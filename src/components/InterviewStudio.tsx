import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Timer, 
  Play, 
  CheckCircle2,
  ChevronRight,
  BarChart2,
  Square
} from "lucide-react";
import { Candidate, JobDescription, InterviewMessage } from "../types";

interface InterviewStudioProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedCandidateId: string | null;
  selectedJobId: string | null;
  onSelectCandidate: (id: string) => void;
  onSelectJob: (id: string) => void;
}

export function InterviewStudio({
  candidates,
  jobs,
  selectedCandidateId,
  selectedJobId,
  onSelectCandidate,
  onSelectJob
}: InterviewStudioProps) {
  const [focusArea, setFocusArea] = useState<string>("System Architecture & Technical Depth");
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [overallScores, setOverallScores] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Audio / Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState<boolean>(true);

  // Voice Recognition (Speech-to-Text) state
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Timed Interview Countdown (90 seconds per answer)
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Speech Synthesis Helper
  const speakQuestion = (text: string) => {
    if (!("speechSynthesis" in window) || !autoVoiceEnabled) return;
    window.speechSynthesis.cancel();

    // Remove markdown symbols and emojis for cleaner speech
    const cleanText = text.replace(/[*_#`~🎉🌟💡✓•]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel")));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Web Speech Recognition (Mic to Text)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setCurrentAnswer(transcript.trim());
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    let timer: any = null;
    if (timerActive && timeLeft > 0 && !isCompleted && !isLoading) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft, isCompleted, isLoading]);

  const startInterview = async () => {
    if (!activeCandidate || !activeJob) return;
    stopSpeaking();
    setIsLoading(true);
    setIsSessionActive(true);
    setIsCompleted(false);
    setRoundNumber(1);
    setOverallScores([]);
    setMessages([]);
    setTimeLeft(90);
    setTimerActive(true);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeCandidate.id,
          jobId: activeJob.id,
          focusArea
        })
      });

      if (res.ok) {
        const data = await res.json();
        const initialMsg: InterviewMessage = {
          role: "interviewer",
          text: data.question,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMsg]);
        speakQuestion(data.question);
      }
    } catch (err) {
      console.error(err);
      const fallbackText = `Welcome ${activeCandidate.name}! Could you detail how your experience with ${activeCandidate.skills.slice(0, 3).join(", ")} equips you for the ${activeJob.title} position?`;
      setMessages([
        {
          role: "interviewer",
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakQuestion(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentAnswer.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const answerText = currentAnswer.trim();
    setCurrentAnswer("");
    setTimerActive(false);

    const lastQuestion = messages.filter(m => m.role === "interviewer").slice(-1)[0]?.text || "Tell us about your background.";

    const updatedMessages: InterviewMessage[] = [
      ...messages,
      {
        role: "candidate",
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: activeCandidate.id,
          jobId: activeJob.id,
          previousQuestion: lastQuestion,
          candidateAnswer: answerText,
          roundNumber
        })
      });

      if (res.ok) {
        const result = await res.json();
        setOverallScores(prev => [...prev, result.score || 85]);

        const nextRound = roundNumber + 1;
        setRoundNumber(nextRound);
        setTimeLeft(90);

        setMessages(prev => {
          const lastIdx = prev.length - 1;
          const cloned = [...prev];
          cloned[lastIdx] = {
            ...cloned[lastIdx],
            feedback: {
              score: result.score,
              critique: result.critique,
              suggestedAnswer: result.suggestedAnswer,
              strengths: result.strengths || []
            }
          };

          if (result.interviewComplete || nextRound > 4) {
            setIsCompleted(true);
            const outroText = `🎉 Thank you, ${activeCandidate.name}! That concludes our 4-round technical evaluation for ${activeJob.title}. Check the diagnostic debrief card below for your comprehensive performance breakdown!`;
            cloned.push({
              role: "interviewer",
              text: outroText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            speakQuestion(outroText);
          } else {
            cloned.push({
              role: "interviewer",
              text: result.nextQuestion,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            speakQuestion(result.nextQuestion);
            setTimerActive(true);
          }

          return cloned;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const avgScore = overallScores.length > 0
    ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Speech & Audio AI Simulator
              </span>
              <span className="text-xs text-slate-400">Interactive Technical & Behavioral Studio</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">
              AI Technical Interview & Voice Practice Studio
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl">
              Conduct high-fidelity technical mock interviews with realistic voice read-aloud, microphone voice answers, live timer, and real-time rubric scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Session Round</div>
              <div className="text-xl font-extrabold text-white">{isSessionActive ? `${Math.min(4, roundNumber)} / 4` : "Ready"}</div>
            </div>
            {overallScores.length > 0 && (
              <div className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-500/30 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Avg Rubric Score</div>
                <div className="text-xl font-extrabold text-emerald-300">{avgScore}/100</div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Target Candidate</label>
            <select
              value={activeCandidate?.id || ""}
              onChange={(e) => onSelectCandidate(e.target.value)}
              className="w-full bg-slate-800/90 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
              disabled={isSessionActive && !isCompleted}
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
              className="w-full bg-slate-800/90 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
              disabled={isSessionActive && !isCompleted}
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Evaluation Focus</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full bg-slate-800/90 text-white text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
              disabled={isSessionActive && !isCompleted}
            >
              <option value="System Architecture & Technical Depth">System Architecture & Technical Depth</option>
              <option value="Coding Algorithms & Performance Optimization">Coding Algorithms & Performance</option>
              <option value="Behavioral Leadership & Cross-Team Collaboration">Behavioral & Leadership</option>
              <option value="Rapid Problem Solving & Edge-Case Handling">Rapid Problem Solving & Edge Cases</option>
            </select>
          </div>
        </div>

        {/* Start / Voice Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <button
              onClick={() => {
                const next = !autoVoiceEnabled;
                setAutoVoiceEnabled(next);
                if (!next) stopSpeaking();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                autoVoiceEnabled ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {autoVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{autoVoiceEnabled ? "AI Voice Speech: ON" : "AI Voice Speech: Muted"}</span>
            </button>

            {isSpeaking && (
              <div className="flex items-center gap-1.5 text-indigo-300">
                <span className="w-1.5 h-3 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-4 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <button
                  onClick={stopSpeaking}
                  className="ml-1 text-[10px] text-slate-400 hover:text-white underline"
                >
                  Stop Audio
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSessionActive && (
              <button
                onClick={startInterview}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restart Session
              </button>
            )}
            {!isSessionActive && (
              <button
                onClick={startInterview}
                disabled={isLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isLoading ? "Preparing Session..." : "Launch Mock Interview"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat / Interaction Workspace */}
      {isSessionActive ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Messages Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[640px]">
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs relative">
                  AI
                  {isSpeaking && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Lead Technical Interviewer
                    {isSpeaking && (
                      <span className="text-[10px] text-indigo-600 font-normal italic flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-pulse" /> Speaking...
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-500">Evaluating for {activeJob?.title}</p>
                </div>
              </div>

              {/* Timer & Round Pill */}
              <div className="flex items-center gap-2">
                {timerActive && (
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                    timeLeft <= 20 ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <Timer className="w-3 h-3" />
                    {timeLeft}s
                  </span>
                )}
                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  Round {Math.min(4, roundNumber)} of 4
                </span>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'interviewer' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${msg.role === 'candidate' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'candidate'
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                    }`}>
                      <div className="font-semibold text-[10px] opacity-70 mb-1 flex items-center justify-between gap-4">
                        <span>{msg.role === 'candidate' ? activeCandidate.name : 'AI Interviewer'}</span>
                        <div className="flex items-center gap-2">
                          {msg.role === 'interviewer' && (
                            <button
                              onClick={() => speakQuestion(msg.text)}
                              className="opacity-75 hover:opacity-100"
                              title="Listen to question"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Feedback Card attached to Candidate Answer */}
                    {msg.feedback && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                          <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px]">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            Rubric Evaluation
                          </span>
                          <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                            Score: {msg.feedback.score}/100
                          </span>
                        </div>

                        <div>
                          <span className="font-bold text-[10px] uppercase text-emerald-800 tracking-wider block mb-0.5">Constructive Critique</span>
                          <p className="text-[11px] text-slate-700 leading-relaxed">{msg.feedback.critique}</p>
                        </div>

                        {msg.feedback.strengths && msg.feedback.strengths.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {msg.feedback.strengths.map((s, i) => (
                              <span key={i} className="bg-emerald-100/90 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200/50 mt-1">
                          <span className="font-bold text-[10px] uppercase text-indigo-700 tracking-wider block mb-0.5">🌟 Exemplary Model Answer Benchmark</span>
                          <p className="text-[11px] text-slate-600 italic leading-relaxed">{msg.feedback.suggestedAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'candidate' && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2 border border-slate-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span>AI Interviewer is analyzing response against rubric...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar with Voice Mic & Text Submission */}
            {!isCompleted ? (
              <form onSubmit={submitAnswer} className="p-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitAnswer();
                        }
                      }}
                      placeholder={`Type or click the microphone to speak ${activeCandidate.name}'s response...`}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 pr-10 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none shadow-2xs"
                      disabled={isLoading}
                    />

                    {/* Speech Recognition Mic Button inside input */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute right-2.5 top-2.5 p-1.5 rounded-lg transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                      title={isListening ? "Stop listening" : "Speak answer with microphone"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!currentAnswer.trim() || isLoading}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-rose-600 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Microphone listening... Speak clearly into your mic.</span>
                  </div>
                )}
              </form>
            ) : (
              <div className="p-4 border-t border-emerald-100 bg-emerald-50 rounded-b-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Interview Session Concluded! Overall Rubric Score: {avgScore}%</span>
                </div>
                <button
                  onClick={startInterview}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-xs"
                >
                  Start New Session
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Diagnostics & Round Breakdown */}
          <div className="space-y-4">
            {/* Candidate Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-sm">
                  {activeCandidate.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{activeCandidate.name}</h4>
                  <p className="text-[10px] text-slate-500">{activeCandidate.predictedRole}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Education</span>
                  <span className="font-semibold text-slate-700 text-right truncate max-w-[160px]">{activeCandidate.education || "University Graduate"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verified Skills</span>
                  <span className="font-semibold text-slate-700">{activeCandidate.skills.length} core competencies</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Target Role</span>
                  <span className="font-semibold text-indigo-600 text-right">{activeJob.title}</span>
                </div>
              </div>
            </div>

            {/* Live Score Progress */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                4-Round Rubric Progression
              </h4>

              <div className="space-y-2.5">
                {[1, 2, 3, 4].map(round => {
                  const score = overallScores[round - 1];
                  const isCurrent = roundNumber === round && !isCompleted;
                  return (
                    <div key={round} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          score ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {round}
                        </span>
                        <span className={`font-medium ${isCurrent ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>
                          Round {round}: {round === 1 ? "Architecture" : round === 2 ? "Implementation" : round === 3 ? "Tradeoffs & Scale" : "Behavioral"}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-800">
                        {score ? `${score}%` : isCurrent ? "Active" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Answer Generator Helper for Testers */}
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs">
              <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick Test Response Helper
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Click any pre-formed candidate response to auto-fill and test the AI rubric evaluator:
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCurrentAnswer(`In our production microservices, I implemented a high-performance caching layer with Redis and async worker queues in FastAPI. We profiled bottleneck queries and reduced P99 latency by 42% while scaling to 15,000 concurrent requests.`)}
                  className="w-full text-left p-2 bg-white rounded-lg border border-indigo-200/60 hover:border-indigo-400 text-[11px] text-indigo-950 font-medium transition-all shadow-2xs"
                >
                  ⚡ "Implemented caching & worker queues, reduced P99 latency by 42%..."
                </button>
                <button
                  onClick={() => setCurrentAnswer(`When scaling our React and TypeScript frontend, we split massive monolithic bundles into lazy-loaded micro-frontends, adopted TanStack Query for cache invalidation, and maintained 98% Lighthouse accessibility scores.`)}
                  className="w-full text-left p-2 bg-white rounded-lg border border-indigo-200/60 hover:border-indigo-400 text-[11px] text-indigo-950 font-medium transition-all shadow-2xs"
                >
                  ⚡ "Architected modular micro-frontends with 98% Lighthouse scores..."
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Ready to Launch Live Interview Simulation</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Select a candidate profile and target job role above, then click <strong>Launch Mock Interview</strong> to simulate a dynamic multi-round technical screening session with AI.
          </p>
          <button
            onClick={startInterview}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Session Now
          </button>
        </div>
      )}
    </div>
  );
}
