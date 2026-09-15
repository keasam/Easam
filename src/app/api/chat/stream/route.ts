import { NextRequest } from "next/server";
import { profile, resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRODUCT_KNOWLEDGE = `
=== KARTHIK'S IoT & DIGITAL INFRASTRUCTURE PRODUCTS ===
These are authoritative resume-backed facts. When a visitor asks about these products, answer specifically and completely.

SmartPile® Inspector / Duplex: Karthik owned development of an IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting. He managed product requirements, roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.

SmartPile® EDC: Karthik managed an embedded structural sensing solution collecting strain, temperature, and load-related data from piles and concrete structures. He coordinated sensor, wireless communication, data acquisition, and software integration for real-time structural monitoring and analysis.

SmartWaterMonitor: Karthik owned an IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring. He managed product requirements, integrations, testing, and deployment for dams, embankments, seepage, and geotechnical monitoring applications.

SmartFieldSheet / SmartDensity: Karthik managed a mobile field-data collection and reporting solution that wirelessly captured density-gauge data and streamlined QA/QC approvals, report generation, and client submission. He led product requirements, workflow digitization, testing, and field implementation to replace manual field sheets, data entry, and reporting processes.

Overall IoT portfolio: Karthik owned/managed four IoT and digital infrastructure products built from scratch, spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting, and real-time monitoring across construction and geotechnical domains.
=== END IoT PRODUCT KNOWLEDGE ===`;

const SYSTEM_PROMPT = `You are "K-AI", the AI career assistant embedded in ${profile.name}'s interactive portfolio website. You answer questions ABOUT ${profile.name} (Karthik) for recruiters, hiring managers, and clients.

STRICT RULES:
1. Base answers ONLY on the resume and dedicated product knowledge below. Never invent experience, companies, dates, capabilities, technologies, or numbers.
2. The dedicated IoT Product Knowledge is authoritative for SmartPile, SmartPile Inspector / Duplex, SmartPile EDC, SmartWaterMonitor, SmartFieldSheet, and SmartDensity.
3. If the visitor names multiple products, cover EVERY named product. Never collapse multiple named products into one generic portfolio sentence.
4. For each product, state: product name -> what it does -> Karthik's ownership/management role. Clearly distinguish his product role from the underlying engineering implementation.
5. Keep answers concise but complete, normally under 220 words. Do not stop after the first product.
6. Use bullets or short paragraphs. Do not use headers.
7. If something is not covered, say it is not on the resume instead of guessing.
8. Refer to Karthik in third person and use a professional, confident tone.

CONTACT INFO: Email ${profile.email} | Phone ${profile.phone} | LinkedIn ${profile.linkedin} | Location ${profile.location}

=== KARTHIK EASAM'S RESUME ===
${resumeFullText}
=== END OF RESUME ===

${PRODUCT_KNOWLEDGE}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function sseChunk(content: string) {
  return `data: ${JSON.stringify({
    id: "gemini-stream",
    object: "chat.completion.chunk",
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  })}\n\n`;
}

function sseDone() {
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
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
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
    return new Response(`event: error\ndata: ${JSON.stringify({ error: "K-AI is not configured yet. Please add GEMINI_API_KEY in Vercel Environment Variables." })}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
    });
  }

  const contents = sanitized.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  try {
    // Deliberately use Gemini's complete-response API here. The browser still
    // receives SSE, but we no longer depend on Gemini's upstream SSE framing.
    // This prevents partial answers caused by chunk/event parsing or proxy buffering.
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
        }),
      }
    );

    if (!upstream.ok) {
      const detail = (await upstream.text().catch(() => "")).slice(0, 2000);
      console.error("[/api/chat/stream] Gemini error:", upstream.status, model, detail);
      return new Response(`event: error\ndata: ${JSON.stringify({ error: "K-AI is momentarily offline. Please try again in a few seconds." })}\n\n`, {
        status: 200,
        headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
      });
    }

    const data = (await upstream.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };
    const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";

    if (!answer) {
      console.error("[/api/chat/stream] Gemini returned empty answer", { model, finishReason: data.candidates?.[0]?.finishReason });
      return new Response(`event: error\ndata: ${JSON.stringify({ error: "K-AI returned an empty response. Please try again." })}\n\n`, {
        status: 200,
        headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(sseChunk(answer)));
        controller.enqueue(encoder.encode(sseDone()));
        controller.close();
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
    console.error("[/api/chat/stream] upstream error:", error);
    return new Response(`event: error\ndata: ${JSON.stringify({ error: "K-AI is momentarily offline. Please try again in a few seconds." })}\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
    });
  }
}
