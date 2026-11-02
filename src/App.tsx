import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  Users, 
  Search, 
  Database, 
  Cpu, 
  Check, 
  FileSpreadsheet, 
  Phone, 
  Mail, 
  Clock, 
  GraduationCap, 
  Award,
  AlertCircle,
  Swords,
  Wand2,
  BarChart3,
  Bot,
  Trophy,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Filter,
  Download,
  DollarSign,
  Code2,
  Layers,
  Upload,
  Coins
} from "lucide-react";
import { Candidate, JobDescription, MatchReport, PipelineStage } from "./types";
import { 
  InteractiveVenn, 
  TalentQuadrantMatrix, 
  BattleSkillsOverlap, 
  SkillRadarChart, 
  RoadmapTimelineVisualizer 
} from "./components/InteractiveVisuals";
import { InterviewStudio } from "./components/InterviewStudio";
import { BatchScreener } from "./components/BatchScreener";
import { JobOptimizer } from "./components/JobOptimizer";
import { TalentDossierModal } from "./components/TalentDossierModal";
import { TalentPipelineKanban } from "./components/TalentPipelineKanban";
import { CompensationCalculator } from "./components/CompensationCalculator";
import { TechnicalAssessmentStudio } from "./components/TechnicalAssessmentStudio";

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  
  // Selection states
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<
    "home" | "pipeline" | "matches" | "interview" | "challenges" | "compensation" | "batch" | "battle" | "enhancer" | "optimizer" | "trends" | "talent" | "jobs"
  >("home");

  const [searchTerm, setSearchTerm] = useState("");
  const [semanticSearchActive, setSemanticSearchActive] = useState(false);
  
  // Advanced Features State
  const [compareCand1Id, setCompareCand1Id] = useState<string>("");
  const [compareCand2Id, setCompareCand2Id] = useState<string>("");
  const [compareJobId, setCompareJobId] = useState<string>("");
  const [isLoadingCompare, setIsLoadingCompare] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<any>(null);

  const [enhanceCandId, setEnhanceCandId] = useState<string>("");
  const [enhanceJobId, setEnhanceJobId] = useState<string>("");
  const [isLoadingEnhance, setIsLoadingEnhance] = useState<boolean>(false);
  const [enhanceResult, setEnhanceResult] = useState<any>(null);

  const [isLoadingTrends, setIsLoadingTrends] = useState<boolean>(false);
  const [trendsResult, setTrendsResult] = useState<any>(null);

  // Dossier Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // Modals state
  const [showAddResume, setShowAddResume] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  
  // Form values
  const [resumeText, setResumeText] = useState("");
  const [resumeFilename, setResumeFilename] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobDepartment, setJobDepartment] = useState("");

  // Match report state
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);
  
  // System feedback notification
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
        if (data.length > 0 && !selectedCandidateId) {
          setSelectedCandidateId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading candidates", err);
      showNotification("Could not load candidates from backend.", "error");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        if (data.length > 0 && !selectedJobId) {
          setSelectedJobId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading jobs", err);
      showNotification("Could not load job postings.", "error");
    }
  };

  const seedDemoData = async () => {
    try {
      const res = await fetch("/api/seed-demo-data", { method: "POST" });
      if (res.ok) {
        await Promise.all([fetchCandidates(), fetchJobs()]);
        showNotification("Seeded 5 rich talent profiles and 4 diverse job vacancies!", "success");
      }
    } catch (err) {
      showNotification("Failed seeding sample data.", "error");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingInitial(true);
      await Promise.all([fetchCandidates(), fetchJobs()]);
      setLoadingInitial(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      if (!compareCand1Id) setCompareCand1Id(candidates[0].id);
      if (!compareCand2Id) setCompareCand2Id(candidates[1]?.id || candidates[0].id);
      if (!enhanceCandId) setEnhanceCandId(candidates[0].id);
    }
  }, [candidates]);

  useEffect(() => {
    if (jobs.length > 0) {
      if (!compareJobId) setCompareJobId(jobs[0].id);
      if (!enhanceJobId) setEnhanceJobId(jobs[0].id);
    }
  }, [jobs]);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleShortlistToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/candidates/${id}/shortlist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isShortlisted: !currentStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, isShortlisted: updated.isShortlisted } : c));
        showNotification(
          `${updated.name} has been ${updated.isShortlisted ? "shortlisted" : "removed from shortlist"}.`, 
          "success"
        );
      }
    } catch (err) {
      showNotification("Error updating shortlist flag.", "error");
    }
  };

  const handleUpdateStage = async (id: string, newStage: PipelineStage) => {
    try {
      const res = await fetch(`/api/candidates/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, pipelineStage: newStage } : c));
        showNotification(
          `Moved ${updated.name} to ${newStage.replace('_', ' ').toUpperCase()} stage.`, 
          "info"
        );
      }
    } catch (err) {
      showNotification("Failed updating candidate stage.", "error");
    }
  };

  const handleDeleteCandidate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== id));
        if (selectedCandidateId === id) {
          const remaining = candidates.filter(c => c.id !== id);
          setSelectedCandidateId(remaining[0]?.id || null);
        }
        showNotification("Candidate profile removed.", "info");
      }
    } catch (err) {
      showNotification("Could not delete candidate.", "error");
    }
  };

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        if (selectedJobId === id) {
          const remaining = jobs.filter(j => j.id !== id);
          setSelectedJobId(remaining[0]?.id || null);
        }
        showNotification("Job posting removed.", "info");
      }
    } catch (err) {
      showNotification("Could not delete job.", "error");
    }
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          filename: resumeFilename || "Uploaded Resume"
        })
      });

      if (res.ok) {
        const newCand = await res.json();
        setCandidates(prev => [newCand, ...prev]);
        setSelectedCandidateId(newCand.id);
        setShowAddResume(false);
        setResumeText("");
        setResumeFilename("");
        showNotification(`Extracted skills for ${newCand.name}!`, "success");
      } else {
        const err = await res.json();
        showNotification(err.detail || "Error parsing resume", "error");
      }
    } catch (err) {
      showNotification("Failed to analyze resume.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setResumeFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setResumeText(text);
        showNotification(`Loaded ${file.name} (${text.length} characters)`, "info");
      }
    };
    reader.readAsText(file);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsPostingJob(true);
    try {
      const skillsArray = jobSkills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle || undefined,
          text: jobDescription,
          requiredSkills: skillsArray.length > 0 ? skillsArray : undefined,
          department: jobDepartment || undefined
        })
      });

      if (res.ok) {
        const newJob = await res.json();
        setJobs(prev => [newJob, ...prev]);
        setSelectedJobId(newJob.id);
        setShowAddJob(false);
        setJobTitle("");
        setJobDescription("");
        setJobSkills("");
        setJobDepartment("");
        showNotification(`Created job opening "${newJob.title}"!`, "success");
      } else {
        const err = await res.json();
        showNotification(err.detail || "Error creating job posting", "error");
      }
    } catch (err) {
      showNotification("Failed creating job opening.", "error");
    } finally {
      setIsPostingJob(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedCandidateId || !selectedJobId) {
      showNotification("Please select both a candidate and a job opening.", "error");
      return;
    }

    setIsMatching(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidateId,
          jobId: selectedJobId
        })
      });

      if (res.ok) {
        const report = await res.json();
        setMatchReport(report);
        setCandidates(prev => prev.map(c => {
          if (c.id === selectedCandidateId) {
            return {
              ...c,
              score: report.score,
              lastMatchedJobId: selectedJobId,
              lastMatchedJobTitle: jobs.find(j => j.id === selectedJobId)?.title,
              lastMatchAt: new Date().toISOString(),
              explanation: report.explanation,
              matchedSkills: report.matchedSkills,
              missingSkills: report.missingSkills,
              radarMetrics: report.radarMetrics || c.radarMetrics
            };
          }
          return c;
        }));
        showNotification(`Matching completed: ${report.score}% fit score.`, "success");
      }
    } catch (err) {
      showNotification("Failed running match analysis.", "error");
    } finally {
      setIsMatching(false);
    }
  };

  const handleCompare = async () => {
    if (!compareCand1Id || !compareCand2Id || !compareJobId) return;
    setIsLoadingCompare(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId1: compareCand1Id,
          candidateId2: compareCand2Id,
          jobId: compareJobId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCompareResult(data);
      }
    } catch (err) {
      showNotification("Error during candidate comparison", "error");
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const handleEnhance = async () => {
    if (!enhanceCandId || !enhanceJobId) return;
    setIsLoadingEnhance(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: enhanceCandId,
          jobId: enhanceJobId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEnhanceResult(data);
      }
    } catch (err) {
      showNotification("Error generating resume enhancement", "error");
    } finally {
      setIsLoadingEnhance(false);
    }
  };

  const handleFetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const res = await fetch("/api/skills-trend");
      if (res.ok) {
        const data = await res.json();
        setTrendsResult(data);
      }
    } catch (err) {
      showNotification("Error loading market skills trends", "error");
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleSemanticSearch = async (query: string) => {
    setSearchTerm(query);
    if (!query.trim()) {
      setSemanticSearchActive(false);
      fetchCandidates();
      return;
    }

    try {
      const res = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.results || []);
        setSemanticSearchActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
          notification.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
          notification.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {notification.type === 'error' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  MatchMind <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">AI Talent OS</span>
                </h1>
                <p className="text-[11px] text-slate-500">Autonomous Resume Screening, Voice Interview & Comp Intelligence</p>
              </div>
            </div>

            {/* Quick Actions & Demo Seeder */}
            <div className="flex items-center gap-2">
              <button
                onClick={seedDemoData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-slate-200"
                title="Populate 5 sample candidates and 4 jobs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Seed Demo Profiles</span>
              </button>

              <button
                onClick={() => setShowAddResume(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Parse Resume</span>
              </button>

              <button
                onClick={() => setShowAddJob(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>+ Post Job</span>
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 text-xs font-semibold no-scrollbar">
            {[
              { id: "home", label: "Dashboard & Search", icon: BarChart3 },
              { id: "pipeline", label: "ATS Pipeline", icon: Layers, badge: "Kanban" },
              { id: "matches", label: "Diagnostic Studio", icon: Cpu },
              { id: "interview", label: "Voice Mock Interview", icon: Bot, badge: "Voice AI" },
              { id: "challenges", label: "Code Challenges", icon: Code2, badge: "New" },
              { id: "compensation", label: "Salary & Comp AI", icon: Coins, badge: "Market" },
              { id: "batch", label: "Batch Screener", icon: Trophy },
              { id: "battle", label: "Candidate Battle", icon: Swords },
              { id: "enhancer", label: "Resume Enhancer", icon: Wand2 },
              { id: "optimizer", label: "Job Post Optimizer", icon: ShieldCheck },
              { id: "trends", label: "Market Analytics", icon: TrendingUp },
              { id: "talent", label: `Talent Pool (${candidates.length})`, icon: Users },
              { id: "jobs", label: `Job Openings (${jobs.length})`, icon: Briefcase }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'trends' && !trendsResult) handleFetchTrends();
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================= */}
        {/* 1. DASHBOARD & SEMANTIC SEARCH (HOME) */}
        {/* ========================================================= */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Hero AI Search Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-max">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Semantic Talent Search Engine
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Find Best-Fit Engineering & Leadership Talent Instantly
                </h2>
                <p className="text-xs text-slate-300">
                  Search across verified resumes using natural language: e.g. <em>"Python developer with PyTorch and microservice experience"</em>.
                </p>
              </div>

              <div className="w-full md:w-96 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSemanticSearch(e.target.value)}
                    placeholder="Search candidate skills, role, or summary..."
                    className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 shadow-inner placeholder:text-slate-500"
                  />
                </div>
                {semanticSearchActive && (
                  <div className="flex items-center justify-between text-[11px] text-indigo-300 px-1">
                    <span>Found {candidates.length} matching candidate profiles</span>
                    <button
                      onClick={() => handleSemanticSearch("")}
                      className="text-slate-400 hover:text-white underline"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Pool</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{candidates.length}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Verified parsed talent profiles</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Positions</span>
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{jobs.length}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Active engineering vacancies</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offers & Hires</span>
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {candidates.filter(c => c.pipelineStage === "offer" || c.pipelineStage === "hired").length}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Advanced pipeline candidates</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Pool Match</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {candidates.length > 0
                    ? Math.round(candidates.reduce((a, b) => a + (b.score || 80), 0) / candidates.length)
                    : 85}%
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">System-wide suitability index</p>
              </div>
            </div>

            {/* 4-Quadrant Talent Matrix & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TalentQuadrantMatrix
                  candidates={candidates}
                  onSelectCandidate={(id) => {
                    setSelectedCandidateId(id);
                    setActiveTab("matches");
                  }}
                  selectedId={selectedCandidateId}
                />
              </div>

              {/* Quick Feature Launchpad */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  AI Talent Modules
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("pipeline")}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        ATS Recruitment Pipeline
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Kanban lifecycle tracking</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab("interview")}
                    className="w-full text-left p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 hover:border-indigo-300 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        AI Voice Mock Interview
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Speech synthesis & mic answers</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab("challenges")}
                    className="w-full text-left p-3 rounded-xl bg-violet-50/70 border border-violet-100 hover:border-violet-300 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-violet-950 flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-violet-600" />
                        Code Challenge Studio
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Tailored gap assessments & rubrics</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab("compensation")}
                    className="w-full text-left p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        Salary & Comp Benchmarking
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Percentiles, equity & geo tiers</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ATS PIPELINE KANBAN BOARD */}
        {/* ========================================================= */}
        {activeTab === "pipeline" && (
          <TalentPipelineKanban
            candidates={candidates}
            onUpdateStage={handleUpdateStage}
            onToggleShortlist={handleShortlistToggle}
            onSelectCandidate={(id) => {
              setSelectedCandidateId(id);
              setActiveTab("matches");
            }}
            onLaunchInterview={(id) => {
              setSelectedCandidateId(id);
              setActiveTab("interview");
            }}
            onOpenDossier={(id) => {
              setSelectedCandidateId(id);
              setShowDossierModal(true);
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 3. MATCH DIAGNOSTIC STUDIO & RADAR */}
        {/* ========================================================= */}
        {activeTab === "matches" && (
          <div className="space-y-6">
            {/* Top Selector Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Candidate Profile
                  </label>
                  <select
                    value={selectedCandidateId || ""}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.predictedRole}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Target Job Vacancy
                  </label>
                  <select
                    value={selectedJobId || ""}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isMatching ? "Calculating Match..." : "Run Match Diagnostic"}
                </button>

                {activeCandidate && (
                  <button
                    onClick={() => setShowDossierModal(true)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Dossier</span>
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Workspace */}
            {activeCandidate && activeJob && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Visual Analytics (Radar + Venn) */}
                <div className="space-y-6">
                  <SkillRadarChart
                    metrics={matchReport?.radarMetrics || activeCandidate.radarMetrics}
                    candidateName={activeCandidate.name}
                  />

                  <InteractiveVenn
                    candSkills={activeCandidate.skills}
                    jobSkills={activeJob.requiredSkills}
                    matched={matchReport?.matchedSkills || activeJob.requiredSkills.filter(r => activeCandidate.skills.some(c => c.toLowerCase() === r.toLowerCase()))}
                    missing={matchReport?.missingSkills || activeJob.requiredSkills.filter(r => !activeCandidate.skills.some(c => c.toLowerCase() === r.toLowerCase()))}
                  />
                </div>

                {/* Center/Right Column: Detailed Report & Roadmap */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Summary Match Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Match Dossier</span>
                        <h3 className="text-base font-extrabold text-slate-900">{activeCandidate.name} ➔ {activeJob.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-indigo-600">{matchReport ? `${matchReport.score}%` : `${activeCandidate.score || 88}%`}</span>
                        <span className="text-[10px] text-slate-400 block">Overall Alignment</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">AI Evaluation Rationale</h4>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {matchReport?.explanation || activeCandidate.explanation || `${activeCandidate.name} exhibits verified mastery across requested stack requirements.`}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Readiness & Skill Gaps</h4>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {matchReport?.gapAnalysis || "Candidate has verified baseline qualifications. Proceed to technical evaluation round."}
                        </p>
                      </div>
                    </div>

                    {/* Interview Questions */}
                    {(matchReport?.interviewQuestions || []).length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          Recommended Interview Questions
                        </h4>
                        <div className="space-y-1.5">
                          {matchReport?.interviewQuestions.map((q, idx) => (
                            <div key={idx} className="p-2.5 bg-indigo-50/50 rounded-lg text-xs text-indigo-950 border border-indigo-100/60 flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                              <span>{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 30/60/90 Day Roadmap */}
                  <RoadmapTimelineVisualizer
                    roadmap={matchReport?.upskillingRoadmap}
                    candidateName={activeCandidate.name}
                    jobTitle={activeJob.title}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. AI MOCK INTERVIEW STUDIO */}
        {/* ========================================================= */}
        {activeTab === "interview" && (
          <InterviewStudio
            candidates={candidates}
            jobs={jobs}
            selectedCandidateId={selectedCandidateId}
            selectedJobId={selectedJobId}
            onSelectCandidate={(id) => setSelectedCandidateId(id)}
            onSelectJob={(id) => setSelectedJobId(id)}
          />
        )}

        {/* ========================================================= */}
        {/* 5. CODE CHALLENGE STUDIO */}
        {/* ========================================================= */}
        {activeTab === "challenges" && (
          <TechnicalAssessmentStudio
            candidates={candidates}
            jobs={jobs}
            selectedCandidateId={selectedCandidateId}
            selectedJobId={selectedJobId}
            onSelectCandidate={(id) => setSelectedCandidateId(id)}
            onSelectJob={(id) => setSelectedJobId(id)}
          />
        )}

        {/* ========================================================= */}
        {/* 6. COMPENSATION & SALARY BENCHMARK */}
        {/* ========================================================= */}
        {activeTab === "compensation" && (
          <CompensationCalculator
            candidates={candidates}
            jobs={jobs}
            selectedCandidateId={selectedCandidateId}
            selectedJobId={selectedJobId}
            onSelectCandidate={(id) => setSelectedCandidateId(id)}
            onSelectJob={(id) => setSelectedJobId(id)}
          />
        )}

        {/* ========================================================= */}
        {/* 7. BATCH SCREENER & LEADERBOARD */}
        {/* ========================================================= */}
        {activeTab === "batch" && (
          <BatchScreener
            candidates={candidates}
            jobs={jobs}
            onToggleShortlist={handleShortlistToggle}
            onSelectCandidate={(id) => {
              setSelectedCandidateId(id);
              setActiveTab("matches");
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 8. CANDIDATE BATTLE MATRIX */}
        {/* ========================================================= */}
        {activeTab === "battle" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                  Head-to-Head Duel
                </span>
                <span className="text-xs text-slate-400">Differential Capability Analysis</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                Candidate Comparison & Battle Matrix
              </h2>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
                Compare two candidates side-by-side against a specific job vacancy with AI differential feedback and key differentiator verdict.
              </p>

              {/* Selector Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Candidate A</label>
                  <select
                    value={compareCand1Id}
                    onChange={(e) => setCompareCand1Id(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700"
                  >
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Candidate B</label>
                  <select
                    value={compareCand2Id}
                    onChange={(e) => setCompareCand2Id(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700"
                  >
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Vacancy</label>
                  <select
                    value={compareJobId}
                    onChange={(e) => setCompareJobId(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleCompare}
                    disabled={isLoadingCompare}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" />
                    {isLoadingCompare ? "Comparing..." : "Execute Battle"}
                  </button>
                </div>
              </div>
            </div>

            {compareResult && (
              <div className="space-y-6">
                {/* Battle Overlap Visualizer */}
                <BattleSkillsOverlap
                  cand1Name={compareResult.candidate1Name}
                  cand2Name={compareResult.candidate2Name}
                  cand1Skills={candidates.find(c => c.id === compareCand1Id)?.skills || []}
                  cand2Skills={candidates.find(c => c.id === compareCand2Id)?.skills || []}
                  jobSkills={jobs.find(j => j.id === compareJobId)?.requiredSkills || []}
                />

                {/* Comparison Breakdown Cards */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900">Side-by-Side Diagnostic Feedback</span>
                    <span className="font-bold text-indigo-600">{compareResult.jobTitle}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                      <div className="font-extrabold text-sm text-blue-900 mb-2 flex items-center justify-between">
                        <span>{compareResult.candidate1Name}</span>
                        <span className="text-blue-700 font-black">{compareResult.scoreA}%</span>
                      </div>
                      <div className="space-y-2 text-slate-700">
                        {compareResult.comparisonPoints.map((cp: any, i: number) => (
                          <div key={i}>
                            <strong className="text-[10px] uppercase text-blue-800">{cp.category}:</strong>
                            <p className="text-[11px]">{cp.candAFeedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
                      <div className="font-extrabold text-sm text-purple-900 mb-2 flex items-center justify-between">
                        <span>{compareResult.candidate2Name}</span>
                        <span className="text-purple-700 font-black">{compareResult.scoreB}%</span>
                      </div>
                      <div className="space-y-2 text-slate-700">
                        {compareResult.comparisonPoints.map((cp: any, i: number) => (
                          <div key={i}>
                            <strong className="text-[10px] uppercase text-purple-800">{cp.category}:</strong>
                            <p className="text-[11px]">{cp.candBFeedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Verdict */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl">
                    <div className="font-bold text-xs text-rose-400 uppercase tracking-wider mb-1">Executive Recommendation Verdict</div>
                    <p className="text-xs leading-relaxed text-slate-200">{compareResult.verdict}</p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      <strong>Key Differentiator:</strong> {compareResult.keyDifferentiator}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 9. AI RESUME ENHANCER & REWRITER */}
        {/* ========================================================= */}
        {activeTab === "enhancer" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  AI Optimization Coach
                </span>
                <span className="text-xs text-slate-400">Impact Metric Bullet Rewriter</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
                Resume Enhancer & Targeted Impact Optimizer
              </h2>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
                Transform passive candidate experience statements into quantified, high-converting achievement bullets tailored for the target position.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Candidate</label>
                  <select
                    value={enhanceCandId}
                    onChange={(e) => setEnhanceCandId(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700"
                  >
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Role</label>
                  <select
                    value={enhanceJobId}
                    onChange={(e) => setEnhanceJobId(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleEnhance}
                    disabled={isLoadingEnhance}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isLoadingEnhance ? "Enhancing..." : "Optimize Resume"}
                  </button>
                </div>
              </div>
            </div>

            {enhanceResult && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Enhanced Professional Summary</h3>
                  <p className="text-slate-700 bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 leading-relaxed">
                    {enhanceResult.enhancedSummary}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                    Action-Oriented Bullet Optimizations
                  </h4>
                  <div className="space-y-3">
                    {enhanceResult.bulletOptimizations.map((bo: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="text-slate-500 line-through text-[11px]">{bo.originalBullet}</div>
                        <div className="font-bold text-emerald-800 text-xs">✓ {bo.suggestedBullet}</div>
                        <div className="text-[10px] text-slate-400 italic">Rationale: {bo.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Coach Critique</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{enhanceResult.resumeCritique}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 10. AI JOB DESCRIPTION OPTIMIZER */}
        {/* ========================================================= */}
        {activeTab === "optimizer" && (
          <JobOptimizer
            jobs={jobs}
            onJobUpdated={() => fetchJobs()}
          />
        )}

        {/* ========================================================= */}
        {/* 11. MARKET SKILLS TRENDS & ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === "trends" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Macro Intelligence
                  </span>
                  <span className="text-xs text-slate-400">Real-Time Labor Supply vs Demand</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black text-white">
                  Market Skills Demand vs Talent Supply Analytics
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Analyzes skill frequencies across open requisitions and candidate inventory to highlight market shortages.
                </p>
              </div>

              <button
                onClick={handleFetchTrends}
                disabled={isLoadingTrends}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {isLoadingTrends ? "Refreshing..." : "Refresh Analytics"}
              </button>
            </div>

            {trendsResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Top In-Demand Skills</h3>
                  <div className="space-y-2 text-xs">
                    {trendsResult.topRequestedSkills.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-slate-700">{s.skill}</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{s.demandCount} jobs ({s.demandPercentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Top Supplied Skills</h3>
                  <div className="space-y-2 text-xs">
                    {trendsResult.topSuppliedSkills.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="font-semibold text-slate-700">{s.skill}</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{s.supplyCount} candidates</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Talent Shortage Gaps</h3>
                  <div className="space-y-2 text-xs">
                    {trendsResult.supplyDemandGap.map((g: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                        <span className="font-semibold text-amber-950">{g.skill}</span>
                        <span className="font-bold text-amber-700">{g.gapValue}% shortage</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 12. TALENT POOL DIRECTORY */}
        {/* ========================================================= */}
        {activeTab === "talent" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Parsed Talent Inventory ({candidates.length})</h2>
              <button
                onClick={() => setShowAddResume(true)}
                className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                + Add Resume
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map(cand => (
                <div key={cand.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-slate-900">{cand.name}</h3>
                      <button
                        onClick={() => handleShortlistToggle(cand.id, Boolean(cand.isShortlisted))}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          cand.isShortlisted ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {cand.isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600">{cand.predictedRole}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{cand.experienceSummary}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {cand.skills.slice(0, 6).map((s, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                      {cand.skills.length > 6 && (
                        <span className="text-[10px] text-slate-400 font-medium">+{cand.skills.length - 6} more</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedCandidateId(cand.id);
                        setActiveTab("matches");
                      }}
                      className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View Match Diagnostic ➔
                    </button>
                    <button
                      onClick={(e) => handleDeleteCandidate(cand.id, e)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 13. JOB OPENINGS DIRECTORY */}
        {/* ========================================================= */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Active Job Vacancies ({jobs.length})</h2>
              <button
                onClick={() => setShowAddJob(true)}
                className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                + Post Job
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-slate-900">{job.title}</h3>
                      <span className="text-[10px] font-semibold text-slate-400">{job.department || "Engineering"}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-1">{job.text}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {job.requiredSkills.map((s, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setActiveTab("batch");
                      }}
                      className="font-bold text-purple-600 hover:text-purple-800"
                    >
                      Screen All Candidates ➔
                    </button>
                    <button
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Parse Resume Modal with Drag-and-Drop & Presets */}
      {showAddResume && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Ingest & Parse Candidate Resume
              </h3>
              <button onClick={() => setShowAddResume(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Quick Demo Pre-fill Presets */}
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs">
              <span className="font-bold text-indigo-900 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick-Load Candidate Profiles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setResumeFilename("Maya_Patel_AI_Architect.pdf");
                    setResumeText("Maya Patel\nPrincipal AI & ML Systems Architect\nEmail: maya.patel@deeptech.io | Phone: +1 (555) 302-8819\nEducation: M.S. in Computer Science - Carnegie Mellon University\nSummary: 7+ years architecting scalable neural search pipelines, fine-tuning large language models on distributed GPU clusters, and productionizing FastAPI inference servers. Core skills: Python, PyTorch, JAX, CUDA, Docker, Kubernetes, Transformers, NLP, Distributed Systems, Git, SQL.");
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 text-[11px] font-semibold transition-all shadow-2xs"
                >
                  + Maya Patel (AI Systems Architect)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFilename("Lucas_Vance_Cloud_K8s.pdf");
                    setResumeText("Lucas Vance\nSenior Cloud Platform & DevOps Engineer\nEmail: lucas.vance@cloudeng.com | Phone: +1 (555) 744-2201\nEducation: B.S. in Software Engineering - University of Washington\nSummary: 5+ years building immutable multi-cloud infrastructure with Terraform, orchestrating Kubernetes pods, managing AWS VPC networking, and enforcing CI/CD gitops. Core skills: Kubernetes, Docker, AWS, Terraform, CI/CD, Linux, Go, Python, Cloud Architecture, Prometheus, IAM.");
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 text-[11px] font-semibold transition-all shadow-2xs"
                >
                  + Lucas Vance (DevOps & K8s)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFilename("Sophia_Lin_FullStack.txt");
                    setResumeText("Sophia Lin\nSenior Full Stack & Design Systems Engineer\nEmail: sophia.lin@frontendlab.dev | Phone: +1 (555) 918-3344\nEducation: B.S. in Computer Science - UCLA\nSummary: 4+ years engineering high-traffic web applications with React 19, TypeScript, Next.js, Tailwind CSS, and Node.js. Passionate about accessibility, sub-100ms API responses, and clean component architecture. Core skills: React, TypeScript, Next.js, Node.js, Express, Tailwind CSS, REST API, GraphQL, Jest, Git.");
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 text-[11px] font-semibold transition-all shadow-2xs"
                >
                  + Sophia Lin (Full Stack Lead)
                </button>
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50"
              onClick={() => {
                const el = document.getElementById("file-upload-input");
                if (el) el.click();
              }}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".txt,.pdf,.json,.md,.doc"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
              <span className="text-xs font-bold text-slate-800 block">Drop resume file here or click to browse</span>
              <span className="text-[10px] text-slate-400">Supports .txt, .pdf, .json, .md text documents</span>
            </div>

            <form onSubmit={handleAnalyzeResume} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Candidate Identifier / Source</label>
                <input
                  type="text"
                  value={resumeFilename}
                  onChange={(e) => setResumeFilename(e.target.value)}
                  placeholder="e.g. John Doe Resume.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Resume Content Text</label>
                <textarea
                  rows={7}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste candidate resume text with contact details, work history, and technical competencies..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs resize-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddResume(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing || !resumeText.trim()}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm"
                >
                  {isAnalyzing ? "Extracting..." : "Parse & Add Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-900" />
                Post New Job Vacancy
              </h3>
              <button onClick={() => setShowAddJob(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Position Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Job Description</label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Describe key responsibilities and required stack qualifications..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Explicit Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  placeholder="Python, PyTorch, Docker, SQL, FastAPI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostingJob || !jobDescription.trim()}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-sm"
                >
                  {isPostingJob ? "Saving..." : "Create Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Dossier Export Modal */}
      {showDossierModal && activeCandidate && (
        <TalentDossierModal
          candidate={activeCandidate}
          job={activeJob}
          matchReport={matchReport}
          onClose={() => setShowDossierModal(false)}
        />
      )}
    </div>
  );
}
