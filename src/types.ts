export type PipelineStage = "sourced" | "screened" | "interview" | "team_match" | "offer" | "hired";

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
  pipelineStage?: PipelineStage;
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
    pipelineStage?: PipelineStage;
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

export interface SalaryBenchmarkResult {
  roleTitle: string;
  experienceLevel: string;
  baseSalary: {
    p25: number;
    median: number;
    p75: number;
    p90: number;
  };
  estimatedEquityRange: string;
  estimatedTargetBonus: string;
  totalCompMedian: number;
  geoTiers: {
    tier1: string; // SF / NYC / Remote US (High)
    tier2: string; // Austin / Seattle / Chicago / London
    tier3: string; // Global Remote / Low Cost
  };
  marketRarityMultiplier: number;
  marketRarityComment: string;
  negotiationPointers: string[];
}

export interface TechnicalChallengeResult {
  title: string;
  difficulty: "Medium" | "Hard" | "Staff / Expert";
  timeLimitMinutes: number;
  problemStatement: string;
  targetedSkillGaps: string[];
  realWorldScenario: string;
  constraints: string[];
  starterCode: {
    language: "python" | "typescript";
    code: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    explanation: string;
  }[];
  rubric: {
    category: string;
    weight: string;
    criteria: string;
  }[];
}

export interface LearningResource {
  skill: string;
  category: "Documentation" | "Interactive Course" | "Open Source Architecture" | "Hands-on Lab";
  title: string;
  url: string;
  description: string;
  estimatedHours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface OutreachTouchpoint {
  id: string;
  channel: "Email" | "LinkedIn" | "Follow-up" | "Executive";
  timing: string;
  subject: string;
  body: string;
  personalizedHook: string;
  callToAction: string;
}

export interface OutreachSequence {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  tone: "Founder-to-Founder" | "Engineering Leader" | "Executive" | "Growth & Culture";
  keyStrengthsReferenced: string[];
  touchpoints: OutreachTouchpoint[];
}

export interface SquadMemberAssignment {
  candidateId: string;
  name: string;
  assignedRole: string;
  primaryDomain: string;
  keyResponsibilities: string[];
  keySkillsProvided: string[];
}

export interface EngineeringSquadPlan {
  objective: string;
  squadName: string;
  synergyScore: number;
  summary: string;
  members: SquadMemberAssignment[];
  competencyCoverage: {
    frontend: number;
    backend: number;
    cloudDevOps: number;
    aiMachineLearning: number;
    systemDesign: number;
    teamVelocity: number;
  };
  complementarySynergies: string[];
  potentialRisksAndMitigations: { risk: string; mitigation: string }[];
}

export interface CodeReviewReport {
  timeComplexity: string;
  spaceComplexity: string;
  bigOScore: number;
  codeQualityScore: number;
  strengths: string[];
  edgeCaseVulnerabilities: string[];
  suggestedImprovements: string[];
  refactoredSnippet: string;
}

export interface ReferenceCheckReport {
  candidateId: string;
  candidateName: string;
  targetRole: string;
  verifiableClaims: {
    claim: string;
    context: string;
    probeQuestion: string;
    greenFlags: string;
    redFlags: string;
  }[];
  managerQuestions: string[];
  peerQuestions: string[];
}

