import { NextResponse } from "next/server";
import { resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_BYTES = 8 * 1024 * 1024;

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
      const allowed = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
      if (!allowed.includes(mimeType)) {
        return NextResponse.json({ error: "Supported formats: PDF, DOC, DOCX, or TXT." }, { status: 400 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      base64 = bytes.toString("base64");
    }

    if (!jdText && !base64) {
      return NextResponse.json({ error: "Upload a job description or paste its text." }, { status: 400 });
    }

    const parts: Array<Record<string, unknown>> = [];
    if (base64) parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
    if (jdText) parts.push({ text: `JOB DESCRIPTION TEXT:\n${jdText}` });
    parts.push({ text: `Analyze this JD against Karthik's resume. Return exactly this JSON shape:\n{\"overall\":number,\"scores\":{\"skills\":number,\"experience\":number,\"responsibilities\":number,\"technology\":number,\"industry\":number,\"qualifications\":number},\"whyKarthik\":[string],\"strongMatches\":[string],\"partialMatches\":[string],\"gaps\":[string]}` });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY || "")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("JD match Gemini error:", detail);
      return NextResponse.json({ error: "AI analysis is temporarily unavailable. Please try again." }, { status: 502 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
    const result = JSON.parse(cleanJson(text));
    return NextResponse.json(result);
  } catch (error) {
    console.error("/api/jd-match failed:", error);
    return NextResponse.json({ error: "Could not analyze this job description." }, { status: 500 });
  }
}
