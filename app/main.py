import time
import re
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    CandidateBase, 
    CandidateUpdateShortlist, 
    JobBase, 
    AnalyzeResumeRequest, 
    MatchingRequest,
    CompareRequest,
    EnhanceRequest
)
from app.database import load_db, save_db
from app.gemini import call_gemini_json

app = FastAPI(title="MatchMind AI Python Backend", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KNOWN_SKILLS = [
    "Python", "PyTorch", "JAX", "TensorFlow", "React", "TypeScript", "JavaScript", "HTML5", "CSS3",
    "Tailwind CSS", "TailwindCSS", "Tailwind", "Node.js", "Express", "FastAPI", "Flask", "Django",
    "Git", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "SQL", "PostgreSQL", "MongoDB", "NoSQL",
    "Linux", "Agile", "Jira", "Figma", "Machine Learning", "Deep Learning", "NLP", "Transformer",
    "CUDA", "C++", "C#", "Java", "Go", "Rust", "Redux", "Next.js", "Webpack", "Jest", "WAI-ARIA",
    "Product Specifications", "Analytics", "Roadmaps", "Communication", "Scrum", "CI/CD", "REST API",
    "GraphQL", "Microservices", "Data Science", "Tableau", "Pandas", "NumPy", "Scikit-Learn", "Keras",
    "Security", "IAM", "Terraform", "Cloud Architecture"
]

def fallback_extract_resume(resume_text: str, filename: str) -> dict:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    
    # 1. Name extraction
    name = "Candidate"
    for line in lines[:6]:
        if "@" in line or "http" in line or ":" in line:
            continue
        clean_line = re.sub(r'(?i)\b(curriculum vitae|cv|resume|dr\.|mr\.|ms\.|phd|md)\b', '', line).strip()
        words = clean_line.split()
        if 1 <= len(words) <= 4 and all(w[0].isupper() or w[0].isalpha() for w in words if w):
            name = clean_line
            break
            
    if (name == "Candidate" or len(name) < 2) and filename:
        base = filename.split('.')[0]
        parts = [p.capitalize() for p in re.split(r'[-_]', base) if p.lower() not in ['cv', 'resume', 'txt', 'pdf', 'doc']]
        if parts:
            name = " ".join(parts)

    # 2. Email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', resume_text)
    email = email_match.group(0) if email_match else "candidate@example.com"

    # 3. Phone
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_text)
    phone = phone_match.group(0) if phone_match else ""

    # 4. Skills
    found_skills = []
    text_lower = resume_text.lower()
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            if skill not in found_skills:
                found_skills.append(skill)
            
    skills_line_match = re.search(r'(?i)skills?\s*[:\-]\s*(.*)', resume_text)
    if skills_line_match:
        custom_skills = [s.strip() for s in re.split(r'[,|;]', skills_line_match.group(1)) if s.strip()]
        for s in custom_skills:
            if s and s not in found_skills and len(s) < 30:
                found_skills.append(s)

    if not found_skills:
        found_skills = ["Software Development", "Problem Solving", "Technical Communication"]

    # 5. Predicted Role
    predicted_role = "Software Professional"
    if any(s in found_skills for s in ["PyTorch", "JAX", "TensorFlow", "Machine Learning", "NLP", "CUDA"]):
        predicted_role = "AI/ML Engineer & Researcher"
    elif any(s in found_skills for s in ["React", "TypeScript", "Tailwind CSS", "HTML5", "Next.js", "CSS3"]):
        predicted_role = "React Frontend Specialist"
    elif any(s in found_skills for s in ["Jira", "Agile", "Product Specifications", "Roadmaps"]):
        predicted_role = "Technical Product Manager"
    elif any(s in found_skills for s in ["AWS", "Docker", "Kubernetes", "Linux", "Terraform"]):
        predicted_role = "Cloud Infrastructure Specialist"
    elif any(s in found_skills for s in ["Python", "FastAPI", "Node.js", "Django", "SQL"]):
        predicted_role = "Backend Software Engineer"

    # 6. Experience Summary
    exp_summary = "Experienced professional with background in " + ", ".join(found_skills[:5]) + "."
    exp_match = re.search(r'(?i)(experience|work history|summary)\s*[:\-]?\s*(.*)', resume_text, re.DOTALL)
    if exp_match:
        raw_exp = exp_match.group(2).strip()
        first_p = raw_exp.split('\n\n')[0].replace('\n', ' ')
        if len(first_p) > 20:
            exp_summary = first_p[:300] + ("..." if len(first_p) > 300 else "")

    # 7. Education
    edu = "Bachelor's Degree in Computer Science or Related Technical Field"
    edu_match = re.search(r'(?i)(b\.?s\.?|m\.?s\.?|ph\.?d\.?|bachelor|master|degree|university|college)[^\n]*', resume_text)
    if edu_match:
        edu = edu_match.group(0).strip()

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": found_skills,
        "predictedRole": predicted_role,
        "experienceSummary": exp_summary,
        "education": edu
    }

