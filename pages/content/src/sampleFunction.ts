export function applyOverlayToAllInputFields() {
  function applyOverlay(input: HTMLInputElement | HTMLTextAreaElement) {
    console.log('applyOverlay', input)

    // Compute styles of the input
    const styles = window.getComputedStyle(input)

    // 1. Create the wrapper
    const wrapper = document.createElement('div')
    Object.assign(wrapper.style, {
      display: 'contents',
      position: 'relative',
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
    overlay.classList.add('custom-input-overlay') // For potential styling

    Object.assign(overlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 255, 255, 0.2)',
      pointerEvents: 'none',
      padding: styles.padding,
      borderRadius: styles.borderRadius,
      fontSize: styles.fontSize,
      fontFamily: styles.fontFamily,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      color: 'green',
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
    input.classList.add('has-overlay')
  }

  // Apply overlay to all existing input fields that don't already have an overlay and aren't hidden
  const inputFields = document.querySelectorAll('input:not(.has-overlay):not([type="hidden"])')
  Array.from(inputFields).forEach(input => applyOverlay(input as HTMLInputElement))
  const textAreas = document.querySelectorAll('textarea:not(.has-overlay):not([type="hidden"])')
  Array.from(textAreas).forEach(textarea => applyOverlay(textarea as HTMLTextAreaElement))

  // Observe for dynamically added input fields
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)
        ) {
          console.log('mutation.addedNodes', { node })
          applyOverlay(node)
        }
      })
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}
