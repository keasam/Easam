import { NextRequest } from "next/server";
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

function openAIChunk(content: string) {
  return `data: ${JSON.stringify({
    id: "gemini-stream",
    object: "chat.completion.chunk",
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  })}\n\n`;
}

function doneChunk() {
  return `data: ${JSON.stringify({
    id: "gemini-stream",
    object: "chat.completion.chunk",
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
  })}\n\ndata: [DONE]\n\n`;
}

export async function POST(req: NextRequest) {
  let sanitized: ChatMessage[];

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

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({
        error: "K-AI is not configured yet. Please add GEMINI_API_KEY in Vercel Environment Variables.",
      })}\n\n`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      }
    );
  }

  const contents = sanitized.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 500,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("[/api/chat/stream] Gemini error:", upstream.status, detail);
      throw new Error("Gemini request failed");
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(streamController) {
        let buffer = "";
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n");
            buffer = events.pop() ?? "";

            for (const line of events) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload) continue;

              try {
                const parsed = JSON.parse(payload) as {
                  candidates?: { content?: { parts?: { text?: string }[] } }[];
                };
                const text = parsed.candidates?.[0]?.content?.parts
                  ?.map((part) => part.text ?? "")
                  .join("") ?? "";
                if (text) streamController.enqueue(encoder.encode(openAIChunk(text)));
              } catch {
                // Ignore incomplete/non-JSON SSE lines.
              }
            }
          }

          streamController.enqueue(encoder.encode(doneChunk()));
          streamController.close();
        } catch (error) {
          console.error("[/api/chat/stream] Gemini stream error:", error);
          streamController.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: "K-AI is momentarily offline. Please try again in a few seconds.",
              })}\n\n`
            )
          );
          streamController.close();
        } finally {
          clearTimeout(timeout);
        }
      },
      cancel() {
        clearTimeout(timeout);
        reader.cancel().catch(() => undefined);
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    clearTimeout(timeout);
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
}
