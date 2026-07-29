import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Database Storage in data/matchmind.json
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "matchmind.json");

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  predictedRole: string;
  source: string;
  resumeText: string;
  score?: number;
  lastMatchedJobId?: string;
  lastMatchedJobTitle?: string;
  lastMatchAt?: string;
  explanation?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  experienceSummary?: string;
  education?: string;
  isShortlisted: boolean;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  text: string;
  requiredSkills: string[];
  createdAt: string;
}

interface DB {
  candidates: Candidate[];
  jobs: Job[];
}

function ensureDB(): DB {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DB = {
      candidates: [
        {
          id: "cand-1",
          name: "Alexander Mercer",
          email: "alex.mercer@gmail.com",
          phone: "+1 (555) 349-9281",
          skills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
          predictedRole: "AI Engineer",
          source: "alex_mercer_cv.pdf",
          resumeText: "Alexander Mercer\nAI Engineer & Machine Learning Specialist with 4+ years building neural networks, LLM agents, and high-performance REST APIs.",
          score: 95,
          lastMatchedJobId: "job-1",
          lastMatchedJobTitle: "Lead AI Engineer",
          lastMatchAt: new Date().toISOString(),
          explanation: "Alexander demonstrates exceptional skill coverage in PyTorch, Python, FastAPI, and NLP architecture.",
          matchedSkills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
          missingSkills: [],
          experienceSummary: "4+ years experience engineering AI pipelines and microservices.",
          education: "M.S. in Computer Science - Stanford University",
          isShortlisted: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "cand-2",
          name: "Sarah Jenkins",
          email: "sarah.j.code@yahoo.com",
          phone: "+1 (555) 832-1100",
          skills: ["React", "TypeScript", "Node.js", "Express", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Git", "Jest"],
          predictedRole: "Frontend Developer",
          source: "sarah_jenkins_web.txt",
          resumeText: "Sarah Jenkins\nSenior Frontend Engineer specializing in React 19, TypeScript, and modern responsive web architectures.",
          score: 87,
          lastMatchedJobId: "job-2",
          lastMatchedJobTitle: "Senior Full Stack Dev",
          lastMatchAt: new Date().toISOString(),
          explanation: "Sarah exhibits strong frontend expertise with React and TypeScript.",
          matchedSkills: ["React", "TypeScript", "Node.js", "Express", "Git"],
          missingSkills: ["Python", "SQL", "Docker", "AWS", "FastAPI"],
          experienceSummary: "3+ years designing accessible, high-speed single page applications.",
          education: "B.S. in Computer Information Systems - Georgia Tech",
          isShortlisted: false,
          createdAt: new Date().toISOString()
        }
      ],
      jobs: [
        {
          id: "job-1",
          title: "Lead AI Engineer",
          text: "We are seeking a Lead AI Engineer to architect, build, and deploy NLP extraction pipelines and microservices in FastAPI and Docker.",
          requiredSkills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
          createdAt: new Date().toISOString()
        },
        {
          id: "job-2",
          title: "Senior Full Stack Dev",
          text: "We are looking for a Senior Developer who loves crafting clean frontend components in React, TypeScript, and backend APIs in Python.",
          requiredSkills: ["Python", "SQL", "React", "Docker", "AWS", "Git", "FastAPI", "TypeScript", "REST API"],
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { candidates: [], jobs: [] };
  }
}

function saveDB(data: DB) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Known skills catalog for rule-based NLP engine
const KNOWN_SKILLS = [
  "Python", "PyTorch", "JAX", "TensorFlow", "React", "TypeScript", "JavaScript", "HTML5", "CSS3",
  "Tailwind CSS", "TailwindCSS", "Tailwind", "Node.js", "Express", "FastAPI", "Flask", "Django",
  "Git", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "SQL", "PostgreSQL", "MongoDB", "NoSQL",
  "Linux", "Agile", "Jira", "Figma", "Machine Learning", "Deep Learning", "NLP", "Transformer",
  "CUDA", "C++", "C#", "Java", "Go", "Rust", "Redux", "Next.js", "Webpack", "Jest", "WAI-ARIA",
  "Product Specifications", "Analytics", "Roadmaps", "Communication", "Scrum", "CI/CD", "REST API",
  "GraphQL", "Microservices", "Data Science", "Tableau", "Pandas", "NumPy", "Scikit-Learn", "Keras",
  "Security", "IAM", "Terraform", "Cloud Architecture"
];

// Gemini AI Structured JSON Helper
async function callGeminiJson(prompt: string, systemInstruction: string, responseSchema: any): Promise<any> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "YOUR_GEMINI_API_KEY" || apiKey === "undefined") {
    throw new Error("GEMINI_API_KEY not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema
        }
      });
      if (response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err) {
      lastError = err;
      console.warn(`Gemini call failed with model ${model}:`, err);
    }
  }
  throw lastError || new Error("All Gemini models failed.");
}

