import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { profile, resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are "K-AI", the AI career assistant embedded in ${profile.name}'s interactive portfolio website. You answer questions ABOUT ${profile.name} (Karthik) for visitors such as recruiters, hiring managers, and clients.

STRICT RULES:
1. Base your answers ONLY on the resume provided below. Never invent experience, companies, dates, or numbers that are not in the resume.
2. If asked about something not covered in the resume (e.g., salary expectations, specific certifications not listed), say honestly that it is not on the resume and suggest contacting Karthik directly at ${profile.email} or ${profile.phone}.
3. Keep answers concise and scannable: short paragraphs or bullet points (max ~120 words unless the visitor asks for depth).
4. Use a warm, professional, confident tone. Refer to Karthik in third person ("Karthik leads...", "He owns...").
5. You may lightly format with markdown (bold, bullets). Do not use headers.
6. If a visitor asks something unrelated to Karthik's career, politely steer back to his profile.
7. When it fits naturally, end with a subtle call-to-action like suggesting they reach out via email or LinkedIn.

CONTACT INFO YOU CAN SHARE: Email ${profile.email} | Phone ${profile.phone} | LinkedIn ${profile.linkedin} | Location ${profile.location}

=== KARTHIK EASAM'S RESUME ===
${resumeFullText}
=== END OF RESUME ===`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Google Gemini bridge (used when GEMINI_API_KEY is set).
 * Lets the site be self-hosted anywhere with a free key from
 * https://aistudio.google.com/apikey — no sandbox SDK required.
 */
async function geminiReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY as string;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Gemini requires contents to start with "user" and not repeat roles —
  // merge consecutive same-role turns and drop a leading assistant turn.
  const merged: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  for (const m of messages) {
    const role = m.role === "assistant" ? "model" : "user";
    const last = merged[merged.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += "\n\n" + m.content;
    } else {
      merged.push({ role, parts: [{ text: m.content }] });
    }
  }
  while (merged.length > 0 && merged[0].role === "model") merged.shift();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: merged,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini ${res.status} — check GEMINI_API_KEY / model name`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
    "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    // Validate and sanitize incoming messages
    const sanitized = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-12) // keep context window manageable
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (
      sanitized.length === 0 ||
      sanitized[sanitized.length - 1].role !== "user"
    ) {
      return NextResponse.json(
        { error: "A non-empty user message is required." },
        { status: 400 }
      );
    }

    let reply = "";
    const providerLog: string[] = [];

    // 1) Preferred: owner's own free Gemini key (self-hosted deployments).
    if (process.env.GEMINI_API_KEY) {
      try {
        reply = await geminiReply(sanitized);
        providerLog.push("gemini:ok");
      } catch (err) {
        console.error("[/api/chat] Gemini failed, falling back:", err);
        providerLog.push("gemini:fail");
      }
    }

    // 2) Fallback: Z.ai backend (used in this sandbox; also a safety net).
    if (!reply.trim()) {
      try {
        const zai = await ZAI.create();
        const completion = await zai.chat.completions.create({
          messages: [{ role: "assistant", content: SYSTEM_PROMPT }, ...sanitized],
          thinking: { type: "disabled" },
        });
        reply = completion.choices[0]?.message?.content || "";
        providerLog.push("z-ai:ok");
      } catch (err) {
        console.error("[/api/chat] Z.ai failed:", err);
        providerLog.push("z-ai:fail");
      }
    }

    console.log(`[/api/chat] providers: ${providerLog.join(" -> ") || "none"}`);

    if (!reply.trim()) {
      return NextResponse.json(
        { error: "K-AI is momentarily offline. Please try again in a few seconds." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (error) {
    console.error("[/api/chat] error:", error);
    return NextResponse.json(
      {
        error:
          "K-AI is momentarily offline. Please try again in a few seconds.",
      },
      { status: 500 }
    );
  }
}
