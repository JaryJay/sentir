import { Overlayable } from 'lib/types/index.js'

export function isOverlayable(node: Node): node is Overlayable {
	return node instanceof HTMLElement && (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)
}

export function isElementVisible(element: HTMLElement): boolean {
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
 * This function is like Object.assign, but for CSSStyleDeclaration objects.
 * It copies all the properties from the source to the target.
 * @param target - The target CSSStyleDeclaration object.
 * @param source - The source CSSStyleDeclaration object.
 */
export function assignCSSStyleDeclaration(target: CSSStyleDeclaration, source: CSSStyleDeclaration) {
	for (let i = 0; i < source.length; i++) {
		const propertyName = source[i]
		target.setProperty(propertyName, source.getPropertyValue(propertyName), source.getPropertyPriority(propertyName))
	}
}

export function computeKey(node: Overlayable): string {
	const classlist = Array.from(node.classList)
	const key = classlist.find(className => className.startsWith('sentir-o-'))
	if (!key) {
		console.error('No key found for node', node)
		throw new Error('No key found')
	}
	return key
}
