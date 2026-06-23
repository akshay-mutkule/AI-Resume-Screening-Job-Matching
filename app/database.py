import json
import os
from typing import Dict, Any, List

DB_DIR = "data"
DB_FILE = os.path.join(DB_DIR, "db.json")

def ensure_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
    if not os.path.exists(DB_FILE):
        initial_data = {
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
                    "text": "We are seeking a Lead AI Engineer to architect, build, and deploy NLP extraction...",
                    "requiredSkills": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "SQL", "Docker", "Git", "Machine Learning", "NLP"],
                    "createdAt": "2026-06-20T22:24:00.000Z"
                },
                {
                    "id": "job-2",
                    "title": "Senior Full Stack Dev",
                    "text": "We are looking for a Senior Developer who loves crafting amazing clean frontend components in React...",
                    "requiredSkills": ["Python", "SQL", "React", "Docker", "AWS", "Git", "FastAPI", "TypeScript", "REST API"],
                    "createdAt": "2026-06-20T22:24:00.000Z"
                }
            ]
        }
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=2, ensure_ascii=False)

def load_db() -> Dict[str, Any]:
    ensure_db()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"candidates": [], "jobs": []}

def save_db(data: Dict[str, Any]):
    ensure_db()
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