// NLP Fallbacks
function fallbackExtractResume(text: string, filename: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  let name = "Candidate";
  for (const line of lines.slice(0, 6)) {
    if (line.includes("@") || line.includes("http") || line.includes(":")) continue;
    const clean = line.replace(/\b(curriculum vitae|cv|resume|dr\.|mr\.|ms\.|phd|md)\b/gi, "").trim();
    const words = clean.split(/\s+/);
    if (words.length >= 1 && words.length <= 4 && words.every(w => /^[A-Z]/i.test(w))) {
      name = clean;
      break;
    }
  }
  if ((name === "Candidate" || name.length < 2) && filename) {
    const base = filename.split(".")[0];
    const parts = base.split(/[-_]/).filter(p => !["cv", "resume", "txt", "pdf", "doc"].includes(p.toLowerCase()));
    if (parts.length > 0) {
      name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    }
  }

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;

  const phoneMatch = text.match(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const textLower = text.toLowerCase();
  const foundSkills: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
    if (pattern.test(textLower)) {
      if (!foundSkills.includes(skill)) foundSkills.push(skill);
    }
  }

  let role = "Software Professional";
  if (foundSkills.some(s => ["PyTorch", "TensorFlow", "Machine Learning", "NLP", "CUDA"].includes(s))) {
    role = "AI / Machine Learning Engineer";
  } else if (foundSkills.some(s => ["React", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"].includes(s))) {
    role = "Frontend Web Developer";
  } else if (foundSkills.some(s => ["AWS", "Docker", "Kubernetes", "Linux", "Terraform"].includes(s))) {
    role = "Cloud & DevOps Specialist";
  } else if (foundSkills.some(s => ["Python", "FastAPI", "Node.js", "Express", "SQL"].includes(s))) {
    role = "Full Stack Engineer";
  }

  let education = "Degree in Computer Science or technical background";
  for (const line of lines) {
    if (/(b\.s\.|m\.s\.|bachelor|master|phd|stanford|mit|georgia tech|university|degree)/i.test(line)) {
      education = line;
      break;
    }
  }

  return {
    name,
    email,
    phone,
    skills: foundSkills,
    predictedRole: role,
    experienceSummary: `${foundSkills.length} core competencies detected. Solid technical candidate with strong alignment for modern software roles.`,
    education
  };
}

function fallbackExtractJob(text: string, titleInput: string) {
  const textLower = text.toLowerCase();
  const foundSkills: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
    if (pattern.test(textLower)) {
      if (!foundSkills.includes(skill)) foundSkills.push(skill);
    }
  }

  let title = titleInput ? titleInput.trim() : "";
  if (!title && text) {
    const firstLine = text.split("\n")[0].trim();
    if (firstLine.length > 3 && firstLine.length < 60) {
      title = firstLine;
    } else {
      if (foundSkills.some(s => ["PyTorch", "Machine Learning", "NLP"].includes(s))) {
        title = "AI / Machine Learning Engineer";
      } else if (foundSkills.some(s => ["React", "TypeScript", "Tailwind CSS"].includes(s))) {
        title = "Frontend Web Engineer";
      } else {
        title = "Software Engineer Opening";
      }
    }
  }

  return {
    title: title || "Software Position",
    requiredSkills: foundSkills
  };
}

function fallbackMatch(cand: Candidate, job: Job) {
  const candSkills = cand.skills || [];
  const reqSkills = job.requiredSkills || [];

  const matchedSkills = reqSkills.filter(r => 
    candSkills.some(c => c.toLowerCase() === r.toLowerCase())
  );
  const missingSkills = reqSkills.filter(r => 
    !candSkills.some(c => c.toLowerCase() === r.toLowerCase())
  );

  let score = 70;
  if (reqSkills.length > 0) {
    const ratio = matchedSkills.length / reqSkills.length;
    score = Math.min(98, Math.max(45, Math.round(ratio * 100)));
  }

  const explanation = `${cand.name} matches ${matchedSkills.length} out of ${reqSkills.length} requested skills for ${job.title}. Solid foundation for this position.`;
  const gapAnalysis = missingSkills.length > 0 
    ? `Skills to verify during discussion: ${missingSkills.join(", ")}.`
    : "Outstanding skills alignment! No major required skills are missing.";

  const interviewQuestions = [
    `Can you tell us about a project where you applied ${matchedSkills[0] || 'your core technical skills'}?`,
    `How do you handle learning new tools like ${missingSkills[0] || 'emerging technologies'} on the job?`,
    `What approach do you take when designing modular, scalable applications?`
  ];

  return {
    score,
    matchedSkills,
    missingSkills,
    explanation,
    gapAnalysis,
    interviewQuestions
  };
}

function fallbackCompare(cand1: Candidate, cand2: Candidate, job: Job) {
  const reqSkills = job.requiredSkills || [];
  
  const m1 = reqSkills.filter(r => (cand1.skills || []).some(c => c.toLowerCase() === r.toLowerCase()));
  const m2 = reqSkills.filter(r => (cand2.skills || []).some(c => c.toLowerCase() === r.toLowerCase()));

  const scoreA = reqSkills.length > 0 ? Math.round((m1.length / reqSkills.length) * 100) : 80;
  const scoreB = reqSkills.length > 0 ? Math.round((m2.length / reqSkills.length) * 100) : 75;

  let verdict = `${cand1.name} has slightly broader skills coverage for this position.`;
  if (scoreB > scoreA) {
    verdict = `${cand2.name} demonstrates higher technical alignment with the target job requirements.`;
  }

  return {
    scoreA,
    scoreB,
    comparisonPoints: [
      {
        category: "Core Technical Alignment",
        candAFeedback: `Matches ${m1.length} requested skills: ${m1.join(", ") || "General background"}.`,
        candBFeedback: `Matches ${m2.length} requested skills: ${m2.join(", ") || "General background"}.`
      },
      {
        category: "Experience Depth",
        candAFeedback: cand1.experienceSummary || "Solid technical background.",
        candBFeedback: cand2.experienceSummary || "Experienced software professional."
      }
    ],
    strengthsA: m1.slice(0, 4),
    strengthsB: m2.slice(0, 4),
    gapsA: reqSkills.filter(r => !m1.includes(r)),
    gapsB: reqSkills.filter(r => !m2.includes(r)),
    verdict,
    keyDifferentiator: `${scoreA >= scoreB ? cand1.name : cand2.name} offers immediate productivity in key requested stack requirements.`
  };
}

function fallbackEnhance(cand: Candidate, job: Job) {
  const candSkills = cand.skills || [];
  const reqSkills = job.requiredSkills || [];
  const missing = reqSkills.filter(r => !candSkills.some(c => c.toLowerCase() === r.toLowerCase()));

  return {
    originalSummary: cand.experienceSummary || `${cand.name} - ${cand.predictedRole}`,
    enhancedSummary: `High-impact ${cand.predictedRole} with deep expertise in ${(candSkills.slice(0, 4)).join(", ")}. Proven track record of delivering scalable solutions aligned with modern requirements.`,
    suggestedSkillsToAdd: missing.slice(0, 5),
    bulletOptimizations: [
      {
        originalBullet: "Worked on building software features and fixing user bugs.",
        suggestedBullet: `Architected and deployed production software modules using ${(candSkills.slice(0, 2)).join(" and ") || "modern tools"}, improving system reliability.`,
        rationale: "Quantifies technical scope and highlights core technology stack."
      },
      {
        originalBullet: "Collaborated with team members on daily tasks and documentation.",
        suggestedBullet: "Spearheaded cross-functional technical planning, establishing robust API patterns and documentation standards.",
        rationale: "Emphasizes leadership and proactive engineering workflow."
      }
    ],
    resumeCritique: "Strong foundational resume. Adding measurable metrics and highlighting key target job skills will significantly increase candidate response rates."
  };
}

// API ROUTES

// 1. Get Candidates
app.get("/api/candidates", (req, res) => {
  const db = ensureDB();
  res.json(db.candidates);
});

// 2. Add Candidate
app.post("/api/candidates", (req, res) => {
  const db = ensureDB();
  const body = req.body || {};
  const newCand: Candidate = {
    id: `cand-${Date.now()}`,
    name: body.name || "Candidate",
    email: body.email || "info@example.com",
    phone: body.phone || "",
    skills: body.skills || [],
    predictedRole: body.predictedRole || "Software Professional",
    source: body.source || "Manual Entry",
    resumeText: body.resumeText || "",
    experienceSummary: body.experienceSummary || "",
    education: body.education || "",
    isShortlisted: false,
    createdAt: new Date().toISOString()
  };
  db.candidates.unshift(newCand);
  saveDB(db);
  res.status(201).json(newCand);
});

// 3. Delete Candidate
app.delete("/api/candidates/:id", (req, res) => {
  const db = ensureDB();
  const { id } = req.params;
  db.candidates = db.candidates.filter(c => c.id !== id);
  saveDB(db);
  res.json({ message: "Candidate deleted successfully" });
});

// 4. Shortlist Candidate
app.patch("/api/candidates/:id/shortlist", (req, res) => {
  const db = ensureDB();
  const { id } = req.params;
  const { isShortlisted } = req.body;
  const cand = db.candidates.find(c => c.id === id);
  if (!cand) {
    return res.status(404).json({ detail: "Candidate not found" });
  }
  cand.isShortlisted = Boolean(isShortlisted);
  saveDB(db);
  res.json(cand);
});

// 5. Get Jobs
app.get("/api/jobs", (req, res) => {
  const db = ensureDB();
  res.json(db.jobs);
});

// 6. Post Job
app.post("/api/jobs", async (req, res) => {
  const db = ensureDB();
  const { title, text, requiredSkills } = req.body || {};
  const userSkills: string[] = Array.isArray(requiredSkills) ? requiredSkills.map((s: string) => s.trim()).filter(Boolean) : [];
  
  let extractedTitle = (title || "").trim();
  let extractedSkills = [...userSkills];

  if (text && text.trim()) {
    const systemPrompt = "You are an HR talent acquisition specialist. Extract the clean job title and key required skills from this job description.";
    const prompt = `Title: "${title}"\nDescription:\n${text}`;
    const schema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        requiredSkills: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["title", "requiredSkills"]
    };

    try {
      const parsed = await callGeminiJson(prompt, systemPrompt, schema);
      if (!extractedTitle && parsed.title) extractedTitle = parsed.title.trim();
      const aiSkills = parsed.requiredSkills || [];
      for (const s of aiSkills) {
        if (!extractedSkills.some(e => e.toLowerCase() === s.toLowerCase())) {
          extractedSkills.push(s.trim());
        }
      }
    } catch {
      const fb = fallbackExtractJob(text, extractedTitle);
      if (!extractedTitle) extractedTitle = fb.title;
      for (const s of fb.requiredSkills) {
        if (!extractedSkills.some(e => e.toLowerCase() === s.toLowerCase())) {
          extractedSkills.push(s);
        }
      }
    }
  }

  if (!extractedTitle) extractedTitle = "Untitled Job Opening";

  const newJob: Job = {
    id: `job-${Date.now()}`,
    title: extractedTitle,
    text: text || "",
    requiredSkills: extractedSkills,
    createdAt: new Date().toISOString()
  };

  db.jobs.unshift(newJob);
  saveDB(db);
  res.status(201).json(newJob);
});