def fallback_extract_job(job_text: str, user_title: str = "") -> dict:
    text_lower = job_text.lower()
    found_skills = []
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            if skill not in found_skills:
                found_skills.append(skill)
                
    title = user_title.strip() if user_title else ""
    if not title:
        first_line = job_text.split('\n')[0].strip()
        if len(first_line) < 60 and len(first_line) > 3:
            title = first_line
        else:
            if any(s in found_skills for s in ["PyTorch", "Machine Learning", "NLP"]):
                title = "AI / Machine Learning Engineer"
            elif any(s in found_skills for s in ["React", "TypeScript", "Tailwind CSS"]):
                title = "Frontend Web Engineer"
            elif any(s in found_skills for s in ["AWS", "Docker", "Kubernetes", "Linux"]):
                title = "Cloud & DevOps Specialist"
            else:
                title = "Software Engineer Position"

    return {
        "title": title,
        "requiredSkills": found_skills
    }

def fallback_match(cand: dict, job: dict) -> dict:
    cand_skills = cand.get("skills", [])
    job_skills = job.get("requiredSkills", [])
    
    cand_skills_lower = [s.lower() for s in cand_skills]
    matched = [s for s in job_skills if s.lower() in cand_skills_lower]
    missing = [s for s in job_skills if s.lower() not in cand_skills_lower]
    
    if job_skills:
        score = int(round((len(matched) / len(job_skills)) * 100))
    else:
        score = 80
        
    score = max(35, min(98, score))
    
    explanation = f"{cand.get('name')} shows strong alignment with the {job.get('title')} role, bringing key expertise in {', '.join(matched[:4]) if matched else 'core technical fields'}."
    gap = f"Skill gaps to consider: {', '.join(missing) if missing else 'None! All core requested skills are present in candidate profile.'}"
    questions = [
        f"How have you applied your experience with {matched[0]} in your recent projects?" if matched else "Can you walk us through your most relevant technical project?",
        f"What steps are you taking to build proficiency in {missing[0]}?" if missing else "How do you keep your technical skills sharp?",
        f"What drew you to applying for the {job.get('title')} position?"
    ]
    
    return {
        "score": score,
        "matchedSkills": matched,
        "missingSkills": missing,
        "explanation": explanation,
        "gapAnalysis": gap,
        "interviewQuestions": questions
    }

def fallback_compare(cand1: dict, cand2: dict, job: dict) -> dict:
    m1 = fallback_match(cand1, job)
    m2 = fallback_match(cand2, job)
    
    scoreA = m1["score"]
    scoreB = m2["score"]
    
    if scoreA >= scoreB:
        verdict = f"{cand1.get('name')} holds an edge for {job.get('title')} due to broader coverage of key requested skills."
        diff = f"{cand1.get('name')} brings {scoreA}% match score vs {cand2.get('name')}'s {scoreB}%."
    else:
        verdict = f"{cand2.get('name')} holds an edge for {job.get('title')} with higher skill alignment."
        diff = f"{cand2.get('name')} brings {scoreB}% match score vs {cand1.get('name')}'s {scoreA}%."
        
    return {
        "scoreA": scoreA,
        "scoreB": scoreB,
        "comparisonPoints": [
            {
                "category": "Core Technical Match",
                "candAFeedback": f"Matches {len(m1['matchedSkills'])} required skills ({', '.join(m1['matchedSkills'][:3]) or 'General background'}).",
                "candBFeedback": f"Matches {len(m2['matchedSkills'])} required skills ({', '.join(m2['matchedSkills'][:3]) or 'General background'})."
            },
            {
                "category": "Skill Gaps & Vulnerabilities",
                "candAFeedback": f"Missing: {', '.join(m1['missingSkills'][:3]) or 'None'}.",
                "candBFeedback": f"Missing: {', '.join(m2['missingSkills'][:3]) or 'None'}."
            }
        ],
        "strengthsA": m1["matchedSkills"] or [cand1.get("predictedRole")],
        "strengthsB": m2["matchedSkills"] or [cand2.get("predictedRole")],
        "gapsA": m1["missingSkills"],
        "gapsB": m2["missingSkills"],
        "verdict": verdict,
        "keyDifferentiator": diff
    }

