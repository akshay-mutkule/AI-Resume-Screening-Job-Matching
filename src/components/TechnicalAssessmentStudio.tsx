import React, { useState } from "react";
import { 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  Terminal, 
  AlertTriangle, 
  Award,
  Layers,
  Play
} from "lucide-react";
import { Candidate, JobDescription, TechnicalChallengeResult } from "../types";

interface TechnicalAssessmentStudioProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedCandidateId: string | null;
  selectedJobId: string | null;
  onSelectCandidate: (id: string) => void;
  onSelectJob: (id: string) => void;
}

export function TechnicalAssessmentStudio({
  candidates,
  jobs,
  selectedCandidateId,
  selectedJobId,
  onSelectCandidate,
  onSelectJob
}: TechnicalAssessmentStudioProps) {
  const [difficulty, setDifficulty] = useState<"Medium" | "Hard" | "Staff / Expert">("Hard");
  const [language, setLanguage] = useState<"python" | "typescript">("python");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [challenge, setChallenge] = useState<TechnicalChallengeResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const generateChallenge = async () => {
    if (!activeCandidate || !activeJob) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/technical-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeCandidate.id,
          jobId: activeJob.id,
          difficulty,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (!challenge) return;
    navigator.clipboard.writeText(challenge.starterCode.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
                Adaptive Technical Assessment
              </span>
              <span className="text-xs text-slate-400">Targeted Gap & Production Coding Generator</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              AI Technical Assessment & Code Challenge Studio
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Synthesize tailored algorithmic and system challenges specifically targeting candidate competency gaps with starter code, unit test cases, and rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateChallenge}
              disabled={isLoading}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Synthesizing Assessment..." : "Generate Challenge"}</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Candidate</label>
            <select
              value={activeCandidate?.id || ""}
              onChange={(e) => onSelectCandidate(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-violet-500"
            >
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.predictedRole})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Vacancy</label>
            <select
              value={activeJob?.id || ""}
              onChange={(e) => onSelectJob(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-violet-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-violet-500"
            >
              <option value="Medium">Medium (L4 / Mid-Level)</option>
              <option value="Hard">Hard (L5 / Senior)</option>
              <option value="Staff / Expert">Staff / Principal (L6+ Architecture)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Implementation Language</label>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setLanguage("python")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  language === "python" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setLanguage("typescript")}
                className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
                  language === "typescript" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                TypeScript
              </button>
            </div>
          </div>
        </div>
      </div>

      {challenge ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Problem & Starter Code */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" />
                    Targeted Assessment Scenario
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{challenge.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-violet-50 text-violet-700 border border-violet-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {challenge.timeLimitMinutes} Mins
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {challenge.difficulty}
                  </span>
                </div>
              </div>

              {/* Real World Scenario */}
              <div className="p-3.5 bg-violet-50/60 rounded-xl border border-violet-100 text-xs text-violet-950">
                <span className="font-bold block mb-1">🏢 Production Context:</span>
                <p className="leading-relaxed text-[11px]">{challenge.realWorldScenario}</p>
              </div>

              {/* Problem Statement */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Problem Specification</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-sans">
                  {challenge.problemStatement}
                </p>
              </div>

              {/* Explicit Constraints */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">Technical Constraints</h4>
                <ul className="space-y-1.5">
                  {challenge.constraints.map((c, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Starter Code Workspace */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-300">
                    solution.{challenge.starterCode.language === "python" ? "py" : "ts"}
                  </span>
                  <button
                    onClick={copyCode}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? "Copied" : "Copy Template"}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono leading-relaxed overflow-x-auto max-h-72">
                  {challenge.starterCode.code}
                </pre>
              </div>
            </div>
          </div>

          {/* Right Column: Test Cases & Evaluation Rubric */}
          <div className="space-y-5">
            {/* Targeted Skill Gaps */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Evaluating Candidate Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {challenge.targetedSkillGaps.map((skill, i) => (
                  <span key={i} className="bg-violet-50 text-violet-800 border border-violet-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Automated Test Verification Cases
              </h4>
              <div className="space-y-2.5">
                {challenge.testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Test Case #{idx + 1}</span>
                      <span className="text-emerald-700 font-bold">Passing Criteria</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200/60 truncate">
                      <strong>Input:</strong> {tc.input}
                    </div>
                    <div className="font-mono text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-200/60">
                      <strong>Expected:</strong> {tc.expectedOutput}
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">{tc.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rubric Matrix */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-violet-600" />
                Engineering Assessment Rubric
              </h4>
              <div className="space-y-2">
                {challenge.rubric.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{r.category}</span>
                      <span className="text-violet-600 font-extrabold">{r.weight}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{r.criteria}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Code2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Synthesize Custom Technical Assessment</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Select a candidate and vacancy above, then click <strong>Generate Challenge</strong> to automatically formulate a tailored coding scenario evaluating targeted competency gaps.
          </p>
          <button
            onClick={generateChallenge}
            disabled={isLoading}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Assessment Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
