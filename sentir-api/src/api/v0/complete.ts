import { GoogleGenAI, Type } from "@google/genai";
import { PROCESS_ENV } from "@/utils/env";
import { options } from "@/utils/options";
import { CompletionsResponse, PromptRequest } from "sentir-common";

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

const ai = new GoogleGenAI({ apiKey: PROCESS_ENV.GEMINI_API_KEY });
const cache = await ai.caches.create({
  model: "gemini-2.0-flash-lite",
  config: {
    systemInstruction: SYSTEM_INSTRUCTION,
    ttl: "43200s",
  },
});

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

  // TODO: Use cached system instruction
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: prompt,
    config: {
      candidateCount: 2,
      cachedContent: cache.name,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          completionType: {
            type: Type.STRING,
            description:
              "The type of completion to perform. If the completion only adds to the current text, use 'insert'. If the completion replaces a part of the current text, use 'replace'.",
            enum: ["insert", "replace"],
          },
          textToReplace: {
            type: Type.STRING,
            description:
              "The text to replace. Only present if completionType is 'replace'.",
            example: "w",
            nullable: true,
          },
          completion: {
            type: Type.STRING,
            description: "The completion to perform",
            example: "a few words",
          },
        },
      },
    },
  });

  if (!response.text) {
    return new Response(JSON.stringify({ error: "No response from AI" }), {
      status: 500,
    });
  }

  console.dir(response, { depth: null });

  const rawCompletions = response.candidates
    ?.map((c) => c.content?.parts?.map((p) => p.text)?.join(""))
    .filter((s) => s !== undefined) ?? [response.text];

  // The LLM will often add an unecessary \n on the end
  // This is a hack to remove that (but only 1 instance because sometimes you actually want to enter newlines)
  const completions = rawCompletions.map((text) =>
    text.endsWith("\n") ? text.slice(0, text.length - 1) : text
  );

  return new Response(
    JSON.stringify({ completions, timestamp } satisfies CompletionsResponse),
    { status: 200 }
  );
}

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
