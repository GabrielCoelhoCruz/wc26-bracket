import { z } from "zod"

const MAX_PREDICTIONS = 64
const MAX_OWNER_NAME = 64
const MAX_MATCH_ID_LEN = 32
const MAX_TEAM_CODE_LEN = 4

const teamCodeSchema = z
  .string()
  .min(2)
  .max(MAX_TEAM_CODE_LEN)
  .regex(/^[A-Z0-9]+$/)

const predictionEntrySchema = z.object({
  winner: teamCodeSchema,
  homeScore: z.number().int().min(0).max(99).optional(),
  awayScore: z.number().int().min(0).max(99).optional(),
})

export const sharePostBodySchema = z.object({
  predictions: z
    .record(z.string().max(MAX_MATCH_ID_LEN), predictionEntrySchema)
    .refine(
      (predictions) => Object.keys(predictions).length <= MAX_PREDICTIONS,
      { message: `At most ${MAX_PREDICTIONS} predictions allowed` },
    ),
  ownerName: z.string().trim().max(MAX_OWNER_NAME).optional(),
  locale: z.string().max(10).optional(),
})

export type SharePostBody = z.infer<typeof sharePostBodySchema>
