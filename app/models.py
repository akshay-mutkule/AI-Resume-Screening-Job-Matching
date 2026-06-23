from pydantic import BaseModel, EmailStr
from typing import List, Optional

class CandidateBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    skills: List[str] = []
    predictedRole: str = "Unknown"
    source: Optional[str] = "Manual Entry"
    resumeText: str = ""
    score: Optional[int] = None
    lastMatchedJobId: Optional[str] = None
    lastMatchedJobTitle: Optional[str] = None
    lastMatchAt: Optional[str] = None
    explanation: Optional[str] = None
    matchedSkills: Optional[List[str]] = []
    missingSkills: Optional[List[str]] = []
    experienceSummary: Optional[str] = ""
    education: Optional[str] = ""
    isShortlisted: Optional[bool] = False

class CandidateUpdateShortlist(BaseModel):
    isShortlisted: bool

class JobBase(BaseModel):
    title: str
    text: str
    requiredSkills: List[str] = []

class AnalyzeResumeRequest(BaseModel):
    resumeText: str
    filename: Optional[str] = "uploaded_resume.txt"

class MatchingRequest(BaseModel):
    candidateId: str
    jobId: str
