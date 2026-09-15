"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  ClipboardList,
  Copy,
  Mic,
  MicOff,
  RotateCcw,
  SendHorizonal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { profile } from "@/lib/resume-data";
import { useToast } from "@/hooks/use-toast";
import { useActiveSection } from "@/hooks/use-active-section";
import {
  contextualSuggestions,
  contextualFollowUps,
} from "@/lib/contextual-prompts";
import {
  fetchFeedbackAggregate,
  pushFeedbackVote,
  type FeedbackAggregate,
} from "@/lib/kai-feedback-client";
import { LiveSocialProof } from "@/components/portfolio/live-social-proof";

/* --- Web Speech API (voice input) minimal typings --- */
interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: { [j: number]: SpeechRecognitionResultItem; isFinal: boolean } };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content: `Hi there! 👋 I'm **K-AI**, Karthik's AI resume assistant. Ask me anything about his **9+ years** of delivery experience — projects, skills, leadership, or how to get in touch.`,
};

const STORAGE_KEY = "kai-chat-history-v1";
const FEEDBACK_KEY = "kai-message-feedback-v1";
const ASKED_COUNT_KEY = "kai-session-asked-v1";
const RENUDGE_KEY = "kai-renudge-shown-v1";
const MILESTONES = [10, 25, 50, 100, 250, 500];
type Feedback = "up" | "down";

const ALL_SECTION_IDS = [
  "top",
  "about",
  "expertise",
  "experience",
  "projects",
  "highlights",
  "ai",
  "toolkit",
  "contact",
];

