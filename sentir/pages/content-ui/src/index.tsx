import { createRoot } from 'react-dom/client'
import App from '@/App'
// @ts-expect-error Because file doesn't exist before build
import tailwindcssOutput from '../dist/tailwind-output.css?inline'

const root = document.createElement('div')
root.id = 'sentir-overlay-root'
root.classList.add('pointer-events-none', 'w-0')

document.documentElement.append(root)

const rootIntoShadow = document.createElement('div')
rootIntoShadow.id = 'sentir-shadow-root'
rootIntoShadow.classList.add('pointer-events-none', 'w-0')

const shadowRoot = root.attachShadow({ mode: 'open' })

if (navigator.userAgent.includes('Firefox')) {
	/**
	 * In the firefox environment, adoptedStyleSheets cannot be used due to the bug
	 * @url https://bugzilla.mozilla.org/show_bug.cgi?id=1770592
	 *
	 * Injecting styles into the document, this may cause style conflicts with the host page
	 */
	const styleElement = document.createElement('style')
	styleElement.innerHTML = tailwindcssOutput
	shadowRoot.appendChild(styleElement)
} else {
	/** Inject styles into shadow dom */
	const globalStyleSheet = new CSSStyleSheet()
	globalStyleSheet.replaceSync(tailwindcssOutput)
	shadowRoot.adoptedStyleSheets = [globalStyleSheet]
}

shadowRoot.appendChild(rootIntoShadow)
createRoot(rootIntoShadow).render(<App />)

// Create a style element to create any needed styles for the DOM elements
const styleElement = document.createElement('style')
styleElement.innerHTML = `
	.sentir-placeholder-transparent::-webkit-input-placeholder { color: transparent; }
	.sentir-placeholder-transparent::-moz-placeholder { color: transparent; }
	.sentir-placeholder-transparent:-ms-input-placeholder { color: transparent; }
	.sentir-placeholder-transparent::placeholder { color: transparent; }
`
document.head.appendChild(styleElement)
