import { z } from "zod";

const processEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
});

export const PROCESS_ENV = processEnvSchema.parse(process.env);
