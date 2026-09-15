"use client";

import { useSyncExternalStore } from "react";

export interface PlatformKeys {
  /** Mac / Apple device detection */
  isMac: boolean;
  /** "⌘K" on Apple devices, "Ctrl K" on Windows / Linux */
  comboK: string;
  /** "⌘P" on Apple devices, "Ctrl P" on Windows / Linux */
  comboP: string;
}

const noopSubscribe = () => () => {};
const getClientIsMac = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
const getServerIsMac = () => false;

/**
 * Detects the visitor's platform so keyboard-shortcut labels match what
 * actually works on their machine (Cmd on macOS, Ctrl on Windows/Linux).
 *
 * Uses useSyncExternalStore: hydration-safe (server snapshot renders the
 * Windows label; Apple devices reconcile to ⌘ immediately after mount
 * without a setState-in-effect cascade).
 */
export function usePlatformKeys(): PlatformKeys {
  const isMac = useSyncExternalStore(noopSubscribe, getClientIsMac, getServerIsMac);
  return {
    isMac,
    comboK: isMac ? "⌘K" : "Ctrl K",
    comboP: isMac ? "⌘P" : "Ctrl P",
  };
}
