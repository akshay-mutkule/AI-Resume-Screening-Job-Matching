import time
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
        
    system_prompt = "You are a professional recruiting panel analyst. Compare two candidates side-by-side for a specific job."
    
    prompt = f"""
Compare Candidate A and Candidate B side-by-side for the target job opening.

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
        return {
            "candidate1Id": req.candidateId1,
            "candidate2Id": req.candidateId2,
            "candidate1Name": cand1.get("name"),
            "candidate2Name": cand2.get("name"),
            "jobId": req.jobId,
            "jobTitle": job.get("title"),
            **report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/enhance")
def enhance_resume(req: EnhanceRequest):
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    cand = next((c for c in candidates if c.get("id") == req.candidateId), None)
    job = next((j for j in jobs if j.get("id") == req.jobId), None)
    
    if not cand or not job:
        raise HTTPException(status_code=404, detail="Candidate profile or target Job posting not found.")
        
    system_prompt = "You are an elite expert in resume writing, ATS (Applicant Tracking System) optimization, and career coaching."
    
    prompt = f"""
Optimize this candidate's resume summary, skills list, and bullet points specifically to match the target job description.
The target is to maximize their match rate in an Applicant Tracking System while maintaining truthfulness.

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
        return {
            "candidateId": req.candidateId,
            "candidateName": cand.get("name"),
            "jobId": req.jobId,
            "jobTitle": job.get("title"),
            **report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/skills-trend")
def skills_trend_analysis():
    db = load_db()
    candidates = db.get("candidates", [])
    jobs = db.get("jobs", [])
    
    # Simple Python aggregation
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
                
    # Format the stats
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
        
    # Calculate gap (required skills that candidates don't have enough of)
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
    
    # Generate an intelligent AI Market Narrative
    if not jobs or not candidates:
        ai_narrative = "Please configure more job specifications and upload candidate resumes to generate an AI-powered talent market insight report."
    else:
        system_prompt = "You are a Chief People Officer and labor market expert specializing in technical sourcing and skills analytics."
        prompt = f"""
Analyze the skills market dynamic between our open jobs and applicant talent pool.

Total Job Openings: {total_jobs}
Requested Job Skills frequency: {job_skills_count}

Total Candidates: {total_candidates}
Possessed Candidate Skills frequency: {cand_skills_count}

Top Skills Gaps (Demand % minus Supply %):
{[{'skill': g['skill'], 'gap_percentage_points': g['gapValue']} for g in gaps]}

Write a concise market insights summary covering:
1. Talent supply-demand dynamics (where is the talent pool dry vs. saturated).
2. Sourcing recommendations (how to close critical skill gaps).
3. Talent development advice (what skills current staff or incoming hires should be trained on).
Keep it under 300 words. Format cleanly with headers or bullets.
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
            ai_narrative = "Analysis completed. Significant demand found for " + ", ".join(all_req_skills) + ". Sourcing focus recommended for the highest gap skills."
            
    return {
        "topRequestedSkills": top_requested[:10],
        "topSuppliedSkills": top_supplied[:10],
        "supplyDemandGap": gaps,
        "aiMarketNarrative": ai_narrative
    }

