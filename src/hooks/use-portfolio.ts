"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Typewriter effect that cycles through a list of phrases.
 */
export function useTypewriter(
  phrases: string[],
  typeSpeed = 55,
  deleteSpeed = 28,
  pauseMs = 1600
) {
  const [state, setState] = useState({ text: "", index: 0, deleting: false });

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[state.index % phrases.length];

    // All state updates happen inside timeouts — never synchronously.
    let delay: number;
    let action: () => void;

    if (!state.deleting && state.text === current) {
      // finished typing → pause, then start deleting
      delay = pauseMs;
      action = () => setState((s) => ({ ...s, deleting: true }));
    } else if (state.deleting && state.text === "") {
      // finished deleting → move to next phrase
      delay = 60;
      action = () =>
        setState((s) => ({
          ...s,
          deleting: false,
          index: (s.index + 1) % phrases.length,
        }));
    } else {
      delay = state.deleting ? deleteSpeed : typeSpeed;
      action = () =>
        setState((s) => {
          const cur = phrases[s.index % phrases.length];
          return {
            ...s,
            text: s.deleting
              ? cur.slice(0, Math.max(0, s.text.length - 1))
              : cur.slice(0, s.text.length + 1),
          };
        });
    }

    const timeout = setTimeout(action, delay);
    return () => clearTimeout(timeout);
  }, [state, phrases, typeSpeed, deleteSpeed, pauseMs]);

  return state.text;
}

/**
 * Animated counter that counts from 0 to `target` when the element enters view.
 */
export function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return { ref, value };
}

/**
 * Progressive "AI typing" of a long block of text when it scrolls into view.
 */
export function useInViewTyping(fullText: string, cps = 60, startDelay = 300) {
  const [visibleChars, setVisibleChars] = useState(0);
  const ref = useRef<HTMLParagraphElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          let chars = 0;
          const interval = setInterval(() => {
            chars += Math.max(1, Math.round(cps / 30));
            setVisibleChars(Math.min(chars, fullText.length));
            if (chars >= fullText.length) clearInterval(interval);
          }, 33);
          // small initial delay
          setVisibleChars(0);
          setTimeout(() => {}, startDelay);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fullText, cps, startDelay]);

  return { ref, visible: fullText.slice(0, visibleChars), done: visibleChars >= fullText.length };
}
