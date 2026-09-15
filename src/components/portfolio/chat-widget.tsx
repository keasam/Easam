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
/** Ratings totals that trigger a celebration burst + toast */
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

/** Questions K-AI answered this visit (per-tab session counter) */
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

/** Plain text for read-aloud + transcript export: strip markdown syntax */
function stripMarkdown(md: string) {
  return md
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // links → text
    .replace(/(\*\*|__|`)/g, "") // bold / code markers
    .replace(/^\s*#{1,6}\s+/gm, "") // headings
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/\s*\n\s*/g, " ") // newlines → spaces
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

/** Load persisted history (client only) — strips any duplicated welcome entries */
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
          // never persist/restore the synthetic welcome bubble
          !(m.role === "assistant" && m.content === WELCOME.content)
      )
      .slice(-30);
  } catch {
    return [];
  }
}

/**
 * Tiny teal→amber spark burst on the helpful badge when a visitor's
 * vote lands cross-visitor (pure delight — respects reduced motion via
 * the global MotionConfig).
 */
function BadgeSpark({ burstId, big }: { burstId: number; big?: boolean }) {
  if (burstId === 0) return null;
  const dots = big ? 8 : 5;
  const radius = big ? 42 : 26;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-visible"
    >
      {Array.from({ length: dots }, (_, d) => {
        const angle = (d / dots) * 2 * Math.PI - Math.PI / 2;
        return (
          <motion.span
            key={`${burstId}-${d}`}
            initial={{ opacity: 0.95, x: 0, y: 0, scale: big ? 0.7 : 0.5 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
              scale: big ? 1.5 : 1.1,
            }}
            transition={{ duration: big ? 0.85 : 0.65, ease: "easeOut" }}
            className={`absolute left-1/2 top-1/2 rounded-full bg-gradient-to-br from-teal-300 to-amber-300 shadow-sm ${
              big ? "h-2 w-2" : "h-1.5 w-1.5"
            }`}
          />
        );
      })}
    </span>
  );
}

export function ChatWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // waiting for first token
  const [streaming, setStreaming] = useState(false); // actively receiving tokens
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // cross-visitor aggregate from the server (null → fall back to local stats)
  const [serverStats, setServerStats] = useState<FeedbackAggregate | null>(null);
  // how many questions K-AI answered this visit (nudge social proof)
  const [askedCount, setAskedCount] = useState(0);
  // increments on each new vote → triggers the badge spark burst
  const [sparkKey, setSparkKey] = useState(0);
  // true when the current spark celebrates a ratings milestone (bigger burst)
  const [megaSpark, setMegaSpark] = useState(false);
  // message currently read aloud (feedbackKey) or null
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  // browser TTS availability
  const [speechSupported, setSpeechSupported] = useState(false);

  // context-aware suggestion + follow-up chips: while the visitor reads a
  // section, both the openers and the post-answer prompts stay scoped to it
  const activeSection = useActiveSection(ALL_SECTION_IDS);
  const initialChips = contextualSuggestions(activeSection);
  const followUpChips = contextualFollowUps(activeSection);

  // helpful-rating aggregate for the header badge:
  // live server aggregate (all visitors) → this visit's local ratings → demo default
  const localHelpful = (() => {
    const vals = Object.values(feedback);
    const ups = vals.filter((v) => v === "up").length;
    if (vals.length === 0) return { pct: 94, demo: true, total: 0 };
    return {
      pct: Math.round((ups / vals.length) * 100),
      demo: false,
      total: vals.length,
    };
  })();
  const helpful = serverStats
    ? {
        pct: serverStats.pct ?? 100,
        demo: false,
        total: serverStats.total,
        live: true,
      }
    : { ...localHelpful, live: false };
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // milestone tracking: celebrate when the cross-visitor total crosses thresholds
  const prevTotalRef = useRef<number | null>(null);
  // section the last question was asked from (for per-area vote breakdown)
  const askedSectionRef = useRef<string>(activeSection);
  // is the nudge bubble on screen right now? (milestone toasts wait for it)
  const nudgeVisibleRef = useRef(false);

  useEffect(() => {
    askedSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    nudgeVisibleRef.current = showNudge;
  }, [showNudge]);

  /** Central aggregate sink: refreshes badge state, fires sparks/milestones. */
  const applyStats = useCallback(
    (stats: FeedbackAggregate, fromVote: boolean) => {
      const prev = prevTotalRef.current;
      prevTotalRef.current = stats.total;
      setServerStats(stats);
      if (!fromVote) return; // initial snapshot — never celebrate existing data
      const crossed = MILESTONES.find(
        (m) => prev !== null && prev < m && stats.total >= m
      );
      if (crossed) {
        setMegaSpark(true);
        setSparkKey((k) => k + 1);
        // if the nudge bubble is on screen, wait a beat so the two
        // don't pop in the same instant (visual collision guard)
        const delay = nudgeVisibleRef.current ? 300 : 0;
        setTimeout(() => {
          toast({
            title: `K-AI just hit ${crossed} ratings! 🎉`,
            description: `${stats.pct}% of visitors found it helpful. Karthik appreciates every signal.`,
            duration: 8000,
          });
        }, delay);
      } else if (stats.total !== prev) {
        setMegaSpark(false);
        setSparkKey((k) => k + 1); // normal spark for every new vote
      }
    },
    [toast]
  );

  // restore saved answer feedback + load cross-visitor aggregate
  useEffect(() => {
    setFeedback(loadFeedback());
    setAskedCount(loadAskedCount());
    fetchFeedbackAggregate().then((stats) => {
      if (stats) applyStats(stats, false);
    });
  }, [applyStats]);

  const rateAnswer = useCallback(
    (content: string, value: Feedback) => {
      const key = feedbackKey(content);
      let voted: boolean | null = value === "up";
      setFeedback((prev) => {
        const next = { ...prev };
        if (next[key] === value) {
          delete next[key];
          voted = null; // toggled off — clear the server vote too
        } else {
          next[key] = value;
          toast({
            title: value === "up" ? "Thanks for the feedback! 🙌" : "Thanks — noted 📝",
            description:
              value === "up"
                ? "Glad K-AI helped. Karthik reads every recruiter conversation signal."
                : "K-AI keeps improving its answers from this.",
          });
        }
        try {
          if (Object.keys(next).length > 0) {
            localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
          } else {
            localStorage.removeItem(FEEDBACK_KEY);
          }
        } catch {
          /* ignore */
        }
        return next;
      });
      // sync the vote cross-visitor (fire-and-forget; response refreshes the badge)
      // include the visitor question + portfolio section it came from (owner stats)
      const qIdx = messages.findIndex(
        (m) => m.role === "assistant" && m.content === content
      );
      let question: string | undefined;
      for (let i = qIdx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          question = messages[i].content;
          break;
        }
      }
      void pushFeedbackVote(
        key,
        voted,
        question,
        askedSectionRef.current
      ).then((stats) => {
        if (stats) applyStats(stats, true);
      });
    },
    [toast, messages, applyStats]
  );

  const copyAnswer = useCallback(
    async (content: string) => {
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
      try {
        await navigator.clipboard.writeText(content);
      } catch {
        if (!legacyCopy()) {
          toast({
            title: "Couldn't copy",
            description: "Your browser blocked clipboard access.",
            variant: "destructive",
          });
          return;
        }
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
    },
    [toast]
  );

  // cancel any in-flight stream on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // voice input + TTS availability + cleanup
  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    if (listening) {
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
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
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0]?.transcript ?? "";
        }
        if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}`.slice(0, 500) : transcript));
      };
      recog.onerror = () => setListening(false);
      recog.onend = () => setListening(false);
      recog.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  // restore persisted conversation once on mount
  useEffect(() => {
    const saved = loadHistory();
    if (saved.length > 0) {
      setMessages([WELCOME, ...saved]);
    }
  }, []);

  // persist conversation whenever it changes (excluding the synthetic welcome)
  useEffect(() => {
    const real = messages.filter(
      (m) =>
        m !== WELCOME &&
        !(m.role === "assistant" && m.content === WELCOME.content)
    );
    try {
      if (real.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(real.slice(-30)));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* storage full / private mode — ignore */
    }
  }, [messages]);

  // auto-scroll on new messages & stream ticks
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, streamText, open]);

  // focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
      setShowNudge(false);
    }
  }, [open]);

  // proactive nudge — after 18s on site, if the visitor never chatted
  useEffect(() => {
    const timer = setTimeout(() => {
      const used = localStorage.getItem(STORAGE_KEY);
      if (!used && !open) setShowNudge(true);
    }, 18000);
    return () => clearTimeout(timer);
  }, [open]);

  // post-chat re-nudge — one time per session: if the visitor chatted,
  // closed the panel and stays idle, invite them back with a social-proof line
  useEffect(() => {
    if (open || askedCount === 0) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(RENUDGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (shown) return;
    const timer = setTimeout(() => {
      if (!open) {
        setShowNudge(true);
        try {
          sessionStorage.setItem(RENUDGE_KEY, "1");
        } catch {
          /* ignore */
        }
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [open, askedCount]);

  /** Fallback: classic non-streaming request */
  const sendNonStreaming = useCallback(
    async (history: Message[]) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    },
    []
  );

  /** Primary path: SSE streaming from /api/chat/stream */
  const sendStreaming = useCallback(
    async (history: Message[], onToken: (t: string) => void): Promise<string> => {
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
      let sawFirstToken = false;

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.startsWith("event:")) {
          if (trimmed.slice(6).trim() === "error") streamError = "K-AI hit a snag mid-stream.";
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
          if (delta) {
            if (!sawFirstToken) {
              sawFirstToken = true;
              setLoading(false);
              setStreaming(true);
            }
            full += delta;
            onToken(delta);
          }
        } catch {
          /* ignore malformed keep-alive lines */
        }
      };

      // Read loop with cross-chunk buffering
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? ""; // keep incomplete trailing line in buffer
        for (const line of parts) processLine(line);
      }
      if (buffer) processLine(buffer);

      if (streamError && full.length === 0) {
        throw new Error(streamError);
      }
      return full;
    },
    []
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || streaming) return;

      const history = messages.filter((m) => m !== WELCOME);
      const nextMessages: Message[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setError(null);
      setShowNudge(false);

      // social-proof counter: questions asked this visit (per-tab session)
      setAskedCount((n) => {
        const next = n + 1;
        try {
          sessionStorage.setItem(ASKED_COUNT_KEY, String(next));
        } catch {
          /* ignore */
        }
        return next;
      });

      const historyForApi = [...history, { role: "user" as const, content: trimmed }];

      try {
        let full = "";
        try {
          full = await sendStreaming(historyForApi, (t) =>
            setStreamText((prev) => prev + t)
          );
        } catch (streamErr) {
          // streaming failed before producing anything → classic fallback
          if (full.length === 0) {
            await sendNonStreaming(historyForApi);
          } else {
            throw streamErr;
          }
        }
        if (full.trim().length > 0) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: full },
          ]);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "K-AI is unavailable right now."
        );
      } finally {
        abortRef.current = null;
        setStreaming(false);
        setStreamText("");
        setLoading(false);
      }
    },
    [messages, loading, streaming, sendStreaming, sendNonStreaming]
  );

  // External "ask K-AI" hook — used by the command palette (⌘K)
  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent<{ question?: string }>).detail;
      onOpenChange(true);
      setShowNudge(false);
      if (detail?.question) {
        // slight delay so the panel can open first
        setTimeout(() => send(detail.question as string), 400);
      } else {
        setTimeout(() => inputRef.current?.focus(), 400);
      }
    };
    window.addEventListener("kai:ask", onAsk);
    return () => window.removeEventListener("kai:ask", onAsk);
  }, [send, onOpenChange]);

  /** Read an answer aloud with the browser's TTS (toggle: click again to stop) */
  const speakAnswer = useCallback(
    (content: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const key = feedbackKey(content);
      if (speakingKey === key) {
        window.speechSynthesis.cancel();
        setSpeakingKey(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        stripMarkdown(content).slice(0, 4000)
      );
      utter.rate = 1.02;
      utter.pitch = 1;
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.toLowerCase().startsWith("en"));
      if (voice) utter.voice = voice;
      utter.onend = () => setSpeakingKey((k) => (k === key ? null : k));
      utter.onerror = () => setSpeakingKey((k) => (k === key ? null : k));
      setSpeakingKey(key);
      window.speechSynthesis.speak(utter);
    },
    [speakingKey]
  );

  /** Copy the whole conversation as readable Q/A text (notes / email friendly) */
  const copyTranscript = useCallback(async () => {
    const real = messages.filter(
      (m) =>
        m !== WELCOME &&
        !(m.role === "assistant" && m.content === WELCOME.content)
    );
    if (real.length === 0) {
      toast({
        title: "Nothing to copy yet",
        description:
          "Ask K-AI a question first — the transcript copies once there's a conversation.",
      });
      return;
    }
    const exchanges = real.filter((m) => m.role === "user").length;
    const text = [
      "K-AI conversation — Karthik Easam portfolio",
      new Date().toLocaleString(),
      "",
      ...real.flatMap((m) =>
        m.role === "user"
          ? [`Q: ${m.content}`]
          : [`A: ${stripMarkdown(m.content)}`]
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast({
      title: "Transcript copied 📋",
      description: `${exchanges} Q&A exchange${exchanges === 1 ? "" : "s"} — paste it into your notes or an email.`,
    });
  }, [messages, toast]);

  const reset = () => {
    abortRef.current?.abort();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeakingKey(null);
    setMessages([WELCOME]);
    setError(null);
    setStreaming(false);
    setStreamText("");
    setLoading(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const showInitialChips = messages.length <= 1 && !loading && !streaming;
  const showFollowUps = messages.length > 2 && !loading && !streaming && !error;

  return (
    <>
      {/* proactive nudge bubble */}
      <AnimatePresence>
        {showNudge && !open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="no-print fixed bottom-[92px] right-4 z-[59] w-[min(300px,calc(100vw-64px))] md:right-6"
            role="status"
          >
            <div className="nudge-ring relative rounded-2xl rounded-br-md border border-primary/15 bg-white p-4 pr-8 shadow-2xl shadow-primary/20">
              <span aria-hidden className="nudge-tail" />
              <button
                onClick={() => setShowNudge(false)}
                aria-label="Dismiss K-AI suggestion"
                className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-[12.5px] font-semibold leading-relaxed text-foreground/85">
                  {askedCount > 0
                    ? `K-AI has answered ${askedCount} question${askedCount === 1 ? "" : "s"} this visit ✨ Ready to dig deeper?`
                    : NUDGE_TEXT}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(true)}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-3 py-2 text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02]"
              >
                {askedCount > 0
                  ? "Continue the conversation"
                  : "Chat with K-AI — it's instant"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating launcher */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 260, damping: 18 }}
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close K-AI assistant" : "Open K-AI assistant"}
        title={open ? "Close K-AI assistant" : "Ask K-AI anything about Karthik's resume"}
        className="no-print fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white shadow-2xl shadow-primary/40 transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <Bot className="h-7 w-7" />
              <span className="absolute inset-0 animate-pulse-ring rounded-full" />
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[8px] font-black ring-2 ring-white">
                AI
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label="K-AI chat assistant"
            className="no-print fixed bottom-[88px] right-4 z-[60] flex h-[min(620px,calc(100dvh-120px))] w-[min(420px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-primary/15 bg-white/95 shadow-2xl shadow-primary/25 backdrop-blur-xl md:right-6"
          >
            {/* header */}
            <div className="relative flex items-center justify-between gap-2 bg-gradient-to-r from-primary to-emerald-500 px-5 py-4 text-white">
              <div
                aria-hidden
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="relative flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-white/70" />
                </span>
                <div>
                  <p className="text-sm font-extrabold tracking-tight">
                    K-AI Resume Assistant
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-50/90">
                    {listening ? (
                      <>
                        <Mic className="h-3 w-3 animate-pulse text-amber-300" />
                        Listening… speak now
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                        Online · knows Karthik&apos;s full resume
                      </>
                    )}
                  </p>
                </div>
                <motion.span
                  key={sparkKey}
                  initial={{ scale: 1 }}
                  animate={sparkKey > 0 ? { scale: [1, 1.18, 1] } : undefined}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative ml-1 hidden shrink-0 sm:inline-flex"
                >
                  <BadgeSpark burstId={sparkKey} big={megaSpark} />
                  <span
                    title={
                      helpful.demo
                        ? "Visitors rate K-AI's answers — your 👍/👎 feedback updates this live"
                        : helpful.live
                          ? `Live across all visitors — based on ${helpful.total} rating${helpful.total === 1 ? "" : "s"}. Yours included!`
                          : `Based on your ${helpful.total} rating${helpful.total === 1 ? "" : "s"} this visit`
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tabular-nums tracking-tight backdrop-blur transition-colors hover:bg-white/30"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    {helpful.pct}% helpful
                  </span>
                </motion.span>
              </div>
              <div className="relative flex items-center gap-1.5">
                <button
                  onClick={() => void copyTranscript()}
                  aria-label="Copy conversation transcript"
                  title="Copy transcript"
                  className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"
                >
                  <ClipboardList className="h-4 w-4" />
                </button>
                <button
                  onClick={reset}
                  aria-label="Reset conversation"
                  title="Reset conversation"
                  className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              className="thin-scrollbar flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-secondary/25 to-white px-4 py-5"
            >
              {messages.map((m, i) => {
                const isWelcome =
                  m.role === "assistant" && m.content === WELCOME.content;
                const msgKey = feedbackKey(m.content);
                const msgFeedback = feedback[msgKey];
                return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <span className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div className={`max-w-[82%] ${m.role === "assistant" && !isWelcome ? "group/msg" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "chat-user rounded-br-md font-semibold"
                          : "rounded-bl-md border border-primary/10 bg-white text-foreground/90"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <>
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <span className="block [&>strong]:font-bold">{children}</span>
                              ),
                              ul: ({ children }) => (
                                <ul className="ml-3 list-disc space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="ml-3 list-decimal space-y-1">{children}</ol>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-primary underline underline-offset-2"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                          {/* live social proof under the welcome text —
                              kept OUT of WELCOME.content so storage filtering stays intact */}
                          {isWelcome && (
                            <LiveSocialProof variant="strip" stats={serverStats} />
                          )}
                        </>
                      ) : (
                        m.content
                      )}
                    </div>

                    {/* hover actions: copy + rate (committed answers only) */}
                    {m.role === "assistant" && !isWelcome && (
                      <div
                        className="mt-1 flex items-center gap-1 pl-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/msg:opacity-100 max-md:opacity-60"
                        role="group"
                        aria-label="Answer actions"
                      >
                        <button
                          onClick={() => copyAnswer(m.content)}
                          aria-label="Copy answer"
                          title="Copy answer"
                          className="msg-action grid h-6 w-6 place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-primary"
                        >
                          {copiedKey === msgKey ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {speechSupported && (
                          <button
                            onClick={() => speakAnswer(m.content)}
                            aria-label={
                              speakingKey === msgKey
                                ? "Stop reading aloud"
                                : "Read answer aloud"
                            }
                            aria-pressed={speakingKey === msgKey}
                            title={
                              speakingKey === msgKey
                                ? "Stop reading aloud"
                                : "Read aloud"
                            }
                            className={`msg-action grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-secondary ${
                              speakingKey === msgKey
                                ? "text-primary"
                                : "text-muted-foreground/70 hover:text-primary"
                            }`}
                          >
                            {speakingKey === msgKey ? (
                              <span
                                className="flex h-4 items-end gap-[2.5px]"
                                aria-hidden
                              >
                                <span className="eq-bar" style={{ animationDelay: "0s" }} />
                                <span className="eq-bar" style={{ animationDelay: "0.18s" }} />
                                <span className="eq-bar" style={{ animationDelay: "0.36s" }} />
                              </span>
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => rateAnswer(m.content, "up")}
                          aria-label="Helpful answer"
                          aria-pressed={msgFeedback === "up"}
                          title="Helpful"
                          className={`grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-secondary ${
                            msgFeedback === "up"
                              ? "text-emerald-500"
                              : "text-muted-foreground/70 hover:text-primary"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => rateAnswer(m.content, "down")}
                          aria-label="Not helpful"
                          aria-pressed={msgFeedback === "down"}
                          title="Not helpful"
                          className={`grid h-6 w-6 place-items-center rounded-md transition-colors hover:bg-secondary ${
                            msgFeedback === "down"
                              ? "text-amber-600"
                              : "text-muted-foreground/70 hover:text-primary"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        {msgFeedback && (
                          <span className="ml-1 text-[10px] font-bold text-muted-foreground/70">
                            {msgFeedback === "up" ? "Thanks!" : "Noted"}
                          </span>
                        )}
                        {speakingKey === msgKey && (
                          <span className="ml-1 text-[10px] font-bold text-primary/80">
                            Reading…
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}

              {/* typing indicator — only while waiting for the first token */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-primary/10 bg-white px-4 py-3.5 shadow-sm">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* streaming bubble — grows as tokens arrive */}
              {streaming && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <span className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  </span>
                  <div className="streaming-bubble max-w-[82%] rounded-2xl rounded-bl-md border border-primary/10 bg-white px-4 py-3 text-[13px] leading-relaxed text-foreground/90 shadow-sm">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <span className="block [&>strong]:font-bold">{children}</span>
                        ),
                        ul: ({ children }) => (
                          <ul className="ml-3 list-disc space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="ml-3 list-decimal space-y-1">{children}</ol>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-primary underline underline-offset-2"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {streamText}
                    </ReactMarkdown>
                    <span className="stream-caret" aria-hidden />
                  </div>
                </motion.div>
              )}

              {error && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* suggestion / follow-up chips */}
            {(showInitialChips || showFollowUps) && (
              <div className="flex flex-wrap gap-1.5 border-t border-primary/10 bg-white px-4 pt-3">
                {(showInitialChips ? initialChips : followUpChips).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className={`chip-shine rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                      i % 2 === 1
                        ? "border-amber-300/50 bg-amber-50/70 text-amber-800 hover:border-amber-400/70"
                        : "border-primary/15 bg-secondary/60 text-primary hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-primary/10 bg-white p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  listening
                    ? "Listening… speak now"
                    : `Ask about ${profile.firstName}'s experience…`
                }
                aria-label="Type your question for K-AI"
                className="h-11 flex-1 rounded-2xl border border-primary/15 bg-secondary/40 px-4 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10"
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                  aria-pressed={listening}
                  title={listening ? "Stop voice input" : "Ask with your voice"}
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition-all active:scale-95 ${
                    listening
                      ? "animate-pulse-ring border-amber-400/60 bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-400/40"
                      : "border-primary/15 bg-secondary/50 text-primary hover:border-primary/40 hover:bg-secondary hover:shadow-md"
                  }`}
                >
                  {listening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                </button>
              )}
              <button
                type="submit"
                disabled={loading || streaming || !input.trim()}
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <SendHorizonal className="h-4.5 w-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
