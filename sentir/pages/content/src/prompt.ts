import type { PromptRequest } from 'sentir-common'

type CompletionResponse = {
	completion: string
	/** The time that the completion was requested */
	timestamp: number
}

const SYSTEM_PROMPT = `
You are an intelligent form completion assistant, similar to GitHub Copilot or Cursor IDE.
Given the following context of a web page and the current content of an input/textarea field, predict the most likely next word or phrase the user will type to complete the field.
Provide only the single most probable completion. Do not enclose the completion in quotes. Output the entire completion as a string.
For example, if the current field value is "howw to ceter a" and the site is Stack Overflow, the completion should be "how to center a div".
As another example, if the current field value is "Asus" and the site is Amazon, the completion should be "Asus laptop". Note that the completion should include the "Asus" part.
Similarly, if the current field value is "how" and the site is Google, the completion should be "how to". Note that the completion should include the "how" part.
A final example, if the current field value is "hel", the completion should be "hello". Do not just output "lo".
`

export async function getCompletion(request: PromptRequest): Promise<CompletionResponse> {
	const prompt = constructPrompt(request)

	const timestamp = Date.now()

	// Call ollama local server
	const response = await fetch('http://localhost:11434/api/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			model: 'gemma3:12b',
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
			stream: false,
		}),
	})

	const data = await response.json()

	return {
		completion: data.message.content as string,
		timestamp,
	}
}

function constructPrompt(request: PromptRequest) {
	return `
${SYSTEM_PROMPT}

The user's cursor position is at the ${request.cursorPosition}th character of the input/textarea.

Context:
- URL: ${request.url}
${request.surroundingText.length ? `- Surrounding text: ${request.surroundingText.join(', ')}` : ''}
${request.label ? `- Field label: ${request.label}` : ''}
${request.placeholder ? `- Placeholder text: ${request.placeholder}` : ''}
- Current field value: "${request.inputText}"

Prediction (as a reminder, do NOT just include the end of the completion, but the entire string which often includes the current field value):
`
}
