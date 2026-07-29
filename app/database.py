import json
import os
import sqlite3
from typing import Dict, Any, List

DB_DIR = "data"
DB_FILE = os.path.join(DB_DIR, "db.json")
SQLITE_FILE = os.path.join(DB_DIR, "matchmind.db")

def get_db_connection():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(SQLITE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create candidates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        skills TEXT,
        predictedRole TEXT,
        source TEXT,
        resumeText TEXT,
        score INTEGER,
        lastMatchedJobId TEXT,
        lastMatchedJobTitle TEXT,
        lastMatchAt TEXT,
        explanation TEXT,
        matchedSkills TEXT,
        missingSkills TEXT,
        experienceSummary TEXT,
        education TEXT,
        isShortlisted INTEGER DEFAULT 0,
        createdAt TEXT
    )
    """)
    
    # Create jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        text TEXT,
        requiredSkills TEXT,
        createdAt TEXT
    )
    """)
    
    conn.commit()
    
    # Check if empty, seed default records
    cursor.execute("SELECT COUNT(*) FROM candidates")
    cand_count = cursor.fetchone()[0]
    
    if cand_count == 0:
        # Check if legacy db.json exists
        seed_data = None
        if os.path.exists(DB_FILE):
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    seed_data = json.load(f)
            except Exception:
                pass
                
        if not seed_data or not seed_data.get("candidates"):
            seed_data = {
                "candidates": [
                    {
                        "id": "cand-1",
                        "name": "Alexander Mercer",
                        "email": "alex.mercer@gmail.com",
                        "phone": "+1 (555) 349-9281",
                        "skills": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
                        "predictedRole": "AI Engineer",
                        "source": "alex_mercer_cv.pdf",
                        "resumeText": "Alexander Mercer\nAI Engineer & Machine Learning Specialist...",
                        "score": 95,
                        "lastMatchedJobId": "job-1",
                        "lastMatchedJobTitle": "Lead AI Engineer",
                        "lastMatchAt": "2026-06-20T22:30:00.000Z",
                        "explanation": "This candidate has outstanding alignment with the Lead AI Engineer requirements.",
                        "matchedSkills": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
                        "missingSkills": [],
                        "experienceSummary": "4+ years of hands-on experience building neural networks, LLM agents.",
                        "education": "M.S. in Computer Science - Stanford University",
                        "isShortlisted": True,
                        "createdAt": "2026-06-20T22:25:00.000Z"
                    },
                    {
                        "id": "cand-2",
                        "name": "Sarah Jenkins",
                        "email": "sarah.j.code@yahoo.com",
                        "phone": "+1 (555) 832-1100",
                        "skills": ["React", "TypeScript", "Node.js", "Express", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Git", "Jest"],
                        "predictedRole": "Frontend Developer",
                        "source": "sarah_jenkins_web.txt",
                        "resumeText": "Sarah Jenkins - Frontend Engineer...",
                        "score": 87,
                        "lastMatchedJobId": "job-2",
                        "lastMatchedJobTitle": "Senior Full Stack Dev",
                        "lastMatchAt": "2026-06-20T22:31:00.000Z",
                        "explanation": "Sarah exhibits high proficiency in modern client-side architectures.",
                        "matchedSkills": ["React", "TypeScript", "Node.js", "Express", "Git"],
                        "missingSkills": ["Python", "SQL", "Docker", "AWS", "FastAPI"],
                        "experienceSummary": "3 years of front-end experience crafting highly responsive applications.",
                        "education": "B.S. in Computer Information Systems - Georgia Tech",
                        "isShortlisted": False,
                        "createdAt": "2026-06-20T22:25:00.000Z"
                    }
                ],
                "jobs": [
                    {
                        "id": "job-1",
                        "title": "Lead AI Engineer",
                        "text": "We are seeking a Lead AI Engineer to architect, build, and deploy NLP extraction pipelines and microservices.",
                        "requiredSkills": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
                        "createdAt": "2026-06-20T22:24:00.000Z"
                    },
                    {
                        "id": "job-2",
                        "title": "Senior Full Stack Dev",
                        "text": "We are looking for a Senior Developer who loves crafting clean frontend components in React and TypeScript.",
                        "requiredSkills": ["Python", "SQL", "React", "Docker", "AWS", "Git", "FastAPI", "TypeScript", "REST API"],
                        "createdAt": "2026-06-20T22:24:00.000Z"
                    }
                ]
            }
            
        for cand in seed_data.get("candidates", []):
            cursor.execute("""
            INSERT OR REPLACE INTO candidates (
                id, name, email, phone, skills, predictedRole, source, resumeText,
                score, lastMatchedJobId, lastMatchedJobTitle, lastMatchAt, explanation,
                matchedSkills, missingSkills, experienceSummary, education, isShortlisted, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cand.get("id"),
                cand.get("name", "Candidate"),
                cand.get("email", ""),
                cand.get("phone", ""),
                json.dumps(cand.get("skills", [])),
                cand.get("predictedRole", "Software Professional"),
                cand.get("source", "Manual Entry"),
                cand.get("resumeText", ""),
                cand.get("score"),
                cand.get("lastMatchedJobId", ""),
                cand.get("lastMatchedJobTitle", ""),
                cand.get("lastMatchAt", ""),
                cand.get("explanation", ""),
                json.dumps(cand.get("matchedSkills", [])),
                json.dumps(cand.get("missingSkills", [])),
                cand.get("experienceSummary", ""),
                cand.get("education", ""),
                1 if cand.get("isShortlisted") else 0,
                cand.get("createdAt", "2026-06-20T22:25:00.000Z")
            ))
            
        for job in seed_data.get("jobs", []):
            cursor.execute("""
            INSERT OR REPLACE INTO jobs (id, title, text, requiredSkills, createdAt)
            VALUES (?, ?, ?, ?, ?)
            """, (
                job.get("id"),
                job.get("title", "Untitled Opening"),
                job.get("text", ""),
                json.dumps(job.get("requiredSkills", [])),
                job.get("createdAt", "2026-06-20T22:24:00.000Z")
            ))
            
        conn.commit()
        
    conn.close()

def ensure_db():
    init_sqlite_db()

def load_db() -> Dict[str, Any]:
    init_sqlite_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM candidates ORDER BY createdAt DESC")
    cand_rows = cursor.fetchall()
    candidates = []
    for row in cand_rows:
        cand = dict(row)
        cand["skills"] = json.loads(cand.get("skills") or "[]")
        cand["matchedSkills"] = json.loads(cand.get("matchedSkills") or "[]")
        cand["missingSkills"] = json.loads(cand.get("missingSkills") or "[]")
        cand["isShortlisted"] = bool(cand.get("isShortlisted"))
        candidates.append(cand)
        
    cursor.execute("SELECT * FROM jobs ORDER BY createdAt DESC")
    job_rows = cursor.fetchall()
    jobs = []
    for row in job_rows:
        job = dict(row)
        job["requiredSkills"] = json.loads(job.get("requiredSkills") or "[]")
        jobs.append(job)
        
    conn.close()
    
    result = {"candidates": candidates, "jobs": jobs}
    
    # Sync json backup asynchronously/safely
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
    except Exception:
        pass
        
    return result

def save_db(data: Dict[str, Any]):
    init_sqlite_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if "candidates" in data:
        cursor.execute("DELETE FROM candidates")
        for cand in data["candidates"]:
            cursor.execute("""
            INSERT INTO candidates (
                id, name, email, phone, skills, predictedRole, source, resumeText,
                score, lastMatchedJobId, lastMatchedJobTitle, lastMatchAt, explanation,
                matchedSkills, missingSkills, experienceSummary, education, isShortlisted, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cand.get("id"),
                cand.get("name", "Candidate"),
                cand.get("email", ""),
                cand.get("phone", ""),
                json.dumps(cand.get("skills", [])),
                cand.get("predictedRole", "Software Professional"),
                cand.get("source", "Manual Entry"),
                cand.get("resumeText", ""),
                cand.get("score"),
                cand.get("lastMatchedJobId", ""),
                cand.get("lastMatchedJobTitle", ""),
                cand.get("lastMatchAt", ""),
                cand.get("explanation", ""),
                json.dumps(cand.get("matchedSkills", [])),
                json.dumps(cand.get("missingSkills", [])),
                cand.get("experienceSummary", ""),
                cand.get("education", ""),
                1 if cand.get("isShortlisted") else 0,
                cand.get("createdAt", "")
            ))
            
    if "jobs" in data:
        cursor.execute("DELETE FROM jobs")
        for job in data["jobs"]:
            cursor.execute("""
            INSERT INTO jobs (id, title, text, requiredSkills, createdAt)
            VALUES (?, ?, ?, ?, ?)
            """, (
                job.get("id"),
                job.get("title", "Untitled Opening"),
                job.get("text", ""),
                json.dumps(job.get("requiredSkills", [])),
                job.get("createdAt", "")
            ))
            
    conn.commit()
    conn.close()
    
    # Also sync db.json backup
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception:
        pass
