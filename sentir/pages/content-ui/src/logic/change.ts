import { OverlayableChangeEvent, RegisteredOverlayable } from '@extension/shared'
import { Completion } from 'sentir-common'

/**
 * Makes smart decisions about whether to keep the existing suggested completions
 * based on the changed text. Does not modify the original overlayable.
 * @param overlayable the overlayable
 * @param change the change to the overlayable
 * @returns the new overlayable with the changes applied
 */
export function smartApplyChanges(
	overlayable: RegisteredOverlayable,
	change: Partial<OverlayableChangeEvent>,
): RegisteredOverlayable {
	const newText = change.text
	if (newText === undefined) {
		return { ...overlayable, ...change }
	}

	const oldText = overlayable.text

	const newCompletions = overlayable.completions
		.filter(c => shouldKeepCompletion(c, oldText, newText))
		.map(c => changeCompletion(c, oldText, newText))

	console.dir(JSON.parse(JSON.stringify({ overlayable, change, newCompletions })))

	return { ...overlayable, completions: newCompletions, text: newText }
}

function shouldKeepCompletion(completion: Completion, oldText: string, newText: string): boolean {
	switch (completion.completionType) {
		case 'insert': {
			// oldText = alpha + beta
			const alpha = oldText.substring(0, completion.index)
			const beta = oldText.substring(completion.index)
			// the completion is suggesting alpha + textToInsert + beta

			// Only keep completion if newText == alpha + p + beta
			if (newText.length < alpha.length + beta.length) return false
			if (!newText.startsWith(alpha) || !newText.endsWith(beta)) return false

			// p must be substring of textToInsert
			const p = newText.substring(completion.index, newText.length - beta.length)
			return completion.textToInsert.includes(p)
		}
		case 'replace': {
			// oldText = alpha + r + beta
			const alpha = oldText.substring(0, completion.index)
			const r = oldText.substring(completion.index, completion.endIndex)
			const beta = oldText.substring(completion.endIndex)
			// the completion is suggesting alpha + textToInsert + beta

			// Only keep completion if newText == alpha + p + beta
			if (newText.length < alpha.length + beta.length) return false
			if (!newText.startsWith(alpha) || !newText.endsWith(beta)) return false

			// p must be substring of textToInsert
			const p = newText.substring(completion.index, newText.length - beta.length)
			return completion.textToInsert.includes(p)
		}
		case 'noop': {
			return true
		}
		default: {
			throw new Error('Unhandled completion type ' + JSON.stringify(completion))
		}
	}
}

function changeCompletion(completion: Completion, oldText: string, newText: string): Completion {
	switch (completion.completionType) {
		case 'insert': {
			// oldText = alpha + beta
			const alpha = oldText.substring(0, completion.index)
			const beta = oldText.substring(completion.index)
			// the completion is suggesting alpha + textToInsert + beta

			const p = newText.substring(completion.index, newText.length - beta.length)
			if (completion.textToInsert.startsWith(p)) {
				return {
					completionType: 'insert',
					index: alpha.length + p.length,
					textToInsert: completion.textToInsert.substring(p.length),
				}
			} else {
				return {
					completionType: 'replace',
					index: alpha.length,
					endIndex: alpha.length + p.length,
					textToInsert: completion.textToInsert,
				}
			}
		}
		case 'replace': {
			// oldText = alpha + r + beta
			const alpha = oldText.substring(0, completion.index)
			const r = oldText.substring(completion.index, completion.endIndex)
			const beta = oldText.substring(completion.endIndex)
			// the completion is suggesting alpha + textToInsert + beta

			const p = newText.substring(completion.index, newText.length - beta.length)

			return {
				completionType: 'replace',
				index: alpha.length,
				endIndex: alpha.length + p.length,
				textToInsert: completion.textToInsert,
			}
		}
		case 'noop': {
			return { completionType: 'noop' }
		}
		default: {
			throw new Error('Unhandled completion type ' + JSON.stringify(completion))
		}
	}
}

// function reworkCompletion(completion: Completion, oldText: string, newText: string):
