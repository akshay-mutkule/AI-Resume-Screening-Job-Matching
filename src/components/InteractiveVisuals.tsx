import React, { useState } from "react";
import { BarChart3 } from "lucide-react";

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

  // Find extra skills the candidate has that are not in the job requirements
  const extra = candSkills.filter(
    s => !matched.some(m => m.toLowerCase() === s.toLowerCase())
  );

  const activeRegion = hoveredRegion !== 'none' ? hoveredRegion : clickedRegion;

  let activeTitle = "";
  let activeColorClass = "";
  let activeDesc = "";
  let activeList: string[] = [];

  if (activeRegion === 'candidate') {
    activeTitle = "Candidate's Extra Capabilities";
    activeColorClass = "text-blue-600 bg-blue-50 border-blue-200";
    activeDesc = "Extra skills this applicant possesses that aren't strictly required for this specific vacancy, but could bring additional versatility and value to your team.";
    activeList = extra;
  } else if (activeRegion === 'overlap') {
    activeTitle = "Matching Core Competencies";
    activeColorClass = "text-green-700 bg-green-50 border-green-200";
    activeDesc = "Critical qualifications requested by the job description that the candidate successfully matches.";
    activeList = matched;
  } else if (activeRegion === 'job') {
    activeTitle = "Skills Gap to Bridge";
    activeColorClass = "text-amber-700 bg-amber-50 border-amber-200";
    activeDesc = "Required qualifications from your job opening description that were not detected in the applicant's resume.";
    activeList = missing;
  }

  return (
    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col items-center">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Interactive Alignment Venn Diagram</div>
      
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
            d="M 100,34 A 44,44 0 0,1 120,75 A 44,44 0 0,1 100,116 A 44,44 0 0,1 80,75 A 44,44 0 0,1 100,34 Z"
            fill="url(#grad-overlap)"
            stroke="#059669"
            strokeWidth={activeRegion === 'overlap' ? "2.5" : "1"}
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredRegion('overlap')}
            onMouseLeave={() => setHoveredRegion('none')}
            onClick={() => setClickedRegion('overlap')}
          />

          {/* Text Labels inside SVG */}
          <text x="45" y="77" textAnchor="middle" fill="#1e3a8a" className="text-[9px] font-bold select-none pointer-events-none">Applicant</text>
          <text x="155" y="77" textAnchor="middle" fill="#78350f" className="text-[9px] font-bold select-none pointer-events-none">Vacancy</text>
          <text x="100" y="77" textAnchor="middle" fill="#047857" className="text-[8px] font-extrabold select-none pointer-events-none">Overlap</text>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 text-[8.5px] font-bold text-slate-400 pointer-events-none">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Extra</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Matched</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Gaps</span>
        </div>
      </div>

      {/* Detail description cards */}
      <div className={`w-full mt-4 p-3 border rounded-lg transition-all duration-300 ${activeColorClass}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase">{activeTitle}</span>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/60">
            {activeList.length} skill{activeList.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-[10px] opacity-80 mt-1 leading-normal">{activeDesc}</p>
        
        {activeList.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {activeList.map((skill, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-white/90 text-slate-800 border border-slate-200/50 rounded text-[9px] font-mono font-bold uppercase">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[9.5px] italic opacity-60 mt-2">No skills in this category.</div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. INTERACTIVE TALENT SUPPLY-DEMAND QUADRANT MATRIX
// ==========================================
interface TalentQuadrantMatrixProps {
  topRequested: any[];
  topSupplied: any[];
  supplyDemandGap: any[];
}

export function TalentQuadrantMatrix({ topRequested, topSupplied, supplyDemandGap }: TalentQuadrantMatrixProps) {
  const [hoveredSkill, setHoveredSkill] = useState<any | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<'all' | 'shortage' | 'sweetspot' | 'surplus' | 'niche'>('all');

  // Compile all unique skills
  const allSkillsSet = new Set<string>();
  topRequested.forEach(x => allSkillsSet.add(x.skill));
  topSupplied.forEach(x => allSkillsSet.add(x.skill));
  supplyDemandGap.forEach(x => allSkillsSet.add(x.skill));

  // Map each skill to coordinates based on demand (Y) and supply (X) percentages
  const points = Array.from(allSkillsSet).map(name => {
    const req = topRequested.find(r => r.skill.toLowerCase() === name.toLowerCase());
    const sup = topSupplied.find(s => s.skill.toLowerCase() === name.toLowerCase());
    
    const demandVal = req ? req.demandPercentage : 0;
    const supplyVal = sup ? sup.supplyPercentage : 0;
    
    // Categorize into quadrants
    let quadrant: 'shortage' | 'sweetspot' | 'surplus' | 'niche' = 'niche';
    if (demandVal >= 50 && supplyVal < 50) quadrant = 'shortage';
    else if (demandVal >= 50 && supplyVal >= 50) quadrant = 'sweetspot';
    else if (demandVal < 50 && supplyVal >= 50) quadrant = 'surplus';
    
    return {
      skill: name,
      demand: demandVal,
      supply: supplyVal,
      quadrant,
      demandCount: req ? req.demandCount : 0,
      supplyCount: sup ? sup.supplyCount : 0,
    };
  });

  const filteredPoints = selectedQuadrant === 'all' 
    ? points 
    : points.filter(p => p.quadrant === selectedQuadrant);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
        <div>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Labor Economics</span>
          <h3 className="font-bold text-sm text-slate-900 mt-1">Interactive Talent Supply-Demand Quadrant Matrix</h3>
          <p className="text-[11px] text-slate-500">Visual mapping of candidate skill supply (X) vs. vacancy demand (Y). Hover over nodes for strategic insights.</p>
        </div>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shrink-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'shortage', label: '⚠️ Shortage' },
            { id: 'sweetspot', label: '✓ Sweetspot' },
            { id: 'surplus', label: '🤝 Surplus' },
            { id: 'niche', label: '• Niche' }
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQuadrant(q.id as any)}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                selectedQuadrant === q.id 
                  ? "bg-blue-600 text-white shadow-xs" 
                  : "text-slate-600 hover:bg-slate-200/50"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Interactive Scatter Plot SVG */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[380px] aspect-square bg-slate-50/50 rounded-xl border border-slate-200 p-2 overflow-visible">
            
            {/* Quadrant backgrounds */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-15 pointer-events-none">
              <div className="border-r border-b border-dashed border-red-500 bg-red-50/20 flex items-start p-3">
                <span className="text-[8px] font-black text-red-700 uppercase tracking-wider">Shortages (High demand, low supply)</span>
              </div>
              <div className="border-b border-dashed border-green-500 bg-green-50/20 flex items-start justify-end p-3">
                <span className="text-[8px] font-black text-green-700 uppercase tracking-wider">Sweetspots (High demand & supply)</span>
              </div>
              <div className="border-r border-dashed border-slate-400 bg-slate-50/20 flex items-end p-3">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Niche (Low demand & supply)</span>
              </div>
              <div className="bg-blue-50/20 flex items-end justify-end p-3">
                <span className="text-[8px] font-black text-blue-700 uppercase tracking-wider">Surpluses (Low demand, high supply)</span>
              </div>
            </div>

            {/* SVG Plot */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
              <line x1="100" y1="0" x2="100" y2="200" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="200" y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              
              {filteredPoints.map((p, idx) => {
                const cx = 20 + (p.supply / 100) * 160;
                const cy = 180 - (p.demand / 100) * 160;
                
                const isHovered = hoveredSkill?.skill === p.skill;
                
                let dotColor = "#475569";
                let dotRing = "#94a3b8";
                if (p.quadrant === 'shortage') {
                  dotColor = "#dc2626";
                  dotRing = "#fca5a5";
                } else if (p.quadrant === 'sweetspot') {
                  dotColor = "#16a34a";
                  dotRing = "#86efac";
                } else if (p.quadrant === 'surplus') {
                  dotColor = "#2563eb";
                  dotRing = "#93c5fd";
                }

                return (
                  <g 
                    key={idx}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredSkill(p)}
                    onMouseLeave={() => setHoveredSkill(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? "11" : "5"}
                      fill={dotRing}
                      opacity={isHovered ? "0.6" : "0.2"}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? "5.5" : "3.5"}
                      fill={dotColor}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="transition-all duration-300"
                    />
                    {(p.demand >= 15 || p.supply >= 15 || isHovered) && (
                      <text
                        x={cx}
                        y={cy - 7}
                        textAnchor="middle"
                        fill="#0f172a"
                        className={`text-[7px] font-mono font-bold select-none pointer-events-none transition-all duration-300 ${
                          isHovered ? "text-[8px] font-black fill-blue-900" : ""
                        }`}
                      >
                        {p.skill}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Axes Labels */}
            <div className="absolute left-2 bottom-1.5 text-[7px] font-bold text-slate-400 pointer-events-none uppercase">
              ← Scarce Pool
            </div>
            <div className="absolute right-2 bottom-1.5 text-[7px] font-bold text-slate-400 pointer-events-none uppercase">
              Plentiful Pool →
            </div>
          </div>
        </div>

        {/* Side panel description */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex-1 flex flex-col justify-between min-h-[160px]">
            {hoveredSkill ? (
              <div className="animate-fadeIn flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] font-black uppercase font-mono tracking-wider">
                      {hoveredSkill.skill}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      hoveredSkill.quadrant === 'shortage' ? "bg-red-100 text-red-800" :
                      hoveredSkill.quadrant === 'sweetspot' ? "bg-green-100 text-green-800" :
                      hoveredSkill.quadrant === 'surplus' ? "bg-blue-100 text-blue-800" :
                      "bg-slate-100 text-slate-800"
                    }`}>
                      {hoveredSkill.quadrant === 'shortage' ? "Shortage" :
                       hoveredSkill.quadrant === 'sweetspot' ? "Sweetspot" :
                       hoveredSkill.quadrant === 'surplus' ? "Surplus" :
                       "Niche"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-semibold text-slate-600">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Demand in Openings</div>
                      <p className="text-sm font-black text-slate-800">{hoveredSkill.demand}% <span className="text-[10px] text-slate-400">({hoveredSkill.demandCount} jobs)</span></p>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Supply in Candidates</div>
                      <p className="text-sm font-black text-slate-800">{hoveredSkill.supply}% <span className="text-[10px] text-slate-400">({hoveredSkill.supplyCount} profiles)</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-600 leading-normal">
                  <strong>Advice:</strong>{' '}
                  {hoveredSkill.quadrant === 'shortage' && `Vulnerability. Finding talent with "${hoveredSkill.skill}" is exceptionally challenging. Consider targeted headhunting or internal training.`}
                  {hoveredSkill.quadrant === 'sweetspot' && `Balanced. "${hoveredSkill.skill}" is both heavily sought after and readily available in our talent pool.`}
                  {hoveredSkill.quadrant === 'surplus' && `Oversupply. We have many candidates with "${hoveredSkill.skill}" but fewer active vacancies. High negotiating power.`}
                  {hoveredSkill.quadrant === 'niche' && `Specialized. Quiet, specialized demand matches specialized supply. Monitor for future changes.`}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center py-6">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                <h4 className="text-[11px] font-bold text-slate-700">Interactive Quadrant Navigator</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-relaxed">
                  Hover over any node on the plot to view detailed supply-demand metrics and actionable strategic advice.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-[10px] text-blue-800 leading-normal">
            <strong>How to read:</strong> Higher nodes mean more employer demand. Nodes further right mean abundant candidate supply.
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. BATTLE MODE OVERLAP SKILLS GRID
// ==========================================
interface BattleSkillsOverlapProps {
  cand1Name: string;
  cand2Name: string;
  skillsA: string[];
  skillsB: string[];
  requiredSkills: string[];
}

export function BattleSkillsOverlap({ cand1Name, cand2Name, skillsA, skillsB, requiredSkills }: BattleSkillsOverlapProps) {
  const mutualSkills = skillsA.filter(s => skillsB.some(b => b.toLowerCase() === s.toLowerCase()));
  const uniqueToA = skillsA.filter(s => !mutualSkills.some(m => m.toLowerCase() === s.toLowerCase()));
  const uniqueToB = skillsB.filter(s => !mutualSkills.some(m => m.toLowerCase() === s.toLowerCase()));
  
  const reqLower = requiredSkills.map(s => s.toLowerCase());
  const mutualRequired = mutualSkills.filter(s => reqLower.includes(s.toLowerCase()));
  const aRequired = uniqueToA.filter(s => reqLower.includes(s.toLowerCase()));
  const bRequired = uniqueToB.filter(s => reqLower.includes(s.toLowerCase()));
  
  const bothMissingRequired = requiredSkills.filter(s => 
    !skillsA.some(a => a.toLowerCase() === s.toLowerCase()) &&
    !skillsB.some(b => b.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="border-b border-slate-100 pb-2 mb-4">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
          ⚔️ Side-by-Side Skills Overlap Matrix
        </h3>
        <p className="text-[11px] text-slate-500">Comparing technical skillsets and how they map against the job's vacancy requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Candidate A Exclusive */}
        <div className="bg-blue-50/40 border border-blue-200/60 p-4 rounded-xl flex flex-col">
          <span className="text-[9px] font-black text-blue-700 uppercase tracking-wider mb-2">Unique to {cand1Name}</span>
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-[8.5px] font-extrabold text-blue-600 uppercase">Core Job Requirements:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {aRequired.map((s, idx) => (
                  <span key={idx} className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                    {s}
                  </span>
                ))}
                {aRequired.length === 0 && (
                  <span className="text-[9px] text-slate-400 italic block mt-1">No exclusive matches.</span>
                )}
              </div>
            </div>
            
            <div className="pt-2.5 border-t border-blue-100">
              <div className="text-[8.5px] font-extrabold text-slate-400 uppercase">Additional Capabilities:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {uniqueToA.filter(s => !aRequired.includes(s)).map((s, idx) => (
                  <span key={idx} className="bg-white border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mutual/Overlapping Skills */}
        <div className="bg-emerald-50/40 border border-emerald-200/60 p-4 rounded-xl flex flex-col">
          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider mb-2">Mutual Capabilities (Shared)</span>
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-[8.5px] font-extrabold text-emerald-600 uppercase">Overlapping Job Matches:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {mutualRequired.map((s, idx) => (
                  <span key={idx} className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                    {s}
                  </span>
                ))}
                {mutualRequired.length === 0 && (
                  <span className="text-[9px] text-slate-400 italic block mt-1">No shared matches.</span>
                )}
              </div>
            </div>
            
            <div className="pt-2.5 border-t border-emerald-100">
              <div className="text-[8.5px] font-extrabold text-slate-400 uppercase">Other Shared Skills:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {mutualSkills.filter(s => !mutualRequired.includes(s)).map((s, idx) => (
                  <span key={idx} className="bg-white border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidate B Exclusive */}
        <div className="bg-indigo-50/40 border border-indigo-200/60 p-4 rounded-xl flex flex-col">
          <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider mb-2">Unique to {cand2Name}</span>
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-[8.5px] font-extrabold text-indigo-600 uppercase">Core Job Requirements:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {bRequired.map((s, idx) => (
                  <span key={idx} className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                    {s}
                  </span>
                ))}
                {bRequired.length === 0 && (
                  <span className="text-[9px] text-slate-400 italic block mt-1">No exclusive matches.</span>
                )}
              </div>
            </div>
            
            <div className="pt-2.5 border-t border-indigo-100">
              <div className="text-[8.5px] font-extrabold text-slate-400 uppercase">Additional Capabilities:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {uniqueToB.filter(s => !bRequired.includes(s)).map((s, idx) => (
                  <span key={idx} className="bg-white border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {bothMissingRequired.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] rounded-lg flex items-center justify-between">
          <span>
            <strong>Skills Void:</strong> Neither candidate features{' '}
            <strong>{bothMissingRequired.join(', ')}</strong> (which is requested by the job vacancy).
          </span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-extrabold rounded-full text-[9px]">
            {bothMissingRequired.length} skill gap
          </span>
        </div>
      )}
    </div>
  );
}