// 7. Delete Job
app.delete("/api/jobs/:id", (req, res) => {
  const db = ensureDB();
  const { id } = req.params;
  db.jobs = db.jobs.filter(j => j.id !== id);
  saveDB(db);
  res.json({ message: "Job deleted successfully" });
});

// 8. Analyze Resume
app.post("/api/analyze-resume", async (req, res) => {
  const db = ensureDB();
  const { resumeText, filename } = req.body || {};
  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ detail: "Please provide resume text to analyze." });
  }

  const systemPrompt = "You are a friendly, encouraging resume parser. Extract details in warm, simple, supportive language.";
  const prompt = `Resume text:\n${resumeText}`;
  const schema = {
    type: "OBJECT",
    properties: {
      name: { type: "STRING" },
      email: { type: "STRING" },
      phone: { type: "STRING" },
      skills: { type: "ARRAY", items: { type: "STRING" } },
      predictedRole: { type: "STRING" },
      experienceSummary: { type: "STRING" },
      education: { type: "STRING" }
    },
    required: ["name", "email", "skills", "predictedRole", "experienceSummary", "education"]
  };

  let parsed: any;
  try {
    parsed = await callGeminiJson(prompt, systemPrompt, schema);
  } catch {
    parsed = fallbackExtractResume(resumeText, filename || "");
  }

  const newCand: Candidate = {
    id: `cand-${Date.now()}`,
    name: parsed.name || "Candidate",
    email: parsed.email || "info@example.com",
    phone: parsed.phone || "",
    skills: parsed.skills || [],
    predictedRole: parsed.predictedRole || "Software Professional",
    source: filename || "Pasted Text",
    resumeText,
    experienceSummary: parsed.experienceSummary || "",
    education: parsed.education || "",
    isShortlisted: false,
    createdAt: new Date().toISOString()
  };

  db.candidates.unshift(newCand);
  saveDB(db);
  res.status(201).json(newCand);
});

