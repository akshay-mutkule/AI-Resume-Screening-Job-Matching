export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  predictedRole: string;
  source?: string;
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
  isShortlisted?: boolean;
  createdAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  text: string;
  requiredSkills: string[];
  createdAt: string;
}

export interface MatchReport {
  candidateId: string;
  jobId: string;
  score: number;
  predictedRole: string;
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  experienceSummary: string;
  gapAnalysis: string;
  interviewQuestions: string[];
}
