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
  AlertCircle
} from "lucide-react";
import { Candidate, JobDescription, MatchReport } from "./types";

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  
  // Selection states
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<"matches" | "jobs" | "talent">("matches");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");
  
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

  return (
    <div className="flex flex-col h-screen min-h-[768px] min-w-[1024px] bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden" id="match-mind-root">
      
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
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0" id="matchmind-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">MatchMind <span className="text-blue-600">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">RESUME SCREENING & JOB MATCHING</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Gemini NLP Model Enabled
          </div>
          <button 
            id="open-upload-btn"
            onClick={() => setShowAddResume(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Upload Resume
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs" title="Human Resources Administrator">
            HR
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-slate-200 bg-white p-4 flex flex-col gap-1.5 shrink-0" id="app-sidebar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Recruitment Workspace</div>
          
          <button 
            id="tab-btn-matches"
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "matches" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-500" />
            Active Match Matrices
          </button>
          
          <button 
            id="tab-btn-jobs"
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "jobs" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-500" />
            Job Postings ({jobs.length})
          </button>
          
          <button 
            id="tab-btn-talent"
            onClick={() => setActiveTab("talent")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-xs text-left cursor-pointer transition-all ${
              activeTab === "talent" 
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            Talent Pool ({candidates.length})
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
                ATS Smart Tip
              </div>
              Select a job, select a candidate, then press <strong>Score Match</strong> to test and analyze capability alignment models instantly.
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto" id="main-content-scrollable">
          
          {/* Top Stats Cards */}
          <section className="grid grid-cols-4 gap-4 shrink-0" id="statistics-cards">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Target Position</div>
              <div className="text-lg font-bold text-slate-900 truncate">
                {selectedJob ? selectedJob.title : "No Active Postings"}
              </div>
              <div className="text-blue-600 text-[9px] mt-1 font-semibold uppercase tracking-wider">
                {selectedJob ? `${selectedJob.requiredSkills.length} Required Skills` : "Define postings"}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Candidate Submissions</div>
              <div className="text-2xl font-black text-slate-900">{candidates.length}</div>
              <div className="text-green-600 text-[9px] mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                Durable SQLite Persistent State
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Avg Similarity Score</div>
              <div className="text-2xl font-black text-slate-900">{averageMatchScore}</div>
              <div className="text-slate-500 text-[9px] mt-1 font-semibold">
                Cosine Distance / Semantic Indexing
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Shortlisted Prospects</div>
              <div className="text-2xl font-black text-amber-600">{shortlistedCount}</div>
              <div className="text-slate-500 text-[9px] mt-1 font-medium">Ready for immediate interview</div>
            </div>
          </section>

          {/* MAIN SCREEN DEPENDENT ON TABS */}

          {activeTab === "matches" && (
            <div className="flex-1 flex gap-6 overflow-hidden min-h-[480px]">
              
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
                <div className="overflow-y-auto flex-1">
                  {filteredCandidatesList.length === 0 ? (
                    <div className="p-8 text-center" id="no-candidates-matched-view">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">No candidates available or matched your search criteria.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Try reloading jobs, uploading sample resumes, or resetting filters.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFBFD] sticky top-0 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="p-3 pl-4 w-12">Select</th>
                          <th className="p-3">Candidate / Context</th>
                          <th className="p-3">Predicted Domain</th>
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
                              </td>
                              <td className="p-3">
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
                <div className="grid grid-cols-3 gap-2">
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
