import { debounce } from 'lodash'
import { getCompletion } from './prompt'
import { isElementVisible, assignCSSStyleDeclaration } from './utils'

const INPUT_WRAPPER_CLASS = 'delect-extension-input-wrapper'
const MARKED_INPUT_CLASS = 'delect-extension-marked-input'
const OVERLAY_CLASS = 'delect-extension-overlay'

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

	// Function to check visibility changes
	function updateOverlaysBasedOnVisibility() {
		// Check all inputs and textareas
		const allInputs = document.querySelectorAll('input, textarea')
		allInputs.forEach(element => {
			const htmlElement = element as HTMLElement
			const wasVisible = visibilityMap.get(htmlElement) ?? false
			const isVisible = isElementVisible(htmlElement)

			// If element became visible and doesn't have an overlay yet
			if (isVisible && !wasVisible && !htmlElement.classList.contains(MARKED_INPUT_CLASS)) {
				applyOverlay(element as HTMLInputElement | HTMLTextAreaElement)
			}

			// Update visibility state
			visibilityMap.set(htmlElement, isVisible)
		})
	}

	// Set up a visibility observer
	const visibilityObserver = new MutationObserver(() => {
		updateOverlaysBasedOnVisibility()
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
 * <div class="delect-extension-input-wrapper">
 *   <input class="delect-extension-marked-input">
 *   <div class="delect-extension-overlay">...</div>
 * </div>
 * ```
 */
function applyOverlay(input: HTMLInputElement | HTMLTextAreaElement) {
	console.log('applyOverlay', input)

	// Skip if the input is not visible or already has an overlay
	if (!isElementVisible(input) || input.classList.contains(MARKED_INPUT_CLASS)) {
		return
	}

	const inputStyle = window.getComputedStyle(input)

	const wrapper = createWrapper(inputStyle)

	input.parentNode?.insertBefore(wrapper, input)
	wrapper.appendChild(input)

	modifyInput(input)

	const overlay = createOverlay(inputStyle)

	setupEventListeners(input, overlay)

	wrapper.appendChild(overlay)
}

/**
 * Creates and styles the wrapper element
 */
function createWrapper(inputStyle: CSSStyleDeclaration): HTMLDivElement {
	const wrapper = document.createElement('div')
	wrapper.classList.add(INPUT_WRAPPER_CLASS)
	Object.assign(wrapper.style, {
		position: 'relative',
		display: inputStyle.display,
		flexBasis: inputStyle.flexBasis,
		flexGrow: inputStyle.flexGrow,
		flexShrink: inputStyle.flexShrink,
		flexWrap: inputStyle.flexWrap,
	})
	return wrapper
}

/**
 * Modifies the original input/textarea element behavior
 */
function modifyInput(input: HTMLInputElement | HTMLTextAreaElement) {
	Object.assign(input.style, {
		color: 'rgba(0, 0, 0, 0.1)',
		caretColor: 'rgba(0, 0, 0, 1)',
	})
	// Mark the input as having an overlay
	input.classList.add(MARKED_INPUT_CLASS)
}

/**
 * Creates and styles the overlay element
 */
function createOverlay(inputStyle: CSSStyleDeclaration): HTMLDivElement {
	const overlay = document.createElement('div')
	overlay.classList.add(OVERLAY_CLASS) // For potential styling

	assignCSSStyleDeclaration(overlay.style, inputStyle)
	Object.assign(overlay.style, {
		position: 'absolute',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 255, 255, 0.1)',
		pointerEvents: 'none',
		// But we make it transparent so it doesn't show
		borderColor: 'transparent',
		color: 'green',
		textEmphasis: 'green',
		webkitTextFillColor: 'green',
		webkitTextStrokeColor: 'green',
		opacity: 1,
		whiteSpace: 'pre-wrap',
	})

	return overlay
}

/**
 * Sets up event listeners for the input and overlay
 */
function setupEventListeners(input: HTMLInputElement | HTMLTextAreaElement, overlay: HTMLDivElement) {
	let currentCompletion = {
		completion: '',
		timestamp: 0,
	}
	// Update overlay text when input value changes
	input.addEventListener('input', () => {
		overlay.textContent = input.value
	})
	input.addEventListener(
		'input',
		debounce(() => {
			getCompletion({
				inputText: input.value,
				url: window.location.href,
				cursorPosition: input.selectionStart ?? 0,
				surroundingText: [],
				placeholder: input.placeholder,
				label: input.labels?.[0]?.textContent ?? undefined,
			}).then(completion => {
				console.log(`completion: '${completion.completion}'`)
				if (completion.timestamp > currentCompletion.timestamp) {
					currentCompletion = completion
					overlay.textContent = completion.completion
				}
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
