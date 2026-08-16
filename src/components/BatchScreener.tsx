import React, { useState } from "react";
import { 
  Users, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpDown, 
  Download, 
  Star, 
  Check, 
  Briefcase, 
  RefreshCw,
  Trophy,
  Filter
} from "lucide-react";
import { Candidate, JobDescription, BatchScreeningResult } from "../types";

interface BatchScreenerProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  onToggleShortlist: (candidateId: string, currentStatus: boolean) => void;
  onSelectCandidate: (id: string) => void;
}

export function BatchScreener({
  candidates,
  jobs,
  onToggleShortlist,
  onSelectCandidate
}: BatchScreenerProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<BatchScreeningResult | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [recommendationFilter, setRecommendationFilter] = useState<string>("all");

  const runBatchScreening = async () => {
    if (!selectedJobId) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/batch-screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId })
      });

      if (res.ok) {
        const data = await res.json();
        setBatchResult(data);
      }
    } catch (err) {
      console.error("Error in batch screening", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const filteredCandidates = (batchResult?.rankedCandidates || []).filter(c => {
    if (c.score < minScoreFilter) return false;
    if (recommendationFilter !== "all" && c.recommendation !== recommendationFilter) return false;
    return true;
  });

  const exportCSV = () => {
    if (!batchResult) return;
    const headers = "Candidate Name,Predicted Role,Match Score,Recommendation,Matched Skills,Missing Skills\n";
    const rows = batchResult.rankedCandidates.map(c => 
      `"${c.name}","${c.predictedRole}",${c.score}%,"${c.recommendation}",${c.matchedSkillsCount},${c.missingSkillsCount}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Batch_Screening_${batchResult.jobTitle.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-purple-400" />
                Bulk Intelligence Hub
              </span>
              <span className="text-xs text-slate-400">Multi-Candidate Auto-Rank Engine</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              Automated Batch Screening & Candidate Leaderboard
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Screen your entire talent pool against any job opening in seconds. Compare match percentages, skill alignment depth, and identify top hire candidates instantly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
              <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Talent Pool</div>
              <div className="text-xl font-extrabold text-white">{candidates.length} Profiles</div>
            </div>
            {batchResult && (
              <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-3 rounded-xl border border-emerald-500/30 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Avg Pool Fit</div>
                <div className="text-xl font-extrabold text-emerald-300">{batchResult.averageScore}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Screening Launcher Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Select Target Vacancy</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-slate-800/90 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.requiredSkills?.length || 0} required skills)</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runBatchScreening}
              disabled={isLoading}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? "Screening Pool..." : "Run Bulk Screening"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Table & Insights */}
      {batchResult ? (
        <div className="space-y-4">
          {/* Filter and Export Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">Filter By Fit:</span>
              </div>
              <select
                value={recommendationFilter}
                onChange={(e) => setRecommendationFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Recommendations</option>
                <option value="Strong Hire">Strong Hire (85%+)</option>
                <option value="Consider">Consider (70-84%)</option>
                <option value="Needs Development">Needs Development (&lt;70%)</option>
              </select>

              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Min Score:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  className="w-20 accent-purple-600"
                />
                <span className="font-bold text-slate-800">{minScoreFilter}%</span>
              </div>
            </div>

            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV Leaderboard
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Leaderboard: {batchResult.jobTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredCandidates.length} of {batchResult.totalScreened} candidate profiles ranked by algorithm
                </p>
              </div>

              {batchResult.topSkillGaps && batchResult.topSkillGaps.length > 0 && (
                <div className="text-right hidden md:block">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Common Talent Pool Gaps</span>
                  <div className="flex gap-1 justify-end mt-0.5">
                    {batchResult.topSkillGaps.map((gap, i) => (
                      <span key={i} className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200/80">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Candidate Profile</th>
                    <th className="py-3 px-4">Predicted Role</th>
                    <th className="py-3 px-4 text-center">Match Score</th>
                    <th className="py-3 px-4 text-center">Skill Coverage</th>
                    <th className="py-3 px-4">Recommendation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((cand, idx) => {
                    const isTop3 = idx < 3;
                    return (
                      <tr key={cand.candidateId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                            idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            idx === 1 ? 'bg-slate-200 text-slate-700' :
                            idx === 2 ? 'bg-amber-50 text-amber-900' : 'text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onSelectCandidate(cand.candidateId)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors flex items-center gap-1.5"
                          >
                            <span>{cand.name}</span>
                            {cand.isShortlisted && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </button>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{cand.keyHighlights}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {cand.predictedRole}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block font-black px-2.5 py-1 rounded-full text-xs ${
                            cand.score >= 85 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            cand.score >= 70 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {cand.score}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="text-slate-700 font-semibold">
                            {cand.matchedSkillsCount} matched
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cand.missingSkillsCount} gaps
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            cand.recommendation === 'Strong Hire' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            cand.recommendation === 'Consider' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {cand.recommendation === 'Strong Hire' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {cand.recommendation}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => onToggleShortlist(cand.candidateId, Boolean(cand.isShortlisted))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                              cand.isShortlisted
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cand.isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Screen Entire Talent Pool at Scale</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Choose a target job vacancy from the dropdown above and launch bulk screening to generate a complete leaderboard of all candidate matches with recommendations.
          </p>
          <button
            onClick={runBatchScreening}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Screen All {candidates.length} Profiles
          </button>
        </div>
      )}
    </div>
  );
}
