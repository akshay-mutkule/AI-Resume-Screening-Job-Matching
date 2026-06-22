import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Candidate, JobDescription } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper to get or initialize DB data
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Safe lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your key in the Secrets/Settings panel to activate AI Resume Screening."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Initial Mock Seed Data
const defaultCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Alexander Mercer",
    email: "alex.mercer@gmail.com",
    phone: "+1 (555) 349-9281",
    skills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
    predictedRole: "AI Engineer",
    source: "alex_mercer_cv.pdf",
    resumeText: `Alexander Mercer
AI Engineer & Machine Learning Specialist
Email: alex.mercer@gmail.com | Phone: +1 (555) 349-9281 | GitHub: github.com/alex-mercer

Professional Summary:
Passionate Machine Learning Engineer with 4+ years of hands-on experience building and deploying NLP pipelines, predictive neural networks, and scalable API services. Proven track record of turning research papers into productionized systems.

Experience:
Senior ML Developer | Brainwave Technologies | 2024 - Present
- Designed and benchmarked custom LLM agents and semantic search platforms using Vector DBs.
- Built NLP skill extraction pipelines achieving 94% accuracy over legacy text heuristics.
- Accelerated inference latency by 35% through model quantization and on-devices optimization.

ML Engineer | TechCore Systems | 2022 - 2024
- Authored production ML code using Python, Scikit-Learn, and PyTorch for customer attrition modeling.
- Created robust real-time API routes with FastAPI and dockerized development microservices.
- Managed automated data validation pipelines over PostgreSQL clusters with Airflow.

Education:
M.S. in Computer Science (AI Specialization) | Stanford University | 2022
B.S. in Software Engineering | University of Michigan | 2020

Technical Skills:
Python, PyTorch, TensorFlow, Scikit-learn, FastAPI, SQL, Docker, Git, ML, NLP, PostgreSQL, Airflow`,
    score: 95,
    lastMatchedJobId: "job-1",
    lastMatchedJobTitle: "Lead AI Engineer",
    lastMatchAt: "2026-06-20T22:30:00.000Z",
    explanation: "This candidate has outstanding alignment with the Lead AI Engineer requirements. He possesses years of direct experience with PyTorch, TensorFlow, NLP pipelines, vector servers, and FastAPI backend engineering. His Master's degree from Stanford provides solid theoretical fundamentals to reinforce senior architectural decisions.",
    matchedSkills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
    missingSkills: [],
    experienceSummary: "4+ years of hands-on experience building neural networks, LLM agents, and deploying systems in production with Brainwave and TechCore.",
    education: "M.S. in Computer Science (AI Specialization) - Stanford University",
    isShortlisted: true,
    createdAt: "2026-06-20T22:25:00.000Z"
  },
  {
    id: "cand-2",
    name: "Sarah Jenkins",
    email: "sarah.j.code@yahoo.com",
    phone: "+1 (555) 832-1100",
    skills: ["React", "TypeScript", "Node.js", "Express", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Git", "Jest"],
    predictedRole: "Frontend Developer",
    source: "sarah_jenkins_web.txt",
    resumeText: `Sarah Jenkins - Frontend Engineer
Email: sarah.j.code@yahoo.com | Web: sarahjenkins.dev

Profile:
Creative frontend developer with 3 years of building crisp, responsive single-page applications. Highly proficient with modern React, TypeScript, and developer tooling. Passionate about beautiful atomic component architectures and micro-interactions.

Professional Experience:
Web Application Developer | Digital Canvas LLC | 2023 - Present
- Engineered high-traffic e-commerce interfaces using React 18, TypeScript, and NextJS.
- Crafted highly maintainable pixel-perfect dashboards utilizing Tailwind CSS and Framer Motion.
- Overhauled client load times by 40% using code splitting, assets caching, and responsive images.

Junior Frontend Architect | AppFlow Solutions | 2021 - 2023
- Built atomic component libraries with React and styled-components, accelerating developer agility.
- Wrote and enforced 90%+ coverage unit testing utilizing Jest and React Testing Library.
- Interacted with designers to implement clean cross-browser flexbox/grid user layouts.

Skills:
React, TypeScript, Node.js, Express, HTML5, CSS3, Tailwind CSS, Redux, Git, Jest, Responsive Design, CSS Grid

Education:
B.S. in Computer Information Systems | Georgia Tech | 2021`,
    score: 87,
    lastMatchedJobId: "job-2",
    lastMatchedJobTitle: "Senior Full Stack Dev",
    lastMatchAt: "2026-06-20T22:31:00.000Z",
    explanation: "Sarah exhibits high proficiency in modern client-side architectures, React, TypeScript, and state management. However, for a Full Stack Dev role, she has minimal experience in enterprise backend scaling, custom REST APIs, databases like PostgreSQL, and virtualization (Docker, AWS) which are listed in the job specification.",
    matchedSkills: ["React", "TypeScript", "Node.js", "Express", "Git"],
    missingSkills: ["Python", "SQL", "Docker", "AWS", "FastAPI"],
    experienceSummary: "3 years of front-end experience crafting highly responsive, atomic web applications and NextJS configurations.",
    education: "B.S. in Computer Information Systems - Georgia Tech",
    isShortlisted: false,
    createdAt: "2026-06-20T22:25:00.000Z"
  },
  {
    id: "cand-3",
    name: "John Doe",
    email: "john.doe@techcorp.com",
    phone: "+1 (555) 728-1122",
    skills: ["Python", "Java", "SQL", "Docker", "AWS", "Git", "FastAPI", "React", "Linux", "REST API", "PostgreSQL"],
    predictedRole: "Full Stack Engineer",
    source: "john_doe_resume.txt",
    resumeText: `John Doe
Full-Stack Software Developer
john.doe@techcorp.com | Seattle, WA | +1 (555) 728-1122

SUMMARY:
Highly analytical and performance-oriented developer with 5+ years of fullstack application engineering. Expert in Python backend REST services and styled React client interfaces.

EXPERIENCE:
Senior software engineer | TechCorp Inc. | 2022 - Present
- Architected and delivered 4 high-concurrency SaaS apps from start to finish.
- Built RESTful web servers in Python (FastAPI/Django) and database layer schemas in PostgreSQL.
- Streamlined deployment workflows down to single-command setups with Docker and AWS ECS.
- Mentored a team of 4 junior developers across codebase migrations and architectural transitions.

Full Stack Engineer | Ignite Ventures | 2019 - 2022
- Engineered responsive client modules using React, Tailwind CSS, and state managers.
- Developed scalable microservices in Java / Spring Boot.
- Designed schema integrations in relational SQL queries and integrated external APIs.

EDUCATION:
B.S. in Computer Science | University of Washington | 2019

CORE SKILLS:
Python, Java, Git, SQL, Docker, AWS, FastAPI, Express, React, Linux, Kubernetes, REST API`,
    score: 93,
    lastMatchedJobId: "job-2",
    lastMatchedJobTitle: "Senior Full Stack Dev",
    lastMatchAt: "2026-06-20T22:32:00.000Z",
    explanation: "John Doe is a stellar candidate for our Senior Full Stack Developer opening. He has solid enterprise experience in Python (FastAPI), React frontends, robust SQL databases, and Cloud architecture (AWS, Docker). He cleanly ticks off all skills required for the backend while also maintaining strong client and team leadership competencies.",
    matchedSkills: ["Python", "SQL", "React", "Docker", "AWS", "Git", "FastAPI", "REST API"],
    missingSkills: [],
    experienceSummary: "5+ years of full-stack developer experience at TechCorp and Ignite Ventures with multiple production software releases.",
    education: "B.S. in Computer Science - University of Washington",
    isShortlisted: true,
    createdAt: "2026-06-20T22:25:00.000Z"
  }
];

