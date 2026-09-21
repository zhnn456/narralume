import { z } from "zod";

// ============ Karl Case Types ============

export const TrickCategorySchema = z.enum([
  "locked_room",
  "alibi",
  "identity",
  "time",
  "body",
  "clue",
  "red_herring",
  "locked_container",
  "impossible_disappearance",
  "poison",
  "staged_suicide",
  "false_identity",
  "time_swap",
  "mirror",
  "mechanical_device",
]);

export type TrickCategory = z.infer<typeof TrickCategorySchema>;

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["victim", "killer", "detective", "witness", "suspect", "accomplice"]),
  age: z.number().optional(),
  occupation: z.string().optional(),
  motive: z.string().optional(),
  alibi: z.string().optional(),
  secret: z.string().optional(),
  relationship: z.string().optional(),
});

export type Character = z.infer<typeof CharacterSchema>;

export const ClueSchema = z.object({
  id: z.string(),
  description: z.string(),
  chapter_revealed: z.number(),
  isKey: z.boolean().default(false),
  leadsTo: z.string().optional(),
  redHerring: z.boolean().default(false),
});

export type Clue = z.infer<typeof ClueSchema>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  time: z.string(),
  description: z.string(),
  isTruth: z.boolean().default(true),
  publicKnowledge: z.boolean().default(false),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const CaseProposalSchema = z.object({
  caseId: z.string(),
  title: z.string(),
  genre: z.string().default("honkaku"),
  setting: z.string(),
  era: z.string().optional(),
  coreTrick: z.string(),
  trickCategory: TrickCategorySchema,
  victim: CharacterSchema,
  killer: CharacterSchema,
  suspects: z.array(CharacterSchema),
  motive: z.string(),
  method: z.string(),
  alibi: z.string(),
  deathTime: string(),
  discoveredTime: string(),
  trueDeathTime: z.string().optional(),
  clues: z.array(ClueSchema),
  redHerrings: z.array(z.string()),
  timeline: z.array(TimelineEventSchema),
  breakthrough: z.string(),
  fairPlayScore: z.number().min(0).max(100).default(50),
  originalityScore: z.number().min(0).max(100).default(50),
  usedMechanisms: z.array(z.string()).default([]),
});

export type CaseProposal = z.infer<typeof CaseProposalSchema>;

export const FairPlayIssueSchema = z.object({
  severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]),
  category: z.enum([
    "premature_reveal",
    "missing_clue",
    "impossible_physics",
    "unfair_knowledge",
    "timeline_contradiction",
    "alibi_gap",
    "character_knowledge_violation",
    "last_minute_information",
  ]),
  message: z.string(),
  evidence: z.string().optional(),
  requiredFix: z.string().optional(),
});

export type FairPlayIssue = z.infer<typeof FairPlayIssueSchema>;

export const FairPlayReportSchema = z.object({
  caseId: z.string(),
  pass: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(FairPlayIssueSchema),
  recommendation: z.string(),
});

export type FairPlayReport = z.infer<typeof FairPlayReportSchema>;

export const IntentSchema = z.enum([
  "CREATE_CASE",
  "CREATE_OUTLINE",
  "WRITE_CHAPTER",
  "CONTINUE",
  "REWRITE",
  "EXPAND",
  "CONDENSE",
  "CHANGE_TRICK",
  "CHANGE_ALIBI",
  "CHANGE_KILLER",
  "CHANGE_MOTIVE",
  "CHANGE_LOCATION",
  "CHANGE_TIME",
  "CHANGE_BODY",
  "CHANGE_CLUE",
  "CHANGE_ENDING",
  "CHECK_LOGIC",
  "CHECK_FAIR_PLAY",
  "CHECK_CONTINUITY",
  "SHOW_CASE",
  "SHOW_TIMELINE",
  "SHOW_CLUES",
  "SHOW_CHARACTER",
  "SAVE_CANON",
]);

export type Intent = z.infer<typeof IntentSchema>;

export const CanonEntrySchema = z.object({
  canonId: z.string(),
  caseId: z.string(),
  title: z.string(),
  acceptedAt: z.string(),
  characters: z.array(CharacterSchema),
  locations: z.array(z.string()),
  timeline: z.array(TimelineEventSchema),
  usedTricks: z.array(TrickCategorySchema),
  deaths: z.array(z.string()),
  openLooseEnds: z.array(z.string()),
  worldState: z.record(z.string(), z.unknown()),
});

export type CanonEntry = z.infer<typeof CanonEntrySchema>;

export const MechanismRecordSchema = z.object({
  mechanismId: z.string(),
  caseId: z.string(),
  category: TrickCategorySchema,
  description: z.string(),
  corePrinciple: z.string(),
  firstUsed: z.string(),
});

export type MechanismRecord = z.infer<typeof MechanismRecordSchema>;
