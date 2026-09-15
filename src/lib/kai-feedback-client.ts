"use client";

/**
 * Client side of the cross-visitor K-AI feedback feature.
 * Anonymous visitor identity: a random UUID persisted in localStorage.
 */

const VISITOR_KEY = "kai-visitor-id-v1";

export interface FeedbackAggregate {
  total: number;
  up: number;
  pct: number | null;
}

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/** Fetch the all-visitor aggregate (null on any failure — caller falls back to local stats) */
export async function fetchFeedbackAggregate(): Promise<FeedbackAggregate | null> {
  try {
    const res = await fetch("/api/feedback", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as FeedbackAggregate;
    if (typeof data.total !== "number" || typeof data.up !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export interface FeedbackDetailed extends FeedbackAggregate {
  down?: number;
  recent?: { helpful: boolean; question: string; asked?: string; at: string }[];
  sections?: { section: string; total: number; up: number }[];
}

/** Owner view: aggregate + down-count + last 10 votes (for the ⌘K stats action) */
export async function fetchFeedbackDetailed(): Promise<FeedbackDetailed | null> {
  try {
    const res = await fetch("/api/feedback?detailed=1", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as FeedbackDetailed;
    if (typeof data.total !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Push a vote (or clear it with helpful=null) and get back the fresh aggregate.
 * `question` is the visitor question that led to the answer (optional, stored
 * truncated for the owner stats). `section` is the portfolio area the question
 * was asked from ("projects"…) — powers the per-area breakdown. Both optional;
 * fire-and-forget friendly — never throws.
 */
export async function pushFeedbackVote(
  messageKey: string,
  helpful: boolean | null,
  question?: string,
  section?: string
): Promise<FeedbackAggregate | null> {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        messageKey,
        helpful,
        question: question?.slice(0, 200),
        section: section?.slice(0, 40),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FeedbackAggregate;
    if (typeof data.total !== "number" || typeof data.up !== "number") return null;
    return data;
  } catch {
    return null;
  }
}
