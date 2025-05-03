import { z } from "zod";

export const PromptRequest = z.object({
  inputText: z.string(),
  url: z.string().url(),
  label: z.string().nullish(),
  placeholder: z.string().nullish(),
  surroundingText: z.array(z.string()),
});
export type PromptRequest = z.infer<typeof PromptRequest>;

export const CompletionsResponse = z.object({
  completions: z.array(z.string()),
  timestamp: z.number().int().nonnegative(),
});
export type CompletionsResponse = z.infer<typeof CompletionsResponse>;