def fallback_enhance(cand: dict, job: dict) -> dict:
    m = fallback_match(cand, job)
    orig_sum = cand.get("experienceSummary") or f"Experienced {cand.get('predictedRole')}."
    enh_sum = f"Driven {cand.get('predictedRole')} with expertise in {', '.join(cand.get('skills', [])[:5])}, seeking to leverage strong skills for {job.get('title')}."
    
    return {
        "originalSummary": orig_sum,
        "enhancedSummary": enh_sum,
        "suggestedSkillsToAdd": m["missingSkills"] or ["Cloud Architecture", "Agile Leadership"],
        "bulletOptimizations": [
            {
                "originalBullet": "Worked on technical projects and developed features.",
                "suggestedBullet": f"Architected and delivered high-impact software solutions leveraging {', '.join(cand.get('skills', [])[:3])}, improving performance by 25%.",
                "rationale": "Quantifies achievements and highlights key target technical skills."
            }
        ],
        "resumeCritique": "Overall strong background. Emphasizing measurable metrics and explicit technical terms will boost ATS ranking for this position."
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "language": "python", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/candidates")
def list_candidates():
    db = load_db()
    return db.get("candidates", [])

@app.post("/api/candidates", status_code=status.HTTP_201_CREATED)
def add_manual_candidate(candidate: CandidateBase):
    db = load_db()
    new_id = f"cand-{int(time.time() * 1000)}"
    new_candidate = candidate.dict()
    new_candidate["id"] = new_id
    new_candidate["createdAt"] = datetime.utcnow().isoformat() + "Z"
    
    if "candidates" not in db:
        db["candidates"] = []
    db["candidates"].insert(0, new_candidate)
    save_db(db)
    return new_candidate

@app.patch("/api/candidates/{id}/shortlist")
def toggle_candidate_shortlist(id: str, update: CandidateUpdateShortlist):
    db = load_db()
    candidates = db.get("candidates", [])
    found_index = -1
    for idx, c in enumerate(candidates):
        if c.get("id") == id:
            found_index = idx
            break
            
    if found_index == -1:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
        
    candidates[found_index]["isShortlisted"] = update.isShortlisted
    db["candidates"] = candidates
    save_db(db)
    return candidates[found_index]

@app.delete("/api/candidates/{id}")
def delete_candidate(id: str):
    db = load_db()
    candidates = db.get("candidates", [])
    initial_len = len(candidates)
    filtered = [c for c in candidates if c.get("id") != id]
    
    if len(filtered) == initial_len:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    db["candidates"] = filtered
    save_db(db)
    return {"message": "Candidate deleted successfully"}

@app.get("/api/jobs")
def list_jobs():
    db = load_db()
    return db.get("jobs", [])

@app.post("/api/jobs", status_code=status.HTTP_201_CREATED)
def add_job_position(job: JobBase):
    db = load_db()
    new_id = f"job-{int(time.time() * 1000)}"
    user_skills = [s.strip() for s in job.requiredSkills if s.strip()]
    
    extracted_title = job.title.strip() if job.title else ""
    extracted_skills = list(user_skills)

    if job.text and job.text.strip():
        system_prompt = "You are an expert HR talent acquisition parser. Extract the clean job title and key required technical and professional skills from the job description."
        prompt = f"""Extract the official job title and a list of required technical/professional skills from this job description text:
User Provided Title: "{job.title}"
Job Description:
{job.text}
"""
        expected_schema = {
            "type": "OBJECT",
            "properties": {
                "title": { "type": "STRING" },
                "requiredSkills": {
                    "type": "ARRAY",
                    "items": { "type": "STRING" }
                }
            },
            "required": ["title", "requiredSkills"]
        }
        
        try:
            parsed = call_gemini_json(prompt, system_prompt, expected_schema)
            if not extracted_title and parsed.get("title"):
                extracted_title = parsed.get("title").strip()
            ai_skills = [s.strip() for s in parsed.get("requiredSkills", []) if s.strip()]
            for s in ai_skills:
                if not any(s.lower() == existing.lower() for existing in extracted_skills):
                    extracted_skills.append(s)
        except Exception as e:
            print(f"Notice: Gemini job parsing skipped or failed ({e}), using NLP fallback.")
            fb = fallback_extract_job(job.text, extracted_title)
            if not extracted_title:
                extracted_title = fb.get("title", "Software Opening")
            for s in fb.get("requiredSkills", []):
                if not any(s.lower() == existing.lower() for existing in extracted_skills):
                    extracted_skills.append(s)

    if not extracted_title:
        extracted_title = "Untitled Job Opening"

    new_job = {
        "id": new_id,
        "title": extracted_title,
        "text": job.text or "",
        "requiredSkills": extracted_skills,
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    
    if "jobs" not in db:
        db["jobs"] = []
    db["jobs"].insert(0, new_job)
    save_db(db)
    return new_job

@app.delete("/api/jobs/{id}")
def delete_job(id: str):
    db = load_db()
    jobs = db.get("jobs", [])
    initial_len = len(jobs)
    filtered = [j for j in jobs if j.get("id") != id]
    
    if len(filtered) == initial_len:
        raise HTTPException(status_code=404, detail="Job opening not found")
        
    db["jobs"] = filtered
    save_db(db)
    return {"message": "Job deleted successfully"}

@app.post("/api/analyze-resume")
def analyze_resume(req: AnalyzeResumeRequest):
    if not req.resumeText or not req.resumeText.strip():
        raise HTTPException(status_code=400, detail="Please paste or provide resume text to analyze.")
        
    system_prompt = "You are a friendly, encouraging resume reader. Help extract the candidate's details in warm, simple, humanized, and supportive language that anyone can easily understand. Avoid dry technical jargon, keep descriptions down-to-earth and highly approachable."
    
    prompt = f"""Read this resume and extract the key details. For any descriptive fields like experienceSummary, write them in a friendly, simple, and highly readable human tone.
Resume text:
{req.resumeText}
"""

    expected_schema = {
        "type": "OBJECT",
        "properties": {
            "name": { "type": "STRING" },
            "email": { "type": "STRING" },
            "phone": { "type": "STRING" },
            "skills": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            },
            "predictedRole": { "type": "STRING" },
            "experienceSummary": { "type": "STRING" },
            "education": { "type": "STRING" }
        },
        "required": ["name", "email", "skills", "predictedRole", "experienceSummary", "education"]
    }

    try:
        parsed_json = call_gemini_json(prompt, system_prompt, expected_schema)
    except Exception as e:
        print(f"Notice: Gemini LLM call skipped or failed ({e}), using NLP Rule Engine.")
        parsed_json = fallback_extract_resume(req.resumeText, req.filename or "")

    db = load_db()
    new_candidate = {
        "id": f"cand-{int(time.time() * 1000)}",
        "name": parsed_json.get("name") or "Candidate",
        "email": parsed_json.get("email") or "info@example.com",
        "phone": parsed_json.get("phone") or "",
        "skills": parsed_json.get("skills") or [],
        "predictedRole": parsed_json.get("predictedRole") or "Software Professional",
        "source": req.filename or "Pasted Text",
        "resumeText": req.resumeText,
        "experienceSummary": parsed_json.get("experienceSummary") or "",
        "education": parsed_json.get("education") or "",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "isShortlisted": False
    }
    
    if "candidates" not in db:
        db["candidates"] = []
    db["candidates"].insert(0, new_candidate)
    save_db(db)
    return new_candidate

@app.post("/api/match")
def match_candidate_job(req: MatchingRequest):
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    cand = next((c for c in candidates if c.get("id") == req.candidateId), None)
    job = next((j for j in jobs if j.get("id") == req.jobId), None)
    
    if not cand or not job:
        raise HTTPException(status_code=404, detail="Candidate profile or target Job posting not found.")
        
    system_prompt = "You are a friendly, encouraging career advisor. Explain candidate job suitability in simple, warm, supportive, and humanized language that anyone can easily understand. Avoid cold, dry algorithmic jargon, system metrics talk, or technical formulas."
    
    prompt = f"""
Compare this candidate's resume with the target job description. Write the suitability explanation, gap analysis, and interview questions in a warm, simple, encouraging, and highly readable human tone. No complex recruiter slang.
Make sure the interview questions are simple, friendly, and helpful for a casual conversation.

Candidate Name: "{cand.get('name')}"
Candidate Predicted Role: "{cand.get('predictedRole')}"
Candidate Skills: {cand.get('skills')}
Candidate Resume Content:
{cand.get('resumeText')}

Target Job Opening Title: "{job.get('title')}"
Target Job Skills Requested: {job.get('requiredSkills')}
Target Job Spec Description:
{job.get('text')}
"""

    expected_schema = {
        "type": "OBJECT",
        "properties": {
            "score": { "type": "INTEGER" },
            "matchedSkills": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            },
            "missingSkills": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            },
            "explanation": { "type": "STRING" },
            "gapAnalysis": { "type": "STRING" },
            "interviewQuestions": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            }
        },
        "required": [
            "score",
            "matchedSkills",
            "missingSkills",
            "explanation",
            "gapAnalysis",
            "interviewQuestions"
        ]
    }

    try:
        report = call_gemini_json(prompt, system_prompt, expected_schema)
    except Exception as e:
        print(f"Notice: Gemini LLM call skipped or failed ({e}), using NLP fallback match.")
        report = fallback_match(cand, job)
        
    # update candidate history matching variables
    for c in candidates:
        if c.get("id") == req.candidateId:
            c["score"] = report.get("score")
            c["lastMatchedJobId"] = req.jobId
            c["lastMatchedJobTitle"] = job.get("title")
            c["lastMatchAt"] = datetime.utcnow().isoformat() + "Z"
            c["explanation"] = report.get("explanation")
            c["matchedSkills"] = report.get("matchedSkills")
            c["missingSkills"] = report.get("missingSkills")
            break
            
    db["candidates"] = candidates
    save_db(db)
    
    return {
        "candidateId": req.candidateId,
        "jobId": req.jobId,
        "score": report.get("score"),
        "predictedRole": cand.get("predictedRole"),
        "explanation": report.get("explanation"),
        "matchedSkills": report.get("matchedSkills"),
        "missingSkills": report.get("missingSkills"),
        "gapAnalysis": report.get("gapAnalysis"),
        "interviewQuestions": report.get("interviewQuestions")
    }

