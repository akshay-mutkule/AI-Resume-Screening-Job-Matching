import React from "react";
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone,
  FileText
} from "lucide-react";
import { Candidate, JobDescription, MatchReport } from "../types";
import { SkillRadarChart, InteractiveVenn, RoadmapTimelineVisualizer } from "./InteractiveVisuals";

interface TalentDossierModalProps {
  candidate: Candidate;
  job: JobDescription | null;
  matchReport: MatchReport | null;
  onClose: () => void;
}

export function TalentDossierModal({
  candidate,
  job,
  matchReport,
  onClose
}: TalentDossierModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                Executive Candidate Dossier & Evaluation Brief
              </h3>
              <p className="text-[11px] text-slate-400">MatchMind AI Verified Talent Report</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Dossier Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          {/* Candidate Profile Summary Header */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{candidate.name}</h2>
                  {candidate.isShortlisted && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      ★ Shortlisted
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-indigo-600">{candidate.predictedRole}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {candidate.email}</span>
                  {candidate.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {candidate.phone}</span>}
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {candidate.education || "University Degree"}</span>
                </div>
              </div>
            </div>

            {/* Overall Score Badge */}
            {matchReport && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shrink-0 min-w-[140px] shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Match Score</div>
                <div className="text-3xl font-black text-indigo-600 mt-0.5">{matchReport.score}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">{job?.title || "Evaluated Role"}</div>
              </div>
            )}
          </div>

          {/* Visuals & Radar Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillRadarChart
              metrics={matchReport?.radarMetrics || candidate.radarMetrics}
              candidateName={candidate.name}
            />

            {job && matchReport && (
              <InteractiveVenn
                candSkills={candidate.skills}
                jobSkills={job.requiredSkills}
                matched={matchReport.matchedSkills}
                missing={matchReport.missingSkills}
              />
            )}
          </div>

          {/* Executive Rationale & Gap Analysis */}
          {matchReport && (
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Executive Qualification Rationale
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  {matchReport.explanation}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Target Gap & Readiness Analysis
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  {matchReport.gapAnalysis}
                </p>
              </div>
            </div>
          )}

          {/* Structured Interview Question Checklist */}
          {matchReport?.interviewQuestions && matchReport.interviewQuestions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Tailored Interview Question Cheat Sheet
              </h4>
              <div className="space-y-2">
                {matchReport.interviewQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onboarding Roadmap */}
          <RoadmapTimelineVisualizer
            roadmap={matchReport?.upskillingRoadmap}
            candidateName={candidate.name}
            jobTitle={job?.title}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Generated by MatchMind AI Talent Intelligence System</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
}
