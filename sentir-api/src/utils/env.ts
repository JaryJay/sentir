import { z } from "zod";

const processEnvSchema = z.strictObject({
  GEMINI_API_KEY: z.string(),
});

export const PROCESS_ENV = processEnvSchema.parse(process.env);