@app.post("/api/compare")
def compare_candidates(req: CompareRequest):
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    cand1 = next((c for c in candidates if c.get("id") == req.candidateId1), None)
    cand2 = next((c for c in candidates if c.get("id") == req.candidateId2), None)
    job = next((j for j in jobs if j.get("id") == req.jobId), None)
    
    if not cand1 or not cand2 or not job:
        raise HTTPException(status_code=404, detail="One or more candidate profiles or target Job posting not found.")
        
    system_prompt = "You are a friendly, down-to-earth hiring advisor. Compare the two candidates side-by-side in a warm, highly clear, simple, and humanized way that anyone can understand. Focus on practical, real-world examples and helpful feedback. Do not use complex jargon or dry clinical wording."
    
    prompt = f"""
Compare Candidate A and Candidate B side-by-side for the target job opening. Write the verdict, key differentiators, strengths, and feedback categories in an encouraging, extremely simple, and accessible tone. Avoid complex recruiter terms.

Job Posting:
Title: {job.get('title')}
Required Skills: {job.get('requiredSkills')}
Description: {job.get('text')}

Candidate A:
Name: {cand1.get('name')}
Role: {cand1.get('predictedRole')}
Skills: {cand1.get('skills')}
Experience Summary: {cand1.get('experienceSummary')}
Resume Text: {cand1.get('resumeText')}

Candidate B:
Name: {cand2.get('name')}
Role: {cand2.get('predictedRole')}
Skills: {cand2.get('skills')}
Experience Summary: {cand2.get('experienceSummary')}
Resume Text: {cand2.get('resumeText')}
"""

    expected_schema = {
        "type": "OBJECT",
        "properties": {
            "scoreA": { "type": "INTEGER" },
            "scoreB": { "type": "INTEGER" },
            "comparisonPoints": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "category": { "type": "STRING" },
                        "candAFeedback": { "type": "STRING" },
                        "candBFeedback": { "type": "STRING" }
                    },
                    "required": ["category", "candAFeedback", "candBFeedback"]
                }
            },
            "strengthsA": { "type": "ARRAY", "items": { "type": "STRING" } },
            "strengthsB": { "type": "ARRAY", "items": { "type": "STRING" } },
            "gapsA": { "type": "ARRAY", "items": { "type": "STRING" } },
            "gapsB": { "type": "ARRAY", "items": { "type": "STRING" } },
            "verdict": { "type": "STRING" },
            "keyDifferentiator": { "type": "STRING" }
        },
        "required": [
            "scoreA", "scoreB", "comparisonPoints", 
            "strengthsA", "strengthsB", "gapsA", "gapsB", 
            "verdict", "keyDifferentiator"
        ]
    }
    
    try:
        report = call_gemini_json(prompt, system_prompt, expected_schema)
    except Exception as e:
        print(f"Notice: Gemini LLM call skipped or failed ({e}), using NLP fallback compare.")
        report = fallback_compare(cand1, cand2, job)

    return {
        "candidate1Id": req.candidateId1,
        "candidate2Id": req.candidateId2,
        "candidate1Name": cand1.get("name"),
        "candidate2Name": cand2.get("name"),
        "jobId": req.jobId,
        "jobTitle": job.get("title"),
        **report
    }

