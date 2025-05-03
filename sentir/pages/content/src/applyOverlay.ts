import { debounce } from 'lodash'
import { getCompletion } from './prompt'
import { isElementVisible, assignCSSStyleDeclaration } from '@extension/shared/lib/utils'
import { CompletionsResponse } from 'sentir-common'

const INPUT_WRAPPER_CLASS = 'sentir-extension-input-wrapper'
const MARKED_INPUT_CLASS = 'sentir-extension-marked-input'
const OVERLAY_CLASS = 'sentir-extension-overlay'

/**
 * Creates an overlay for all input fields.
 * It will be used to show a suggestion when the user is typing.
 */
export function applyOverlayToAllInputFields() {
	// Apply overlay to all existing input fields
	applyOverlaysToExistingInputs()

	// Set up observers for dynamic changes
	setupVisibilityObserver()
}

/**
 * Applies overlays to all existing input/textarea fields that don't already have an overlay
 */
function applyOverlaysToExistingInputs() {
	document
		.querySelectorAll(`input:not(.${MARKED_INPUT_CLASS}):not([type="hidden"])`)
		.forEach(input => applyOverlay(input as HTMLInputElement))

	document
		.querySelectorAll(`textarea:not(.${MARKED_INPUT_CLASS}):not([type="hidden"])`)
		.forEach(textarea => applyOverlay(textarea as HTMLTextAreaElement))

	// In the future, we also want to support custom web components, like rich text editors
	// A good example is the rich-textarea component that the Gemini app uses
}

/**
 * Sets up a visibility observer to handle dynamically added or shown inputs
 */
function setupVisibilityObserver() {
	// Create a map to track visibility state of elements
	const visibilityMap = new Map<HTMLElement, boolean>()
	// Create a map to track class changes
	const classMap = new Map<HTMLElement, string>()

	// Function to check visibility changes
	function updateOverlaysBasedOnVisibility() {
		// Check all inputs and textareas
		const allInputs = document.querySelectorAll('input, textarea')
		allInputs.forEach(element => {
			const htmlElement = element as HTMLElement
			const wasVisible = visibilityMap.get(htmlElement) ?? false
			const isVisible = isElementVisible(htmlElement)
			// Update visibility state
			visibilityMap.set(htmlElement, isVisible)

			if (!isVisible) return

			// If element became visible and doesn't have an overlay yet
			if (!wasVisible && !htmlElement.classList.contains(MARKED_INPUT_CLASS)) {
				applyOverlay(element as HTMLInputElement | HTMLTextAreaElement)
			}

			// If element was already visible, check if classes have changed. If so, update the overlay
			if (wasVisible && isVisible) {
				const currentClasses = htmlElement.className
				const previousClasses = classMap.get(htmlElement)

				if (currentClasses !== previousClasses) {
					classMap.set(htmlElement, currentClasses)
					updateOverlay(element as HTMLInputElement | HTMLTextAreaElement)
				}
			}
		})
	}

	const debouncedUpdate = debounce(updateOverlaysBasedOnVisibility, 100)
	// Set up a visibility observer with debounced updates
	const visibilityObserver = new MutationObserver(() => {
		debouncedUpdate()
	})

	// Observe style changes that might affect visibility
	visibilityObserver.observe(document.body, {
		attributes: true,
		attributeFilter: ['style', 'class', 'hidden'],
		subtree: true,
	})

	// Initial overlay update
	updateOverlaysBasedOnVisibility()
}

/**
 * Applies an overlay to a single input or textarea element.
 * Manipulates the DOM in the following way:
 *
 * Before:
 * ```html
 * <input>
 * ```
 *
 * After:
 * ```html
 * <div class="sentir-extension-input-wrapper">
 *   <input class="sentir-extension-marked-input">
 *   <div class="sentir-extension-overlay">...</div>
 * </div>
 * ```
 */
function applyOverlay(input: HTMLInputElement | HTMLTextAreaElement) {
	console.log('applyOverlay', input)

	// Skip if the input is not visible or already has an overlay
	if (!isElementVisible(input) || input.classList.contains(MARKED_INPUT_CLASS)) {
		return
	}

	const inputStyle = input.style
	const inputComputedStyle = window.getComputedStyle(input)

	const wrapper = createWrapper(inputStyle, inputComputedStyle)

	input.parentNode?.insertBefore(wrapper, input)
	wrapper.appendChild(input)

	const overlay = createOverlay()
	assignOverlayStyle(overlay, inputStyle, inputComputedStyle)

	modifyInput(input)

	setupEventListeners(input, overlay)

	wrapper.appendChild(overlay)
}

function updateOverlay(input: HTMLInputElement | HTMLTextAreaElement) {
	const wrapper = input.parentElement
	if (!wrapper || !wrapper.classList.contains(INPUT_WRAPPER_CLASS)) {
		console.error('updateOverlay: no wrapper found')
		return
	}

	const overlay = wrapper.querySelector<HTMLDivElement>(`.${OVERLAY_CLASS}`)
	if (!overlay) {
		console.error('updateOverlay: no overlay found')
		return
	}

	const inputStyle = input.style
	const inputComputedStyle = window.getComputedStyle(input)

	assignOverlayStyle(overlay, inputStyle, inputComputedStyle)
}

