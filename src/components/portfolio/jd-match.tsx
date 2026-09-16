"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Loader2, Sparkles, UploadCloud, XCircle } from "lucide-react";
import { SectionHeading } from "./section-heading";

type Result = {
  overall: number;
  scores: Record<string, number>;
  whyKarthik: string[];
  strongMatches: string[];
  partialMatches: string[];
  gaps: string[];
};

const labels: Record<string, string> = {
  skills: "Skills",
  experience: "Experience",
  responsibilities: "Responsibilities",
  technology: "Technology",
  industry: "Industry / Domain",
  qualifications: "Qualifications",
};

export function JdMatch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch("/api/jd-match", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <section id="jd-match" className="relative overflow-hidden py-14 md:py-20 scroll-mt-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/70 via-transparent to-secondary/25" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl rounded-3xl border border-amber-200/70 bg-white/80 p-4 text-center shadow-sm backdrop-blur md:p-5">
          <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">For recruiters & hiring managers</p>
          <p className="mt-1 text-sm font-semibold text-foreground/80">Have a role in mind? Upload the JD and instantly see how it aligns with Karthik&apos;s resume.</p>
        </div>
        <SectionHeading eyebrow="AI Career Match" title="Drop a JD." highlight="See the fit." description="Upload a job description and AI will compare it with Karthik's resume, showing the evidence, strongest matches, and gaps." />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] border border-primary/10 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8">
            <div onClick={() => inputRef.current?.click()} className="cursor-pointer rounded-3xl border-2 border-dashed border-primary/20 bg-secondary/25 p-8 text-center transition-colors hover:border-primary/40 hover:bg-secondary/45">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/25"><UploadCloud className="h-6 w-6" /></span>
              <h3 className="mt-4 text-lg font-extrabold">Upload Job Description</h3>
              <p className="mt-1 text-sm text-muted-foreground">PDF or TXT · up to 8 MB</p>
              <input ref={inputRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} />
            </div>

            {file && <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/10 bg-white p-3"><FileText className="h-5 w-5 text-primary" /><span className="min-w-0 flex-1 truncate text-sm font-bold">{file.name}</span><button type="button" onClick={() => setFile(null)} aria-label="Remove file"><XCircle className="h-5 w-5 text-muted-foreground" /></button></div>}
            {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <button disabled={!file || loading} onClick={analyze} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing JD…</> : <><Sparkles className="h-4 w-4" /> Analyze Match</>}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">The score reflects resume-to-JD alignment, not a hiring decision.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="min-h-[360px] rounded-[2rem] border border-primary/10 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8">
            {!result && !loading && <div className="grid h-full min-h-[320px] place-items-center text-center"><div><Sparkles className="mx-auto h-9 w-9 text-primary/40" /><p className="mt-4 text-lg font-extrabold">Your match report will appear here</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Upload a JD to see the overall match, category scores, evidence, and gaps.</p></div></div>}
            {loading && <div className="grid h-full min-h-[320px] place-items-center text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" /><p className="mt-4 font-extrabold">Comparing the JD with Karthik's resume…</p></div>}
            {result && <div>
              <div className="flex flex-wrap items-center gap-5 border-b border-primary/10 pb-6">
                <div className="grid h-28 w-28 place-items-center rounded-full border-8 border-secondary bg-white shadow-inner"><span className="text-3xl font-black text-primary">{result.overall}%</span></div>
                <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Overall match</p><h3 className="mt-1 text-2xl font-black">Resume ↔ JD alignment</h3></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Object.entries(result.scores).map(([key, value]) => <div key={key} className="rounded-2xl bg-secondary/35 p-3"><div className="flex justify-between text-xs font-extrabold"><span>{labels[key] || key}</span><span>{value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>)}
              </div>
              <ReportList title="Why Karthik matches" items={result.whyKarthik} icon="check" />
              <ReportList title="Strong matches" items={result.strongMatches} icon="check" />
              {result.partialMatches.length > 0 && <ReportList title="Partial matches" items={result.partialMatches} icon="partial" />}
              {result.gaps.length > 0 && <ReportList title="Gaps / not found in resume" items={result.gaps} icon="gap" />}
            </div>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ReportList({ title, items, icon }: { title: string; items: string[]; icon: "check" | "partial" | "gap" }) {
  const Icon = icon === "check" ? CheckCircle2 : XCircle;
  return <div className="mt-6"><h4 className="text-sm font-extrabold">{title}</h4><div className="mt-2 space-y-2">{items.slice(0, 6).map((item, i) => <div key={`${item}-${i}`} className="flex gap-2 text-sm leading-relaxed text-muted-foreground"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon === "gap" ? "text-amber-500" : "text-primary"}`} />{item}</div>)}</div></div>;
}