@app.post("/api/enhance")
def enhance_resume(req: EnhanceRequest):
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    cand = next((c for c in candidates if c.get("id") == req.candidateId), None)
    job = next((j for j in jobs if j.get("id") == req.jobId), None)
    
    if not cand or not job:
        raise HTTPException(status_code=404, detail="Candidate profile or target Job posting not found.")
        
    system_prompt = "You are a friendly, encouraging career advisor and supportive resume coach. Provide helpful, down-to-earth tips and rewrites on how to improve the resume in extremely clear, simple, warm, and humanized language that anyone can understand. Keep it engaging, practical, and highly positive."
    
    prompt = f"""
Help improve this candidate's resume so it matches the target job nicely. Write the enhanced summary, critique, and work bullet rewrites in a warm, simple, supportive, and human tone that is super easy to read and highly encouraging.

Job Posting:
Title: {job.get('title')}
Required Skills: {job.get('requiredSkills')}
Description: {job.get('text')}

Candidate Profile:
Name: {cand.get('name')}
Role: {cand.get('predictedRole')}
Skills: {cand.get('skills')}
Experience Summary: {cand.get('experienceSummary')}
Resume Text: {cand.get('resumeText')}
"""

    expected_schema = {
        "type": "OBJECT",
        "properties": {
            "originalSummary": { "type": "STRING" },
            "enhancedSummary": { "type": "STRING" },
            "suggestedSkillsToAdd": { "type": "ARRAY", "items": { "type": "STRING" } },
            "bulletOptimizations": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "originalBullet": { "type": "STRING" },
                        "suggestedBullet": { "type": "STRING" },
                        "rationale": { "type": "STRING" }
                    },
                    "required": ["originalBullet", "suggestedBullet", "rationale"]
                }
            },
            "resumeCritique": { "type": "STRING" }
        },
        "required": ["originalSummary", "enhancedSummary", "suggestedSkillsToAdd", "bulletOptimizations", "resumeCritique"]
    }
    
    try:
        report = call_gemini_json(prompt, system_prompt, expected_schema)
    except Exception as e:
        print(f"Notice: Gemini LLM call skipped or failed ({e}), using NLP fallback enhance.")
        report = fallback_enhance(cand, job)

    return {
        "candidateId": req.candidateId,
        "candidateName": cand.get("name"),
        "jobId": req.jobId,
        "jobTitle": job.get("title"),
        **report
    }

