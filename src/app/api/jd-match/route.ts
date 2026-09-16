import { NextResponse } from "next/server";
import { resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FALLBACK_MODEL = "gemini-3.5-flash";
const MAX_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 35_000;
const MAX_RETRIES = 3;

const SYSTEM_PROMPT = `You are a recruitment resume-to-job-description matching assistant for Karthik Easam. Compare the supplied job description ONLY against the authoritative resume below. Do not invent experience, skills, employers, certifications, metrics, education, or achievements. Treat synonymous wording as a possible match only when the underlying capability is clearly supported. Return JSON only.

Score the overall alignment from 0-100 based on evidence in the resume. Also score skills, experience, responsibilities, technology, industry/domain, and qualifications separately. A missing requirement must reduce the relevant score. Explain the strongest evidence and the main gaps. The section called whyKarthik should explain why the resume aligns with this particular JD using concrete evidence; do not claim certainty about hiring decisions.

Resume:\n${resumeFullText}`;

function cleanJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) return candidate.slice(start, end + 1);
  return candidate;
}

function normalizeResult(value: unknown) {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const rawScores = (input.scores && typeof input.scores === "object" ? input.scores : {}) as Record<string, unknown>;
  const number = (v: unknown) => Math.max(0, Math.min(100, Number(v) || 0));
  const list = (v: unknown) => Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 12) : [];
  const scores = {
    skills: number(rawScores.skills),
    experience: number(rawScores.experience),
    responsibilities: number(rawScores.responsibilities),
    technology: number(rawScores.technology),
    industry: number(rawScores.industry),
    qualifications: number(rawScores.qualifications),
  };
  const calculatedOverall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);
  return {
    overall: number(input.overall) || calculatedOverall,
    scores,
    whyKarthik: list(input.whyKarthik),
    strongMatches: list(input.strongMatches),
    partialMatches: list(input.partialMatches),
    gaps: list(input.gaps),
  };
}

function fallbackAnalyze(jdText: string) {
  const resume = resumeFullText.toLowerCase();
  const jd = jdText.toLowerCase();
  const terms = Array.from(new Set(jd.match(/[a-z][a-z0-9+#.-]{2,}/g) || []))
    .filter((t) => !new Set(["the", "and", "for", "with", "that", "this", "from", "you", "your", "are", "will", "our", "job", "role", "years", "work", "team", "have", "has", "who", "their", "they", "into", "about", "can", "all", "not", "but", "its", "our"]).has(t));
  const matched = terms.filter((t) => resume.includes(t));
  const ratio = terms.length ? matched.length / terms.length : 0;
  const overall = Math.round(Math.max(20, Math.min(95, ratio * 100)));
  const highlights = matched.slice(0, 8).map((t) => `Resume evidence includes “${t}”.`);
  const gaps = terms.filter((t) => !resume.includes(t)).slice(0, 8).map((t) => `The resume does not explicitly mention “${t}”.`);
  const scores = {
    skills: overall,
    experience: overall,
    responsibilities: overall,
    technology: overall,
    industry: overall,
    qualifications: overall,
  };
  return {
    overall,
    scores,
    whyKarthik: ["AI analysis service was temporarily unavailable, so this result uses a conservative local text-evidence comparison against the stored resume."],
    strongMatches: highlights,
    partialMatches: [],
    gaps,
  };
}

async function callGemini(model: string, parts: Array<Record<string, unknown>>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let lastError = "";
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
              maxOutputTokens: 3000,
            },
          }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
          if (!text) throw new Error("Gemini returned an empty response");
          return normalizeResult(JSON.parse(cleanJson(text)));
        }

        const detail = await response.text();
        lastError = `HTTP ${response.status}: ${detail.slice(0, 500)}`;
        if (![408, 429, 500, 502, 503, 504].includes(response.status)) break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = 800 * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(lastError || "Gemini request failed");
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const pasted = form.get("text");

    let jdText = typeof pasted === "string" ? pasted.trim() : "";
    let mimeType = "text/plain";
    let base64 = "";

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Please upload a JD smaller than 8 MB." }, { status: 413 });
      }
      mimeType = file.type || "application/pdf";
      const allowed = ["application/pdf", "text/plain"];
      if (!allowed.includes(mimeType)) {
        return NextResponse.json({ error: "For uploaded files, use PDF or TXT. DOC/DOCX should be pasted as text for the most reliable analysis." }, { status: 400 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      base64 = bytes.toString("base64");
    }

    if (!jdText && !base64) {
      return NextResponse.json({ error: "Upload a JD or paste its text." }, { status: 400 });
    }

    const parts: Array<Record<string, unknown>> = [];
    if (base64) parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
    if (jdText) parts.push({ text: `JOB DESCRIPTION TEXT:\n${jdText}` });
    parts.push({ text: `Analyze this JD against Karthik's resume. Return exactly this JSON shape:\n{"overall":number,"scores":{"skills":number,"experience":number,"responsibilities":number,"technology":number,"industry":number,"qualifications":number},"whyKarthik":[string],"strongMatches":[string],"partialMatches":[string],"gaps":[string]}` });

    try {
      const result = await callGemini(PRIMARY_MODEL, parts);
      return NextResponse.json(result);
    } catch (primaryError) {
      console.error("JD match primary Gemini attempt failed:", primaryError);
      if (FALLBACK_MODEL !== PRIMARY_MODEL) {
        try {
          const result = await callGemini(FALLBACK_MODEL, parts);
          return NextResponse.json(result);
        } catch (fallbackError) {
          console.error("JD match fallback Gemini attempt failed:", fallbackError);
        }
      }

      // Never make the feature unusable just because Gemini is temporarily unavailable.
      // Return a conservative local comparison with the same response shape expected by the UI.
      return NextResponse.json(fallbackAnalyze(jdText), { headers: { "X-JD-Match-Fallback": "local" } });
    }
  } catch (error) {
    console.error("/api/jd-match failed:", error);
    return NextResponse.json({ error: "Could not analyze this job description. Please paste the JD text and try again." }, { status: 500 });
  }
}
