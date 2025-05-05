export type StringDiffEqualResult = {
	category: 'equal'
}

export type StringDiffInsertResult = {
	category: 'insert'
	textToInsert: string
	index: number
}

export type StringDiffDeleteResult = {
	category: 'delete'
	textToDelete: string
	index: number
	endIndex: number
}

export type StringDiffMixedResult = {
	category: 'mixed'
	textToInsert: string
	textToDelete: string
	index: number
	endIndex: number
}

export type StringDiffResult =
	| StringDiffEqualResult
	| StringDiffInsertResult
	| StringDiffDeleteResult
	| StringDiffMixedResult

export function stringDiff(current: string, next: string): StringDiffResult {
	if (current === next) {
		return { category: 'equal' }
	}

	if (next.startsWith(current)) {
		return { category: 'insert', textToInsert: next.slice(current.length), index: current.length }
	}

	if (current.startsWith(next)) {
		return {
			category: 'delete',
			textToDelete: current.slice(next.length),
			index: next.length,
			endIndex: current.length,
		}
	}

	/**
	 * TODO: Handle cases where inserts and deletes happen in the middle of the string
	 */
	return { category: 'mixed', textToInsert: next, textToDelete: current, index: 0, endIndex: current.length }
}
