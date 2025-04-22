import { z } from "zod";

export const promptSchema = z.object({
  inputText: z.string(),
  url: z.string().url(),
  cursorPosition: z.number().int().nonnegative(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  surroundingText: z.array(z.string()),
});

export type PromptData = z.infer<typeof promptSchema>;
