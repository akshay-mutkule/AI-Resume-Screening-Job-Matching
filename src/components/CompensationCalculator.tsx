import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Calculator,
  RefreshCw,
  Coins,
  Briefcase
} from "lucide-react";
import { Candidate, JobDescription, SalaryBenchmarkResult } from "../types";

interface CompensationCalculatorProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedCandidateId: string | null;
  selectedJobId: string | null;
  onSelectCandidate: (id: string) => void;
  onSelectJob: (id: string) => void;
}

export function CompensationCalculator({
  candidates,
  jobs,
  selectedCandidateId,
  selectedJobId,
  onSelectCandidate,
  onSelectJob
}: CompensationCalculatorProps) {
  const [selectedGeoTier, setSelectedGeoTier] = useState<"tier1" | "tier2" | "tier3">("tier1");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [benchmark, setBenchmark] = useState<SalaryBenchmarkResult | null>(null);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const fetchBenchmark = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/salary-benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeCandidate?.id,
          jobId: activeJob?.id,
          roleTitle: activeJob?.title || activeCandidate?.predictedRole,
          experienceLevel: activeJob?.experienceLevel || "Senior (4-7 years)"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBenchmark(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark();
  }, [selectedCandidateId, selectedJobId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Market Equity & Comp AI
              </span>
              <span className="text-xs text-slate-400">Total Rewards & Negotiation Analytics</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              AI Market Salary & Total Compensation Benchmark
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time base salary percentiles, equity vesting models, geographic cost-of-living tiers, and candidate negotiation leverage calibrated to stack competencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBenchmark}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? "Recalculating..." : "Recalibrate Market"}</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Candidate</label>
            <select
              value={activeCandidate?.id || ""}
              onChange={(e) => onSelectCandidate(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.predictedRole})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Job Vacancy</label>
            <select
              value={activeJob?.id || ""}
              onChange={(e) => onSelectJob(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Geographic Compensation Tier</label>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setSelectedGeoTier("tier1")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  selectedGeoTier === "tier1" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Tier 1 (SF/NYC)
              </button>
              <button
                onClick={() => setSelectedGeoTier("tier2")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  selectedGeoTier === "tier2" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Tier 2 (Hubs)
              </button>
              <button
                onClick={() => setSelectedGeoTier("tier3")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  selectedGeoTier === "tier3" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Tier 3 (Remote)
              </button>
            </div>
          </div>
        </div>
      </div>

      {benchmark ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Median Base Salary</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ${benchmark.baseSalary.median.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">50th percentile market anchor</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Compensation Median</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ${benchmark.totalCompMedian.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Base + Annual Equity + Target Bonus</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skill Rarity Index</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {benchmark.marketRarityMultiplier}x
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Competency scarcity multiplier</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Bonus Range</span>
              <div className="text-base font-extrabold text-slate-800 mt-1">
                {benchmark.estimatedTargetBonus}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Annual performance based</p>
            </div>
          </div>

          {/* Percentile Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Market Percentile Base Salary Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Benchmarked for <strong className="text-slate-700">{benchmark.roleTitle}</strong> ({benchmark.experienceLevel})
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                Active Benchmark
              </span>
            </div>

            {/* Visual Percentile Bar */}
            <div className="py-4">
              <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden flex items-center border border-slate-200">
                <div className="h-full bg-blue-200 w-1/4"></div>
                <div className="h-full bg-emerald-400 w-1/4"></div>
                <div className="h-full bg-indigo-500 w-1/4"></div>
                <div className="h-full bg-purple-600 w-1/4"></div>
              </div>

              {/* Percentile Values Grid */}
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">25th Percentile</span>
                  <div className="font-black text-slate-800 text-sm mt-0.5">${benchmark.baseSalary.p25.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500">Entry Band</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Median (50th)</span>
                  <div className="font-black text-emerald-800 text-base mt-0.5">${benchmark.baseSalary.median.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Standard Market</span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase">75th Percentile</span>
                  <div className="font-black text-indigo-800 text-sm mt-0.5">${benchmark.baseSalary.p75.toLocaleString()}</div>
                  <span className="text-[10px] text-indigo-600 font-semibold">High Performer</span>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">90th Percentile</span>
                  <div className="font-black text-purple-800 text-sm mt-0.5">${benchmark.baseSalary.p90.toLocaleString()}</div>
                  <span className="text-[10px] text-purple-600 font-semibold">Top 10% Scarcity</span>
                </div>
              </div>
            </div>

            {/* Geo Tier Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  {selectedGeoTier === "tier1" ? "Tier 1 Metro (San Francisco, New York, High Cost Remote)" :
                   selectedGeoTier === "tier2" ? "Tier 2 Hub (Austin, Seattle, Denver, London, Toronto)" :
                   "Tier 3 / Distributed (Global Remote, Low Cost Regions)"}
                </span>
              </div>
              <span className="font-black text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                {benchmark.geoTiers[selectedGeoTier]}
              </span>
            </div>
          </div>

          {/* Equity & Strategic Negotiation Leverage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equity Model */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
                <Coins className="w-4 h-4 text-emerald-600" />
                Equity Grant & Vesting Horizon
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950">
                <span className="font-black text-base text-emerald-800 block mb-1">
                  {benchmark.estimatedEquityRange}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Based on late-stage / public enterprise benchmarks. Typically structured as RSUs or ISO options with standard 4-year vesting schedule and 1-year cliff.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                <strong className="text-slate-800 block mb-0.5">Market Scarcity Insight:</strong>
                <p className="text-[11px] leading-relaxed">{benchmark.marketRarityComment}</p>
              </div>
            </div>

            {/* Negotiation Leverage Checklist */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
                <Award className="w-4 h-4 text-indigo-600" />
                Strategic Candidate Negotiation Pointers
              </div>
              <ul className="space-y-2">
                {benchmark.negotiationPointers.map((pointer, idx) => (
                  <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pointer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-2xs">
          <Calculator className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
          <h4 className="font-bold text-slate-800 text-sm">Calibrating Compensation Engine...</h4>
          <p className="text-xs text-slate-400 mt-1">Retrieving market salary percentiles and equity ranges.</p>
        </div>
      )}
    </div>
  );
}
