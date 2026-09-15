/**
 * Context-aware K-AI prompt sets, grounded in resume-data content.
 *
 * Keyed by section id — while a visitor reads a given section, K-AI
 * surfaces deep-dive questions scoped to what they're looking at
 * (hero prompt carousel + chat suggestion chips both consume this).
 */

export const SECTION_PROMPTS: Record<string, string[]> = {
  top: [
    "How does Karthik manage risk?",
    "Tell me about OfficeGX",
    "What is his leadership style?",
  ],
  about: [
    "What is Karthik's career story in one paragraph?",
    "What makes him different from other PMs?",
    "What are his biggest strengths?",
  ],
  expertise: [
    "How does he run RAID and stakeholder reporting?",
    "Describe his UAT and release-management process",
    "How does he coordinate distributed teams?",
  ],
  experience: [
    "What did he deliver as Executive Manager at RedandBlue?",
    "Tell me about his Genpact years and the GoDaddy account",
    "What is HST 550 and why does it matter?",
    "How did he grow from tester to manager?",
  ],
  projects: [
    "Walk me through the OfficeGX rollout",
    "How does eLegum serve legal teams?",
    "What is Smart FieldSheet?",
    "Compare his three flagship projects",
  ],
  products: [
    "Tour his IoT product portfolio — SmartPile, SmartWaterMonitor, SmartFieldSheet",
    "What did he own on SmartPile Inspector / Duplex?",
    "How did SmartFieldSheet / SmartDensity digitize field QA?",
    "Which domains do his IoT products serve?",
  ],
  highlights: [
    "What is his biggest professional win?",
    "How does he handle difficult stakeholders?",
  ],
  ai: [
    "How does Karthik use AI in delivery?",
    "Why does his portfolio have an AI assistant?",
  ],
  toolkit: [
    "What is his tech stack comfort zone?",
    "Which methodologies does he certified in?",
    "What did he study?",
  ],
  contact: [
    "What's the fastest way to reach Karthik?",
    "Is he open to relocation or remote roles?",
  ],
};

/** Stable base suggestion set for the chat (used as fallback / filler) */
export const BASE_SUGGESTIONS = [
  "Summarize Karthik's experience",
  "What projects has he delivered?",
  "How does he manage risk?",
  "What's the best way to contact him?",
];

/** Stable base follow-up set (fillers for post-answer chips) */
export const BASE_FOLLOW_UPS = [
  "Tell me about OfficeGX",
  "Has he worked with US stakeholders?",
  "What tools does he use?",
  "Describe his leadership style",
];

/**
 * Build a context-aware suggestion list for the current section:
 * up to 3 section-scoped prompts first (skipping any that duplicate
 * base items), then base suggestions to fill the remainder.
 */
export function contextualSuggestions(
  sectionId: string | undefined,
  max = 4
): string[] {
  const scoped = (sectionId && SECTION_PROMPTS[sectionId]) || [];
  const picked: string[] = [];
  for (const q of scoped) {
    if (picked.length >= max - 1) break;
    picked.push(q);
  }
  for (const q of BASE_SUGGESTIONS) {
    if (picked.length >= max) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return picked.slice(0, max);
}

/**
 * Context-aware FOLLOW-UP chips (shown after the first answer).
 * Deliberately differs from the initial chips: takes scoped prompts
 * from the tail of the section list, then fills with base follow-ups.
 */
export function contextualFollowUps(
  sectionId: string | undefined,
  max = 4
): string[] {
  const scoped = (sectionId && SECTION_PROMPTS[sectionId]) || [];
  const picked: string[] = [];
  for (let i = scoped.length - 1; i >= 0 && picked.length < 2; i--) {
    picked.push(scoped[i]);
  }
  for (const q of BASE_FOLLOW_UPS) {
    if (picked.length >= max) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return picked.slice(0, max);
}