/**
 * Creates and styles the wrapper element
 */
function createWrapper(inputStyle: CSSStyleDeclaration, inputComputedStyle: CSSStyleDeclaration): HTMLDivElement {
	const wrapper = document.createElement('div')
	wrapper.classList.add(INPUT_WRAPPER_CLASS)
	Object.assign(wrapper.style, {
		position: 'relative',
		display: inputStyle.display,
		flexBasis: inputStyle.flexBasis,
		flexGrow: inputStyle.flexGrow,
		flexShrink: inputStyle.flexShrink,
		flexWrap: inputStyle.flexWrap,
		width: inputStyle.width || inputComputedStyle.width || '100%',
		height: inputStyle.height || inputComputedStyle.height || '100%',
	} as Partial<CSSStyleDeclaration>)
	return wrapper
}

/**
 * Modifies the original input/textarea element behavior
 */
function modifyInput(input: HTMLInputElement | HTMLTextAreaElement) {
	Object.assign(input.style, {
		width: '100%',
		height: '100%',
	} as Partial<CSSStyleDeclaration>)
	// Mark the input as having an overlay
	input.classList.add(MARKED_INPUT_CLASS)
}

/**
 * Creates and styles the overlay element
 */
function createOverlay(): HTMLDivElement {
	const overlay = document.createElement('div')
	overlay.classList.add(OVERLAY_CLASS)
	// Overlay should not affect screenreaders
	overlay.ariaHidden = 'true'

	return overlay
}

function assignOverlayStyle(
	overlay: HTMLDivElement,
	inputStyle: CSSStyleDeclaration,
	inputComputedStyle: CSSStyleDeclaration,
) {
	const overlayTextColor = inputComputedStyle.color.replace(/^rgb\((.+)\)$/, 'rgba($1, 0.5)')
	assignCSSStyleDeclaration(overlay.style, inputStyle)
	Object.assign(overlay.style, {
		overflow: inputStyle.overflow || inputComputedStyle.overflow,
		padding: inputStyle.padding || inputComputedStyle.padding,
		margin: inputStyle.margin || inputComputedStyle.margin,
		border: inputStyle.border || inputComputedStyle.border,
		textAlign: inputStyle.textAlign || inputComputedStyle.textAlign,
		fontSize: inputStyle.fontSize || inputComputedStyle.fontSize,
		fontFamily: inputStyle.fontFamily || inputComputedStyle.fontFamily,
		lineHeight: inputStyle.lineHeight || inputComputedStyle.lineHeight,
		borderColor: 'transparent',
		position: 'absolute',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		backgroundColor: 'rgb(0, 255, 255, 0.05)',
		color: overlayTextColor,
		pointerEvents: 'none',
		whiteSpace: 'pre-wrap',
	} as Partial<CSSStyleDeclaration>)
}

/**
 * Sets up event listeners for the input and overlay
 */
function setupEventListeners(input: HTMLInputElement | HTMLTextAreaElement, overlay: HTMLDivElement) {
	let currentCompletion: CompletionsResponse = {
		completions: [],
		timestamp: 0,
	}
	// Update overlay text when input value changes
	input.addEventListener('input', () => {
		overlay.textContent = input.value
	})
	input.addEventListener(
		'input',
		debounce(() => {
			if (input.value.length === 0) {
				return
			}
			const selectionStart = input.selectionStart
			const selectionEnd = input.selectionEnd
			const surroundingText = []
			if (selectionStart !== null) {
				if (selectionEnd !== null && selectionEnd > selectionStart) {
					surroundingText.push(input.value.slice(selectionStart, selectionEnd))
					surroundingText.push(input.value.slice(selectionEnd))
				} else {
					surroundingText.push(input.value.slice(selectionStart))
				}
			}
			getCompletion({
				inputText: input.value.slice(0, selectionStart ?? undefined),
				url: window.location.href,
				surroundingText,
				placeholder: input.placeholder,
				label: input.labels?.[0]?.textContent ?? undefined,
			}).then(completion => {
				console.log(`completion: '${completion.completions[0]}'`)
				if (completion.timestamp <= currentCompletion.timestamp) return

				const fullTextSuggestion = completion.completions[0] + input.value.slice(selectionEnd ?? undefined)
				currentCompletion = completion
				overlay.textContent = fullTextSuggestion
			})
		}, 400),
	)

	// Handle Tab key to accept suggestion
	input.addEventListener('keydown', (event: Event) => {
		const keyboardEvent = event as KeyboardEvent
		if (keyboardEvent.key === 'Tab' && !keyboardEvent.shiftKey && overlay.textContent) {
			// Return early if overlay content is the same as input value
			if (overlay.textContent === input.value) {
				return
			}

			// Prevent default tab behavior
			keyboardEvent.preventDefault()

			// Replace input value with overlay text
			input.value = overlay.textContent

			// Trigger input event to update the overlay
			input.dispatchEvent(new Event('input', { bubbles: true }))
		}
	})
}