function loadAskedCount(): number {
  try {
    const n = parseInt(sessionStorage.getItem(ASKED_COUNT_KEY) ?? "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function feedbackKey(content: string) {
  return content.slice(0, 80).replace(/\s+/g, " ");
}

function stripMarkdown(md: string) {
  return md
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/(\*\*|__|`)/g, "")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

function loadFeedback(): Record<string, Feedback> {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
const NUDGE_TEXT =
  "Hi! Curious about Karthik's ERP & LegalTech delivery work? Ask me anything ⚡";

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is Message =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.length > 0 &&
          !(m.role === "assistant" && m.content === WELCOME.content)
      )
      .slice(-30);
  } catch {
    return [];
  }
}

function BadgeSpark({ burstId, big }: { burstId: number; big?: boolean }) {
  if (burstId === 0) return null;
  const dots = big ? 8 : 5;
  const radius = big ? 42 : 26;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: dots }, (_, d) => {
        const angle = (d / dots) * 2 * Math.PI - Math.PI / 2;
        return (
          <motion.span
            key={`${burstId}-${d}`}
            initial={{ opacity: 0.95, x: 0, y: 0, scale: big ? 0.7 : 0.5 }}
            animate={{ opacity: 0, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: big ? 1.5 : 1.1 }}
            transition={{ duration: big ? 0.85 : 0.65, ease: "easeOut" }}
            className={`absolute left-1/2 top-1/2 rounded-full bg-gradient-to-br from-teal-300 to-amber-300 shadow-sm ${big ? "h-2 w-2" : "h-1.5 w-1.5"}`}
          />
        );
      })}
    </span>
  );
}

export function ChatWidget({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serverStats, setServerStats] = useState<FeedbackAggregate | null>(null);
  const [askedCount, setAskedCount] = useState(0);
  const [sparkKey, setSparkKey] = useState(0);
  const [megaSpark, setMegaSpark] = useState(false);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  const activeSection = useActiveSection(ALL_SECTION_IDS);
  const initialChips = contextualSuggestions(activeSection);
  const followUpChips = contextualFollowUps(activeSection);

  const localHelpful = (() => {
    const vals = Object.values(feedback);
    const ups = vals.filter((v) => v === "up").length;
    if (vals.length === 0) return { pct: 94, demo: true, total: 0 };
    return { pct: Math.round((ups / vals.length) * 100), demo: false, total: vals.length };
  })();
  const helpful = serverStats
    ? { pct: serverStats.pct ?? 100, demo: false, total: serverStats.total, live: true }
    : { ...localHelpful, live: false };
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevTotalRef = useRef<number | null>(null);
  const askedSectionRef = useRef<string>(activeSection);
  const nudgeVisibleRef = useRef(false);

  useEffect(() => { askedSectionRef.current = activeSection; }, [activeSection]);
  useEffect(() => { nudgeVisibleRef.current = showNudge; }, [showNudge]);

  const applyStats = useCallback((stats: FeedbackAggregate, fromVote: boolean) => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = stats.total;
    setServerStats(stats);
    if (!fromVote) return;
    const crossed = MILESTONES.find((m) => prev !== null && prev < m && stats.total >= m);
    if (crossed) {
      setMegaSpark(true);
      setSparkKey((k) => k + 1);
      const delay = nudgeVisibleRef.current ? 300 : 0;
      setTimeout(() => toast({ title: `K-AI just hit ${crossed} ratings! 🎉`, description: `${stats.pct}% of visitors found it helpful. Karthik appreciates every signal.`, duration: 8000 }), delay);
    } else if (stats.total !== prev) {
      setMegaSpark(false);
      setSparkKey((k) => k + 1);
    }
  }, [toast]);

  useEffect(() => {
    setFeedback(loadFeedback());
    setAskedCount(loadAskedCount());
    fetchFeedbackAggregate().then((stats) => { if (stats) applyStats(stats, false); });
  }, [applyStats]);

  const rateAnswer = useCallback((content: string, value: Feedback) => {
    const key = feedbackKey(content);
    let voted: boolean | null = value === "up";
    setFeedback((prev) => {
      const next = { ...prev };
      if (next[key] === value) {
        delete next[key];
        voted = null;
      } else {
        next[key] = value;
        toast({ title: value === "up" ? "Thanks for the feedback! 🙌" : "Thanks — noted 📝", description: value === "up" ? "Glad K-AI helped. Karthik reads every recruiter conversation signal." : "K-AI keeps improving its answers from this." });
      }
      try {
        if (Object.keys(next).length > 0) localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
        else localStorage.removeItem(FEEDBACK_KEY);
      } catch { /* ignore */ }
      return next;
    });
    const qIdx = messages.findIndex((m) => m.role === "assistant" && m.content === content);
    let question: string | undefined;
    for (let i = qIdx - 1; i >= 0; i--) {
      if (messages[i].role === "user") { question = messages[i].content; break; }
    }
    void pushFeedbackVote(key, voted, question, askedSectionRef.current).then((stats) => { if (stats) applyStats(stats, true); });
  }, [toast, messages, applyStats]);

  const copyAnswer = useCallback(async (content: string) => {
    const key = feedbackKey(content);
    const legacyCopy = () => {
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    };
    try { await navigator.clipboard.writeText(content); }
    catch {
      if (!legacyCopy()) {
        toast({ title: "Couldn't copy", description: "Your browser blocked clipboard access.", variant: "destructive" });
        return;
      }
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
  }, [toast]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      try { recogRef.current?.stop(); } catch { /* ignore */ }
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    };
  }, []);

  const toggleListening = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    if (listening) {
      try { recogRef.current?.stop(); } catch { /* ignore */ }
      setListening(false);
      return;
    }
    try {
      const recog = new Ctor();
      recogRef.current = recog;
      recog.lang = "en-US";
      recog.interimResults = true;
      recog.maxAlternatives = 1;
      recog.continuous = false;
      recog.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) transcript += e.results[i][0]?.transcript ?? "";
        if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}`.slice(0, 500) : transcript));
      };
      recog.onerror = () => setListening(false);
      recog.onend = () => setListening(false);
      recog.start();
      setListening(true);
    } catch { setListening(false); }
  }, [listening]);

  useEffect(() => {
    const saved = loadHistory();
    if (saved.length > 0) setMessages([WELCOME, ...saved]);
  }, []);

  useEffect(() => {
    const real = messages.filter((m) => m !== WELCOME && !(m.role === "assistant" && m.content === WELCOME.content));
    try {
      if (real.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(real.slice(-30)));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, streamText, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
      setShowNudge(false);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const used = localStorage.getItem(STORAGE_KEY);
      if (!used && !open) setShowNudge(true);
    }, 18000);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (open || askedCount === 0) return;
    let shown = false;
    try { shown = sessionStorage.getItem(RENUDGE_KEY) === "1"; } catch { /* ignore */ }
    if (shown) return;
    const timer = setTimeout(() => {
      if (!open) {
        setShowNudge(true);
        try { sessionStorage.setItem(RENUDGE_KEY, "1"); } catch { /* ignore */ }
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [open, askedCount]);

  const sendNonStreaming = useCallback(async (history: Message[]) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Something went wrong.");
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  }, []);

  /**
   * Primary path: the server currently returns one complete SSE payload.
   * We deliberately keep that payload hidden until the response is complete.
   * This prevents visitors from ever seeing a partial answer as if it were
   * the final K-AI answer, while retaining the existing SSE contract.
   */
  const sendStreaming = useCallback(async (history: Message[], _onToken: (t: string) => void): Promise<string> => {
    const controller = new AbortController();
    abortRef.current = controller;
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Stream unavailable.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";
    let streamError: string | null = null;

    const processLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith("event:")) {
        if (trimmed.slice(6).trim() === "error") streamError = "K-AI hit a snag.";
        return;
      }
      if (!trimmed.startsWith("data:")) return;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as {
          error?: string;
          choices?: { delta?: { content?: string } }[];
        };
        if (parsed.error) {
          streamError = parsed.error;
          return;
        }
        const delta = parsed.choices?.[0]?.delta?.content ?? "";
        if (delta) full += delta;
      } catch {
        /* ignore malformed keep-alive lines */
      }
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? "";
      for (const line of parts) processLine(line);
    }
    buffer += decoder.decode();
    if (buffer) {
      const parts = buffer.split(/\r?\n/);
      for (const line of parts) processLine(line);
    }

    if (streamError) throw new Error(streamError);
    if (!full.trim()) throw new Error("K-AI returned an empty response.");
    return full;
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || streaming) return;

    const history = messages.filter((m) => m !== WELCOME);
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStreaming(false);
    setStreamText("");
    setError(null);
    setShowNudge(false);

    setAskedCount((n) => {
      const next = n + 1;
      try { sessionStorage.setItem(ASKED_COUNT_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });

    const historyForApi = [...history, { role: "user" as const, content: trimmed }];

    try {
      let full = "";
      try {
        full = await sendStreaming(historyForApi, () => undefined);
      } catch (streamErr) {
        // Only use the classic endpoint when no complete answer was received.
        if (full.length === 0) await sendNonStreaming(historyForApi);
        else throw streamErr;
      }
      if (full.trim().length > 0) setMessages((prev) => [...prev, { role: "assistant", content: full }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "K-AI is unavailable right now.");
    } finally {
      abortRef.current = null;
      setStreaming(false);
      setStreamText("");
      setLoading(false);
    }
  }, [messages, loading, streaming, sendStreaming, sendNonStreaming]);

  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent<{ question?: string }>).detail;
      onOpenChange(true);
      setShowNudge(false);
      if (detail?.question) setTimeout(() => send(detail.question as string), 400);
      else setTimeout(() => inputRef.current?.focus(), 400);
    };
    window.addEventListener("kai:ask", onAsk);
    return () => window.removeEventListener("kai:ask", onAsk);
  }, [send, onOpenChange]);

  const speakAnswer = useCallback((content: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const key = feedbackKey(content);
    if (speakingKey === key) {
      window.speechSynthesis.cancel();
      setSpeakingKey(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(stripMarkdown(content).slice(0, 4000));
    utter.rate = 1.02;
    utter.pitch = 1;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("en"));
    if (voice) utter.voice = voice;
    utter.onend = () => setSpeakingKey((k) => (k === key ? null : k));
    utter.onerror = () => setSpeakingKey((k) => (k === key ? null : k));
    setSpeakingKey(key);
    window.speechSynthesis.speak(utter);
  }, [speakingKey]);

  const copyTranscript = useCallback(async () => {
    const real = messages.filter((m) => m !== WELCOME && !(m.role === "assistant" && m.content === WELCOME.content));
    if (real.length === 0) {
      toast({ title: "Nothing to copy yet", description: "Ask K-AI a question first — the transcript copies once there's a conversation." });
      return;
    }
    const text = ["K-AI conversation — Karthik Easam portfolio", new Date().toLocaleString(), "", ...real.flatMap((m) => m.role === "user" ? [`Q: ${m.content}`] : [`A: ${stripMarkdown(m.content)}`])].join("\n");
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast({ title: "Transcript copied", description: "The K-AI conversation is ready to paste." });
  }, [messages, toast]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setInput("");
    setLoading(false);
    setStreaming(false);
    setStreamText("");
    setError(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showNudge && !open && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            onClick={() => { setShowNudge(false); onOpenChange(true); }}
            className="fixed bottom-24 right-4 z-50 max-w-[320px] rounded-2xl border border-primary/15 bg-white px-4 py-3 text-left text-xs font-semibold text-foreground shadow-xl"
          >
            {NUDGE_TEXT}
          </motion.button>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-5">
          <button aria-label="Close K-AI" onClick={() => onOpenChange(false)} className="absolute inset-0 bg-black/10" />
          <motion.section initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative flex h-[min(720px,calc(100vh-24px))] w-full max-w-[460px] flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-2xl">
            <header className="relative shrink-0 bg-gradient-to-br from-primary to-emerald-600 p-4 text-white">
              <div className="relative flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/20 backdrop-blur"><Bot className="h-5 w-5" /><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-white/70" /></span>
                <div><p className="text-sm font-extrabold tracking-tight">K-AI Resume Assistant</p><p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-50/90">{listening ? <><Mic className="h-3 w-3 animate-pulse text-amber-300" />Listening… speak now</> : <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />Online · knows Karthik&apos;s full resume</>}</p></div>
                <motion.span key={sparkKey} initial={{ scale: 1 }} animate={sparkKey > 0 ? { scale: [1, 1.18, 1] } : undefined} transition={{ duration: 0.5, ease: "easeOut" }} className="relative ml-1 hidden shrink-0 sm:inline-flex"><BadgeSpark burstId={sparkKey} big={megaSpark} /><span title={helpful.demo ? "Visitors rate K-AI's answers — your 👍/👎 feedback updates this live" : helpful.live ? `Live across all visitors — based on ${helpful.total} rating${helpful.total === 1 ? "" : "s"}. Yours included!` : `Based on your ${helpful.total} rating${helpful.total === 1 ? "" : "s"} this visit`} className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tabular-nums tracking-tight backdrop-blur transition-colors hover:bg-white/30"><ThumbsUp className="h-3 w-3" />{helpful.pct}% helpful</span></motion.span>
              </div>
              <div className="relative flex items-center gap-1.5"><button onClick={() => void copyTranscript()} aria-label="Copy conversation transcript" title="Copy transcript" className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"><ClipboardList className="h-4 w-4" /></button><button onClick={reset} aria-label="Reset conversation" title="Reset conversation" className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"><RotateCcw className="h-4 w-4" /></button><button onClick={() => onOpenChange(false)} aria-label="Close K-AI" title="Close" className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"><X className="h-4 w-4" /></button></div>
            </header>

            <div ref={scrollRef} className="thin-scrollbar flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-secondary/25 to-white px-4 py-5">
              {messages.map((m, i) => {
                const isWelcome = m.role === "assistant" && m.content === WELCOME.content;
                const msgKey = feedbackKey(m.content);
                const msgFeedback = feedback[msgKey];
                return <motion.div key={i} initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <span className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow"><Sparkles className="h-3.5 w-3.5" /></span>}
                  <div className={`max-w-[82%] ${m.role === "assistant" && !isWelcome ? "group/msg" : ""}`}>
                    <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${m.role === "user" ? "chat-user rounded-br-md font-semibold" : "rounded-bl-md border border-primary/10 bg-white text-foreground/90"}`}>
                      {m.role === "assistant" ? <><ReactMarkdown components={{ p: ({ children }) => <span className="block [&>strong]:font-bold">{children}</span>, ul: ({ children }) => <ul className="ml-3 list-disc space-y-1">{children}</ul>, ol: ({ children }) => <ol className="ml-3 list-decimal space-y-1">{children}</ol>, a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="font-bold text-primary underline underline-offset-2">{children}</a> }}>{m.content}</ReactMarkdown>{isWelcome && <LiveSocialProof variant="strip" stats={serverStats} />}</> : m.content}
                    </div>
                    {m.role === "assistant" && !isWelcome && <div className="mt-1 flex items-center gap-1 pl-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/msg:opacity-100 max-md:opacity-60" role="group" aria-label="Answer actions">
                      <button onClick={() => copyAnswer(m.content)} aria-label="Copy answer" title="Copy answer" className="msg-action grid h-6 w-6 place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-primary">{copiedKey === msgKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</button>
                      {speechSupported && <button onClick={() => speakAnswer(m.content)} aria-label={speakingKey === msgKey ? "Stop reading aloud" : "Read answer aloud"} aria-pressed={speakingKey === msgKey} title={speakingKey === msgKey ? "Stop reading aloud" : "Read aloud"} className={`msg-action grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-secondary ${speakingKey === msgKey ? "text-primary" : "text-muted-foreground/70 hover:text-primary"}`}>{speakingKey === msgKey ? <span className="flex h-4 items-end gap-[2.5px]" aria-hidden><span className="eq-bar" /><span className="eq-bar" /><span className="eq-bar" /></span> : <Volume2 className="h-3.5 w-3.5" />}</button>}
                      <button onClick={() => rateAnswer(m.content, "up")} aria-label="Helpful answer" aria-pressed={msgFeedback === "up"} title="Helpful" className={`grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-secondary ${msgFeedback === "up" ? "text-emerald-500" : "text-muted-foreground/70 hover:text-primary"}`}><ThumbsUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => rateAnswer(m.content, "down")} aria-label="Not helpful" aria-pressed={msgFeedback === "down"} title="Not helpful" className={`grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-secondary ${msgFeedback === "down" ? "text-amber-600" : "text-muted-foreground/70 hover:text-primary"}`}><ThumbsDown className="h-3.5 w-3.5" /></button>
                      {msgFeedback && <span className="ml-1 text-[10px] font-bold text-muted-foreground/70">{msgFeedback === "up" ? "Thanks!" : "Noted"}</span>}
                      {speakingKey === msgKey && <span className="ml-1 text-[10px] font-bold text-primary/80">Reading…</span>}
                    </div>}
                  </div>
                </motion.div>;
              })}

              {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow"><Sparkles className="h-3.5 w-3.5 animate-pulse" /></span><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-primary/10 bg-white px-4 py-3.5 shadow-sm">{[0,1,2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: `${d * 0.15}s` }} />)}</div></motion.div>}

              {error && <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800">⚠️ {error}</div>}
            </div>

            <div className="shrink-0 border-t bg-white p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">{(messages.length === 1 ? initialChips : followUpChips).slice(0, 4).map((chip) => <button key={chip} onClick={() => send(chip)} disabled={loading || streaming} className="rounded-full border border-primary/15 bg-secondary/40 px-3 py-1.5 text-[11px] font-bold text-foreground/80 transition hover:bg-secondary disabled:opacity-50">{chip}</button>)}</div>
              <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-secondary/30 p-1.5 focus-within:ring-2 focus-within:ring-primary/20">
                {voiceSupported && <button type="button" onClick={toggleListening} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop listening" : "Voice input"} className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${listening ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"}`}>{listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>}
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value.slice(0, 500))} placeholder="Ask about Karthik…" disabled={loading || streaming} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60" />
                <button type="submit" disabled={!input.trim() || loading || streaming} aria-label="Send message" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-white transition hover:brightness-110 disabled:opacity-40"><SendHorizonal className="h-4 w-4" /></button>
              </form>
            </div>
          </motion.section>
        </div>
      )}
    </>
  );
}
