/*
 * Note: these are types for only the API, and not used by the frontend.
 * If you want to define a type that is used by both the API and the frontend, define it in sentir-common.
 */

import { z } from "zod";

export const RawCompletionResponse = z.discriminatedUnion("completionType", [
  z.object({
    completionType: z.literal("insert"),
    completion: z.string(),
  }),
  z.object({
    completionType: z.literal("replace"),
    textToReplace: z.string(),
    completion: z.string(),
  }),
  z.object({
    completionType: z.literal("noop"),
  }),
]);
export type RawCompletionResponse = z.infer<typeof RawCompletionResponse>;
