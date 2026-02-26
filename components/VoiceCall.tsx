"use client";

import React, { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { jsPDF } from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Message } from "@/types";
import ChatComponent from "@/components/ChatComponent";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Globe, Loader2, AlertCircle, Stethoscope, Activity, Pill, AlertTriangle, Download } from "lucide-react";
import Waveform from "@/components/Waveform";

export default function VoiceCall({
  sessionId,
  systemPrompt,
  doctor,
  initialConversation = [],
}: {
  sessionId: string;
  systemPrompt: string;
  doctor: { image: string; specialist: string; description: string };
  initialConversation?: Message[];
}) {
  const [callActive, setCallActive] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialUserText, setPartialUserText] = useState<string>("");
  const [assistantCaption, setAssistantCaption] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [aiTyping, setAiTyping] = useState<boolean>(false);
  const [asrConnected, setAsrConnected] = useState<boolean>(false);
  const [report, setReport] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "hi">("en");
  const [reportOpen, setReportOpen] = useState<boolean>(false);

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severityScore, setSeverityScore] = useState<number>(0); // 0-10
  const [medications, setMedications] = useState<string[]>([]);

  // Simple heuristic for severity (in production, use LLM)
  useEffect(() => {
    const text = transcript.map(t => t.text.toLowerCase()).join(" ");
    const foundSymptoms = [];
    let score = 0;
    
    if (text.includes("fever") || text.includes("temperature")) { foundSymptoms.push("Fever"); score += 2; }
    if (text.includes("cough")) { foundSymptoms.push("Cough"); score += 1; }
    if (text.includes("pain")) { foundSymptoms.push("Pain"); score += 2; }
    if (text.includes("breathing") || text.includes("breath")) { foundSymptoms.push("Breathlessness"); score += 4; }
    if (text.includes("headache")) { foundSymptoms.push("Headache"); score += 1; }
    if (text.includes("vomit")) { foundSymptoms.push("Vomiting"); score += 2; }
    if (text.includes("chest")) { foundSymptoms.push("Chest Pain"); score += 5; }

    if (foundSymptoms.length > 0) {
      setSymptoms([...new Set(foundSymptoms)]);
      setSeverityScore(Math.min(10, score));
    }


    // Extract potential medications (very basic)
    const meds = [];
    if (text.includes("paracetamol")) meds.push("Paracetamol");
    if (text.includes("antibiotic")) meds.push("Antibiotics");
    if (text.includes("syrup")) meds.push("Cough Syrup");
    setMedications([...new Set(meds)]);

  }, [transcript]);

  const getSeverityColor = (score: number) => {
    if (score < 3) return "text-green-400";
    if (score < 6) return "text-yellow-400";
    return "text-red-500";
  };

  const getSeverityLabel = (score: number) => {
    if (score < 3) return "Normal";
    if (score < 6) return "Moderate";
    return "Urgent Care Needed";
  };


  const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY as string | undefined;
  const assistantVoice = process.env.NEXT_PUBLIC_VAPI_VOICE || "alloy";
  const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID as string | undefined;

  const vapi = useRef<any>(null);
  const vapiEventsAttached = useRef<boolean>(false);
  const timerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<any>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    latestTranscriptRef.current = transcript;
  }, [transcript]);

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setCallDuration((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };


  const startWebSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Browser does not support Web Speech API");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage === "hi" ? "hi-IN" : "en-US"; // Default to English if auto, or specific

    recognition.onstart = () => {
      setAsrConnected(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setPartialUserText(interimTranscript);
      }

      if (finalTranscript) {
        setPartialUserText("");
        setAiTyping(true);
        
        // Auto-detect language switch simulation if needed, 
        // but Web Speech API requires restart to change lang.
        // For now we trust the user selected lang or default en-US.
        
        setTranscript((t) => [...t, { role: "user", text: finalTranscript, timestamp: Date.now() }]);
        
        // Notify Vapi if language changed (optional logic)
        if (selectedLanguage === "auto") {
           // Simple heuristic: if contains devanagari
           const detected = /\p{Script=Devanagari}/u.test(finalTranscript) ? "hi" : "en";
           if (detected !== currentLanguage) {
             setCurrentLanguage(detected);
             if (vapi.current) {
               const langLabel = detected === "hi" ? "Hindi" : "English";
               try {
                 vapi.current.send({
                   type: "add-message",
                   message: {
                     role: "system",
                     content: `Respond only in ${langLabel}.`,
                   },
                 });
               } catch {}
             }
           }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") return;
      console.error("Speech recognition error", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied");
      }
    };

    recognition.onend = () => {
      // If call is still active, restart listener (continuous mode sometimes stops)
      if (callActive) {
        try {
          recognition.start();
        } catch {}
      } else {
        setAsrConnected(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const attachVapiEvents = () => {
    if (!vapi.current || vapiEventsAttached.current) return;
    vapi.current.on("speech-start", () => {
      setAiSpeaking(true);
    });
    vapi.current.on("speech-end", () => {
      setAiSpeaking(false);
    });
    vapi.current.on("call-start", () => {
      setCallActive(true);
    });
    vapi.current.on("call-end", (payload: any) => {
      // payload may contain reason for end, like "ejection"
      const reason = (payload && (payload.reason || payload.message)) || "";
      if (typeof reason === "string" && reason.toLowerCase().includes("ejection")) {
        // Suppress ejection errors as they often just mean the call ended naturally or by timeout
        // Only set error if it seems like a genuine permission/config issue
        if (callDuration < 2) {
             setError("Call ended abruptly. Please check microphone permissions or try again.");
        }
      }
      setCallActive(false);
      setAiSpeaking(false);
      stopTimer();
      saveConversation();
    });
    vapi.current.on("message", (message: any) => {
      try {
        const role = message?.message?.role || message?.role;
        const content = message?.message?.content || message?.content;
        
        // Handle assistant transcript
        if (role === "assistant" && typeof content === "string" && content.trim().length > 0) {
          setAiTyping(false);
          setAssistantCaption(content);
          setTranscript((t) => [...t, { role: "assistant", text: content, timestamp: Date.now() }]);
        }
        
        // Handle user transcript from Vapi (if they provide it)
        if (role === "user" && typeof content === "string" && content.trim().length > 0) {
           // We prefer our local Web Speech API transcript, but could use this as fallback
           // or for confirmation. For now, we rely on local recognition.
        }

        // Also listen for 'transcript' type messages if Vapi sends them differently
        if (message.type === "transcript" && message.transcriptType === "final") {
           const text = message.transcript;
           // If it's the assistant speaking
           if (message.role === "assistant") {
             setTranscript((t) => [...t, { role: "assistant", text, timestamp: Date.now() }]);
           }
        }
      } catch {}
    });
    vapi.current.on("error", (e: any) => {
      const msg = e?.message || "Vapi error";
      setError(msg);
    });
    vapiEventsAttached.current = true;
  };

  useEffect(() => {
    // Scroll handling moved to ChatComponent
  }, [transcript, partialUserText]);

  const startVapiCall = async () => {
    if (!vapiPublicKey) {
      setError("Vapi public key missing");
      return;
    }
    if (!vapi.current) {
      vapi.current = new (Vapi as any)(vapiPublicKey);
    }
    attachVapiEvents();
    setAiSpeaking(true);
    try {
      if (vapiAssistantId) {
        await vapi.current.start(vapiAssistantId);
        // Always set multilingual instruction after call starts
        try {
          await vapi.current.send({
            type: "add-message",
            message: {
              role: "system",
              content:
                "You are an AI medical doctor limited to Hindi and English. Always respond in the same language the user speaks. Detect between Hindi and English automatically. If the user switches, switch immediately. Keep responses short, fluent, and conversational.",
            },
          });
        } catch {}
        if (selectedLanguage !== "auto") {
          const langLabel = selectedLanguage === "hi" ? "Hindi" : "English";
          setCurrentLanguage(selectedLanguage as "en" | "hi");
          try {
            await vapi.current.send({
              type: "add-message",
              message: {
                role: "system",
                content: `Respond only in ${langLabel}. Maintain clinical, concise tone.`,
              },
            });
          } catch {}
        }
      } else {
        // Fallback to transient assistant if no ID is provided
        await vapi.current.start({
            name: "AI Doctor",
            systemPrompt:
              "You are an AI medical doctor limited to Hindi and English. Always respond in the same language the user speaks. Detect between Hindi and English automatically. If the user switches, switch immediately. Keep responses short, fluent, and conversational.",
            model: {
              provider: "openai",
              model: "gpt-4o-mini",
              temperature: 0.4,
            },
            voice: {
              provider: "vapi",
              voice: assistantVoice,
            },
        });
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to start Vapi call";
      setError(String(msg));
      // throw e;
    }
  };

  const stopCall = () => {
    stopTimer();
    setCallActive(false);
    setAiSpeaking(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (vapi.current) {
      try {
        vapi.current.stop();
      } catch {}
    }
  };

  const saveConversation = async () => {
    try {
      const res = await fetch("/api/save-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          conversation: latestTranscriptRef.current,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.report) setReport(data.report);
        if (data?.report?.summary) setReportOpen(true);
      }
    } catch {}
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const languageOptions = [
    { label: "Auto Detect (Hindi/English)", value: "auto" },
    { label: "English", value: "en" },
    { label: "Hindi", value: "hi" },
  ];

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // --- Header ---
    doc.setFontSize(24);
    doc.setTextColor(0, 128, 128); // Teal
    doc.setFont("helvetica", "bold");
    doc.text("SehatSathi", margin, y);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("AI-Powered Medical Assistant", margin, y + 6);
    
    // Right side header info
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, y, { align: "right" });
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, pageWidth - margin, y + 6, { align: "right" });
    doc.text(`Session ID: ${sessionId.slice(0, 8)}...`, pageWidth - margin, y + 12, { align: "right" });

    y += 25;

    // --- Horizontal Line ---
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // --- Doctor Info ---
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text(`Consultant: ${doctor.specialist}`, margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("AI Medical Specialist", margin, y);
    
    // Duration
    doc.text(`Duration: ${formatTime(callDuration)}`, pageWidth - margin, y, { align: "right" });
    y += 15;

    // --- Vitals & Stats (Mockup) ---
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 20, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("Severity Score", margin + 5, y + 8);
    doc.setFontSize(14);
    doc.setTextColor(severityScore > 5 ? 200 : 0, severityScore > 5 ? 0 : 128, severityScore > 5 ? 0 : 0);
    doc.setFont("helvetica", "bold");
    doc.text(`${severityScore}/10 (${getSeverityLabel(severityScore)})`, margin + 5, y + 15);

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.text("Language", margin + 80, y + 8);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(report.language || "Detected", margin + 80, y + 15);

    y += 30;

    // Helper for sections
    const addSection = (title: string, content: string | string[], isList = false) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      // Section Title
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), margin, y);
      doc.line(margin, y + 2, margin + 50, y + 2); // Underline
      y += 10;

      // Section Content
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.setFont("helvetica", "normal");

      if (Array.isArray(content)) {
        content.forEach(item => {
           const bullet = isList ? "• " : "";
           const text = `${bullet}${item}`;
           const lines = doc.splitTextToSize(text, contentWidth);
           
           if (y + lines.length * 5 > 280) {
             doc.addPage();
             y = 20;
           }
           doc.text(lines, margin + 2, y);
           y += lines.length * 6;
        });
      } else {
        const lines = doc.splitTextToSize(content || "N/A", contentWidth);
        if (y + lines.length * 5 > 280) {
             doc.addPage();
             y = 20;
        }
        doc.text(lines, margin, y);
        y += lines.length * 6;
      }
      y += 8; // Spacing after section
    };

    if (report.summary) addSection("Clinical Summary", report.summary);
    if (report.diagnosis) addSection("Diagnosis", report.diagnosis);
    
    // Symptoms and Meds side by side logic or just stacked
    if (report.symptoms && report.symptoms.length > 0) {
        addSection("Reported Symptoms", report.symptoms, true);
    } else if (symptoms.length > 0) {
        addSection("Detected Symptoms (Live)", symptoms, true);
    }

    if (report.advice && report.advice.length > 0) {
        addSection("Medical Advice", report.advice, true);
    }

    // Medications
    if (medications.length > 0) {
        addSection("Suggested Medications (Detected)", medications, true);
    }

    if (report.followUpQuestions && report.followUpQuestions.length > 0) {
        addSection("Follow-up Questions", report.followUpQuestions, true);
    }

    // --- Footer / Disclaimer ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = 285;
        
        doc.setDrawColor(200);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("DISCLAIMER: This report is generated by an AI system (SehatSathi). It is for informational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider.", margin, footerY, { maxWidth: contentWidth });
        
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 5, { align: "right" });
    }

    doc.save(`SehatSathi_Report_${sessionId.slice(0, 8)}.pdf`);
  };

  const startCall = () => {
    startWebSpeech();
    startVapiCall();
  };

  return (
    <div className="w-full max-w-4xl bg-neutral-950 text-white rounded-3xl shadow-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row h-[85vh]">
      {/* Left Panel: Doctor Info & Status */}
      <div className="w-full md:w-1/3 bg-neutral-900/50 p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto">
        <div className="flex flex-col items-center text-center w-full">
          <div className="relative">
            <motion.div
              animate={{
                scale: aiSpeaking ? [1, 1.05, 1] : 1,
                rotate: aiSpeaking ? [0, 1, -1, 0] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <img
                src={doctor.image}
                alt={doctor.specialist}
                className="w-32 h-32 rounded-3xl object-cover border-2 border-white/10 shadow-2xl"
              />
            </motion.div>
            <AnimatePresence>
              {aiSpeaking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-teal-500/20 rounded-3xl blur-2xl -z-10"
                />
              )}
            </AnimatePresence>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-2xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
          >
            {doctor.specialist}
          </motion.h2>
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed px-4">{doctor.description}</p>
          
          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-3xl font-mono font-medium tracking-tighter text-white/90">
                {formatTime(callDuration)}
              </div>
              <div className="h-4 w-px bg-white/10" />
              <Waveform active={aiSpeaking} color="bg-teal-400" />
            </div>

            {/* Severity Score Card */}
            {callActive && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white/5 rounded-2xl border border-white/5 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Severity Score</div>
                  <AlertTriangle className={`w-4 h-4 ${getSeverityColor(severityScore)}`} />
                </div>
                <div className="flex items-end gap-2">
                  <div className={`text-2xl font-bold ${getSeverityColor(severityScore)}`}>{severityScore}/10</div>
                  <div className="text-xs text-neutral-400 mb-1">{getSeverityLabel(severityScore)}</div>
                </div>
                <div className="mt-2 h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${severityScore < 3 ? 'bg-green-500' : severityScore < 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(severityScore / 10) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${callActive ? "bg-green-500 animate-pulse" : "bg-neutral-600"}`} />
              <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                {connecting ? "Connecting" : callActive ? "In Call" : "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Symptom Tracker */}
        {callActive && symptoms.length > 0 && (
          <div className="w-full mt-6">
            <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3 text-center">Detected Symptoms</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {symptoms.map((symptom, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-full flex items-center gap-1.5"
                >
                  <Activity className="w-3 h-3" />
                  {symptom}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Medication Tracker */}
        {callActive && medications.length > 0 && (
          <div className="w-full mt-6">
            <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3 text-center">Suggested Meds</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {medications.map((med, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1.5 hover:bg-blue-500/20 transition-colors group"
                  onClick={() => alert(`Reminder set for ${med}`)}
                >
                  <Pill className="w-3 h-3 group-hover:text-blue-200" />
                  {med}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="w-full space-y-3 mt-8">
          <div className="relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 transition-colors group-hover:text-teal-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-white/5 text-sm text-white pl-10 pr-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none cursor-pointer hover:bg-white/10"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <AnimatePresence mode="wait">
            {!callActive ? (
              <motion.button
                key="start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={startCall}
                disabled={connecting}
                className="w-full bg-white text-black text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5"
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {connecting ? "Connecting..." : "Start Consultation"}
              </motion.button>
            ) : (
              <motion.button
                key="end"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => {
                  stopCall();
                  saveConversation();
                }}
                className="w-full bg-red-500/10 text-red-500 text-sm font-bold py-4 rounded-xl border border-red-500/20 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-red-500/10"
              >
                <PhoneOff className="w-4 h-4" />
                End Consultation
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: Chat & Visualizer */}
      <div className="flex-1 flex flex-col p-6 md:p-8 bg-neutral-950 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

        <div className="flex-1 flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Live Transcript</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                <Mic className={`w-3.5 h-3.5 ${asrConnected ? "text-blue-400" : "text-neutral-600"}`} />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                  {asrConnected ? "Mic Active" : "Mic Ready"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ChatComponent
              conversation={transcript}
              partialUserText={partialUserText}
              aiSpeaking={aiSpeaking}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200 leading-relaxed">{error}</div>
            </motion.div>
          )}

          {report && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setReportOpen(true)}
              className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-between group hover:bg-teal-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                  <Stethoscope className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Medical Report Generated</div>
                  <div className="text-[11px] text-teal-400/80 font-medium uppercase tracking-wider">Click to view summary</div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Globe className="w-4 h-4 text-white/40" />
              </div>
            </motion.button>
          )}
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-xl bg-neutral-900 border-white/10 text-white rounded-3xl p-0 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-8 border-b border-white/5 flex items-start justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 mb-4">
                <Stethoscope className="w-6 h-6 text-teal-400" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight">Consultation Summary</DialogTitle>
              </DialogHeader>
            </div>
            <button 
              onClick={downloadPDF}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group"
              title="Download PDF Report"
            >
              <Download className="w-5 h-5 text-white/70 group-hover:text-white" />
            </button>
          </div>
          
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1">Language</div>
                <div className="text-sm font-medium text-white capitalize">{report?.language || "Detected"}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1">Duration</div>
                <div className="text-sm font-medium text-white">{formatTime(callDuration)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold uppercase tracking-widest text-teal-400">Clinical Overview</div>
              <p className="text-base text-neutral-300 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                {report?.summary || "No clinical summary was generated for this session."}
              </p>
            </div>

            {report?.diagnosis && (
              <div className="space-y-4">
                <div className="text-sm font-bold uppercase tracking-widest text-teal-400">Diagnosis</div>
                <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-200 font-medium">
                  {report.diagnosis}
                </div>
              </div>
            )}

            {report?.symptoms && report.symptoms.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-bold uppercase tracking-widest text-teal-400">Symptoms</div>
                <div className="flex flex-wrap gap-2">
                  {report.symptoms.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report?.advice && report.advice.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-bold uppercase tracking-widest text-teal-400">Medical Advice</div>
                <ul className="space-y-2">
                  {report.advice.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {report?.followUpQuestions && report.followUpQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-bold uppercase tracking-widest text-teal-400">Follow-up</div>
                <ul className="space-y-2">
                  {report.followUpQuestions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-400 italic bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

