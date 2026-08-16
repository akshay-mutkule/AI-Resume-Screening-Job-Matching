import React, { useState } from "react";
import { 
  Wand2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  BookOpen,
  Briefcase
} from "lucide-react";
import { JobDescription, JobOptimizationResult } from "../types";

interface JobOptimizerProps {
  jobs: JobDescription[];
  onJobUpdated?: (newJob: JobDescription) => void;
}

export function JobOptimizer({ jobs, onJobUpdated }: JobOptimizerProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || "");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<JobOptimizationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setCustomTitle(job.title);
      setCustomDescription(job.text);
    }
  };

  const runOptimization = async () => {
    if (!customDescription.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/optimize-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customTitle,
          description: customDescription
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.enhancedDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Inclusivity & Clarity AI
              </span>
              <span className="text-xs text-slate-400">Job Description Optimization Studio</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              AI Job Description Optimizer & Bias Detector
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Audit job postings for unconscious bias, extreme jargon density, and missing modern competencies. Automatically generate welcoming, high-converting descriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => handleSelectJob(e.target.value)}
              className="bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="">Load from saved vacancies...</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor & AI Analyzer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Draft */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-teal-600" />
                Job Posting Draft
              </h3>
              <span className="text-xs text-slate-400">Paste or edit JD text</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Position Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Job Description & Requirements</label>
              <textarea
                rows={12}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Paste the full job opening description, core duties, and desired tech stack qualifications..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-normal leading-relaxed resize-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {customDescription.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={runOptimization}
              disabled={!customDescription.trim() || isLoading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {isLoading ? "Auditing & Optimizing..." : "Analyze & Enhance Posting"}
            </button>
          </div>
        </div>

        {/* Right Column: AI Optimization Diagnostics & Rewrite */}
        <div className="space-y-4">
          {result ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              {/* Score Diagnostics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Inclusivity Index</div>
                  <div className="text-xl font-black text-teal-700 mt-0.5">{result.inclusivityScore}/100</div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Clarity Rating</div>
                  <div className="text-xl font-black text-blue-700 mt-0.5">{result.clarityScore}/100</div>
                </div>

                <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Readability</div>
                  <div className="text-xl font-black text-purple-700 mt-0.5">{result.readabilityScore}/100</div>
                </div>
              </div>

              {/* Bias and Missing Competency Audit */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    AI Linguistic & Bias Audit
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed mb-2">{result.critique}</p>

                  {result.identifiedBiases && result.identifiedBiases.length > 0 && (
                    <ul className="space-y-1 text-[11px] text-amber-800 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                      {result.identifiedBiases.map((bias, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-bold text-amber-600">•</span>
                          <span>{bias}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {result.missingCrucialSkills && result.missingCrucialSkills.length > 0 && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                    <span className="font-bold text-indigo-900 block mb-1.5">
                      💡 Suggested Modern Stack Additions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingCrucialSkills.map((skill, i) => (
                        <span key={i} className="bg-white text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Rewrite Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    AI-Optimized Job Description
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-all border border-slate-200 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <div className="p-4 bg-slate-900 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {result.enhancedDescription}
                </div>
              </div>
            </div>
          ) : (
            /* Blank state */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3 h-full flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Wand2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Waiting for Job Draft</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Enter your job description or pick an existing vacancy on the left to run AI bias detection, readability audit, and generate an enhanced version.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