const defaultJobs: JobDescription[] = [
  {
    id: "job-1",
    title: "Lead AI Engineer",
    text: `Job Title: Lead AI Engineer / AI Developer
Department: Engineering (AI & NLP Platforms)
Location: Remote / San Francisco, CA

Overview:
We are seeking a Lead AI Engineer to architect, build, and deploy NLP extraction, predictive systems, and high-performance machine learning models. You will lead our intelligence pipelines and work with cutting-edge LLMs and custom model fine-tuning.

Requirements:
- Strong experience with NLP systems, text embeddings, and similarity metrics (Cosine Similarity, Vectors)
- Direct mastery of Python, PyTorch, TensorFlow, scikit-learn
- Strong experience with modular API creation using FastAPI, Express, or Django
- Proficiency with infrastructure such as Docker, Git, and SQL databases
- Ability to explain complex model predictions to technical and business personnel`,
    requiredSkills: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
    createdAt: "2026-06-20T22:24:00.000Z"
  },
  {
    id: "job-2",
    title: "Senior Full Stack Dev",
    text: `Job Title: Senior Full Stack Developer (Python & React)
Department: Core Software Team
Location: Hybrid (Seattle, WA)

Overview:
We are looking for a Senior Developer who loves crafting amazing clean frontend components in React / TypeScript while designing robust backends in Python (FastAPI) and SQL. You will oversee architectural layout, maintain high testing standards, and guide features from discovery to stable release.

Core Tech Stack:
- Frontend: React, Redux, Tailwind CSS, TypeScript
- Backend: Python, FastAPI, SQL/NoSQL databases, REST APIs
- DevOps: Docker, AWS Cloud integrations, Git, automated pipelines`,
    requiredSkills: ["Python", "SQL", "React", "Docker", "AWS", "Git", "FastAPI", "TypeScript", "REST API"],
    createdAt: "2026-06-20T22:24:00.000Z"
  },
  {
    id: "job-3",
    title: "Junior Product Manager",
    text: `Job Title: Junior Product Manager (Software Products)
Department: Strategic Growth
Location: New York, NY

Overview:
Looking for a tech-savvy Junior Product Manager to join our growing enterprise software product suite. You will collaborate closely with UI/UX, Software Engineering, and Marketing to detail requirements, organize development sprints, parse customer feedback, and write specifications.

We Value:
- Fast learner with deep curiosity about technical products and system integrations
- Excellent written and verbal communication
- Ability to manage task trackers (Jira, Linear), write tickets, and direct agendas
- Basic experience with analytical tools, database querying, or HTML/JS/CSS is a plus`,
    requiredSkills: ["Communication", "Agile", "Jira", "Product Specifications", "Analytics"],
    createdAt: "2026-06-20T22:24:00.000Z"
  }
];