// 9. Match Candidate & Job
app.post("/api/match", async (req, res) => {
  const db = ensureDB();
  const { candidateId, jobId } = req.body || {};
  const cand = db.candidates.find(c => c.id === candidateId);
  const job = db.jobs.find(j => j.id === jobId);

  if (!cand || !job) {
    return res.status(404).json({ detail: "Candidate or Job not found." });
  }

  const systemPrompt = "You are a friendly, encouraging career advisor. Explain candidate job suitability in simple, warm language.";
  const prompt = `Candidate Name: "${cand.name}"\nCandidate Skills: ${JSON.stringify(cand.skills)}\nCandidate Resume: ${cand.resumeText}\nJob Title: "${job.title}"\nJob Skills: ${JSON.stringify(job.requiredSkills)}\nJob Description: ${job.text}`;
  const schema = {
    type: "OBJECT",
    properties: {
      score: { type: "INTEGER" },
      matchedSkills: { type: "ARRAY", items: { type: "STRING" } },
      missingSkills: { type: "ARRAY", items: { type: "STRING" } },
      explanation: { type: "STRING" },
      gapAnalysis: { type: "STRING" },
      interviewQuestions: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["score", "matchedSkills", "missingSkills", "explanation", "gapAnalysis", "interviewQuestions"]
  };

  let report: any;
  try {
    report = await callGeminiJson(prompt, systemPrompt, schema);
  } catch {
    report = fallbackMatch(cand, job);
  }

  cand.score = report.score;
  cand.lastMatchedJobId = jobId;
  cand.lastMatchedJobTitle = job.title;
  cand.lastMatchAt = new Date().toISOString();
  cand.explanation = report.explanation;
  cand.matchedSkills = report.matchedSkills;
  cand.missingSkills = report.missingSkills;
  saveDB(db);

  res.json({
    candidateId,
    jobId,
    score: report.score,
    predictedRole: cand.predictedRole,
    explanation: report.explanation,
    matchedSkills: report.matchedSkills,
    missingSkills: report.missingSkills,
    gapAnalysis: report.gapAnalysis,
    interviewQuestions: report.interviewQuestions
  });
});

// 10. Compare Candidates
app.post("/api/compare", async (req, res) => {
  const db = ensureDB();
  const { candidateId1, candidateId2, jobId } = req.body || {};
  const cand1 = db.candidates.find(c => c.id === candidateId1);
  const cand2 = db.candidates.find(c => c.id === candidateId2);
  const job = db.jobs.find(j => j.id === jobId);

  if (!cand1 || !cand2 || !job) {
    return res.status(404).json({ detail: "One or more candidates/jobs not found." });
  }

  const systemPrompt = "Compare Candidate A and Candidate B side by side in a clear, friendly, humanized way.";
  const prompt = `Job: ${job.title}\nCandidate A: ${cand1.name}\nCandidate B: ${cand2.name}`;
  const schema = {
    type: "OBJECT",
    properties: {
      scoreA: { type: "INTEGER" },
      scoreB: { type: "INTEGER" },
      comparisonPoints: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            candAFeedback: { type: "STRING" },
            candBFeedback: { type: "STRING" }
          },
          required: ["category", "candAFeedback", "candBFeedback"]
        }
      },
      strengthsA: { type: "ARRAY", items: { type: "STRING" } },
      strengthsB: { type: "ARRAY", items: { type: "STRING" } },
      gapsA: { type: "ARRAY", items: { type: "STRING" } },
      gapsB: { type: "ARRAY", items: { type: "STRING" } },
      verdict: { type: "STRING" },
      keyDifferentiator: { type: "STRING" }
    },
    required: ["scoreA", "scoreB", "comparisonPoints", "strengthsA", "strengthsB", "gapsA", "gapsB", "verdict", "keyDifferentiator"]
  };

  let report: any;
  try {
    report = await callGeminiJson(prompt, systemPrompt, schema);
  } catch {
    report = fallbackCompare(cand1, cand2, job);
  }

  res.json({
    candidate1Id: candidateId1,
    candidate2Id: candidateId2,
    candidate1Name: cand1.name,
    candidate2Name: cand2.name,
    jobId,
    jobTitle: job.title,
    ...report
  });
});

