"use client";

import { useEffect, useState } from "react";
import {
  fetchFeedbackAggregate,
  type FeedbackAggregate,
} from "@/lib/kai-feedback-client";

// module-level cache — one aggregate fetch per page load, shared by
// every LiveSocialProof consumer (AI section, future surfaces)
let cache: Promise<FeedbackAggregate | null> | null = null;

function loadAggregate() {
  cache ??= fetchFeedbackAggregate();
  return cache;
}

/**
 * Read-only snapshot of the cross-visitor feedback aggregate.
 * (The chat widget keeps its own live-updating state — pass it as a prop
 * to LiveSocialProof instead of using this hook there.)
 */
export function useFeedbackAggregate(): FeedbackAggregate | null {
  const [stats, setStats] = useState<FeedbackAggregate | null>(null);

  useEffect(() => {
    let mounted = true;
    loadAggregate().then((s) => {
      if (mounted && s) setStats(s);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return stats;
}
