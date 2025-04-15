import { assignCSSStyleDeclaration } from './cssUtils'

const inputWrapperClass = 'delect-extension-input-wrapper'
const markedInputClass = 'delect-extension-marked-input'
const overlayClass = 'delect-extension-overlay'

// Function to check if an element is visible
function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  )
}

/**
 * Creates an overlay for all input fields.
 * It will be used to show a suggestion when the user is typing.
 */
export function applyOverlayToAllInputFields() {
  function applyOverlay(input: HTMLInputElement | HTMLTextAreaElement) {
    console.log('applyOverlay', input)

    // Skip if the input is not visible
    if (!isElementVisible(input)) {
      return
    }

    // Skip if the input already has an overlay
    if (input.classList.contains(markedInputClass)) {
      return
    }

    // Compute styles of the input
    const inputStyle = window.getComputedStyle(input)

    // 1. Create the wrapper
    const wrapper = document.createElement('div')
    wrapper.classList.add(inputWrapperClass)
    Object.assign(wrapper.style, {
      position: 'relative',
      display: inputStyle.display,
      flexBasis: inputStyle.flexBasis,
      flexGrow: inputStyle.flexGrow,
      flexShrink: inputStyle.flexShrink,
      flexWrap: inputStyle.flexWrap,
    })

    // 2. Move the input inside the wrapper
    input.parentNode?.insertBefore(wrapper, input)
    wrapper.appendChild(input)
    Object.assign(input.style, {
      color: 'rgba(0, 0, 0, 0.1)',
      caretColor: 'rgba(0, 0, 0, 1)',
    })

    // 3. Create the overlay
    const overlay = document.createElement('div')
    overlay.classList.add(overlayClass) // For potential styling

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

    // Whenever the input value is changed, update the overlay text
    input.addEventListener('input', () => {
      console.log(`input.value: '${input.value}'`)

      // if (Math.random() > 0.5) {
      overlay.textContent = input.value + ' suggestion'
      // } else {
      //   overlay.textContent = "suggestion " + input.value;
      // }
    })

    // Add keydown event listener for Tab key
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

    // 4. Append the overlay to the wrapper
    wrapper.appendChild(overlay)

    // 5. Add a special class to the input to mark it as having an overlay
    input.classList.add(markedInputClass)
  }

  // Apply overlay to all existing input fields that don't already have an overlay and aren't hidden
  document
    .querySelectorAll(`input:not(.${markedInputClass}):not([type="hidden"])`)
    .forEach(input => applyOverlay(input as HTMLInputElement))
  document
    .querySelectorAll(`textarea:not(.${markedInputClass}):not([type="hidden"])`)
    .forEach(textarea => applyOverlay(textarea as HTMLTextAreaElement))

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
      if (isVisible && !wasVisible && !htmlElement.classList.contains(markedInputClass)) {
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

  // Also observe style changes that might affect visibility
  visibilityObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden'],
    subtree: true,
  })

  // Initial overlay update
  updateOverlaysBasedOnVisibility()
}