// Read database file and fallback safely
function readDB() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR);
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDbState = {
        candidates: defaultCandidates,
        jobs: defaultJobs,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDbState, null, 2), "utf8");
      return initialDbState;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning defaults", err);
    return { candidates: defaultCandidates, jobs: defaultJobs };
  }
}

// Write database file safely
function writeDB(data: { candidates: Candidate[]; jobs: JobDescription[] }) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// REST APIs
// 1. Candidates List
app.get("/api/candidates", (req, res) => {
  const db = readDB();
  res.json(db.candidates);
});

// 2. Add manual Candidate
app.post("/api/candidates", (req, res) => {
  const db = readDB();
  const c: Candidate = {
    id: `cand-${Date.now()}`,
    name: req.body.name || "Unknown Candidate",
    email: req.body.email || "no-email@example.com",
    phone: req.body.phone || "",
    skills: req.body.skills || [],
    predictedRole: req.body.predictedRole || "Unknown",
    source: req.body.source || "Manual Entry",
    resumeText: req.body.resumeText || "",
    createdAt: new Date().toISOString(),
    isShortlisted: false,
    score: req.body.score,
    lastMatchedJobId: req.body.lastMatchedJobId,
    lastMatchedJobTitle: req.body.lastMatchedJobTitle,
    lastMatchAt: req.body.lastMatchAt,
    explanation: req.body.explanation,
    matchedSkills: req.body.matchedSkills,
    missingSkills: req.body.missingSkills,
    experienceSummary: req.body.experienceSummary,
    education: req.body.education,
  };
  db.candidates.unshift(c);
  writeDB(db);
  res.status(201).json(c);
});