// 11. Enhance Resume
app.post("/api/enhance", async (req, res) => {
  const db = ensureDB();
  const { candidateId, jobId } = req.body || {};
  const cand = db.candidates.find(c => c.id === candidateId);
  const job = db.jobs.find(j => j.id === jobId);

  if (!cand || !job) {
    return res.status(404).json({ detail: "Candidate or Job not found." });
  }

  const systemPrompt = "Help optimize candidate resume for target job opening with actionable rewrites.";
  const prompt = `Candidate: ${cand.name}\nJob: ${job.title}`;
  const schema = {
    type: "OBJECT",
    properties: {
      originalSummary: { type: "STRING" },
      enhancedSummary: { type: "STRING" },
      suggestedSkillsToAdd: { type: "ARRAY", items: { type: "STRING" } },
      bulletOptimizations: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            originalBullet: { type: "STRING" },
            suggestedBullet: { type: "STRING" },
            rationale: { type: "STRING" }
          },
          required: ["originalBullet", "suggestedBullet", "rationale"]
        }
      },
      resumeCritique: { type: "STRING" }
    },
    required: ["originalSummary", "enhancedSummary", "suggestedSkillsToAdd", "bulletOptimizations", "resumeCritique"]
  };

  let report: any;
  try {
    report = await callGeminiJson(prompt, systemPrompt, schema);
  } catch {
    report = fallbackEnhance(cand, job);
  }

  res.json({
    candidateId,
    candidateName: cand.name,
    jobId,
    jobTitle: job.title,
    ...report
  });
});

