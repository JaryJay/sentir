import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { PROCESS_ENV } from "@/utils/env";
import { options } from "@/utils/options";
import { Completion, CompletionsResponse, PromptRequest } from "sentir-common";
import { RawCompletionResponse } from "@/types";

const ai = new GoogleGenAI({ apiKey: PROCESS_ENV.GEMINI_API_KEY });
const systemInstruction = await Bun.file("./res/system_instruction.md").text();
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    completionType: {
      type: Type.STRING,
      description:
        "The type of completion to perform. If the completion only adds to the current text, use 'insert'. If the completion replaces a part of the current text, use 'replace'. If there's nothing to change, use 'noop'.",
      enum: ["insert", "replace", "noop"],
    },
    textToReplace: {
      type: Type.STRING,
      description:
        "The text to replace. Only present if completionType is 'replace'.",
      example: "w",
    },
    completion: {
      type: Type.STRING,
      description:
        "The completion to perform. Only present if completionType is 'insert' or 'replace'.",
      example: "a few words",
      maxLength: "30",
    },
  },
  required: ["completionType"],
};

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
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      maxOutputTokens: 150,
    },
  });

  if (!response.text) {
    return new Response(JSON.stringify({ error: "No response from AI" }), {
      status: 500,
    });
  }

  console.dir(response, { depth: null });

  const rawCompletions = (
    response.candidates
      ?.map((c) => c.content?.parts?.map((p) => p.text)?.join(""))
      .filter((s) => s !== undefined) ?? [response.text]
  ).map((text) => RawCompletionResponse.parse(JSON.parse(text)));

  const completions = processRawCompletions(rawCompletions, request);

  return new Response(
    JSON.stringify({ completions, timestamp } satisfies CompletionsResponse),
    { status: 200 }
  );
}

function constructPrompt(request: PromptRequest) {
  return `
URL: ${request.url}
${
  request.surroundingText.length
    ? `Surrounding text: ${request.surroundingText.join(", ")}`
    : ""
}
${request.label ? `Label: "${request.label}"` : ""}
${request.placeholder ? `Placeholder text: "${request.placeholder}"` : ""}
Current field value: "${request.inputText}"
`;
}

function processRawCompletions(
  rawCompletions: RawCompletionResponse[],
  request: PromptRequest
): Completion[] {
  const oldText = request.inputText;

  return rawCompletions.map((rawCompletion) => {
    switch (rawCompletion.completionType) {
      case "insert": {
        if (!rawCompletion.completion) {
          return { completionType: "noop" };
        }
        // Sometimes the AI will insert a space at the beginning of the completion. This is a hack to fix that.
        if (oldText == "" && rawCompletion.completion.startsWith(" ")) {
          rawCompletion.completion = rawCompletion.completion.slice(1);
        }
        return {
          completionType: "insert",
          textToInsert: rawCompletion.completion,
          index: oldText.length,
        };
      }
      case "replace": {
        const lastIndex = oldText.lastIndexOf(rawCompletion.textToReplace);
        return {
          completionType: "replace",
          textToInsert: rawCompletion.completion,
          index: lastIndex,
          endIndex: lastIndex + rawCompletion.textToReplace.length,
        };
      }
      case "noop": {
        return { completionType: "noop" };
      }
    }
  });
}

export default {
  post: complete,
  options: options("POST", "OPTIONS"),
};
