import React, { useState } from "react";
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  Award,
  Cpu,
  BarChart3,
  Check,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { Candidate, EngineeringSquadPlan } from "../types";

interface SquadBuilderProps {
  candidates: Candidate[];
  onSelectCandidate?: (id: string) => void;
  onAdvanceCandidateStage?: (candidateId: string, stage: string) => void;
}

export function SquadBuilder({
  candidates,
  onSelectCandidate,
  onAdvanceCandidateStage
}: SquadBuilderProps) {
  const [objective, setObjective] = useState<string>("Scalable Generative AI & Autonomous Platform");
  const [customObjective, setCustomObjective] = useState<string>("");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    candidates.slice(0, 4).map(c => c.id)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [squadPlan, setSquadPlan] = useState<EngineeringSquadPlan | null>(null);
  const [offeredPod, setOfferedPod] = useState<boolean>(false);

  const presets = [
    "Scalable Generative AI & Autonomous Platform",
    "Cloud Migration & Event-Driven Microservices",
    "High-Velocity Full-Stack FinTech Core",
    "Distributed Kubernetes & Edge Infrastructure",
    "Real-Time Collaborative Canvas Engine"
  ];

  const toggleCandidate = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      if (selectedCandidateIds.length > 2) {
        setSelectedCandidateIds(selectedCandidateIds.filter(cid => cid !== id));
      }
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const buildSquad = async () => {
    const finalObjective = objective === "custom" ? customObjective : objective;
    if (!finalObjective.trim()) return;

    setIsLoading(true);
    setOfferedPod(false);

    try {
      const res = await fetch("/api/build-squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: finalObjective,
          candidateIds: selectedCandidateIds
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSquadPlan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const advanceAllToTeamMatch = () => {
    if (!squadPlan || !onAdvanceCandidateStage) return;
    squadPlan.members.forEach(m => {
      onAdvanceCandidateStage(m.candidateId, "team_match");
    });
    setOfferedPod(true);
    setTimeout(() => setOfferedPod(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-400" />
                Multi-Hire Pod Intelligence
              </span>
              <span className="text-xs text-slate-400">Synergy Matrix & Complementary SWAT Teams</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              Engineering Squad & SWAT Pod Synergy Optimizer
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Stop hiring in silos. Model multi-hire engineering squads that complement each other's technical blindspots, maximize delivery velocity, and guarantee mission readiness.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={buildSquad}
              disabled={isLoading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Assembling Optimal Pod..." : "Optimize Squad Synergy"}</span>
            </button>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 pt-4 border-t border-slate-800">
          <div className="lg:col-span-6">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Mission Objective</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-teal-500"
            >
              {presets.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
              <option value="custom">+ Custom Project Objective</option>
            </select>

            {objective === "custom" && (
              <input
                type="text"
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                placeholder="e.g. High-throughput crypto derivatives trading engine"
                className="w-full mt-2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-teal-500"
              />
            )}
          </div>

          <div className="lg:col-span-6">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Candidate Pool ({selectedCandidateIds.length} Selected)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-800/60 rounded-lg border border-slate-700">
              {candidates.map(c => {
                const isSelected = selectedCandidateIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCandidate(c.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                      isSelected 
                        ? "bg-teal-600 text-white font-bold" 
                        : "bg-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {squadPlan ? (
        <div className="space-y-6">
          {/* Top Score & Coverage Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">
                  Autonomous Pod Configuration
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{squadPlan.squadName}</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">{squadPlan.summary}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center min-w-28">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">Synergy Score</span>
                  <div className="text-3xl font-black text-teal-800 mt-0.5">{squadPlan.synergyScore}%</div>
                  <span className="text-[10px] font-semibold text-teal-600">High Cohesion</span>
                </div>

                {onAdvanceCandidateStage && (
                  <button
                    onClick={advanceAllToTeamMatch}
                    className="px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    {offeredPod ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Layers className="w-4 h-4" />}
                    <span>{offeredPod ? "Moved to Team Match!" : "Advance Pod in ATS Pipeline"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 6-Dimension Pod Competency Radar Coverage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              {[
                { label: "Frontend Experience", val: squadPlan.competencyCoverage.frontend, color: "bg-blue-500" },
                { label: "Core Backend", val: squadPlan.competencyCoverage.backend, color: "bg-teal-500" },
                { label: "Cloud & DevOps", val: squadPlan.competencyCoverage.cloudDevOps, color: "bg-emerald-500" },
                { label: "AI & ML Systems", val: squadPlan.competencyCoverage.aiMachineLearning, color: "bg-violet-500" },
                { label: "System Design", val: squadPlan.competencyCoverage.systemDesign, color: "bg-amber-500" },
                { label: "Team Velocity", val: squadPlan.competencyCoverage.teamVelocity, color: "bg-indigo-500" }
              ].map((cov, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span className="truncate">{cov.label}</span>
                    <span>{cov.val}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${cov.color}`} style={{ width: `${cov.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pod Member Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {squadPlan.members.map((member, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Pod Seat #{idx + 1}
                    </span>
                    <button
                      onClick={() => onSelectCandidate && onSelectCandidate(member.candidateId)}
                      className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-0.5"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{member.name}</h4>
                    <div className="text-xs font-bold text-teal-700 mt-0.5">{member.assignedRole}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{member.primaryDomain}</div>
                  </div>

                  {/* Core Responsibilities */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pod Responsibilities
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {member.keyResponsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                          <span className="text-[11px] leading-relaxed">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skills Contributed */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Skills Provided to Pod
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {member.keySkillsProvided.map((sk, i) => (
                      <span key={i} className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row: Complementary Synergies & Risk Mitigations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Complementary Synergies */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Complementary Pod Synergies
                </h4>
              </div>

              <div className="space-y-2">
                {squadPlan.complementarySynergies.map((syn, i) => (
                  <div key={i} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/60 text-xs text-teal-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-[11px] font-medium">{syn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Risks & Mitigations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Potential Blindspots & Governance Mitigations
                </h4>
              </div>

              <div className="space-y-2">
                {squadPlan.potentialRisksAndMitigations.map((rm, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <span className="text-amber-600">Risk:</span> {rm.risk}
                    </div>
                    <div className="text-slate-600 text-[11px] pl-3 border-l-2 border-teal-500">
                      <strong className="text-teal-700">Mitigation:</strong> {rm.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Assemble Synergistic Engineering Pod</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Select a project initiative above, pick candidate profiles from your pool, and click <strong>Optimize Squad Synergy</strong> to calculate skill complementarity and form an elite delivery pod.
          </p>
          <button
            onClick={buildSquad}
            disabled={isLoading}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Squad Blueprint</span>
          </button>
        </div>
      )}
    </div>
  );
}
