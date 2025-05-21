import { createRoot } from 'react-dom/client'
import SidePanel from '@src/SidePanel'
// @ts-expect-error Because file doesn't exist before build
import tailwindcssOutput from '../dist/tailwind-output.css?inline'

function init() {
	const appContainer = document.querySelector('#app-container')
	if (!appContainer) {
		throw new Error('Can not find #app-container')
	}
	const root = createRoot(appContainer)
	root.render(<SidePanel />)
	const styleElement = document.createElement('style')
	styleElement.innerHTML = tailwindcssOutput
	document.head.appendChild(styleElement)
}

init()
