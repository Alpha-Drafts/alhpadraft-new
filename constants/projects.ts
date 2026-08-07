export const PROJECT_STATUS_OPTIONS = [
  "draft",
  "completed",
  // "uploading",
  // "analysing",
  // "reviewing",
] as const;

export const PROJECT_TYPES = [
  "essay",
  "research_paper",
  "case_study",
  "literature_review",
  "thesis",
  "dissertation",
  "report",
  "proposal",
  "other",
] as const;

export const AI_THRESHOLD = 20; // Sentences above this are considered AI-generated
