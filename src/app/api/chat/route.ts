import { NextRequest, NextResponse } from "next/server";
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
  inspector: `* **SmartPile® Inspector / Duplex**\n  * **Product & Data:** An IoT-enabled pile-driving and integrity monitoring solution that uses audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting.\n  * **Karthik's Role:** Owned development and managed product requirements, the product roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.`,
  edc: `* **SmartPile® EDC**\n  * **Product & Data:** An embedded structural sensing solution that collects strain, temperature, and load-related data from piles and concrete structures for real-time structural monitoring and analysis.\n  * **Karthik's Role:** Coordinated sensor, wireless communication, data acquisition, and software integration.`,
  water: `* **SmartWaterMonitor**\n  * **Product & Data:** An IoT water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring for applications including dams, embankments, seepage, and geotechnical monitoring.\n  * **Karthik's Role:** Managed product requirements, integrations, testing, and deployment.`,
  field: `* **SmartFieldSheet / SmartDensity**\n  * **Product & Data:** A mobile field-data collection and reporting solution that wirelessly captures density-gauge data and streamlines QA/QC approvals, report generation, and client submission to replace manual field sheets, data entry, and reporting processes.\n  * **Karthik's Role:** Led product requirements, workflow digitization, testing, and field implementation.`,
};

function exactProductAnswer(question: string): string | null {
  const q = question.toLowerCase();
  if (!/smartpile|smartwatermonitor|smartfieldsheet|smartdensity|iot product|iot products/.test(q)) return null;
  const answers: string[] = [];
  if (q.includes("smartpile") && (q.includes("inspector") || q.includes("duplex"))) answers.push(EXACT_PRODUCT_ANSWERS.inspector);
  if (q.includes("smartpile edc") || q.includes("edc")) answers.push(EXACT_PRODUCT_ANSWERS.edc);
  if (q.includes("smartwatermonitor")) answers.push(EXACT_PRODUCT_ANSWERS.water);
  if (q.includes("smartfieldsheet") || q.includes("smartdensity")) answers.push(EXACT_PRODUCT_ANSWERS.field);
  if (answers.length === 0) return `Karthik owned/managed four IoT and digital infrastructure products built from scratch across construction and geotechnical domains. The documented products are SmartPile® Inspector / Duplex, SmartPile® EDC, SmartWaterMonitor, and SmartFieldSheet / SmartDensity.`;
  return answers.join("\n\n");
}

const SYSTEM_PROMPT = `You are "K-AI", the AI career assistant embedded in ${profile.name}'s interactive portfolio website. You answer questions ABOUT ${profile.name} (Karthik) for visitors such as recruiters, hiring managers, and clients.

STRICT RULES:
1. Base your answers ONLY on the resume and dedicated product knowledge provided below. Never invent experience, companies, dates, product capabilities, technologies, or numbers.
2. For IoT product questions, use the dedicated IoT Product Knowledge as the primary source and give specific product-by-product answers when relevant.
3. Clearly distinguish Karthik's role from product capabilities. Do not claim he personally engineered every component.
4. If asked about something not covered, say honestly that it is not specified on the resume.
5. Keep answers concise and scannable: short paragraphs or bullet points.
6. Do not use sales-style calls to action unless specifically requested.
7. Refer to Karthik in third person.

When the application provides an exact product answer before calling Gemini, preserve that answer verbatim. Do not rewrite or expand it.

CONTACT INFO: Email ${profile.email} | Phone ${profile.phone} | LinkedIn ${profile.linkedin} | Location ${profile.location}

=== KARTHIK EASAM'S RESUME ===
${resumeFullText}
=== END OF RESUME ===
${PRODUCT_KNOWLEDGE}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function geminiReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const merged: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  for (const m of messages) {
    const role = m.role === "assistant" ? "model" : "user";
    const last = merged[merged.length - 1];
    if (last && last.role === role) last.parts[0].text += "\n\n" + m.content;
    else merged.push({ role, parts: [{ text: m.content }] });
  }
  while (merged.length > 0 && merged[0].role === "model") merged.shift();

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: merged, generationConfig: { temperature: 0.1, maxOutputTokens: 1400 } }),
  });
  if (!res.ok) {
    const errorBody = (await res.text()).slice(0, 2000);
    console.error("Gemini API diagnostic:", { status: res.status, model, body: errorBody });
    throw new Error(`Gemini ${res.status}`);
  }
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const sanitized = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") return NextResponse.json({ error: "A non-empty user message is required." }, { status: 400 });

    const deterministicAnswer = exactProductAnswer(sanitized[sanitized.length - 1].content);
    if (deterministicAnswer) return NextResponse.json({ reply: deterministicAnswer });

    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "K-AI is not configured yet. Please add GEMINI_API_KEY in Vercel." }, { status: 503 });

    const reply = await geminiReply(sanitized);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[/api/chat] Gemini error:", error);
    return NextResponse.json({ error: "K-AI is momentarily offline. Please try again in a few seconds." }, { status: 502 });
  }
}
