import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// NOTE: uses lib/db's schema-fingerprint refresh — picks up newly pushed
// Prisma columns (like `question`) without a dev-server restart.

/**
 * Cross-visitor K-AI feedback aggregate.
 *
 * GET  /api/feedback
 *      → { total, up, pct }  (pct null when no ratings yet)
 * GET  /api/feedback?detailed=1
 *      → aggregate + { down, recent: last 10 votes } (owner stats view)
 *
 * POST /api/feedback  { visitorId, messageKey, helpful: boolean | null, question?, section? }
 *      helpful=true|false → upsert this visitor's vote for the answer
 *      helpful=null       → clear the vote (visitor toggled it off)
 *      question           → optional visitor question that led to the answer
 *                           (truncated to 200 chars, stored for owner stats)
 *      section            → optional portfolio section id the question came
 *                           from ("projects", "experience"…) — powers the
 *                           per-area 👍 breakdown in owner stats
 *
 * Votes are anonymous: visitorId is a random UUID kept in localStorage.
 */
export async function GET(req: Request) {
  try {
    const detailed = new URL(req.url).searchParams.has("detailed");
    const [total, up, recent, bySection] = await Promise.all([
      db.kaiFeedback.count(),
      db.kaiFeedback.count({ where: { helpful: true } }),
      detailed
        ? db.kaiFeedback.findMany({
            orderBy: { updatedAt: "desc" },
            take: 10,
            select: {
              helpful: true,
              messageKey: true,
              question: true,
              updatedAt: true,
            },
          })
        : Promise.resolve([]),
      detailed
        ? db.kaiFeedback.groupBy({
            by: ["section"],
            _count: { _all: true },
            where: { section: { not: null } },
          })
        : Promise.resolve([]),
    ]);
    // per-section 👍 counts (only sections with at least one vote)
    const sectionUps = detailed
      ? await Promise.all(
          bySection.map((g) =>
            db.kaiFeedback.count({
              where: { section: g.section, helpful: true },
            })
          )
        )
      : [];
    const sections = detailed
      ? bySection
          .map((g, i) => ({
            section: (g.section ?? "unknown").slice(0, 40),
            total: g._count._all,
            up: sectionUps[i],
          }))
          .sort((a, b) => b.up - a.up || b.total - a.total)
      : undefined;
    return NextResponse.json({
      total,
      up,
      down: detailed ? total - up : undefined,
      pct: total > 0 ? Math.round((up / total) * 100) : null,
      recent: detailed
        ? recent.map((r) => ({
            helpful: r.helpful,
            question: r.messageKey.slice(0, 60),
            asked: r.question ?? undefined,
            at: r.updatedAt.toISOString(),
          }))
        : undefined,
      sections,
    });
  } catch (e) {
    console.error("[/api/feedback] GET failed:", e);
    return NextResponse.json(
      { error: "Could not load feedback stats." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      visitorId?: string;
      messageKey?: string;
      helpful?: boolean | null;
      question?: string;
      section?: string;
    };

    const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : "";
    const messageKey = typeof body.messageKey === "string" ? body.messageKey.slice(0, 120) : "";
    if (!visitorId || !messageKey) {
      return NextResponse.json(
        { error: "visitorId and messageKey are required." },
        { status: 400 }
      );
    }
    const question =
      typeof body.question === "string" && body.question.trim().length > 0
        ? body.question.trim().slice(0, 200)
        : null;
    const section =
      typeof body.section === "string" && body.section.trim().length > 0
        ? body.section.trim().slice(0, 40)
        : null;

    if (body.helpful === null || body.helpful === undefined) {
      await db.kaiFeedback.deleteMany({ where: { visitorId, messageKey } });
      // fall through to return fresh aggregate
    } else {
      await db.kaiFeedback.upsert({
        where: { visitorId_messageKey: { visitorId, messageKey } },
        update: { helpful: body.helpful, question, section },
        create: { visitorId, messageKey, helpful: body.helpful, question, section },
      });
    }

    const [total, up] = await Promise.all([
      db.kaiFeedback.count(),
      db.kaiFeedback.count({ where: { helpful: true } }),
    ]);
    return NextResponse.json({
      total,
      up,
      pct: total > 0 ? Math.round((up / total) * 100) : null,
    });
  } catch (e) {
    console.error("[/api/feedback] POST failed:", e);
    return NextResponse.json(
      { error: "Could not save feedback." },
      { status: 500 }
    );
  }
}
