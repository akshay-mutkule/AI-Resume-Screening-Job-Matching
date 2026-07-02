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
  BarChart3
} from "lucide-react";
import { Candidate, JobDescription, MatchReport } from "./types";

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  
  // Selection states
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<"home" | "matches" | "jobs" | "talent" | "battle" | "enhancer" | "trends">("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");
  
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
  
  // Home Sandbox Simulator State
  const [sandboxCandidateSkills, setSandboxCandidateSkills] = useState<string[]>(["Python", "Docker", "SQL", "Git", "React"]);
  const [sandboxJobSkills, setSandboxJobSkills] = useState<string[]>(["Python", "SQL", "FastAPI", "Docker", "AWS"]);
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      showNotification("Could not load candidates from backend databases.", "error");
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
    }, 5000);
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
        setCandidates(prev => prev.map(c => c.id === id ? updated : c));
        showNotification(
          `${updated.name} has been ${updated.isShortlisted ? "shortlisted" : "removed from shortlist"}.`, 
          "success"
        );
      } else {
        showNotification("Failed updating candidate shortlist flag.", "error");
      }
    } catch (err) {
      showNotification("Error communicating with servers.", "error");
    }
  };

  const handleDeleteCandidate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this candidate? This is permanent.")) return;
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== id));
        if (selectedCandidateId === id) {
          setSelectedCandidateId(null);
          setMatchReport(null);
        }
        showNotification("Candidate profile deleted.", "success");
      }
    } catch (error) {
      showNotification("Failed deleting candidate.", "error");
    }
  };

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this job position? It will delete related analytics.")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        if (selectedJobId === id) {
          setSelectedJobId(null);
          setMatchReport(null);
        }
        showNotification("Job posting removed.", "success");
      }
    } catch (error) {
      showNotification("Failed deleting job posting.", "error");
    }
  };

  const runAIMatch = async (cId: string, jId: string) => {
    setIsMatching(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: cId, jobId: jId }),
      });
      
      if (res.ok) {
        const report: MatchReport = await res.json();
        setMatchReport(report);
        // Refresh local candidate metrics
        await fetchCandidates();
        showNotification("AI Match calculations updated successfully using Gemini NLP Engine!", "success");
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || "Failed running match analyzer.", "error");
      }
    } catch (error) {
      showNotification("Failed to contact the backend match service.", "error");
    } finally {
      setIsMatching(false);
    }
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      showNotification("Please supply resume text.", "error");
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          filename: resumeFilename || "uploaded_resume.txt"
        })
      });

      if (res.ok) {
        const parsedCandidate: Candidate = await res.json();
        setCandidates(prev => [parsedCandidate, ...prev]);
        setSelectedCandidateId(parsedCandidate.id);
        
        // Match automatically if there is an active job selected
        if (selectedJobId) {
          await runAIMatch(parsedCandidate.id, selectedJobId);
        }
        
        setResumeText("");
        setResumeFilename("");
        setShowAddResume(false);
        showNotification(`AI successfully extracted skills for ${parsedCandidate.name}!`, "success");
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || "Parser failed to parse inputs.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error communicating with AI parser service.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) {
      showNotification("Please fill in the Job Title and Description fields", "error");
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          text: jobDescription,
          requiredSkills: jobSkills.split(",").map(s => s.trim().replace(/\s+/g, " "))
        })
      });

      if (res.ok) {
        const newJob: JobDescription = await res.json();
        setJobs(prev => [newJob, ...prev]);
        setSelectedJobId(newJob.id);
        
        // Reset inputs
        setJobTitle("");
        setJobDescription("");
        setJobSkills("");
        setShowAddJob(false);
        showNotification(`New job posting for "${newJob.title}" added to active matching!`, "success");
      } else {
        showNotification("Failed creating job opening.", "error");
      }
    } catch (err) {
      showNotification("Error creating job posting.", "error");
    }
  };

  const pasteSampleResume = (type: "ml" | "js" | "pm") => {
    if (type === "ml") {
      setResumeFilename("dr_lucas_vance_cv.txt");
      setResumeText(`Dr. Lucas Vance\nML Researcher & Deep Learning Architect\nvance.l@outlook.com\n\nExperience:\n- 6 years at DeepCloud leading model training on TPU arrays.\n- Expert in PyTorch, JAX, Transformer attention layers, and Custom Kernels.\n- Designed low-inference vision frameworks.\n- Published 3 major papers at NeurIPS.\n\nSkills: Python, PyTorch, JAX, Transformer, TensorFlow, Git, CUDA, Docker, Machine Learning, NLP`);
    } else if (type === "js") {
      setResumeFilename("chelsea_chen_cv.txt");
      setResumeText(`Chelsea Chen\nReact Frontend Specialist\nchelsea.dev@gmail.com\n\nExperience:\n- 4 years crafting user layouts at Stripe.\n- Highly analytical with TailwindCSS, React 19, TypeScript, Jest, Next.js, and Webpack.\n- Deeply committed to accessibility (WAI-ARIA) and high Core Web Vitals.\n\nSkills: React, TypeScript, HTML5, CSS3, Tailwind CSS, Git, Jest, Redux, Responsive Design`);
    } else if (type === "pm") {
      setResumeFilename("tim_collins_pm.txt");
      setResumeText(`Tim Collins\nTechnical Product Manager\ntim.collins@prod-masters.com\n\nExperience:\n- Senior PM at Atlassian for Jira Core services.\n- Excellent with Agile frameworks, customer sprint alignment, Product Specifications, and user mapping.\n- Led remote matrix teams of 12+ developers and automated dashboards on Tableaus.\n\nSkills: Agile, Jira, Communication, Product Specifications, Analytics, Figma, Roadmaps`);
    }
  };

  const runBattleComparison = async () => {
    if (!compareCand1Id || !compareCand2Id || !compareJobId) {
      showNotification("Please select two candidates and a target job specification first.", "error");
      return;
    }
    if (compareCand1Id === compareCand2Id) {
      showNotification("Please select two distinct candidates to compare.", "error");
      return;
    }
    setIsLoadingCompare(true);
    setCompareResult(null);
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
        showNotification("Side-by-side battle comparison computed!", "success");
      } else {
        const err = await res.json();
        showNotification(err.detail || "Failed to generate comparison.", "error");
      }
    } catch (err) {
      showNotification("Error communicating with backend.", "error");
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const runResumeEnhancement = async () => {
    if (!enhanceCandId || !enhanceJobId) {
      showNotification("Please select a candidate and a target job spec to optimize.", "error");
      return;
    }
    setIsLoadingEnhance(true);
    setEnhanceResult(null);
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
        showNotification("Resume enhancement recommendations parsed!", "success");
      } else {
        const err = await res.json();
        showNotification(err.detail || "Failed to generate optimization report.", "error");
      }
    } catch (err) {
      showNotification("Network error. Please try again.", "error");
    } finally {
      setIsLoadingEnhance(false);
    }
  };

  const fetchSkillsTrends = async () => {
    setIsLoadingTrends(true);
    setTrendsResult(null);
    try {
      const res = await fetch("/api/skills-trend");
      if (res.ok) {
        const data = await res.json();
        setTrendsResult(data);
        showNotification("Recruitment skills insights aggregated!", "success");
      } else {
        showNotification("Failed to fetch skills trend analysis.", "error");
      }
    } catch (err) {
      showNotification("Error contacting backend servers.", "error");
    } finally {
      setIsLoadingTrends(false);
    }
  };


  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Calculations for stats displays
  const shortlistedCount = candidates.filter(c => c.isShortlisted).length;
  const averageMatchScore =(() => {
    const scoredCandidates = candidates.filter(c => c.score !== undefined);
    if (!scoredCandidates.length) return "N/A";
    const sum = scoredCandidates.reduce((acc, current) => acc + (current.score || 0), 0);
    return `${(sum / scoredCandidates.length).toFixed(1)}%`;
  })();

  const filterCandidates = () => {
    let list = [...candidates];
    
    // search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.predictedRole.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    
    // Job Match Position filter
    if (selectedJobFilter !== "all") {
      list = list.filter(c => c.lastMatchedJobId === selectedJobFilter);
    }
    
    return list;
  };

  const filteredCandidatesList = filterCandidates();

  // Sandbox calculations
  const sandboxIntersection = sandboxCandidateSkills.filter(s => sandboxJobSkills.includes(s));
  const sandboxMissing = sandboxJobSkills.filter(s => !sandboxCandidateSkills.includes(s));
  const sandboxJaccardScore = sandboxJobSkills.length > 0 ? (sandboxIntersection.length / sandboxJobSkills.length) * 100 : 0;
  const sandboxSemanticProxy = (() => {
    let bonus = 0;
    if (sandboxCandidateSkills.includes("React") && sandboxJobSkills.includes("TypeScript")) bonus += 15;
    if (sandboxCandidateSkills.includes("Git") && sandboxJobSkills.includes("Docker")) bonus += 10;
    if (sandboxCandidateSkills.includes("Docker") && sandboxJobSkills.includes("AWS")) bonus += 20;
    if (sandboxCandidateSkills.includes("Python") && sandboxJobSkills.includes("FastAPI")) bonus += 15;
    if (sandboxCandidateSkills.includes("PyTorch") && sandboxJobSkills.includes("Kubernetes")) bonus += 15;
    if (sandboxCandidateSkills.includes("SQL") && sandboxJobSkills.includes("NoSQL")) bonus += 10;
    return Math.min(100, 45 + bonus);
  })();
  const sandboxWeightedScore = Math.round(0.6 * sandboxJaccardScore + 0.4 * sandboxSemanticProxy);

  return (
    <div className="flex flex-col min-h-screen lg:h-screen w-full bg-[#F8FAFC] text-[#1E293B] font-sans overflow-y-auto lg:overflow-hidden" id="match-mind-root">
      
      {/* Dynamic Status / Interactive Toast Notifications */}
      {notification && (
        <div key={notification.message} className="fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border animate-bounce transition-all duration-300 max-w-sm bg-white text-slate-800 border-indigo-200">
          {notification.type === "success" ? (
            <span className="p-1 rounded-full bg-green-100 text-green-700">
              <Check className="w-5 h-5" />
            </span>
          ) : notification.type === "error" ? (
            <span className="p-1 rounded-full bg-red-100 text-red-700">
              <AlertCircle className="w-5 h-5" />
            </span>
          ) : (
            <span className="p-1 rounded-full bg-blue-100 text-blue-700">
              <Sparkles className="w-5 h-5" />
            </span>
          )}
          <div className="text-xs font-semibold leading-snug">{notification.message}</div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0" id="matchmind-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 leading-none">MatchMind <span className="text-blue-600">AI</span></h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5 uppercase">Friendly Resume & Job Helper</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Gemini AI is Ready
          </div>
          <button 
            id="open-upload-btn"
            onClick={() => setShowAddResume(true)}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> <span className="hidden xs:inline sm:inline">Upload Resume</span><span className="inline xs:hidden sm:hidden">Upload</span>
          </button>
          <div className="w-7 h-7 sm:w-8 sm:w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs" title="Human Resources Administrator">
            HR
          </div>
        </div>
      </header>

      {/* Mobile Tab Strip (Only visible on screens < lg) */}
      <div className="flex lg:hidden bg-white border-b border-slate-200 p-2 gap-1 overflow-x-auto shrink-0" id="mobile-tab-strip">
        <button 
          id="mobile-tab-btn-home"
          onClick={() => setActiveTab("home")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "home" 
              ? "bg-blue-50 text-blue-700 font-extrabold" 
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Home
        </button>
        <button 
          id="mobile-tab-btn-matches"
          onClick={() => setActiveTab("matches")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "matches" 
              ? "bg-blue-50 text-blue-700" 
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          Matches
        </button>
        <button 
          id="mobile-tab-btn-jobs"
          onClick={() => setActiveTab("jobs")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "jobs" 
              ? "bg-blue-50 text-blue-700 font-extrabold" 
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-500" />
          Jobs ({jobs.length})
        </button>
        <button 
          id="mobile-tab-btn-talent"
          onClick={() => setActiveTab("talent")}
          className={`flex-1 flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "talent" 
              ? "bg-blue-50 text-blue-700 font-extrabold" 
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          Talent ({candidates.length})
        </button>
        <button 
          id="mobile-tab-btn-battle"
          onClick={() => setActiveTab("battle")}
          className={`flex-1 flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "battle" 
              ? "bg-blue-50 text-blue-700 font-extrabold" 
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-blue-500" />
          Battle
        </button>
        <button 
          id="mobile-tab-btn-enhancer"
          onClick={() => setActiveTab("enhancer")}
          className={`flex-1 flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "enhancer" 
              ? "bg-blue-50 text-blue-700 font-extrabold" 
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-blue-500" />
          Optimize
        </button>
        <button 
          id="mobile-tab-btn-trends"
          onClick={() => {
            setActiveTab("trends");
            fetchSkillsTrends();
          }}
          className={`flex-1 flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "trends" 
              ? "bg-blue-50 text-blue-700 font-extrabold" 
              : "text-slate-600 hover:bg-slate-50 font-semibold"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          Trends
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        
        {/* Sidebar Navigation (Only visible on lg screens and up) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-56 border-r border-slate-200 bg-white p-4 gap-1.5 shrink-0" id="app-sidebar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Workspace</div>
          
          <button 
            id="tab-btn-home"
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "home" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            Home Dashboard
          </button>
          
          <button 
            id="tab-btn-matches"
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "matches" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-500" />
            Compare Candidates
          </button>
          
          <button 
            id="tab-btn-jobs"
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "jobs" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-500" />
            Job Openings ({jobs.length})
          </button>
          
          <button 
            id="tab-btn-talent"
            onClick={() => setActiveTab("talent")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "talent" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            Candidates ({candidates.length})
          </button>

          <div className="border-t border-slate-100 my-2"></div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Smart AI Tools</div>
          
          <button 
            id="tab-btn-battle"
            onClick={() => setActiveTab("battle")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "battle" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Swords className="w-4 h-4 text-blue-500" />
            Compare Two Candidates
          </button>
          
          <button 
            id="tab-btn-enhancer"
            onClick={() => setActiveTab("enhancer")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "enhancer" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Wand2 className="w-4 h-4 text-blue-500" />
            Optimize Resume
          </button>
          
          <button 
            id="tab-btn-trends"
            onClick={() => {
              setActiveTab("trends");
              fetchSkillsTrends();
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "trends" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Market Skills & Trends
          </button>


          <div className="border-t border-slate-100 my-4"></div>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Active Target Opening</div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            {selectedJob ? (
              <>
                <div className="font-bold text-xs text-slate-800 line-clamp-1">{selectedJob.title}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Active Candidate Source
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedJob.requiredSkills.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] text-slate-600 font-medium">
                      {s}
                    </span>
                  ))}
                  {selectedJob.requiredSkills.length > 4 && (
                    <span className="text-[8px] text-slate-400 font-bold">+{selectedJob.requiredSkills.length - 4} more</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-xs italic">No Job Selected</div>
            )}
          </div>

          <div className="mt-auto px-2">
            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 text-[11px] text-blue-800">
              <div className="font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Friendly Tip
              </div>
              Choose a job opening, select a candidate, and click <strong>Score AI Suitability Match</strong> to see how well they fit!
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto" id="main-content-scrollable">
          
          {/* Top Stats Cards */}
          {activeTab !== "home" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0" id="statistics-cards">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[100px]">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Job Opening</div>
                <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 truncate">
                  {selectedJob ? selectedJob.title : "No Openings Yet"}
                </div>
                <div className="text-blue-600 text-[9px] mt-1 font-semibold uppercase tracking-wider">
                  {selectedJob ? `${selectedJob.requiredSkills.length} Core Skills` : "Create an opening"}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[100px]">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Candidates</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{candidates.length}</div>
                <div className="text-green-600 text-[9px] mt-1 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5 animate-pulse" />
                  Saved Safely in Database
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[100px]">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Average Fit Score</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{averageMatchScore}</div>
                <div className="text-slate-500 text-[9px] mt-1 font-semibold">
                  Calculated based on relevant skills
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[100px]">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Shortlisted</div>
                <div className="text-xl sm:text-2xl font-black text-amber-600">{shortlistedCount}</div>
                <div className="text-slate-500 text-[9px] mt-1 font-medium">Ready to contact</div>
              </div>
            </section>
          )}

          {/* MAIN SCREEN DEPENDENT ON TABS */}

          {/* MAIN SCREEN DEPENDENT ON TABS */}

          {activeTab === "home" && (
            <div className="flex-1 flex flex-col gap-8 animate-fadeIn" id="matchmind-home-page">
              
              {/* Hero Section */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800" id="home-hero">
                {/* Decorative absolute elements */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 max-w-3xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-wider uppercase mb-4 border border-blue-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> Smart Resume & Job Helper
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
                    Find the Perfect Candidate for Your Job Openings
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                    Easily check how well any resume fits your job openings. Paste or upload a resume, and our friendly helper will automatically extract skills, show what is missing, and suggest tailored interview questions. It is fast, simple, and easy for everyone to understand!
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setActiveTab("matches")}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      Launch Workspace <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowAddResume(true)}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-blue-400" /> Upload Local Resume
                    </button>
                    <button 
                      onClick={() => setActiveTab("jobs")}
                      className="px-5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 text-xs font-bold rounded-lg transition-all border border-indigo-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-indigo-400" /> Configure Job Specs
                    </button>
                  </div>
                </div>
              </div>

              {/* Who Can Use This System Section */}
              <div id="home-who-use-section">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Who is this for?</h2>
                <p className="text-xs text-slate-500 mb-4">Whether you are hiring or applying, here is how we can help you:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Recruiters & HR Teams</h3>
                      <p className="text-[11px] leading-relaxed text-slate-500 mt-2">
                        Easily sort through raw resumes and find the best candidates for your job openings without reading through pages of text.
                      </p>
                    </div>
                    <div className="text-[10px] text-blue-600 font-bold mt-4">Save time on screening →</div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Hiring Managers</h3>
                      <p className="text-[11px] leading-relaxed text-slate-500 mt-2">
                        Instantly see what key skills or tools a candidate has or is missing before you invite them to an interview.
                      </p>
                    </div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-4">Find skills gaps early →</div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Talent Operations</h3>
                      <p className="text-[11px] leading-relaxed text-slate-500 mt-2">
                        Keep all candidate scores, notes, and custom interview questions organized and saved in one secure, convenient place.
                      </p>
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold mt-4">Stay organized →</div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Candidates & Job Seekers</h3>
                      <p className="text-[11px] leading-relaxed text-slate-500 mt-2">
                        Check how well your own resume matches a job description, see where you can improve, and stand out from the crowd!
                      </p>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-4">Improve your resume →</div>
                  </div>
                </div>
              </div>

              {/* LIVE INTERACTIVE SIMULATOR (FEATURE SHOWCASE) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm" id="interactive-features-showcase">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Interactive Sandbox Feature</span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">Live Skill-Matching Simulator</h2>
                    <p className="text-xs text-slate-500">Add or remove skills to see how our scoring system calculates a match score in real time.</p>
                  </div>
                  
                  {/* Score circle */}
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Weighted Score</div>
                      <div className="text-base font-black text-slate-800">{sandboxWeightedScore}%</div>
                    </div>
                    <div className="w-10 h-10 flex-shrink-0 relative">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" className="text-slate-200" strokeWidth="3" fill="transparent" stroke="currentColor" />
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          className={sandboxWeightedScore >= 75 ? "text-green-500" : sandboxWeightedScore >= 50 ? "text-blue-500" : "text-amber-500"} 
                          strokeWidth="3" 
                          fill="transparent" 
                          stroke="currentColor" 
                          strokeDasharray={2 * Math.PI * 16}
                          strokeDashoffset={2 * Math.PI * 16 * (1 - sandboxWeightedScore / 100)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">
                        {sandboxWeightedScore}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Candidate Skills Configuration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Candidate Skill Set
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">{sandboxCandidateSkills.length} active</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 min-h-[110px] content-start">
                      {sandboxCandidateSkills.map(s => (
                        <button
                          key={`cand-${s}`}
                          onClick={() => setSandboxCandidateSkills(prev => prev.filter(x => x !== s))}
                          className="px-2 py-1 bg-blue-100 hover:bg-red-50 hover:text-red-600 text-blue-800 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {s} <span className="text-[8px] font-black opacity-60">✕</span>
                        </button>
                      ))}
                      {sandboxCandidateSkills.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No skills selected. Click options below to add.</span>
                      )}
                    </div>
                  </div>

                  {/* Required Job Skills Configuration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Required Job Vacancy
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">{sandboxJobSkills.length} active</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 min-h-[110px] content-start">
                      {sandboxJobSkills.map(s => (
                        <button
                          key={`job-${s}`}
                          onClick={() => setSandboxJobSkills(prev => prev.filter(x => x !== s))}
                          className="px-2 py-1 bg-indigo-100 hover:bg-red-50 hover:text-red-600 text-indigo-800 border border-indigo-200 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {s} <span className="text-[8px] font-black opacity-60">✕</span>
                        </button>
                      ))}
                      {sandboxJobSkills.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No skills required. Click options below to add.</span>
                      )}
                    </div>
                  </div>

                  {/* Math Formula Output Realtime */}
                  <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Sandbox Scoring Log
                      </div>
                      
                      <div className="mt-3 space-y-2 text-[10.5px]">
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">Matched Skills Count:</span>
                          <span className="font-mono text-emerald-400 font-bold">{sandboxIntersection.length} matching</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">Missing Skills Count:</span>
                          <span className="font-mono text-amber-400 font-bold">{sandboxMissing.length} missing</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">Basic Keyword Match:</span>
                          <span className="font-mono text-white font-bold">{Math.round(sandboxJaccardScore)}%</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">AI Meaning Match:</span>
                          <span className="font-mono text-white font-bold">{Math.round(sandboxSemanticProxy)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="text-[8.5px] font-mono text-slate-500 leading-normal">
                        FINAL SCORE = (60% Keyword Weight * {Math.round(sandboxJaccardScore)}%) + (40% Meaning Weight * {Math.round(sandboxSemanticProxy)}%) = <span className="text-indigo-400 font-bold">{sandboxWeightedScore}%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Add Quick Pill Options helper */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Toggle standard skill sets directly in either workspace:</div>
                  <div className="flex flex-wrap gap-2">
                    {["Python", "PyTorch", "SQL", "FastAPI", "Docker", "AWS", "Git", "React", "TypeScript", "Node.js", "Kubernetes", "NoSQL"].map(tech => {
                      const inCandidate = sandboxCandidateSkills.includes(tech);
                      const inJob = sandboxJobSkills.includes(tech);
                      
                      return (
                        <div key={tech} className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-md overflow-hidden text-[10px] font-bold">
                          <span className="px-2 py-1 text-slate-700 bg-slate-100 border-r border-slate-200 font-mono">{tech}</span>
                          
                          <button
                            onClick={() => {
                              if (inCandidate) {
                                setSandboxCandidateSkills(prev => prev.filter(x => x !== tech));
                              } else {
                                setSandboxCandidateSkills(prev => [...prev, tech]);
                              }
                            }}
                            className={`px-1.5 py-1 text-[9px] cursor-pointer transition-colors ${inCandidate ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-blue-600"}`}
                          >
                            +Cand
                          </button>
                          
                          <button
                            onClick={() => {
                              if (inJob) {
                                setSandboxJobSkills(prev => prev.filter(x => x !== tech));
                              } else {
                                setSandboxJobSkills(prev => [...prev, tech]);
                              }
                            }}
                            className={`px-1.5 py-1 text-[9px] cursor-pointer border-l border-slate-200 transition-colors ${inJob ? "bg-indigo-600 text-white" : "hover:bg-indigo-50 text-indigo-600"}`}
                          >
                            +Job
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button 
                    onClick={() => {
                      setResumeFilename("sandbox_candidate_profile.txt");
                      setResumeText(`Sandbox Mock Candidate\nSystems Engineer\nsandbox@example.com\n\nSkills: ${sandboxCandidateSkills.join(", ")}`);
                      setShowAddResume(true);
                      showNotification("Loaded simulator skills into the upload workspace! Just press Start NLP Skill Extraction.", "success");
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Deploy Sandbox State to Real Talent Pool
                  </button>
                </div>

              </div>

              {/* CORE INTELLIGENT FEATURES CARDS DECK */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Explore Our Core Features</h2>
                <p className="text-xs text-slate-500 mb-4">Click any tab on the sidebar or launch a tool to try them out live!</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">1</div>
                        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Smart Resume Reading</h3>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        Plain-text resumes are read and understood by Gemini AI. It automatically pulls out key details like contact info, work experience, education, and specific skills.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">Powered by Gemini AI</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">2</div>
                        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Friendly Skills Check</h3>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        We compare the candidate's skills against your job requirements, helping you see what they are great at and what skills they might need to learn.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">Simple Skills Gap Report</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">3</div>
                        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Tailored Interview Questions</h3>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        Our AI automatically suggests three friendly, custom interview questions to help you start a helpful conversation about their skills.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">Custom Interview Guides</div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {activeTab === "matches" && (
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-y-auto lg:overflow-hidden lg:min-h-[480px]">
              
              {/* Left Column: Match Selection and Job Scoring Matrix */}
              <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                
                {/* Selector Bars */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Compare Job:</span>
                    <select 
                      id="match-job-select"
                      className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none max-w-xs"
                      value={selectedJobId || ""}
                      onChange={(e) => {
                        setSelectedJobId(e.target.value);
                        setMatchReport(null);
                      }}
                    >
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <span className="text-xs font-semibold text-slate-500">Search Talent:</span>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400" />
                      <input 
                        id="candidate-search-input"
                        type="text" 
                        placeholder="Search name, skill..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-xs pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none w-44"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">Ranked Match Matrix</h2>
                    <p className="text-[11px] text-slate-400">Comparing talent pools against the active vacancy targeting system.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      id="btn-add-positions-inline"
                      onClick={() => setShowAddJob(true)}
                      className="px-2 py-1 border border-slate-200 hover:bg-slate-50 text-[10px] rounded font-bold text-slate-600 cursor-pointer"
                    >
                      New Position
                    </button>
                    <button 
                      id="btn-add-resume-inline"
                      onClick={() => setShowAddResume(true)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] rounded font-bold cursor-pointer"
                    >
                      Import Resume
                    </button>
                  </div>
                </div>

                {/* Candidate Matching List */}
                <div className="overflow-x-auto overflow-y-auto flex-1">
                  {filteredCandidatesList.length === 0 ? (
                    <div className="p-8 text-center" id="no-candidates-matched-view">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No candidates available or matched your search criteria.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try reloading jobs, uploading sample resumes, or resetting filters.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs min-w-[600px] lg:min-w-full">
                      <thead className="bg-[#FAFBFD] sticky top-0 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="p-3 pl-4 w-12">Select</th>
                          <th className="p-3">Candidate / Context</th>
                          <th className="p-3 hidden sm:table-cell">Predicted Domain</th>
                          <th className="p-3 text-center">Current Score</th>
                          <th className="p-3 text-center">Shortlist Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredCandidatesList.map((c, idx) => {
                          const isSelected = c.id === selectedCandidateId;
                          const hasMatchedThisJob = c.lastMatchedJobId === selectedJobId && c.score !== undefined;
                          
                          return (
                            <tr 
                              key={c.id}
                              id={`candidate-row-${c.id}`}
                              onClick={() => {
                                setSelectedCandidateId(c.id);
                                // If already auto-calculated on this job, load explanations, else clear report so they can run manually.
                                if (hasMatchedThisJob) {
                                  setMatchReport({
                                    candidateId: c.id,
                                    jobId: c.lastMatchedJobId || "",
                                    score: c.score || 0,
                                    predictedRole: c.predictedRole || "",
                                    explanation: c.explanation || "",
                                    matchedSkills: c.matchedSkills || [],
                                    missingSkills: c.missingSkills || [],
                                    experienceSummary: c.experienceSummary || "",
                                    gapAnalysis: c.explanation ? "Gap calculated based on history" : "",
                                    interviewQuestions: []
                                  });
                                } else {
                                  setMatchReport(null);
                                }
                              }}
                              className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                isSelected ? "bg-blue-50/60 border-l-4 border-blue-600" : ""
                              }`}
                            >
                              <td className="p-3 pl-4 text-center">
                                <input 
                                  type="radio" 
                                  name="candidate-selector"
                                  checked={isSelected}
                                  onChange={() => {}} // handled by row click
                                  className="w-3.5 h-3.5 text-blue-600 border-slate-300"
                                />
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{c.name}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-normal">
                                  <span className="truncate max-w-[130px]">{c.email}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[100px]">{c.education || "CV Provided"}</span>
                                </div>
                                <span className="inline-block sm:hidden mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[8px] uppercase tracking-wide">
                                  {c.predictedRole}
                                </span>
                              </td>
                              <td className="p-3 hidden sm:table-cell">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[9px] uppercase tracking-wide">
                                  {c.predictedRole}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {hasMatchedThisJob ? (
                                  <span id={`score-badge-${c.id}`} className={`font-mono font-bold text-xs ${
                                    (c.score || 0) >= 85 ? "text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200" : 
                                    (c.score || 0) >= 70 ? "text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200" :
                                    "text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200"
                                  }`}>
                                    {c.score}% Match
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal italic text-[10px]">
                                    Not Scored yet
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  id={`shortlist-toggle-${c.id}`}
                                  onClick={() => handleShortlistToggle(c.id, !!c.isShortlisted)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                    c.isShortlisted 
                                      ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" 
                                      : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  {c.isShortlisted ? "✓ Shortlisted" : "Shortlist"}
                                </button>
                              </td>
                              <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  id={`delete-cand-${c.id}`}
                                  onClick={(e) => handleDeleteCandidate(c.id, e)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                  title="Delete profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Score Action Panel */}
                {selectedCandidate && selectedJob && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs" id="small-comp-avatar">
                        M
                      </div>
                      <div>
                        <div className="text-xs text-slate-700 leading-tight">
                          Ready to compare <strong className="text-slate-900 font-bold">{selectedCandidate.name}</strong> against <strong className="text-slate-900 font-bold">{selectedJob.title}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          NLP algorithm triggers token matching and context vectors.
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      id="run-match-btn"
                      onClick={() => runAIMatch(selectedCandidate.id, selectedJob.id)}
                      disabled={isMatching}
                      className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isMatching ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Powering AI NLP Engines...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Score AI Suitability Match
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Match Analysis Details & Explanations */}
              <div className="w-[380px] bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm shrink-0 overflow-y-auto" id="selected-match-analysis-panel">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suitability Report</h3>
                  <span className="text-[9px] px-2 py-0.5 bg-blue-600 font-bold text-white rounded-full">
                    Active Profile
                  </span>
                </div>

                {selectedCandidate ? (
                  <>
                    {/* Candidate bio snippet */}
                    <div className="pb-3 border-b border-slate-100">
                      <h4 className="font-bold text-sm text-slate-900">{selectedCandidate.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        Predicted Domain Category: {selectedCandidate.predictedRole}
                      </p>
                      
                      <div className="mt-3 flex flex-col gap-1.5 text-[11px] text-slate-600">
                        {selectedCandidate.email && (
                          <div className="flex items-center gap-1.5 leading-snug">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedCandidate.email}</span>
                          </div>
                        )}
                        {selectedCandidate.phone && (
                          <div className="flex items-center gap-1.5 leading-snug">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{selectedCandidate.phone}</span>
                          </div>
                        )}
                        {selectedCandidate.education && (
                          <div className="flex items-center gap-1.5 leading-snug">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedCandidate.education}</span>
                          </div>
                        )}
                        {selectedCandidate.experienceSummary && (
                          <div className="flex items-start gap-1.5 mt-1 leading-snug bg-slate-50 p-2 rounded border border-slate-100">
                            <Award className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span>{selectedCandidate.experienceSummary}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Scoring match results */}
                    {matchReport ? (
                      <div className="flex flex-col gap-4 flex-1 animate-fadeIn" id="actual-analysis-report">
                        
                        {/* Score Gauge */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">NLP Match Strength</div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                              {matchReport.score}%
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-1">
                              {matchReport.score >= 85 ? "✓ Excellent Fit Match" : 
                               matchReport.score >= 70 ? "⚠ Partial Fit Match" : 
                               "⚡ Skill Gap Detected"}
                            </div>
                          </div>
                          
                          {/* Circle Progress bar */}
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-200"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={
                                  matchReport.score >= 85 ? "text-green-500" :
                                  matchReport.score >= 70 ? "text-blue-500" : "text-amber-500"
                                }
                                strokeDasharray={`${matchReport.score}, 100`}
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">
                              {matchReport.score}%
                            </div>
                          </div>
                        </div>

                        {/* Text Explanation */}
                        {matchReport.explanation && (
                          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div className="text-[9px] font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                              AI Match Justification
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-700">
                              {matchReport.explanation}
                            </p>
                          </div>
                        )}

                        {/* Gap analysis summary if given */}
                        {matchReport.gapAnalysis && (
                          <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100">
                            <div className="text-[9px] font-bold text-amber-800 uppercase tracking-wide mb-1">
                              Skill Gap & Optimization Advice
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-700 italic">
                              "{matchReport.gapAnalysis}"
                            </p>
                          </div>
                        )}

                        {/* Skills breakdown */}
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills Alignment Breakdown</div>
                          <div className="flex flex-wrap gap-1.5">
                            {/* Render Matched skills */}
                            {matchReport.matchedSkills && matchReport.matchedSkills.length > 0 ? (
                              matchReport.matchedSkills.map((s, i) => (
                                <span key={`match-${i}`} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-[9px] font-semibold flex items-center gap-0.5">
                                  ✓ {s}
                                </span>
                              ))
                            ) : null}

                            {/* Render Missing skills */}
                            {matchReport.missingSkills && matchReport.missingSkills.length > 0 ? (
                              matchReport.missingSkills.map((s, i) => (
                                <span key={`miss-${i}`} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-semibold flex items-center gap-0.5">
                                  ✘ {s}
                                </span>
                              ))
                            ) : null}

                            {!matchReport.matchedSkills?.length && !matchReport.missingSkills?.length && (
                              <span className="text-[10px] italic text-slate-400">No skill mappings returned.</span>
                            )}
                          </div>
                        </div>

                        {/* Interview questions */}
                        {matchReport.interviewQuestions && matchReport.interviewQuestions.length > 0 && (
                          <div className="border-t border-slate-100 pt-3">
                            <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" />
                              Custom AI Interview Questions
                            </div>
                            <div className="flex flex-col gap-2">
                              {matchReport.interviewQuestions.map((q, idx) => (
                                <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] text-slate-700 leading-normal">
                                  <span className="font-bold text-indigo-600 mr-1">{idx + 1}.</span>
                                  {q}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-2 pt-3 border-t border-slate-100">
                          <button 
                            id="download-cand-report"
                            onClick={() => {
                              // Simulate download
                              const text = `MATCH MIND REPORT\n==================\nCandidate: ${selectedCandidate.name}\nDesignation: ${selectedCandidate.predictedRole}\nJob Position: ${selectedJob.title}\nMatch Score: ${matchReport.score}%\n\nExplanation:\n${matchReport.explanation}\n\nGap Analysis:\n${matchReport.gapAnalysis}\n\nGenerated Interview Questions:\n${matchReport.interviewQuestions.join("\n")}`;
                              const blob = new Blob([text], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `MatchMind_Report_${selectedCandidate.name.replace(/\s+/g, "_")}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              showNotification("Candidate report downloaded successfully!", "success");
                            }}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold mb-2 cursor-pointer shadow-sm transition-colors text-center"
                          >
                            Download Full Match Report
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200" id="blank-match-pitch">
                        <Cpu className="w-8 h-8 text-blue-500/40 mx-auto mb-2 animate-pulse" />
                        <h5 className="font-bold text-xs text-slate-700">No Match Profile Created</h5>
                        <p className="text-[10px] leading-relaxed text-slate-400 mt-1">
                          You haven't scored this candidate against the selected job posting yet. Click the <strong>Score AI Suitability Match</strong> button below to extract overlap metrics instantly.
                        </p>
                      </div>
                    )}

                    {/* View CV content */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Original Resume Input Draft</div>
                      <pre className="p-3 bg-slate-50 rounded border border-slate-200 text-[9px] font-mono text-slate-600 max-h-40 overflow-y-auto whitespace-pre-wrap leading-tight">
                        {selectedCandidate.resumeText || "No original text available."}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center" id="blank-selection-candidates">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Select a Candidate</p>
                    <p className="text-[10px] text-slate-400">Click a record in the matrix list to view details.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ACTIVE JOB POSTINGS TAB */}
          {activeTab === "jobs" && (
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="manage-job-postings-view">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-slate-900">Configured Job Vacancy Descriptions</h2>
                  <p className="text-[11px] text-slate-400">Define active requirements with explicit lists of skills to seed Cosine matching models.</p>
                </div>
                <button 
                  id="header-add-job-btn"
                  onClick={() => setShowAddJob(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Position
                </button>
              </div>

              <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 flex gap-2">
                <span>Total Active Positions: <strong>{jobs.length}</strong></span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 align-top">
                {jobs.map(j => (
                  <div key={j.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">{j.title}</h3>
                        <button 
                          id={`del-job-btn-${j.id}`}
                          onClick={(e) => handleDeleteJob(j.id, e)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                          title="Delete posting"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-blue-600 mt-1">Target Opening</div>
                      
                      <p className="text-[11px] text-slate-600 mt-3 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                        {j.text}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Required Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {j.requiredSkills.map((s, idx) => (
                          <span key={idx} className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[9px] text-blue-700 font-semibold uppercase">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedJobId(j.id);
                            setMatchReport(null);
                            setActiveTab("matches");
                            showNotification(`Switched comparison target output to: ${j.title}`, "info");
                          }}
                          className="w-full text-center py-1.5 bg-slate-940 text-slate-800 border border-slate-300 rounded hover:bg-slate-50 text-[10px] font-bold cursor-pointer"
                        >
                          Set Target Selection
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TALENT POOL CONFIGS */}
          {activeTab === "talent" && (
            <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col" id="overall-talent-pool">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-slate-900">Central Talent Pool Database</h2>
                  <p className="text-[11px] text-slate-400">View parsed profile indices, extracted metrics, and shortlist classifications.</p>
                </div>
                <button 
                  id="talent-add-resume-btn"
                  onClick={() => setShowAddResume(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Upload New Client CV
                </button>
              </div>

              {/* Filtering bar inside pool */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Job Filter:</span>
                  <select 
                    id="talent-job-select"
                    className="bg-white border rounded border-slate-300 p-1 text-xs outline-none"
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                  >
                    <option value="all">View All Candidates</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span>Search Text:</span>
                  <input 
                    id="talent-search-input"
                    type="text" 
                    placeholder="Filter name or skill..." 
                    className="bg-white border rounded border-slate-300 px-2 py-1 text-xs outline-none w-48 font-normal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid or large List details */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidatesList.map(c => (
                  <div key={c.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-blue-400 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">{c.name}</h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold inline-block mt-1 uppercase tracking-wide">
                            {c.predictedRole}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            id={`talent-shortlist-toggle-${c.id}`}
                            onClick={() => handleShortlistToggle(c.id, !!c.isShortlisted)}
                            className={`px-2 py-0.5 text-[9px] font-bold border rounded ${
                              c.isShortlisted ? "bg-green-100 border-green-300 text-green-700" : "bg-white border-slate-300 text-slate-500"
                            }`}
                          >
                            {c.isShortlisted ? "Shortlisted" : "Shortlist"}
                          </button>
                          
                          <button 
                            id={`talent-delete-cand-${c.id}`}
                            onClick={(e) => handleDeleteCandidate(c.id, e)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] text-slate-600">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Contact Email</div>
                          <p className="truncate font-semibold">{c.email || "no-recorded@email.com"}</p>
                        </div>
                        {c.phone && (
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Phone</div>
                            <p className="font-semibold">{c.phone}</p>
                          </div>
                        )}
                        {c.education && (
                          <div className="col-span-2">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Highest Education Degree</div>
                            <p className="font-semibold truncate">{c.education}</p>
                          </div>
                        )}
                        {c.experienceSummary && (
                          <div className="col-span-2 bg-slate-50 p-2 rounded text-[10px] text-slate-500 border border-slate-100">
                            <strong>Summary:</strong> {c.experienceSummary}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">Extracted AI Capabilities:</div>
                      <div className="flex flex-wrap gap-1">
                        {c.skills.map((s, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-medium uppercase font-mono">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedCandidateId(c.id);
                            setMatchReport(null);
                            setActiveTab("matches");
                            showNotification(`Loaded candidate comparison parameters for: ${c.name}`, "info");
                          }}
                          className="w-full text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Check Job Suitability Match Matrix
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCandidatesList.length === 0 && (
                  <div className="col-span-2 py-12 text-center" id="empty-talent-pool-search">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <h4 className="text-sm font-semibold text-slate-700">No Match in Talent Pool</h4>
                    <p className="text-xs text-slate-400">Clear filters or import raw CV text inside the top workspace banner to populate candidates.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CANDIDATE BATTLE MODE TAB */}
          {activeTab === "battle" && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn" id="candidate-battle-view">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-blue-600" />
                  Candidate Side-by-Side Battle Mode
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Compare two parsed portfolios against a specific job opening. Gemini AI will evaluate relative competence matrices, isolated strengths, and return an official hiring recommendation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Candidate A:</label>
                    <select 
                      value={compareCand1Id} 
                      onChange={(e) => setCompareCand1Id(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none"
                    >
                      <option value="">-- Select Candidate --</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.predictedRole})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Candidate B:</label>
                    <select 
                      value={compareCand2Id} 
                      onChange={(e) => setCompareCand2Id(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none"
                    >
                      <option value="">-- Select Candidate --</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.predictedRole})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Job Position:</label>
                    <select 
                      value={compareJobId} 
                      onChange={(e) => setCompareJobId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none"
                    >
                      <option value="">-- Select Job Description --</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={runBattleComparison}
                    disabled={isLoadingCompare || !compareCand1Id || !compareCand2Id || !compareJobId}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isLoadingCompare ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Evaluating relative domains with Gemini...
                      </>
                    ) : (
                      <>
                        <Swords className="w-4 h-4" /> Run Side-by-Side Competency Battle
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isLoadingCompare && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Swords className="w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mt-4">Assembling Head-to-Head Comparison...</h3>
                  <p className="text-slate-400 text-[11px] mt-1 text-center max-w-sm leading-relaxed px-4">
                    Gemini AI is parsing the skillsets of both candidates and comparing them side-by-side against the specified target job description.
                  </p>
                </div>
              )}

              {compareResult && (
                <div className="space-y-6 animate-fadeIn" id="compare-results-matrix">
                  
                  {/* Scoreboard Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Candidate A Scorecard */}
                    <div className="bg-white border-2 border-blue-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-lg">Candidate A</div>
                      <h3 className="font-extrabold text-base text-slate-900">{compareResult.candidate1Name}</h3>
                      <div className="text-[10px] text-blue-600 font-bold mt-0.5 uppercase tracking-wide">Competence Score</div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="w-16 h-16 relative shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="26" className="text-slate-100" strokeWidth="4" fill="transparent" stroke="currentColor" />
                            <circle cx="32" cy="32" r="26" className="text-blue-600" strokeWidth="4" fill="transparent" stroke="currentColor" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - compareResult.scoreA / 100)} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-800">{compareResult.scoreA}%</div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Strengths:</h4>
                          <ul className="text-[11px] text-slate-600 space-y-1 mt-1 list-disc list-inside">
                            {compareResult.strengthsA.slice(0, 3).map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Candidate B Scorecard */}
                    <div className="bg-white border-2 border-indigo-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-lg">Candidate B</div>
                      <h3 className="font-extrabold text-base text-slate-900">{compareResult.candidate2Name}</h3>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5 uppercase tracking-wide">Competence Score</div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="w-16 h-16 relative shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="26" className="text-slate-100" strokeWidth="4" fill="transparent" stroke="currentColor" />
                            <circle cx="32" cy="32" r="26" className="text-indigo-600" strokeWidth="4" fill="transparent" stroke="currentColor" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - compareResult.scoreB / 100)} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-800">{compareResult.scoreB}%</div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Strengths:</h4>
                          <ul className="text-[11px] text-slate-600 space-y-1 mt-1 list-disc list-inside">
                            {compareResult.strengthsB.slice(0, 3).map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Verdict Block */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl shadow-sm">
                    <span className="px-2.5 py-1 bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider rounded-full inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" /> AI Selection Verdict
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm mt-3 flex items-center gap-2">
                      Key Deciding Factor: <span className="text-blue-700 font-black">"{compareResult.keyDifferentiator}"</span>
                    </h4>
                    <p className="text-[11.5px] leading-relaxed text-slate-700 mt-2 whitespace-pre-line">
                      {compareResult.verdict}
                    </p>
                  </div>

                  {/* Detailed Criteria Matrix Table */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-800">
                      Cross-Evaluation Criteria Table
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                            <th className="p-3 w-1/4">Evaluation Category</th>
                            <th className="p-3 w-3/8 border-l border-slate-200 bg-blue-50/25">{compareResult.candidate1Name} (A)</th>
                            <th className="p-3 w-3/8 border-l border-slate-200 bg-indigo-50/25">{compareResult.candidate2Name} (B)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {compareResult.comparisonPoints.map((pt: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-700">{pt.category}</td>
                              <td className="p-3 text-[11px] leading-normal text-slate-600 border-l border-slate-200">{pt.candAFeedback}</td>
                              <td className="p-3 text-[11px] leading-normal text-slate-600 border-l border-slate-200">{pt.candBFeedback}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Weaknesses / Sourcing Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5" /> Gaps & Concerns (Candidate A)
                      </h4>
                      <ul className="text-[11px] text-slate-600 space-y-1.5 list-inside list-disc">
                        {compareResult.gapsA.map((g: string, i: number) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5" /> Gaps & Concerns (Candidate B)
                      </h4>
                      <ul className="text-[11px] text-slate-600 space-y-1.5 list-inside list-disc">
                        {compareResult.gapsB.map((g: string, i: number) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              )}

              {!isLoadingCompare && !compareResult && (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-xl" id="blank-battle-compare-pitch">
                  <Swords className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-700 font-sans">No Evaluation Drafted</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Select two distinct candidate portfolios from the dropdown and assign a target vacancy to run deep relative suitability analysis.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ATS RESUME OPTIMIZER TAB */}
          {activeTab === "enhancer" && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn" id="ats-optimizer-view">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  ATS Resume Optimizer & Tailoring Agent
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Re-align and tune an applicant's resume elements to perfectly match active job specifications. Our Gemini agent reconstructs summaries, rewrites work-experience bullets using metrics-driven action verbs, and lists target vocabulary keywords to clear corporate parsing filters.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Candidate:</label>
                    <select 
                      value={enhanceCandId} 
                      onChange={(e) => setEnhanceCandId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none"
                    >
                      <option value="">-- Select Candidate --</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.predictedRole})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Job Description:</label>
                    <select 
                      value={enhanceJobId} 
                      onChange={(e) => setEnhanceJobId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs outline-none"
                    >
                      <option value="">-- Select Job Opening --</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={runResumeEnhancement}
                    disabled={isLoadingEnhance || !enhanceCandId || !enhanceJobId}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isLoadingEnhance ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Reconstructing bullet portfolios with Gemini...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Generate Resume Enhancements
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isLoadingEnhance && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Wand2 className="w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mt-4">Drafting Tailored Adjustments...</h3>
                  <p className="text-slate-400 text-[11px] mt-1 text-center max-w-sm leading-relaxed px-4">
                    Gemini Career Writing Engine is performing semantic comparison, identifying critical keyword voids, and optimizing bullet point narratives.
                  </p>
                </div>
              )}

              {enhanceResult && (
                <div className="space-y-6 animate-fadeIn" id="enhance-results-matrix">
                  
                  {/* Summary Comparison Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Profile Summary</div>
                      <p className="text-xs text-slate-500 leading-relaxed italic flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {enhanceResult.originalSummary || "No explicit summary provided in candidate's original resume."}
                      </p>
                    </div>

                    <div className="bg-white border-2 border-green-100 p-5 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-bl-lg">Optimized for ATS</div>
                      <div className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-2">Enhanced Professional Summary</div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed flex-1 bg-green-50/30 p-3 rounded-lg border border-green-100/50">
                        {enhanceResult.enhancedSummary}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Keyword Chips */}
                  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Suggested Skills & Technologies to Append:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {enhanceResult.suggestedSkillsToAdd.map((s: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded text-xs font-bold uppercase font-mono">
                          + {s}
                        </span>
                      ))}
                      {enhanceResult.suggestedSkillsToAdd.length === 0 && (
                        <span className="text-xs italic text-slate-400">All key required tech keywords already present! Excellent portfolio.</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Explicitly including these synonyms and software categories prevents immediate filtering by screening parsers.</p>
                  </div>

                  {/* Bullet Points optimizations */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-800">
                      Work Experience Bullet Optimizer (Impact- & Metric-Driven)
                    </div>
                    <div className="p-4 divide-y divide-slate-100 space-y-4">
                      {enhanceResult.bulletOptimizations.map((b: any, idx: number) => (
                        <div key={idx} className={`pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 align-top`}>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Original Experience Bullet</span>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 font-mono italic">
                              "{b.originalBullet}"
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest">AI Proposed Impact Rewrite</span>
                            <div className="bg-green-50/20 border border-green-100 p-3 rounded-lg text-xs text-slate-800 font-semibold leading-relaxed">
                              "{b.suggestedBullet}"
                            </div>
                            <div className="text-[10.5px] text-slate-400 pl-1 leading-normal">
                              <strong>ATS Improvement Rationale:</strong> {b.rationale}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Structural critique */}
                  <div className="bg-slate-900 text-slate-100 p-5 rounded-xl shadow-sm border border-slate-800">
                    <h4 className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Career Consultant Resume Critique
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line leading-normal">
                      {enhanceResult.resumeCritique}
                    </p>
                  </div>

                </div>
              )}

              {!isLoadingEnhance && !enhanceResult && (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-xl" id="blank-enhancer-pitch">
                  <Wand2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-700 font-sans">No Enhancements Drafted</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Select a candidate profile and an target vacancy spec, then press the optimize button to construct keyword-tailored enhancements.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* LABOR MARKET TRENDS & SOURCING GAP TAB */}
          {activeTab === "trends" && (
            <div className="flex-1 flex flex-col gap-6 animate-fadeIn" id="market-trends-view">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Labour Market Skills Trend Analyst
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Aggregated analytics over our active database comparing skill demand frequency in job postings vs. active supply frequency in candidate profiles.
                    </p>
                  </div>
                  <button
                    onClick={fetchSkillsTrends}
                    disabled={isLoadingTrends}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded shadow flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start"
                  >
                    {isLoadingTrends ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Aggregating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" /> Recalculate Trends
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isLoadingTrends && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-xl">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <h3 className="font-bold text-slate-800 text-sm mt-4">Compiling market ratios...</h3>
                </div>
              )}

              {trendsResult && (
                <div className="space-y-6 animate-fadeIn" id="trends-results-matrix">
                  
                  {/* Supply and Demand Gaps list */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Top Job Demand */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
                        🔥 Top Skills In Demand (Jobs)
                      </h3>
                      <div className="space-y-3 flex-1">
                        {trendsResult.topRequestedSkills.slice(0, 6).map((item: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-700 font-mono">{item.skill}</span>
                              <span className="text-slate-500">{item.demandCount} openings ({item.demandPercentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.demandPercentage}%` }}></div>
                            </div>
                          </div>
                        ))}
                        {trendsResult.topRequestedSkills.length === 0 && (
                          <div className="text-xs text-slate-400 italic text-center py-8">Define job openings to trace demand.</div>
                        )}
                      </div>
                    </div>

                    {/* Top Applicant Supply */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
                        🤝 Top Skills in Supply (Candidates)
                      </h3>
                      <div className="space-y-3 flex-1">
                        {trendsResult.topSuppliedSkills.slice(0, 6).map((item: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-700 font-mono">{item.skill}</span>
                              <span className="text-slate-500">{item.supplyCount} profiles ({item.supplyPercentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-green-600 h-full rounded-full" style={{ width: `${item.supplyPercentage}%` }}></div>
                            </div>
                          </div>
                        ))}
                        {trendsResult.topSuppliedSkills.length === 0 && (
                          <div className="text-xs text-slate-400 italic text-center py-8">Load client resumes to trace supply metrics.</div>
                        )}
                      </div>
                    </div>

                    {/* Critical Sourcing Shortages */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                      <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
                        ⚠️ Critical Sourcing Shortages (Gap)
                      </h3>
                      <div className="space-y-3 flex-1">
                        {trendsResult.supplyDemandGap.slice(0, 6).map((item: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-700 font-mono">{item.skill}</span>
                              <span className="text-amber-700">{item.gapValue}% gap points</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.gapValue}%` }}></div>
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Requires: {item.demandCount} jobs • Found: {item.supplyCount} applicants
                            </div>
                          </div>
                        ))}
                        {trendsResult.supplyDemandGap.length === 0 && (
                          <div className="text-xs text-slate-400 italic text-center py-8">Gap analytics will populate on load.</div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* AI Labor Market Narrative */}
                  <div className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
                    
                    <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-800 pb-3 mb-4">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      AI Executive Sourcing Analysis & Advisory
                    </h3>
                    
                    <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line leading-normal" style={{ whiteSpace: "pre-wrap" }}>
                      {trendsResult.aiMarketNarrative}
                    </p>
                  </div>

                </div>
              )}

              {!isLoadingTrends && !trendsResult && (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-xl" id="blank-trends-pitch">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-slate-700 font-sans">No Market Analysis Loaded</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Press the "Recalculate Trends" button in the upper right to parse supply-demand metrics and build labor market analytics dynamically.
                  </p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Footer Status Bar with Environment Metadata */}
      <footer className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-medium" id="developer-metadata-footer">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            File DB State: sandbox/db.json
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            AI Parser Core Model: gemini-3.5-flash
          </span>
          <span>Algorithms: Cosine Text Embedding Distance & Skill-Gap Matrix</span>
        </div>
        <div className="hidden sm:block">© 2026 MatchMind AI Systems v1.1.0 • All Rights Reserved</div>
      </footer>


      {/* MODALS SECTION */}

      {/* 1. Show Add Resume/CV Parser Dialog */}
      {showAddResume && (
        <div id="upload-resume-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm">Upload & Parse Candidates (AI Powered)</h3>
                  <p className="text-[10px] text-blue-100">Input candidate data and trigger automatic NLP attribute modeling.</p>
                </div>
              </div>
              <button 
                id="close-resume-modal-btn"
                onClick={() => setShowAddResume(false)}
                className="text-white hover:text-red-200 text-xs font-bold px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAnalyzeResume} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              
              {/* Preset Sample Quick Fills */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wide">
                  Quick Demo Tool (Single Click to test Gemini Parser):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => pasteSampleResume("ml")}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded border text-[10.5px] font-semibold text-left transition-colors"
                  >
                    🧪 Dr. Vance (ML Specialist)
                  </button>
                  <button 
                    type="button"
                    onClick={() => pasteSampleResume("js")}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded border text-[10.5px] font-semibold text-left transition-colors"
                  >
                    ⚛ Chelsea Chen (React Web)
                  </button>
                  <button 
                    type="button"
                    onClick={() => pasteSampleResume("pm")}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded border text-[10.5px] font-semibold text-left transition-colors"
                  >
                    📋 Tim Collins (Product PM)
                  </button>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-lg border border-dashed border-blue-300 flex flex-col items-center justify-center text-center gap-2">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Your Resume File (.txt, .md, .json)
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Drag & drop or click to select a text file to populate details below.</p>
                </div>
                <input 
                  id="local-resume-file-selector"
                  type="file" 
                  accept=".txt,.md,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setResumeFilename(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          setResumeText(content);
                          showNotification(`Loaded content from file: ${file.name}`, "success");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("local-resume-file-selector")?.click()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold rounded shadow-sm cursor-pointer"
                >
                  Choose Local File
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Candidate Resource Filename / Source Tag:
                </label>
                <input 
                  id="resume-filename-input"
                  type="text" 
                  placeholder="e.g. michelle_cv_ai_engineer.pdf"
                  value={resumeFilename}
                  onChange={(e) => setResumeFilename(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Original Resume CV Content Text (Paste Below):
                </label>
                <textarea 
                  id="resume-text-input"
                  rows={8}
                  placeholder="Paste raw CV copy-paste lines containing name, contact links, technologies, experience highlights, and university education..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                ></textarea>
              </div>

              <div className="bg-slate-50 p-3 rounded text-[10px] text-slate-500 border border-slate-100 leading-normal">
                <strong>How it works:</strong> Clicking the AI analysis button parses this text server-side through Gemini LLM, returning a clean structured candidate profile (including Name, Email, Phone, Predicted Role, Highest Education, and up to 15 fully extracted skills tags). Any selected Job matching parameters will run automatically!
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddResume(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="submit-resume-parser-btn"
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Parsing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Start NLP Skill Extraction
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* 2. Show Add Job Posting Dialog */}
      {showAddJob && (
        <div id="upload-job-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">Add New Targeted Job Opening</h3>
                <p className="text-[10px] text-slate-400">Specify requirements to test similarity matches.</p>
              </div>
              <button 
                id="close-job-modal-btn"
                onClick={() => setShowAddJob(false)}
                className="text-white hover:text-red-200 text-xs font-bold px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-5 flex flex-col gap-4">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Job Position Title:
                </label>
                <input 
                  id="job-title-input"
                  type="text" 
                  placeholder="e.g. Lead AWS Cloud Security Analyst"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Comma-Separated Required Core Skills (CRITICAL for matching):
                </label>
                <input 
                  id="job-skills-input"
                  type="text" 
                  placeholder="e.g. AWS, Terraform, Docker, Python, Linux, IAM"
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                />
                <p className="text-[9px] text-slate-400 mt-1">
                  We use these exact tokens in candidate alignment matrices.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Full Detailed Job Specifications & Overview:
                </label>
                <textarea 
                  id="job-desc-input"
                  rows={6}
                  placeholder="We are looking for a cloud security specialist who has managed enterprise architectures..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="submit-job-btn"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Post Job Opening
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