// 12. Skills Trends
app.get("/api/skills-trend", async (req, res) => {
  const db = ensureDB();
  const candidates = db.candidates;
  const jobs = db.jobs;

  const jobSkillsCount: Record<string, number> = {};
  const totalJobs = jobs.length;
  for (const j of jobs) {
    for (const s of j.requiredSkills || []) {
      const clean = s.trim();
      if (clean) jobSkillsCount[clean] = (jobSkillsCount[clean] || 0) + 1;
    }
  }

  const candSkillsCount: Record<string, number> = {};
  const totalCandidates = candidates.length;
  for (const c of candidates) {
    for (const s of c.skills || []) {
      const clean = s.trim();
      if (clean) candSkillsCount[clean] = (candSkillsCount[clean] || 0) + 1;
    }
  }

  const topRequested = Object.entries(jobSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      demandCount: count,
      demandPercentage: totalJobs > 0 ? Math.round((count / totalJobs) * 1000) / 10 : 0
    }));

  const topSupplied = Object.entries(candSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      supplyCount: count,
      supplyPercentage: totalCandidates > 0 ? Math.round((count / totalCandidates) * 1000) / 10 : 0
    }));

  const allReqSkills = Object.keys(jobSkillsCount);
  const gaps = allReqSkills.map(skill => {
    const reqPct = totalJobs > 0 ? jobSkillsCount[skill] / totalJobs : 0;
    const supPct = totalCandidates > 0 ? (candSkillsCount[skill] || 0) / totalCandidates : 0;
    const gapValue = Math.max(0, reqPct - supPct);
    return {
      skill,
      gapValue: Math.round(gapValue * 1000) / 10,
      demandCount: jobSkillsCount[skill],
      supplyCount: candSkillsCount[skill] || 0
    };
  }).sort((a, b) => b.gapValue - a.gapValue).slice(0, 10);

  let aiNarrative = "Recruitment skills analysis completed. Demand detected across key technical stack requirements.";
  if (totalJobs > 0 && totalCandidates > 0) {
    try {
      const parsed = await callGeminiJson(
        `Job skills: ${JSON.stringify(jobSkillsCount)}, Candidate skills: ${JSON.stringify(candSkillsCount)}`,
        "Summarize market skills supply and demand trends in 2 simple, encouraging sentences.",
        {
          type: "OBJECT",
          properties: {
            insights: { type: "STRING" },
            recommendation: { type: "STRING" }
          },
          required: ["insights", "recommendation"]
        }
      );
      aiNarrative = `${parsed.insights}\n\n**Actionable Recommendation:** ${parsed.recommendation}`;
    } catch {
      aiNarrative = `Analysis completed across ${totalJobs} open roles and ${totalCandidates} candidate profiles. Highest skill demand identified in ${topRequested.slice(0, 3).map(t => t.skill).join(", ")}.`;
    }
  }

  res.json({
    topRequestedSkills: topRequested,
    topSuppliedSkills: topSupplied,
    supplyDemandGap: gaps,
    aiMarketNarrative: aiNarrative
  });
});

// Configure Vite or Static Web Server assets middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MatchMind AI Engine running on http://0.0.0.0:${PORT}`);
  });
}

start();
