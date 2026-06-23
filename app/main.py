import time
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    CandidateBase, 
    CandidateUpdateShortlist, 
    JobBase, 
    AnalyzeResumeRequest, 
    MatchingRequest
)
from app.database import load_db, save_db
from app.gemini import call_gemini_json

app = FastAPI(title="MatchMind AI Python Backend", version="1.0.0")

# Enable CORS of FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # Prepend to mimic our unshift list ordering
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
    clean_skills = [s.strip() for s in job.requiredSkills if s.strip()]
    
    new_job = {
        "id": new_id,
        "title": job.title or "Untitled Job Opening",
        "text": job.text or "",
        "requiredSkills": clean_skills,
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
        
    system_prompt = "You are an elite AI Resume Parser and HR Recruiter. Extract metrics precisely to match the structured schema."
    
    prompt = f"""Extract candidate bio, credentials and skills from this raw candidate resume.
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
        
        db = load_db()
        new_candidate = {
            "id": f"cand-{int(time.time() * 1000)}",
            "name": parsed_json.get("name", "Candidate"),
            "email": parsed_json.get("email", "info@example.com"),
            "phone": parsed_json.get("phone", ""),
            "skills": parsed_json.get("skills", []),
            "predictedRole": parsed_json.get("predictedRole", "Software Professional"),
            "source": req.filename or "Pasted Text",
            "resumeText": req.resumeText,
            "experienceSummary": parsed_json.get("experienceSummary", ""),
            "education": parsed_json.get("education", ""),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "isShortlisted": False
        }
        
        if "candidates" not in db:
            db["candidates"] = []
        db["candidates"].insert(0, new_candidate)
        save_db(db)
        return new_candidate
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/match")
def match_candidate_job(req: MatchingRequest):
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    cand = next((c for c in candidates if c.get("id") == req.candidateId), None)
    job = next((j for j in jobs if j.get("id") == req.jobId), None)
    
    if not cand or not job:
        raise HTTPException(status_code=404, detail="Candidate profile or target Job posting not found.")
        
    system_prompt = "You are a professional recruiting algorithms compiler. Compute candidate match matrix overlapping metrics."
    
    prompt = f"""
Compare the candidate's custom resume against the target job posting title and details.

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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
