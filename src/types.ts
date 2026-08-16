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
  radarMetrics?: {
    hardSkills: number;
    experienceDepth: number;
    systemArchitecture: number;
    problemSolving: number;
    collaboration: number;
    growthPotential: number;
  };
}

export interface JobDescription {
  id: string;
  title: string;
  text: string;
  requiredSkills: string[];
  department?: string;
  experienceLevel?: string;
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
  radarMetrics?: {
    hardSkills: number;
    experienceDepth: number;
    systemArchitecture: number;
    problemSolving: number;
    collaboration: number;
    growthPotential: number;
  };
  upskillingRoadmap?: {
    day30: string[];
    day60: string[];
    day90: string[];
    recommendedProjects: string[];
    certifications: string[];
  };
}

export interface InterviewMessage {
  role: "interviewer" | "candidate" | "system";
  text: string;
  timestamp: string;
  feedback?: {
    score: number;
    critique: string;
    suggestedAnswer: string;
    strengths: string[];
  };
}

export interface BatchScreeningResult {
  jobId: string;
  jobTitle: string;
  rankedCandidates: {
    candidateId: string;
    name: string;
    predictedRole: string;
    score: number;
    matchedSkillsCount: number;
    missingSkillsCount: number;
    topSkills: string[];
    recommendation: "Strong Hire" | "Consider" | "Needs Development" | "Not Aligned";
    keyHighlights: string;
    isShortlisted: boolean;
  }[];
  totalScreened: number;
  averageScore: number;
  topSkillGaps: string[];
}

export interface JobOptimizationResult {
  originalTitle: string;
  enhancedTitle: string;
  inclusivityScore: number;
  clarityScore: number;
  readabilityScore: number;
  critique: string;
  identifiedBiases: string[];
  missingCrucialSkills: string[];
  enhancedDescription: string;
  keySellingPoints: string[];
}
