import React, { useState } from "react";
import { 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Bot, 
  FileText, 
  Award,
  Layers,
  Filter
} from "lucide-react";
import { Candidate, PipelineStage } from "../types";

interface TalentPipelineKanbanProps {
  candidates: Candidate[];
  onUpdateStage: (candidateId: string, newStage: PipelineStage) => void;
  onToggleShortlist: (candidateId: string, currentStatus: boolean) => void;
  onSelectCandidate: (candidateId: string) => void;
  onLaunchInterview: (candidateId: string) => void;
  onOpenDossier: (candidateId: string) => void;
}

interface ColumnConfig {
  key: PipelineStage;
  label: string;
  color: string;
  bgHeader: string;
  badgeBg: string;
  iconBg: string;
  description: string;
}

const PIPELINE_COLUMNS: ColumnConfig[] = [
  {
    key: "sourced",
    label: "Sourced & Pool",
    color: "border-slate-300 text-slate-700",
    bgHeader: "bg-slate-100/90 text-slate-800",
    badgeBg: "bg-slate-200 text-slate-800",
    iconBg: "bg-slate-300",
    description: "Newly parsed & ingested resumes"
  },
  {
    key: "screened",
    label: "Automated Screen",
    color: "border-blue-300 text-blue-700",
    bgHeader: "bg-blue-50/90 text-blue-900",
    badgeBg: "bg-blue-100 text-blue-800",
    iconBg: "bg-blue-400",
    description: "Evaluated against job requirements"
  },
  {
    key: "interview",
    label: "Technical Interview",
    color: "border-indigo-300 text-indigo-700",
    bgHeader: "bg-indigo-50/90 text-indigo-900",
    badgeBg: "bg-indigo-100 text-indigo-800",
    iconBg: "bg-indigo-400",
    description: "Mock or live technical rounds"
  },
  {
    key: "team_match",
    label: "Team Matching",
    color: "border-purple-300 text-purple-700",
    bgHeader: "bg-purple-50/90 text-purple-900",
    badgeBg: "bg-purple-100 text-purple-800",
    iconBg: "bg-purple-400",
    description: "Architectural & culture fit review"
  },
  {
    key: "offer",
    label: "Offer Extended",
    color: "border-amber-300 text-amber-700",
    bgHeader: "bg-amber-50/90 text-amber-900",
    badgeBg: "bg-amber-100 text-amber-800",
    iconBg: "bg-amber-400",
    description: "Compensation package proposed"
  },
  {
    key: "hired",
    label: "Signed & Hired",
    color: "border-emerald-300 text-emerald-700",
    bgHeader: "bg-emerald-50/90 text-emerald-900",
    badgeBg: "bg-emerald-100 text-emerald-800",
    iconBg: "bg-emerald-400",
    description: "Offer accepted & onboarding"
  }
];

export function TalentPipelineKanban({
  candidates,
  onUpdateStage,
  onToggleShortlist,
  onSelectCandidate,
  onLaunchInterview,
  onOpenDossier
}: TalentPipelineKanbanProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [shortlistOnly, setShortlistOnly] = useState(false);

  const STAGE_ORDER: PipelineStage[] = ["sourced", "screened", "interview", "team_match", "offer", "hired"];

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx < STAGE_ORDER.length - 1) return STAGE_ORDER[idx + 1];
    return null;
  };

  const getPrevStage = (current: PipelineStage): PipelineStage | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx > 0) return STAGE_ORDER[idx - 1];
    return null;
  };

  const filteredCandidates = candidates.filter(c => {
    if (shortlistOnly && !c.isShortlisted) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchRole = c.predictedRole.toLowerCase().includes(q);
      const matchSkills = c.skills.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchRole && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Talent Pipeline OS
              </span>
              <span className="text-xs text-slate-400">Full ATS Recruitment Lifecycle Board</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              Applicant Tracking System (ATS) Pipeline Board
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Track candidates from initial sourcing to technical interview, team match, compensation offer, and final hire with 1-click stage advancement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Active In Pipeline</div>
              <div className="text-lg font-black text-white">{candidates.length} Profiles</div>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-500/30 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Hired & Offers</div>
              <div className="text-lg font-black text-emerald-300">
                {candidates.filter(c => c.pipelineStage === "offer" || c.pipelineStage === "hired").length}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, role, or skill..."
              className="w-full bg-slate-800 text-white text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shortlistOnly}
                onChange={(e) => setShortlistOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>★ Shortlisted Only ({candidates.filter(c => c.isShortlisted).length})</span>
            </label>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map(col => {
          const colCandidates = filteredCandidates.filter(c => {
            const stage = c.pipelineStage || (c.isShortlisted ? "interview" : "screened");
            return stage === col.key;
          });

          return (
            <div
              key={col.key}
              className="bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col min-w-[240px] max-h-[750px] shadow-2xs"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-2xl border-b border-slate-200/60 ${col.bgHeader}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {colCandidates.length}
                  </span>
                </div>
                <p className="text-[10px] opacity-75 truncate">{col.description}</p>
              </div>

              {/* Cards List */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 no-scrollbar">
                {colCandidates.map(cand => {
                  const currentStage = cand.pipelineStage || (cand.isShortlisted ? "interview" : "screened");
                  const nextStage = getNextStage(currentStage);
                  const prevStage = getPrevStage(currentStage);

                  return (
                    <div
                      key={cand.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all space-y-2.5 group"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <button
                            onClick={() => onSelectCandidate(cand.id)}
                            className="font-bold text-xs text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1"
                          >
                            <span>{cand.name}</span>
                          </button>
                          <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[150px]">
                            {cand.predictedRole}
                          </span>
                        </div>

                        <button
                          onClick={() => onToggleShortlist(cand.id, Boolean(cand.isShortlisted))}
                          className={`p-1 rounded-md transition-colors ${
                            cand.isShortlisted
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-slate-400'
                          }`}
                          title={cand.isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                        >
                          <Star className={`w-3.5 h-3.5 ${cand.isShortlisted ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>

                      {/* Score & Experience Tag */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-black ${
                          (cand.score || 85) >= 88 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          (cand.score || 85) >= 70 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {cand.score || 85}% Fit
                        </span>
                        <span className="text-slate-400 truncate max-w-[110px]">
                          {cand.source ? cand.source.replace(/\.[^/.]+$/, "") : "Resume"}
                        </span>
                      </div>

                      {/* Skills Snippet */}
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{cand.skills.length - 3}</span>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onLaunchInterview(cand.id)}
                            className="p-1 hover:bg-indigo-50 text-indigo-600 rounded"
                            title="Launch AI Mock Interview"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDossier(cand.id)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                            title="View Full Evaluation Dossier"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Stage Transition Arrows */}
                        <div className="flex items-center gap-1">
                          {prevStage && (
                            <button
                              onClick={() => onUpdateStage(cand.id, prevStage)}
                              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                              title={`Move back to ${prevStage}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {nextStage && (
                            <button
                              onClick={() => onUpdateStage(cand.id, nextStage)}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-all shadow-2xs flex items-center gap-1"
                              title={`Advance to ${nextStage}`}
                            >
                              <span>Next</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {!nextStage && (
                            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colCandidates.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-slate-400 italic">
                    No candidates in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
