import { NextRequest } from "next/server";
import { profile, resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRODUCT_KNOWLEDGE = `
=== AUTHORITATIVE KARTHIK IoT PRODUCT KNOWLEDGE ===
Use ONLY these resume-backed facts for product questions. Do not add capabilities, technologies, integrations, or outcomes that are not stated here.

SMARTPILE® INSPECTOR / DUPLEX
- Product: IoT-enabled pile-driving and integrity monitoring solution.
- Technology/data: audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting.
- Karthik's role: owned development; managed product requirements, roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.

SMARTPILE® EDC
- Product: embedded structural sensing solution.
- Data: strain, temperature, and load-related data from piles and concrete structures.
- Karthik's role: coordinated sensor, wireless communication, data acquisition, and software integration for real-time structural monitoring and analysis.

SMARTWATERMONITOR
- Product: IoT water-level and pressure monitoring solution.
- Technology/data: sensors, cellular connectivity, cloud data, alerts, and remote monitoring.
- Applications: dams, embankments, seepage, and geotechnical monitoring.
- Karthik's role: managed product requirements, integrations, testing, and deployment.

SMARTFIELDSHEET / SMARTDENSITY
- Product: mobile field-data collection and reporting solution.
- Data/workflow: wirelessly captured density-gauge data; streamlined QA/QC approvals, report generation, and client submission.
- Karthik's role: led product requirements, workflow digitization, testing, and field implementation to replace manual field sheets, data entry, and reporting.

OVERALL PORTFOLIO
Karthik owned/managed four IoT and digital infrastructure products built from scratch, spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting, and real-time monitoring across construction and geotechnical domains.
=== END AUTHORITATIVE PRODUCT KNOWLEDGE ===`;

const EXACT_PRODUCT_ANSWERS = {
  inspector: `* **SmartPile® Inspector / Duplex**
  * **Product & Data:** An IoT-enabled pile-driving and integrity monitoring solution that uses audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting.
  * **Karthik's Role:** Owned development and managed product requirements, the product roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.`,
  edc: `* **SmartPile® EDC**
  * **Product & Data:** An embedded structural sensing solution that collects strain, temperature, and load-related data from piles and concrete structures for real-time structural monitoring and analysis.
  * **Karthik's Role:** Coordinated sensor, wireless communication, data acquisition, and software integration.`,
  water: `* **SmartWaterMonitor**
  * **Product & Data:** An IoT water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring for applications including dams, embankments, seepage, and geotechnical monitoring.
  * **Karthik's Role:** Managed product requirements, integrations, testing, and deployment.`,
  field: `* **SmartFieldSheet / SmartDensity**
  * **Product & Data:** A mobile field-data collection and reporting solution that wirelessly captures density-gauge data and streamlines QA/QC approvals, report generation, and client submission to replace manual field sheets, data entry, and reporting processes.
  * **Karthik's Role:** Led product requirements, workflow digitization, testing, and field implementation.`,
};

function exactProductAnswer(question: string): string | null {
  const q = question.toLowerCase();
  const wantsProductInfo = /smartpile|smartwatermonitor|smartfieldsheet|smartdensity|iot product|iot products/.test(q);
  if (!wantsProductInfo) return null;

  const answers: string[] = [];
  if (q.includes("smartpile") && (q.includes("inspector") || q.includes("duplex"))) answers.push(EXACT_PRODUCT_ANSWERS.inspector);
  if (q.includes("smartpile edc") || q.includes("edc")) answers.push(EXACT_PRODUCT_ANSWERS.edc);
  if (q.includes("smartwatermonitor")) answers.push(EXACT_PRODUCT_ANSWERS.water);
  if (q.includes("smartfieldsheet") || q.includes("smartdensity")) answers.push(EXACT_PRODUCT_ANSWERS.field);

  if (answers.length === 0) {
    return `Karthik owned/managed four IoT and digital infrastructure products built from scratch across construction and geotechnical domains. The documented products are SmartPile® Inspector / Duplex, SmartPile® EDC, SmartWaterMonitor, and SmartFieldSheet / SmartDensity.`;
  }
  return answers.join("\n\n");
}

const SYSTEM_PROMPT = `You are K-AI, the AI career assistant embedded in ${profile.name}'s interactive portfolio website. You answer questions ABOUT ${profile.name} for recruiters, hiring managers, and clients.

SOURCE ACCURACY IS THE HIGHEST PRIORITY.
1. Base answers only on the resume and the authoritative product knowledge below. Never invent, embellish, or infer undocumented facts.
2. Treat the product knowledge as an exact fact sheet. Prefer its wording over general model knowledge.
3. NEVER combine SmartPile Inspector / Duplex and SmartPile EDC into one product description unless the visitor explicitly asks for a combined overview.
4. If multiple products are named, answer EACH named product separately.
5. For each named product, use this order: product name -> documented purpose/data -> Karthik's documented role.
6. Preserve source terminology exactly where practical. Do not paraphrase a product capability into a different technology or workflow.
7. Do not assign portfolio-level capabilities to an individual product.
8. SmartPile EDC must mention that it collects strain, temperature, and load-related data from piles AND concrete structures when that product is discussed.
9. SmartWaterMonitor must use the documented terms sensors, cellular connectivity, cloud data, alerts, and remote monitoring, and may mention dams, embankments, seepage, and geotechnical monitoring.
10. SmartFieldSheet / SmartDensity should mention density-gauge data and, when explaining its workflow, QA/QC approvals, report generation, and client submission.
11. Distinguish Karthik's product ownership/management from engineering implementation.
12. If the source does not answer something, say it is not specified on the resume rather than guessing.
13. Keep answers concise and complete. No unnecessary introduction, sales pitch, follow-up question, or call-to-action.
14. Do not output Markdown links for contact information.
15. Refer to Karthik in third person.

IMPORTANT: When the application provides an exact product answer before calling Gemini, preserve that answer verbatim. Do not rewrite, summarize, expand, or add a call-to-action.

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

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string" &&
        (m as ChatMessage).content.trim().length > 0
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

function response(body: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(sseChunk(body)));
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
}

export async function POST(req: NextRequest) {
  let sanitized: ChatMessage[] = [];

  try {
    const body = await req.json();
    sanitized = sanitizeMessages(body?.messages);
  } catch {
    // handled below
  }

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return new Response(JSON.stringify({ error: "A non-empty user message is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const question = sanitized[sanitized.length - 1].content;
  const deterministicAnswer = exactProductAnswer(question);
  if (deterministicAnswer) return response(deterministicAnswer);

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  if (!apiKey) {
    return response("K-AI is not configured yet. Please add GEMINI_API_KEY in Vercel Environment Variables.");
  }

  const contents = sanitized.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.1, maxOutputTokens: 1400 },
        }),
      }
    );

    if (!upstream.ok) {
      const detail = (await upstream.text().catch(() => "")).slice(0, 2000);
      console.error("[/api/chat/stream] Gemini error:", upstream.status, model, detail);
      return response("K-AI is momentarily offline. Please try again in a few seconds.");
    }

    const data = (await upstream.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };

    const candidate = data.candidates?.[0];
    const answer = candidate?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";

    if (!answer) {
      console.error("[/api/chat/stream] Gemini returned empty answer", { model, finishReason: candidate?.finishReason });
      return response("K-AI returned an empty response. Please try again.");
    }

    return response(answer);
  } catch (error) {
    console.error("[/api/chat/stream] upstream error:", error);
    return response("K-AI is momentarily offline. Please try again in a few seconds.");
  }
}
