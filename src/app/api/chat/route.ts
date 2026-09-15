import { NextRequest, NextResponse } from "next/server";
import { profile, resumeFullText } from "@/lib/resume-data";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRODUCT_KNOWLEDGE = `
=== KARTHIK'S IoT & DIGITAL INFRASTRUCTURE PRODUCTS ===
Use these resume-backed facts when visitors ask about SmartPile, SmartPile Inspector, SmartPile EDC, SmartWaterMonitor, SmartFieldSheet, or SmartDensity. Do not replace them with generic product descriptions.

SmartPile® Inspector / Duplex: Karthik owned development of an IoT-enabled pile-driving and integrity monitoring solution using audio and embedded sensors for real-time data capture, blow counting, driving-stress monitoring, and automated reporting. He managed product requirements, roadmap, cross-functional delivery, testing, and field deployment across hardware, software, cloud, and engineering teams.

SmartPile® EDC: Karthik managed an embedded structural sensing solution collecting strain, temperature, and load-related data from piles and concrete structures. He coordinated sensor, wireless communication, data acquisition, and software integration for real-time structural monitoring and analysis.

SmartWaterMonitor: Karthik owned an IoT-based water-level and pressure monitoring solution integrating sensors, cellular connectivity, cloud data management, alerts, and remote monitoring. He managed product requirements, integrations, testing, and deployment for dams, embankments, seepage, and geotechnical monitoring applications.

SmartFieldSheet / SmartDensity: Karthik managed a mobile field-data collection and reporting solution that wirelessly captured density-gauge data and streamlined QA/QC approvals, report generation, and client submission. He led product requirements, workflow digitization, testing, and field implementation to replace manual field sheets, data entry, and reporting processes.

Overall IoT portfolio: Karthik owned/managed four IoT and digital infrastructure products built from scratch, spanning embedded sensors, hardware, wireless connectivity, mobile applications, cloud platforms, analytics, automated reporting, and real-time monitoring across construction and geotechnical domains.
=== END IoT PRODUCT KNOWLEDGE ===`;

const SYSTEM_PROMPT = `You are "K-AI", the AI career assistant embedded in ${profile.name}'s interactive portfolio website. You answer questions ABOUT ${profile.name} (Karthik) for visitors such as recruiters, hiring managers, and clients.

STRICT RULES:
1. Base your answers ONLY on the resume and dedicated product knowledge provided below. Never invent experience, companies, dates, product capabilities, technologies, or numbers.
2. For IoT product questions, especially SmartPile, SmartPile Inspector / Duplex, SmartPile EDC, SmartWaterMonitor, SmartFieldSheet, or SmartDensity, use the dedicated IoT Product Knowledge as the primary source and give specific product-by-product answers when relevant.
3. Clearly distinguish Karthik's role from product capabilities. Say what Karthik owned, managed, coordinated, or led; do not claim he personally engineered every hardware/software component.
4. If asked about something not covered in the resume or product knowledge, say honestly that it is not on the resume and suggest contacting Karthik directly at ${profile.email} or ${profile.phone}.
5. Keep answers concise and scannable: short paragraphs or bullet points (max ~160 words unless the visitor asks for depth).
6. Use a warm, professional, confident tone. Refer to Karthik in third person ("Karthik leads...", "He owns...").
7. You may lightly format with markdown (bold, bullets). Do not use headers.
8. If a visitor asks something unrelated to Karthik's career, politely steer back to his profile.
9. When it fits naturally, end with a subtle call-to-action like suggesting they reach out via email or LinkedIn.

CONTACT INFO YOU CAN SHARE: Email ${profile.email} | Phone ${profile.phone} | LinkedIn ${profile.linkedin} | Location ${profile.location}

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
    const errorBody = (await res.text()).slice(0, 2000);
    console.error("Gemini API diagnostic:", { status: res.status, model, body: errorBody });
    throw new Error(`Gemini ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
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

    if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
      return NextResponse.json({ error: "A non-empty user message is required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "K-AI is not configured yet. Please add GEMINI_API_KEY in Vercel." }, { status: 503 });
    }

    const reply = await geminiReply(sanitized);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[/api/chat] Gemini error:", error);
    return NextResponse.json({ error: "K-AI is momentarily offline. Please try again in a few seconds." }, { status: 502 });
  }
}
