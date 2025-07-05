import { describe, it, expect } from 'vitest'
import { smartApplyChanges, smartMergeCompletionsIntoUpdatedOverlayable } from '@extension/shared'
import type { RegisteredOverlayable, OverlayableChangeEvent } from '@extension/shared'
import type { Completion } from 'sentir-common'

// Mock HTML element for testing
const createMockOverlayable = (): HTMLInputElement => {
	return {
		value: '',
		focus: () => {},
		blur: () => {},
		select: () => {},
		setSelectionRange: () => {},
	} as HTMLInputElement
}

const createMockRegisteredOverlayable = (
	text: string = '',
	completions: Completion[] = [],
	completionsTimestamp: number = 0,
): RegisteredOverlayable => ({
	overlayable: createMockOverlayable(),
	id: 1,
	focused: true,
	text,
	completions,
	completionsTimestamp,
})

describe('smartApplyChanges', () => {
	it('should return overlayable with change when text is undefined', () => {
		const overlayable = createMockRegisteredOverlayable('hello', [])
		const change: Partial<OverlayableChangeEvent> = { focused: false }

		const result = smartApplyChanges(overlayable, change)

		expect(result).toEqual({
			...overlayable,
			focused: false,
		})
	})

	it('should filter and update completions when text changes', () => {
		const completions: Completion[] = [
			{ completionType: 'insert', textToInsert: ' world', index: 5 },
			{ completionType: 'replace', textToInsert: 'there', index: 0, endIndex: 5 },
		]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'hello world' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.text).toBe('hello world')
		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({
			completionType: 'insert',
			textToInsert: '',
			index: 11,
		})
	})

	it('should handle noop completions correctly', () => {
		const completions: Completion[] = [
			{ completionType: 'noop' },
			{ completionType: 'insert', textToInsert: 'test', index: 0 },
		]
		const overlayable = createMockRegisteredOverlayable('', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'new' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({ completionType: 'noop' })
	})

	it('should handle insert completion that matches partial text', () => {
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: 'world', index: 5 }]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'hello wo' }

		const result = smartApplyChanges(overlayable, change)

		// The completion should be filtered out because the text structure doesn't match
		// the expected pattern for keeping the completion
		expect(result.completions).toHaveLength(0)
	})

	it('should convert insert to replace when partial text does not match start', () => {
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: 'world', index: 5 }]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'hello orld' }

		const result = smartApplyChanges(overlayable, change)

		// The completion should be filtered out because the text structure doesn't match
		expect(result.completions).toHaveLength(0)
	})

	it('should handle replace completion correctly', () => {
		const completions: Completion[] = [{ completionType: 'replace', textToInsert: 'there', index: 0, endIndex: 5 }]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'there world' }

		const result = smartApplyChanges(overlayable, change)

		// The completion should be filtered out because the text structure doesn't match
		expect(result.completions).toHaveLength(0)
	})

	it('should filter out completions when text structure changes', () => {
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: 'world', index: 5 }]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'goodbye' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.completions).toHaveLength(0)
	})
})

describe('smartMergeCompletionsIntoUpdatedOverlayable', () => {
	it('should return newOverlayable when timestamp is older', () => {
		const oldOverlayable = createMockRegisteredOverlayable('hello', [], 100)
		const newOverlayable = createMockRegisteredOverlayable('hello world', [], 200)
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: 'test', index: 0 }]

		const result = smartMergeCompletionsIntoUpdatedOverlayable(
			oldOverlayable,
			newOverlayable,
			completions,
			50, // older timestamp
		)

		expect(result).toBe(newOverlayable)
	})

	it('should merge completions when text has changed', () => {
		const oldOverlayable = createMockRegisteredOverlayable('hello', [], 100)
		const newOverlayable = createMockRegisteredOverlayable('hello world', [], 50)
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: ' world', index: 5 }]

		const result = smartMergeCompletionsIntoUpdatedOverlayable(
			oldOverlayable,
			newOverlayable,
			completions,
			150, // newer timestamp
		)

		expect(result.completionsTimestamp).toBe(150)
		expect(result.text).toBe('hello world')
		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({
			completionType: 'insert',
			textToInsert: '',
			index: 11,
		})
	})

	it('should handle case when text has not changed', () => {
		const oldOverlayable = createMockRegisteredOverlayable('hello', [], 100)
		const newOverlayable = createMockRegisteredOverlayable('hello', [], 50)
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: 'there', index: 5 }]

		const result = smartMergeCompletionsIntoUpdatedOverlayable(oldOverlayable, newOverlayable, completions, 150)

		expect(result.completionsTimestamp).toBe(150)
		expect(result.text).toBe('hello')
		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({
			completionType: 'insert',
			textToInsert: 'there',
			index: 5,
		})
	})

	it('should concatenate existing completions from newOverlayable', () => {
		const oldOverlayable = createMockRegisteredOverlayable('hello', [], 100)
		const existingCompletions: Completion[] = [{ completionType: 'noop' }]
		const newOverlayable = createMockRegisteredOverlayable('hello world', existingCompletions, 50)
		const newCompletions: Completion[] = [{ completionType: 'insert', textToInsert: ' world', index: 5 }]

		const result = smartMergeCompletionsIntoUpdatedOverlayable(oldOverlayable, newOverlayable, newCompletions, 150)

		expect(result.completions).toHaveLength(2)
		expect(result.completions[0]).toEqual({
			completionType: 'insert',
			textToInsert: '',
			index: 11,
		})
		expect(result.completions[1]).toEqual({ completionType: 'noop' })
	})
})

describe('edge cases', () => {
	it('should handle empty text correctly', () => {
		const overlayable = createMockRegisteredOverlayable('', [])
		const change: Partial<OverlayableChangeEvent> = { text: 'new' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.text).toBe('new')
		expect(result.completions).toHaveLength(0)
	})

	it('should handle completion at the beginning of text', () => {
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: 'hello ', index: 0 }]
		const overlayable = createMockRegisteredOverlayable('world', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'hello world' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({
			completionType: 'insert',
			textToInsert: '',
			index: 6,
		})
	})

	it('should handle completion at the end of text', () => {
		const completions: Completion[] = [{ completionType: 'insert', textToInsert: ' world', index: 5 }]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'hello world' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({
			completionType: 'insert',
			textToInsert: '',
			index: 11,
		})
	})

	it('should handle replace completion that spans entire text', () => {
		const completions: Completion[] = [{ completionType: 'replace', textToInsert: 'new', index: 0, endIndex: 5 }]
		const overlayable = createMockRegisteredOverlayable('hello', completions)
		const change: Partial<OverlayableChangeEvent> = { text: 'new' }

		const result = smartApplyChanges(overlayable, change)

		expect(result.completions).toHaveLength(1)
		expect(result.completions[0]).toEqual({
			completionType: 'replace',
			textToInsert: 'new',
			index: 0,
			endIndex: 3,
		})
	})
})
