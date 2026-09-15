import { NextRequest } from "next/server";
import { profile, resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRODUCT_KNOWLEDGE = `
=== KARTHIK'S IoT & DIGITAL INFRASTRUCTURE PRODUCTS ===
These are authoritative resume-backed facts. When a visitor asks about any of these products, answer specifically from this section.

SmartPile® Inspector / Duplex: Karthik owned development of an IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting. He managed product requirements, roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.

SmartPile® EDC: Karthik managed an embedded structural sensing solution collecting strain, temperature, and load-related data from piles and concrete structures. He coordinated sensor, wireless communication, data acquisition, and software integration for real-time structural monitoring and analysis.

SmartWaterMonitor: Karthik owned an IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring. He managed product requirements, integrations, testing, and deployment for dams, embankments, seepage, and geotechnical monitoring applications.

SmartFieldSheet / SmartDensity: Karthik managed a mobile field-data collection and reporting solution that wirelessly captured density-gauge data and streamlined QA/QC approvals, report generation, and client submission. He led product requirements, workflow digitization, testing, and field implementation to replace manual field sheets, data entry, and reporting processes.

Overall IoT portfolio: Karthik owned/managed four IoT and digital infrastructure products built from scratch, spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting, and real-time monitoring across construction and geotechnical domains.
=== END IoT PRODUCT KNOWLEDGE ===`;

const SYSTEM_PROMPT = `You are "K-AI", the AI career assistant embedded in ${profile.name}'s interactive portfolio website. You answer questions ABOUT ${profile.name} (Karthik) for recruiters, hiring managers, and clients.

STRICT RULES:
1. Base answers ONLY on the resume and dedicated product knowledge below. Never invent experience, companies, dates, capabilities, technologies, or numbers.
2. The dedicated IoT Product Knowledge is authoritative for SmartPile, SmartPile Inspector / Duplex, SmartPile EDC, SmartWaterMonitor, SmartFieldSheet, and SmartDensity. If the visitor names multiple products, cover EACH named product rather than collapsing the answer into a generic statement.
3. For product questions, start with the product name and explain what the product does, then briefly state Karthik's ownership/management role. Clearly distinguish his role from the engineering implementation.
4. If asked about something not covered, say honestly that it is not on the resume and suggest contacting Karthik at ${profile.email} or ${profile.phone}.
5. Keep answers concise and scannable: bullets or short paragraphs, normally under 180 words unless the visitor asks for depth.
6. Use a warm, professional, confident tone and refer to Karthik in third person.
7. Do not use headers. Light markdown is allowed.
8. For unrelated questions, politely steer back to Karthik's career profile.

CONTACT INFO: Email ${profile.email} | Phone ${profile.phone} | LinkedIn ${profile.linkedin} | Location ${profile.location}

=== KARTHIK EASAM'S RESUME ===
${resumeFullText}
=== END OF RESUME ===

${PRODUCT_KNOWLEDGE}`;

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
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    sanitized = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  } catch {
    sanitized = [];
  }

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return new Response(JSON.stringify({ error: "A non-empty user message is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  if (!apiKey) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ error: "K-AI is not configured yet. Please add GEMINI_API_KEY in Vercel Environment Variables." })}\n\n`,
      { status: 200, headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } }
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
          generationConfig: { temperature: 0.25, maxOutputTokens: 700 },
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
                const parsed = JSON.parse(payload) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
                const text = parsed.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
                if (text) streamController.enqueue(encoder.encode(openAIChunk(text)));
              } catch {
                // Ignore malformed SSE lines.
              }
            }
          }
          streamController.enqueue(encoder.encode(doneChunk()));
          streamController.close();
        } catch (error) {
          console.error("[/api/chat/stream] Gemini stream error:", error);
          streamController.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "K-AI is momentarily offline. Please try again in a few seconds." })}\n\n`));
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
    return new Response(`event: error\ndata: ${JSON.stringify({ error: "K-AI is momentarily offline. Please try again in a few seconds." })}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
    });
  }
}
