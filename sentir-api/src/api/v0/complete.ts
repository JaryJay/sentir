import { GoogleGenAI } from "@google/genai";
import { PROCESS_ENV } from "@/utils/env";
import { options } from "@/utils/options";
import { CompletionResponse, PromptRequest } from "sentir-common";

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
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  if (!response.text) {
    return new Response(JSON.stringify({ error: "No response from AI" }), {
      status: 500,
    });
  }
  return new Response(
    JSON.stringify({
      completion: response.text,
      timestamp,
    } satisfies CompletionResponse),
    { status: 200 }
  );
}

const SYSTEM_PROMPT = `
You are an intelligent form completion assistant, similar to GitHub Copilot or Cursor IDE.
Given the following context of a web page and the current content of an input/textarea field, predict the most likely next word or phrase the user will type to complete the field.
Provide only the single most probable completion. Do not enclose the completion in quotes. Output the entire completion as a string.
For example, if the current field value is "howw to ceter a" and the site is Stack Overflow, the completion should be "how to center a div".
As another example, if the current field value is "Asus" and the site is Amazon, the completion should be "Asus laptop". Note that the completion should include the "Asus" part.
Similarly, if the current field value is "how" and the site is Google, the completion should be "how to". Note that the completion should include the "how" part.
A final example, if the current field value is "hel", the completion should be "hello". Do not just output "lo".
`;

function constructPrompt(request: PromptRequest) {
  return `
${SYSTEM_PROMPT}

The user's cursor position is at the ${
    request.cursorPosition
  }th character of the input/textarea.

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

Prediction (as a reminder, do NOT just include the end of the completion, but the entire string which often includes the current field value):
`;
}

export default {
  post: complete,
  options: options("POST", "OPTIONS"),
};
