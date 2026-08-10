import { z } from "zod"

import {
  AI_DEFAULT_MESSAGE_LIMIT,
  AI_MAX_MESSAGE_LIMIT,
} from "@/lib/ai/constants"

const limitField = z.number().int().min(1).max(AI_MAX_MESSAGE_LIMIT).optional()

const sinceField = z
  .string()
  .trim()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "since must be a valid ISO datetime",
  })

export const summarizeRequestSchema = z.object({
  limit: limitField,
})

export const catchUpRequestSchema = z.object({
  since: sinceField,
  limit: limitField,
})

export const askRequestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  limit: limitField,
  since: sinceField.optional(),
})

export const explainRequestSchema = z.object({
  messageId: z.string().trim().min(1),
})

export const draftReplyRequestSchema = z.object({
  tone: z.enum(["concise", "friendly", "formal"]).optional().default("concise"),
  limit: limitField,
})

export const notesRequestSchema = z.object({
  since: sinceField.optional(),
  limit: limitField.default(AI_DEFAULT_MESSAGE_LIMIT),
})

export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>
export type CatchUpRequest = z.infer<typeof catchUpRequestSchema>
export type AskRequest = z.infer<typeof askRequestSchema>
export type ExplainRequest = z.infer<typeof explainRequestSchema>
export type DraftReplyRequest = z.infer<typeof draftReplyRequestSchema>
export type NotesRequest = z.infer<typeof notesRequestSchema>
