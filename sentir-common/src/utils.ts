import type { Completion } from "./types.js";

export function applyCompletion(text: string, completion: Completion) {
  switch (completion.completionType) {
    case "insert": {
      const { textToInsert, index } = completion;
      return text.slice(0, index) + textToInsert + text.slice(index);
    }
    case "replace": {
      const { textToInsert, index, endIndex } = completion;
      return text.slice(0, index) + textToInsert + text.slice(endIndex);
    }
    case "noop": {
      return text;
    }
    default: {
      throw new Error(`Unknown completion type ` + JSON.stringify(completion));
    }
  }
}
