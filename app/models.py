from pydantic import BaseModel
from typing import List, Optional

class CandidateBase(BaseModel):
    name: Optional[str] = "Candidate"
    email: Optional[str] = "candidate@example.com"
    phone: Optional[str] = ""
    skills: Optional[List[str]] = []
    predictedRole: Optional[str] = "Professional"
    source: Optional[str] = "Manual Entry"
    resumeText: Optional[str] = ""
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
    isShortlisted: bool = False

class JobBase(BaseModel):
    title: Optional[str] = ""
    text: Optional[str] = ""
    requiredSkills: Optional[List[str]] = []

class AnalyzeResumeRequest(BaseModel):
    resumeText: Optional[str] = ""
    filename: Optional[str] = "uploaded_resume.txt"

class MatchingRequest(BaseModel):
    candidateId: Optional[str] = ""
    jobId: Optional[str] = ""

class CompareRequest(BaseModel):
    candidateId1: Optional[str] = ""
    candidateId2: Optional[str] = ""
    jobId: Optional[str] = ""

class EnhanceRequest(BaseModel):
    candidateId: Optional[str] = ""
    jobId: Optional[str] = ""
