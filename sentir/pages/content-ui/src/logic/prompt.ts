import { CompletionsResponse, PromptRequest } from 'sentir-common'

export async function getCompletions(request: PromptRequest): Promise<CompletionsResponse> {
	// Call ollama local server
	const response = await fetch('http://localhost:3000/v0/complete', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify(request),
	})

	const data = await response.json()

	return CompletionsResponse.parse(data)
}
