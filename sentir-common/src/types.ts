import { z } from "zod";

export const PromptRequest = z.object({
  inputText: z.string(),
  url: z.string().url(),
  label: z.string().nullish(),
  placeholder: z.string().nullish(),
  surroundingText: z.array(z.string()),
});
export type PromptRequest = z.infer<typeof PromptRequest>;

export const InsertCompletion = z.object({
  completionType: z.literal("insert"),
  textToInsert: z.string().min(1),
  // Index to insert the text at
  index: z.number().int().nonnegative(),
});
export type InsertCompletion = z.infer<typeof InsertCompletion>;

export const ReplaceCompletion = z.object({
  completionType: z.literal("replace"),
  // Index to start replacing
  index: z.number().int().nonnegative(),
  // Index to end replacing (exclusive)
  endIndex: z.number().int().nonnegative(),
  // Text to replace with. If empty, the text will be deleted and no new text will be inserted.
  textToInsert: z.string(),
});
export type ReplaceCompletion = z.infer<typeof ReplaceCompletion>;

export const NoopCompletion = z.object({
  // If there's nothing to change
  completionType: z.literal("noop"),
});
export type NoopCompletion = z.infer<typeof NoopCompletion>;

export const Completion = z.discriminatedUnion("completionType", [
  InsertCompletion,
  ReplaceCompletion,
  NoopCompletion,
]);
export type Completion = z.infer<typeof Completion>;

export const CompletionsResponse = z.object({
  completions: z.array(Completion),
  timestamp: z.number().int().nonnegative(),
});
export type CompletionsResponse = z.infer<typeof CompletionsResponse>;