// 3. Shortlist toggling
app.patch("/api/candidates/:id/shortlist", (req, res) => {
  const db = readDB();
  const index = db.candidates.findIndex((c: Candidate) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  db.candidates[index].isShortlisted = !!req.body.isShortlisted;
  writeDB(db);
  res.json(db.candidates[index]);
});

// 4. Delete Candidate
app.delete("/api/candidates/:id", (req, res) => {
  const db = readDB();
  const initialCount = db.candidates.length;
  db.candidates = db.candidates.filter((c: Candidate) => c.id !== req.params.id);
  if (db.candidates.length === initialCount) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  writeDB(db);
  res.json({ message: "Candidate deleted successfully" });
});

// 5. Jobs List
app.get("/api/jobs", (req, res) => {
  const db = readDB();
  res.json(db.jobs);
});

// 6. Create Job Position
app.post("/api/jobs", (req, res) => {
  const db = readDB();
  const requiredSkillsInput: string[] = req.body.requiredSkills || [];
  const cleanSkills = requiredSkillsInput
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const newJob: JobDescription = {
    id: `job-${Date.now()}`,
    title: req.body.title || "Untitled Job Opening",
    text: req.body.text || "",
    requiredSkills: cleanSkills,
    createdAt: new Date().toISOString(),
  };
  db.jobs.unshift(newJob);
  writeDB(db);
  res.status(201).json(newJob);
});

// 7. Delete Job
app.delete("/api/jobs/:id", (req, res) => {
  const db = readDB();
  const initialCount = db.jobs.length;
  db.jobs = db.jobs.filter((j: JobDescription) => j.id !== req.params.id);
  if (db.jobs.length === initialCount) {
    return res.status(404).json({ error: "Job opening not found" });
  }
  writeDB(db);
  res.json({ message: "Job deleted successfully" });
});

// 8. AI Endpoint: Parse Raw Resume Text
app.post("/api/analyze-resume", async (req, res) => {
  const { resumeText, filename } = req.body;
  if (!resumeText || resumeText.trim().length === 0) {
    return res.status(400).json({ error: "Please paste or provide resume text to analyze." });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are an elite, highly accurate AI Resume Parser and Recruitment Assistant. Your objective is to read Candidate CV text and extract key structural properties. Return output STRICTLY as single structural JSON matching the format described.`;

    const modelPrompt = `Extract the candidate bio and technical metrics from this raw candidate resume text.
Resume text:
${resumeText}

Extracted JSON schema requirements:
{
  "name": "Candidate's full name. If not discernible, default to 'Unknown Candidate'",
  "email": "Primary email. If none, default to 'no-email@example.com'",
  "phone": "Phone number or WhatsApp. Default to empty if missing.",
  "skills": ["List of modern technical or soft tools, programming languages, libraries, platforms, or competencies mentioned in the CV. Prioritize hard technical skills (Python, Docker, SQL, React) but include relevant functional soft skills. List up to 15 key skills matching current technology standards."],
  "predictedRole": "The overall job title designation that best categorizes this candidate (e.g. 'Software Engineer', 'Data Scientist', 'AI Specialist', 'Project Manager', 'Product Designer', 'Frontend Architect', etc.)",
  "experienceSummary": "High-level summary of experience, e.g. 3+ years in DevOps and backend scaling.",
  "education": "Highlight the highest degrees, e.g. B.S. in Computer Science from GT, or M.B.A. from NYU."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            predictedRole: { type: Type.STRING },
            experienceSummary: { type: Type.STRING },
            education: { type: Type.STRING },
          },
          required: ["name", "email", "skills", "predictedRole", "experienceSummary", "education"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response output from analysis model.");
    }

    const parsedJson = JSON.parse(resultText.trim());

    // Auto-save parsed candidate to our local SQLite-simulated JSON database
    const db = readDB();
    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name: parsedJson.name || "Candidate",
      email: parsedJson.email || "info@example.com",
      phone: parsedJson.phone || "",
      skills: parsedJson.skills || [],
      predictedRole: parsedJson.predictedRole || "Software Professional",
      source: filename || "Pasted Text",
      resumeText: resumeText,
      experienceSummary: parsedJson.experienceSummary || "",
      education: parsedJson.education || "",
      createdAt: new Date().toISOString(),
      isShortlisted: false,
    };

    db.candidates.unshift(newCandidate);
    writeDB(db);

    res.json(newCandidate);
  } catch (error: any) {
    console.error("AI Parser Error:", error);
    res.status(500).json({
      error: error.message || "Failed parsing the resume text with AI engine.",
    });
  }
});

