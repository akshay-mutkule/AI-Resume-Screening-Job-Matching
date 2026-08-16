import React, { useState } from "react";
import { BarChart3, CheckCircle2, Clock, Sparkles, BookOpen, Layers } from "lucide-react";

// ==========================================
// 1. INTERACTIVE OVERLAP ALIGNMENT VENN DIAGRAM
// ==========================================
interface InteractiveVennProps {
  candSkills: string[];
  jobSkills: string[];
  matched: string[];
  missing: string[];
}

export function InteractiveVenn({ candSkills, jobSkills, matched, missing }: InteractiveVennProps) {
  const [hoveredRegion, setHoveredRegion] = useState<'none' | 'candidate' | 'overlap' | 'job'>('none');
  const [clickedRegion, setClickedRegion] = useState<'candidate' | 'overlap' | 'job'>('overlap');

  const extra = candSkills.filter(
    s => !matched.some(m => m.toLowerCase() === s.toLowerCase())
  );

  const activeRegion = hoveredRegion !== 'none' ? hoveredRegion : clickedRegion;

  let activeTitle = "";
  let activeColorClass = "";
  let activeDesc = "";
  let activeList: string[] = [];

  if (activeRegion === 'candidate') {
    activeTitle = "Candidate's Extra Competencies";
    activeColorClass = "text-blue-600 bg-blue-50 border-blue-200";
    activeDesc = "Skills this candidate possesses that extend beyond core requirements, offering versatility and cross-functional capacity.";
    activeList = extra;
  } else if (activeRegion === 'overlap') {
    activeTitle = "Matching Core Competencies";
    activeColorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    activeDesc = "Critical qualifications demanded by the job that the candidate has demonstrated with high confidence.";
    activeList = matched;
  } else if (activeRegion === 'job') {
    activeTitle = "Target Skills Gap";
    activeColorClass = "text-amber-700 bg-amber-50 border-amber-200";
    activeDesc = "Requested competencies from your vacancy description not yet identified in this candidate's profile.";
    activeList = missing;
  }

  return (
    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col items-center">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Interactive Alignment Venn</div>
      
      {/* SVG Canvas */}
      <div className="relative w-full max-w-[220px] aspect-[4/3] flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 150">
          <defs>
            <radialGradient id="grad-cand" cx="30%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={activeRegion === 'candidate' ? "0.35" : "0.12"} />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity={activeRegion === 'candidate' ? "0.55" : "0.22"} />
            </radialGradient>
            <radialGradient id="grad-job" cx="70%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={activeRegion === 'job' ? "0.35" : "0.12"} />
              <stop offset="100%" stopColor="#78350f" stopOpacity={activeRegion === 'job' ? "0.55" : "0.22"} />
            </radialGradient>
            <radialGradient id="grad-overlap" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity={activeRegion === 'overlap' ? "0.4" : "0.18"} />
              <stop offset="100%" stopColor="#047857" stopOpacity={activeRegion === 'overlap' ? "0.6" : "0.28"} />
            </radialGradient>
          </defs>

          {/* Left Circle: Candidate extra skills */}
          <circle
            cx="75"
            cy="75"
            r="44"
            fill="url(#grad-cand)"
            stroke="#2563eb"
            strokeWidth={activeRegion === 'candidate' ? "2.5" : "1"}
            strokeDasharray={activeRegion === 'candidate' ? "4 2" : "none"}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredRegion('candidate')}
            onMouseLeave={() => setHoveredRegion('none')}
            onClick={() => setClickedRegion('candidate')}
          />

          {/* Right Circle: Job requirements */}
          <circle
            cx="125"
            cy="75"
            r="44"
            fill="url(#grad-job)"
            stroke="#d97706"
            strokeWidth={activeRegion === 'job' ? "2.5" : "1"}
            strokeDasharray={activeRegion === 'job' ? "4 2" : "none"}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredRegion('job')}
            onMouseLeave={() => setHoveredRegion('none')}
            onClick={() => setClickedRegion('job')}
          />

          {/* Intersection Path */}
          <path
            d="M 100,34.5 A 44 44 0 0 1 100,115.5 A 44 44 0 0 1 100,34.5 Z"
            fill="url(#grad-overlap)"
            stroke="#059669"
            strokeWidth={activeRegion === 'overlap' ? "2.5" : "1.5"}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredRegion('overlap')}
            onMouseLeave={() => setHoveredRegion('none')}
            onClick={() => setClickedRegion('overlap')}
          />

          {/* Labels inside the diagram */}
          <text x="50" y="77" textAnchor="middle" className="text-[9px] font-bold fill-blue-700 pointer-events-none select-none">
            +{extra.length}
          </text>
          <text x="100" y="78" textAnchor="middle" className="text-[11px] font-extrabold fill-emerald-800 pointer-events-none select-none">
            {matched.length}
          </text>
          <text x="150" y="77" textAnchor="middle" className="text-[9px] font-bold fill-amber-700 pointer-events-none select-none">
            -{missing.length}
          </text>
        </svg>
      </div>

      {/* Interactive Region Badges */}
      <div className="flex gap-1.5 mt-2 w-full justify-center text-[10px]">
        <button
          onClick={() => setClickedRegion('candidate')}
          className={`px-2 py-1 rounded transition-all font-medium border ${clickedRegion === 'candidate' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Extra ({extra.length})
        </button>
        <button
          onClick={() => setClickedRegion('overlap')}
          className={`px-2 py-1 rounded transition-all font-medium border ${clickedRegion === 'overlap' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Matched ({matched.length})
        </button>
        <button
          onClick={() => setClickedRegion('job')}
          className={`px-2 py-1 rounded transition-all font-medium border ${clickedRegion === 'job' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Gaps ({missing.length})
        </button>
      </div>

      {/* Dynamic Detail Card */}
      <div className={`mt-3 w-full p-2.5 rounded-lg border text-left text-xs ${activeColorClass}`}>
        <div className="font-semibold">{activeTitle}</div>
        <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">{activeDesc}</p>
        
        {activeList.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {activeList.map((skill, idx) => (
              <span key={idx} className="bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-semibold border border-black/5 shadow-2xs">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[11px] italic mt-1 text-slate-400">None in this quadrant</div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. 6-AXIS RADAR DIAGNOSTIC SPIDER CHART
// ==========================================
interface RadarMetrics {
  hardSkills: number;
  experienceDepth: number;
  systemArchitecture: number;
  problemSolving: number;
  collaboration: number;
  growthPotential: number;
}

interface SkillRadarChartProps {
  metrics?: RadarMetrics;
  candidateName?: string;
}

export function SkillRadarChart({ metrics, candidateName }: SkillRadarChartProps) {
  const data = metrics || {
    hardSkills: 88,
    experienceDepth: 84,
    systemArchitecture: 80,
    problemSolving: 90,
    collaboration: 92,
    growthPotential: 94
  };

  const axes = [
    { key: "hardSkills", label: "Hard Skills", val: data.hardSkills, angle: 0 },
    { key: "experienceDepth", label: "Experience", val: data.experienceDepth, angle: 60 },
    { key: "systemArchitecture", label: "Architecture", val: data.systemArchitecture, angle: 120 },
    { key: "problemSolving", label: "Problem Solving", val: data.problemSolving, angle: 180 },
    { key: "collaboration", label: "Collaboration", val: data.collaboration, angle: 240 },
    { key: "growthPotential", label: "Growth Potential", val: data.growthPotential, angle: 300 }
  ];

  const cx = 110;
  const cy = 105;
  const maxRadius = 70;

  // Convert polar to cartesian
  const getCoords = (val: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (val / 100) * maxRadius;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  };

  const polygonPoints = axes.map(a => {
    const pt = getCoords(a.val, a.angle);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  const levels = [25, 50, 75, 100];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          6-Dimensional Talent Radar
        </span>
        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {candidateName || "Candidate"}
        </span>
      </div>

      <div className="relative w-full max-w-[240px] aspect-[1/1] flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 220 210">
          <defs>
            <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
            </radialGradient>
          </defs>

          {/* Concentric grid rings */}
          {levels.map(level => {
            const pts = axes.map(a => {
              const pt = getCoords(level, a.angle);
              return `${pt.x},${pt.y}`;
            }).join(" ");
            return (
              <polygon
                key={level}
                points={pts}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={level === 100 ? "1.5" : "1"}
                strokeDasharray={level < 100 ? "2 2" : "none"}
              />
            );
          })}

          {/* Axis spoke lines */}
          {axes.map((a, i) => {
            const pt = getCoords(100, a.angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={pt.x}
                y2={pt.y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            );
          })}

          {/* Candidate radar polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radarGrad)"
            stroke="#4f46e5"
            strokeWidth="2.2"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />

          {/* Points & Labels */}
          {axes.map((a, i) => {
            const pt = getCoords(a.val, a.angle);
            const labelPt = getCoords(122, a.angle);
            return (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="3.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x={labelPt.x}
                  y={labelPt.y + 3}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-600 select-none"
                >
                  {a.label} ({a.val})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full mt-2 pt-2 border-t border-slate-100 text-[10px]">
        {axes.map(a => (
          <div key={a.key} className="bg-slate-50 p-1.5 rounded text-center border border-slate-100">
            <div className="text-slate-400 text-[9px] truncate">{a.label}</div>
            <div className="font-bold text-slate-800">{a.val}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. TALENT QUADRANT MATRIX VISUALIZER
// ==========================================
interface TalentQuadrantMatrixProps {
  candidates: Array<{
    id: string;
    name: string;
    score?: number;
    skillsCount?: number;
    predictedRole?: string;
  }>;
  onSelectCandidate?: (id: string) => void;
  selectedId?: string | null;
}

export function TalentQuadrantMatrix({ candidates, onSelectCandidate, selectedId }: TalentQuadrantMatrixProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Talent Potential vs Match Matrix</h4>
          <p className="text-[11px] text-slate-500">Categorizes candidates by qualification depth and role fit</p>
        </div>
        <div className="text-[10px] font-semibold text-slate-400">4-Quadrant AI Mapping</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Q1: Star Performers */}
        <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 min-h-[90px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-emerald-800 text-[11px]">🌟 Ready High Impact</span>
            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">High Fit • High Depth</span>
          </div>
          <div className="space-y-1">
            {candidates.filter(c => (c.score || 0) >= 85).map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCandidate && onSelectCandidate(c.id)}
                className={`w-full text-left px-2 py-1 rounded text-[11px] transition-all flex items-center justify-between ${selectedId === c.id ? 'bg-emerald-600 text-white font-medium shadow-xs' : 'bg-white/80 hover:bg-white text-emerald-900 border border-emerald-200/60'}`}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-bold ml-1">{c.score}%</span>
              </button>
            ))}
            {candidates.filter(c => (c.score || 0) >= 85).length === 0 && (
              <span className="text-[10px] text-slate-400 italic">No candidates in top quadrant</span>
            )}
          </div>
        </div>

        {/* Q2: Growth Potential */}
        <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 min-h-[90px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-blue-800 text-[11px]">🚀 High Growth Potential</span>
            <span className="text-[9px] font-semibold text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">Fast Learner</span>
          </div>
          <div className="space-y-1">
            {candidates.filter(c => (c.score || 0) >= 70 && (c.score || 0) < 85).map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCandidate && onSelectCandidate(c.id)}
                className={`w-full text-left px-2 py-1 rounded text-[11px] transition-all flex items-center justify-between ${selectedId === c.id ? 'bg-blue-600 text-white font-medium shadow-xs' : 'bg-white/80 hover:bg-white text-blue-900 border border-blue-200/60'}`}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-bold ml-1">{c.score}%</span>
              </button>
            ))}
            {candidates.filter(c => (c.score || 0) >= 70 && (c.score || 0) < 85).length === 0 && (
              <span className="text-[10px] text-slate-400 italic">No candidates in this tier</span>
            )}
          </div>
        </div>

        {/* Q3: Specialist Talent */}
        <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-100 min-h-[90px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-purple-800 text-[11px]">🎯 Domain Specialist</span>
            <span className="text-[9px] font-semibold text-purple-600 bg-purple-100/60 px-1.5 py-0.5 rounded">Niche Expert</span>
          </div>
          <div className="space-y-1">
            {candidates.filter(c => (c.score || 0) >= 55 && (c.score || 0) < 70).map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCandidate && onSelectCandidate(c.id)}
                className={`w-full text-left px-2 py-1 rounded text-[11px] transition-all flex items-center justify-between ${selectedId === c.id ? 'bg-purple-600 text-white font-medium shadow-xs' : 'bg-white/80 hover:bg-white text-purple-900 border border-purple-200/60'}`}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-bold ml-1">{c.score}%</span>
              </button>
            ))}
            {candidates.filter(c => (c.score || 0) >= 55 && (c.score || 0) < 70).length === 0 && (
              <span className="text-[10px] text-slate-400 italic">None currently mapped</span>
            )}
          </div>
        </div>

        {/* Q4: Early Trajectory */}
        <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100 min-h-[90px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-amber-800 text-[11px]">🌱 Upskill Candidate</span>
            <span className="text-[9px] font-semibold text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded">Foundational</span>
          </div>
          <div className="space-y-1">
            {candidates.filter(c => (c.score || 0) < 55).map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCandidate && onSelectCandidate(c.id)}
                className={`w-full text-left px-2 py-1 rounded text-[11px] transition-all flex items-center justify-between ${selectedId === c.id ? 'bg-amber-600 text-white font-medium shadow-xs' : 'bg-white/80 hover:bg-white text-amber-900 border border-amber-200/60'}`}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-bold ml-1">{c.score || 45}%</span>
              </button>
            ))}
            {candidates.filter(c => (c.score || 0) < 55).length === 0 && (
              <span className="text-[10px] text-slate-400 italic">No candidates in foundational tier</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CANDIDATE BATTLE COMPARISON OVERLAP
// ==========================================
interface BattleSkillsOverlapProps {
  cand1Name: string;
  cand2Name: string;
  cand1Skills: string[];
  cand2Skills: string[];
  jobSkills: string[];
}

export function BattleSkillsOverlap({
  cand1Name,
  cand2Name,
  cand1Skills,
  cand2Skills,
  jobSkills
}: BattleSkillsOverlapProps) {
  const c1Lower = (cand1Skills || []).map(s => s.toLowerCase());
  const c2Lower = (cand2Skills || []).map(s => s.toLowerCase());

  const sharedInJob = jobSkills.filter(s => c1Lower.includes(s.toLowerCase()) && c2Lower.includes(s.toLowerCase()));
  const onlyC1InJob = jobSkills.filter(s => c1Lower.includes(s.toLowerCase()) && !c2Lower.includes(s.toLowerCase()));
  const onlyC2InJob = jobSkills.filter(s => !c1Lower.includes(s.toLowerCase()) && c2Lower.includes(s.toLowerCase()));
  const neitherInJob = jobSkills.filter(s => !c1Lower.includes(s.toLowerCase()) && !c2Lower.includes(s.toLowerCase()));

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Differential Skill Requirement Matrix
        </div>
        <div className="text-[10px] text-slate-400">
          Comparing against {jobSkills.length} job competencies
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Only Cand 1 */}
        <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-900/60">
          <div className="font-bold text-blue-400 mb-1.5 flex items-center justify-between">
            <span className="truncate">{cand1Name} Advantage</span>
            <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">{onlyC1InJob.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2">Target skills possessed solely by {cand1Name}</p>
          <div className="flex flex-wrap gap-1">
            {onlyC1InJob.map((s, i) => (
              <span key={i} className="bg-blue-900/80 text-blue-200 text-[10px] px-1.5 py-0.5 rounded border border-blue-700/50">
                {s}
              </span>
            ))}
            {onlyC1InJob.length === 0 && <span className="text-[10px] text-slate-500 italic">None</span>}
          </div>
        </div>

        {/* Both Match */}
        <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/60">
          <div className="font-bold text-emerald-400 mb-1.5 flex items-center justify-between">
            <span>Shared Match</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px]">{sharedInJob.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2">Target skills both candidates possess</p>
          <div className="flex flex-wrap gap-1">
            {sharedInJob.map((s, i) => (
              <span key={i} className="bg-emerald-900/80 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded border border-emerald-700/50">
                {s}
              </span>
            ))}
            {sharedInJob.length === 0 && <span className="text-[10px] text-slate-500 italic">None</span>}
          </div>
        </div>

        {/* Only Cand 2 */}
        <div className="bg-purple-950/40 p-3 rounded-lg border border-purple-900/60">
          <div className="font-bold text-purple-400 mb-1.5 flex items-center justify-between">
            <span className="truncate">{cand2Name} Advantage</span>
            <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-[10px]">{onlyC2InJob.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2">Target skills possessed solely by {cand2Name}</p>
          <div className="flex flex-wrap gap-1">
            {onlyC2InJob.map((s, i) => (
              <span key={i} className="bg-purple-900/80 text-purple-200 text-[10px] px-1.5 py-0.5 rounded border border-purple-700/50">
                {s}
              </span>
            ))}
            {onlyC2InJob.length === 0 && <span className="text-[10px] text-slate-500 italic">None</span>}
          </div>
        </div>
      </div>

      {neitherInJob.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Unsatisfied Role Competencies ({neitherInJob.length}):</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {neitherInJob.map((s, i) => (
              <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. 30/60/90-DAY UPSKILLING ROADMAP VISUALIZER
// ==========================================
interface RoadmapVisualizerProps {
  roadmap?: {
    day30: string[];
    day60: string[];
    day90: string[];
    recommendedProjects?: string[];
    certifications?: string[];
  };
  candidateName?: string;
  jobTitle?: string;
}

export function RoadmapTimelineVisualizer({ roadmap, candidateName, jobTitle }: RoadmapVisualizerProps) {
  const [activeStep, setActiveStep] = useState<30 | 60 | 90>(30);

  const defaultRoadmap = {
    day30: [
      "Master core architecture principles and configure local sandbox environment.",
      "Review code quality rubrics and establish automated unit test suites."
    ],
    day60: [
      "Deploy containerized microservices to cloud staging with CI/CD automation.",
      "Benchmark database query performance and implement caching layers."
    ],
    day90: [
      "Architect end-to-end production features aligning with enterprise standards.",
      "Mentor team members and lead sprint technical design reviews."
    ],
    recommendedProjects: [
      "Full-stack distributed processing worker with async messaging",
      "High-throughput API gateway with token-based rate limiting"
    ],
    certifications: [
      "AWS Certified Solutions Architect",
      "Certified Kubernetes Administrator (CKA)"
    ]
  };

  const data = roadmap || defaultRoadmap;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            30-60-90 Day Skill Bridge & Onboarding Plan
          </h4>
          <p className="text-xs text-slate-500">
            Tailored learning acceleration for <strong className="text-slate-700">{candidateName || "Candidate"}</strong> towards <strong className="text-slate-700">{jobTitle || "Target Role"}</strong>
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveStep(30)}
            className={`px-3 py-1 rounded-md transition-all ${activeStep === 30 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Day 30
          </button>
          <button
            onClick={() => setActiveStep(60)}
            className={`px-3 py-1 rounded-md transition-all ${activeStep === 60 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Day 60
          </button>
          <button
            onClick={() => setActiveStep(90)}
            className={`px-3 py-1 rounded-md transition-all ${activeStep === 90 ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Day 90
          </button>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-4">
        <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block animate-pulse"></span>
          Phase {activeStep === 30 ? "1 (Foundations & Quick Wins)" : activeStep === 60 ? "2 (Deep Technical Integration)" : "3 (Autonomy & System Leadership)"}
        </div>
        <ul className="space-y-2">
          {(activeStep === 30 ? data.day30 : activeStep === 60 ? data.day60 : data.day90).map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Projects & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Recommended Portfolio Proofs
          </div>
          <ul className="space-y-1 text-[11px] text-slate-600">
            {(data.recommendedProjects || []).map((proj, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>{proj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            High-Value Certifications
          </div>
          <ul className="space-y-1 text-[11px] text-slate-600">
            {(data.certifications || []).map((cert, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
