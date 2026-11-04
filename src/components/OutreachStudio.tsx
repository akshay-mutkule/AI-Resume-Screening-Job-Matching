import React, { useState } from "react";
import { 
  Send, 
  Sparkles, 
  Mail, 
  Linkedin, 
  Copy, 
  Check, 
  ExternalLink, 
  UserCheck, 
  Clock, 
  MessageSquare, 
  ArrowRight,
  Flame,
  ShieldCheck,
  Briefcase,
  Layers
} from "lucide-react";
import { Candidate, JobDescription, OutreachSequence, OutreachTouchpoint } from "../types";

interface OutreachStudioProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedCandidateId: string | null;
  selectedJobId: string | null;
  onSelectCandidate: (id: string) => void;
  onSelectJob: (id: string) => void;
}

export function OutreachStudio({
  candidates,
  jobs,
  selectedCandidateId,
  selectedJobId,
  onSelectCandidate,
  onSelectJob
}: OutreachStudioProps) {
  const [tone, setTone] = useState<"Founder-to-Founder" | "Engineering Leader" | "Executive" | "Growth & Culture">("Engineering Leader");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sequence, setSequence] = useState<OutreachSequence | null>(null);
  const [activeTouchpointId, setActiveTouchpointId] = useState<string>("tp-1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const generateOutreach = async () => {
    if (!activeCandidate) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeCandidate.id,
          jobId: activeJob?.id,
          tone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSequence(data);
        if (data.touchpoints?.length > 0) {
          setActiveTouchpointId(data.touchpoints[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeTouchpoint = sequence?.touchpoints.find(t => t.id === activeTouchpointId) || sequence?.touchpoints[0];

  const getMailtoUrl = (tp: OutreachTouchpoint) => {
    if (!sequence) return "#";
    const subject = encodeURIComponent(tp.subject);
    const body = encodeURIComponent(tp.body);
    return `mailto:${sequence.candidateEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                Hyper-Personalized Outreach Engine
              </span>
              <span className="text-xs text-slate-400">80%+ Response Rate Sequencing</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              AI Candidate Outreach & Multi-Touch Sequencer
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Eliminate boilerplate recruiter spam. Generate tailor-made, high-conversion cold outreach referencing candidates' verified achievements, architectural depth, and specific vacancy challenges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateOutreach}
              disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Drafting Sequences..." : "Generate Outreach"}</span>
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
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Outreach Tone & Persona</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="Engineering Leader">Engineering Leader (High Technical Depth)</option>
              <option value="Founder-to-Founder">Founder-to-Founder (Vision & Equity)</option>
              <option value="Executive">Executive / VP Talent (Strategic Ownership)</option>
              <option value="Growth & Culture">Growth & Culture (Mission & Impact)</option>
            </select>
          </div>
        </div>
      </div>

      {sequence ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sequence Timeline & Touchpoints (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Sequence Blueprint</span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Multi-Touch Funnel</h3>
                <p className="text-xs text-slate-500 mt-1">4 calibrated touches spaced to optimize response conversion.</p>
              </div>

              {/* Touchpoint Selector Cards */}
              <div className="space-y-2">
                {sequence.touchpoints.map((tp, idx) => {
                  const isActive = tp.id === activeTouchpoint?.id;
                  const isLinkedin = tp.channel === "LinkedIn";
                  return (
                    <button
                      key={tp.id}
                      onClick={() => setActiveTouchpointId(tp.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isActive 
                          ? "bg-indigo-50/80 border-indigo-400 shadow-xs" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200/80"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isLinkedin 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {isLinkedin ? <Linkedin className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tp.timing}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLinkedin ? "bg-blue-100 text-blue-800" : "bg-indigo-100 text-indigo-800"
                          }`}>
                            {tp.channel}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{tp.subject}</h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{tp.callToAction}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Referenced Candidate Highlights */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Referenced Technical Hooks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sequence.keyStrengthsReferenced.map((skill, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Message Inspector & Actions (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {activeTouchpoint && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        {activeTouchpoint.timing} • {activeTouchpoint.channel}
                      </span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs text-slate-600 font-medium">To: {sequence.candidateName} &lt;{sequence.candidateEmail}&gt;</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{activeTouchpoint.subject}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(activeTouchpoint.body, activeTouchpoint.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                    >
                      {copiedId === activeTouchpoint.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Body</span>
                        </>
                      )}
                    </button>

                    {activeTouchpoint.channel !== "LinkedIn" && (
                      <a
                        href={getMailtoUrl(activeTouchpoint)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Email</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Personalized Hook Highlight */}
                <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-100 text-xs text-amber-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Algorithmic Personalization Hook: </span>
                    <span>{activeTouchpoint.personalizedHook}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-6">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
                    {activeTouchpoint.body}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Call to Action:</span>
                      <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-md">
                        {activeTouchpoint.callToAction}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Tone: <strong className="text-indigo-600">{sequence.tone}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Send className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Formulate High-Conversion Outreach Sequence</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Select a candidate and vacancy, pick your tone persona, and synthesize tailored multi-channel sequences ready to copy or open directly in your mail client.
          </p>
          <button
            onClick={generateOutreach}
            disabled={isLoading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Draft Sequences Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