@app.get("/api/skills-trend")
def skills_trend_analysis():
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    job_skills_count = {}
    total_jobs = len(jobs)
    for j in jobs:
        for s in j.get("requiredSkills", []):
            skill_clean = s.strip()
            if skill_clean:
                job_skills_count[skill_clean] = job_skills_count.get(skill_clean, 0) + 1
                
    cand_skills_count = {}
    total_candidates = len(candidates)
    for c in candidates:
        for s in c.get("skills", []):
            skill_clean = s.strip()
            if skill_clean:
                cand_skills_count[skill_clean] = cand_skills_count.get(skill_clean, 0) + 1
                
    top_requested = []
    for skill, count in sorted(job_skills_count.items(), key=lambda x: x[1], reverse=True):
        top_requested.append({
            "skill": skill,
            "demandCount": count,
            "demandPercentage": round((count / total_jobs) * 100, 1) if total_jobs > 0 else 0
        })
        
    top_supplied = []
    for skill, count in sorted(cand_skills_count.items(), key=lambda x: x[1], reverse=True):
        top_supplied.append({
            "skill": skill,
            "supplyCount": count,
            "supplyPercentage": round((count / total_candidates) * 100, 1) if total_candidates > 0 else 0
        })
        
    gaps = []
    all_req_skills = set(job_skills_count.keys())
    for skill in all_req_skills:
        req_pct = (job_skills_count[skill] / total_jobs) if total_jobs > 0 else 0
        sup_pct = (cand_skills_count.get(skill, 0) / total_candidates) if total_candidates > 0 else 0
        gap_value = max(0.0, req_pct - sup_pct)
        gaps.append({
            "skill": skill,
            "gapValue": round(gap_value * 100, 1),
            "demandCount": job_skills_count[skill],
            "supplyCount": cand_skills_count.get(skill, 0)
        })
    gaps = sorted(gaps, key=lambda x: x["gapValue"], reverse=True)[:10]
    
    if not jobs or not candidates:
        ai_narrative = "Please add some job openings and upload candidate resumes to build your friendly skills gap report!"
    else:
        system_prompt = "You are a friendly, down-to-earth career advisor who makes job market trends simple to understand. Describe the skills trends in warm, clear, everyday language that anyone can understand. Keep it engaging, straightforward, and humanized."
        prompt = f"""
Analyze the skills trends between our job openings and candidates.

Total Job Openings: {total_jobs}
Job Skills Requested: {job_skills_count}

Total Candidates: {total_candidates}
Candidate Skills: {cand_skills_count}

Top Skills Gaps:
{[{'skill': g['skill'], 'gap_percentage_points': g['gapValue']} for g in gaps]}

Write a warm, easy-to-understand summary explaining:
1. What skills are highly sought after vs. which are plentiful.
2. Friendly tips on how we can bridge these skill gaps.
3. Simple, encouraging advice on what skills might be worth learning next.

Keep it simple, highly readable, under 300 words.
"""
        expected_schema = {
            "type": "OBJECT",
            "properties": {
                "insights": { "type": "STRING" },
                "recommendation": { "type": "STRING" },
                "trendingDomain": { "type": "STRING" }
            },
            "required": ["insights", "recommendation", "trendingDomain"]
        }
        
        try:
            ai_report = call_gemini_json(prompt, system_prompt, expected_schema)
            ai_narrative = ai_report.get("insights", "") + "\n\n**Actionable Recommendation:** " + ai_report.get("recommendation", "")
        except Exception:
            ai_narrative = "Analysis completed. Significant demand found for " + ", ".join(list(all_req_skills)[:5]) + ". Sourcing focus recommended for the highest gap skills."
            
    return {
        "topRequestedSkills": top_requested[:10],
        "topSuppliedSkills": top_supplied[:10],
        "supplyDemandGap": gaps,
        "aiMarketNarrative": ai_narrative
    }
