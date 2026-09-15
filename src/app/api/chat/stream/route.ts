import { NextRequest } from "next/server";
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

export async function POST(req: NextRequest) {
  let sanitized: { role: "user" | "assistant"; content: string }[];

  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    sanitized = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  } catch {
    sanitized = [];
  }

  if (
    sanitized.length === 0 ||
    sanitized[sanitized.length - 1].role !== "user"
  ) {
    return new Response(
      JSON.stringify({ error: "A non-empty user message is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let upstream: ReadableStream<Uint8Array> | null = null;

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        ...sanitized,
      ],
      stream: true,
      thinking: { type: "disabled" },
    });

    if (completion && typeof completion.getReader === "function") {
      upstream = completion as ReadableStream<Uint8Array>;
    } else {
      // SDK returned a full JSON object instead of a stream — wrap it as one SSE event
      const reply =
        (completion as { choices?: { message?: { content?: string } }[] })
          ?.choices?.[0]?.message?.content ?? "";
      const payload = `data: ${JSON.stringify({
        id: "wrapped",
        object: "chat.completion.chunk",
        choices: [{ index: 0, delta: { content: reply }, finish_reason: "stop" }],
      })}\n\ndata: [DONE]\n\n`;
      upstream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(payload));
          controller.close();
        },
      });
    }
  } catch (error) {
    console.error("[/api/chat/stream] upstream error:", error);
    const payload = `event: error\ndata: ${JSON.stringify({
      error: "K-AI is momentarily offline. Please try again in a few seconds.",
    })}\n\n`;
    return new Response(payload, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // Pipe the upstream OpenAI-style SSE straight through to the client
  return new Response(upstream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
