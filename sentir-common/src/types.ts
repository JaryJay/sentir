import { z } from "zod";

export const PromptRequest = z.object({
  inputText: z.string(),
  url: z.string().url(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  surroundingText: z.array(z.string()),
});
export type PromptRequest = z.infer<typeof PromptRequest>;

export const CompletionResponse = z.object({
  completion: z.string(),
  timestamp: z.number().int().nonnegative(),
});
export type CompletionResponse = z.infer<typeof CompletionResponse>;
