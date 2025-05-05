import { GoogleGenAI } from "@google/genai";
import { PROCESS_ENV } from "@/utils/env";
import { options } from "@/utils/options";
import { CompletionsResponse, PromptRequest } from "sentir-common";

const ai = new GoogleGenAI({ apiKey: PROCESS_ENV.GEMINI_API_KEY });

async function complete(req: Request): Promise<Response> {
  const parsed = PromptRequest.safeParse(await req.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    });
  }
  const request: PromptRequest = parsed.data;

  const prompt = constructPrompt(request);

  const timestamp = Date.now();

  // Call ollama local server
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: prompt,
    config: {
      candidateCount: 2,
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  if (!response.text) {
    return new Response(JSON.stringify({ error: "No response from AI" }), {
      status: 500,
    });
  }

  console.dir(response, { depth: null });

  const completions = response.candidates
    ?.map((c) => c.content?.parts?.map((p) => p.text)?.join(""))
    .filter((s) => s !== undefined) ?? [response.text];

  return new Response(
    JSON.stringify({ completions, timestamp } satisfies CompletionsResponse),
    { status: 200 }
  );
}

const SYSTEM_INSTRUCTION = `
You are an intelligent form completion assistant, similar to GitHub Copilot or Cursor IDE.
Given the following context of a web page and the current content of an input/textarea field, predict the most likely word or phrase the user will type to complete the field.
You are allowed to modify the current field value, for example to fix typos.
Do not enclose the completion in quotes. Output the ENTIRE completion as a string.
For example, if the current field value is "howw to ceter a" and the site is Stack Overflow, the completion should be "how to center a div".
As another example, if the current field value is "Asus" and the site is Amazon, the completion should be "Asus laptop", not just "laptop".
Similarly, if the current field value is "how" and the site is Google, the completion should be "how to", not just "to".
A final example, if the current field value is "hel", the completion should be "hello". Do not just output "lo".
You do not have to complete a lot of words. Even just the next 1 or 2 words are enough.
Do not output a newline character at the end, unless you are sure it is part of the completion.
`;

function constructPrompt(request: PromptRequest) {
  return `
Context:
- URL: ${request.url}
${
  request.surroundingText.length
    ? `- Surrounding text: ${request.surroundingText.join(", ")}`
    : ""
}
${request.label ? `- Field label: ${request.label}` : ""}
${request.placeholder ? `- Placeholder text: ${request.placeholder}` : ""}
- Current field value: "${request.inputText}"

Prediction:
`;
}

export default {
  post: complete,
  options: options("POST", "OPTIONS"),
};