// 9. AI Endpoint: Compute Match Matrix and Explanation
app.post("/api/match", async (req, res) => {
  const { candidateId, jobId } = req.body;
  if (!candidateId || !jobId) {
    return res.status(400).json({ error: "Missing candidateId or jobId in request." });
  }

  const db = readDB();
  const cand = db.candidates.find((c: Candidate) => c.id === candidateId);
  const job = db.jobs.find((j: JobDescription) => j.id === jobId);

  if (!cand || !job) {
    return res.status(404).json({ error: "Candidate or Job spec not found." });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are a professional HR recruiter and ATS algorithms developer. Analyze a Candidate's CV against a Job Description to calculate suitability metrics, explain candidate matching, list key gap analysis, and generate technical interview questions.`;

    const modelPrompt = `
Compare the candidate's resume/CV with the target job opening.

Candidate Name: "${cand.name}"
Candidate Predicted Role: "${cand.predictedRole}"
Candidate Skills: ${JSON.stringify(cand.skills)}
Candidate Experiences/Bio:
${cand.resumeText}

Target Job Opening Title: "${job.title}"
Target Job Skills Requested: ${JSON.stringify(job.requiredSkills)}
Target Job Spec Description:
${job.text}

Perform following evaluation and return a clean, structured JSON object:
1. "score": An integer from 0 to 100 calculated by comparing candidate skills with the job description requested skills and requirements (treating this as a semantic Cosine Similarity/skill alignment).
2. "matchedSkills": Array of strings of skills from the candidate that match what the job requested (direct match or highly relevant equivalent, e.g. SQL match if PostgreSQL is requested).
3. "missingSkills": Array of strings of requested core skills from the job description that are NOT found or hinted in candidate profile.
4. "explanation": A clear, analytical paragraph of 3-4 sentences in client-friendly tone explaining why this score was designated, highlighting strengths.
5. "gapAnalysis": Constructive advice of 2-3 sentences noting what skills or experiences are missing, and how they can adapt.
6. "interviewQuestions": A set of 3 targeted, highly contextual, smart interview questions tailored specifically to test this candidate's reported experience with the job description (e.g. "Given your background in X, how would you structure Y for our job's requirements?").
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            explanation: { type: Type.STRING },
            gapAnalysis: { type: Type.STRING },
            interviewQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "score",
            "matchedSkills",
            "missingSkills",
            "explanation",
            "gapAnalysis",
            "interviewQuestions",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response output from math engine.");
    }

    const report = JSON.parse(resultText.trim());

    // Update the candidate with last matched job results
    const candIndex = db.candidates.findIndex((c: Candidate) => c.id === candidateId);
    if (candIndex !== -1) {
      db.candidates[candIndex].score = report.score;
      db.candidates[candIndex].lastMatchedJobId = jobId;
      db.candidates[candIndex].lastMatchedJobTitle = job.title;
      db.candidates[candIndex].lastMatchAt = new Date().toISOString();
      db.candidates[candIndex].explanation = report.explanation;
      db.candidates[candIndex].matchedSkills = report.matchedSkills;
      db.candidates[candIndex].missingSkills = report.missingSkills;
    }

    writeDB(db);

    res.json({
      candidateId: candidateId,
      jobId: jobId,
      score: report.score,
      predictedRole: cand.predictedRole,
      explanation: report.explanation,
      matchedSkills: report.matchedSkills,
      missingSkills: report.missingSkills,
      gapAnalysis: report.gapAnalysis,
      interviewQuestions: report.interviewQuestions,
    });
  } catch (error: any) {
    console.error("AI Matcher Error:", error);
    res.status(500).json({
      error: error.message || "Failed running AI job matching calculations.",
    });
  }
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
    console.log(`AI Resume Screener backend running on http://0.0.0.0:${PORT}`);
  });
}

start();
