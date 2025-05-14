import { Overlayable } from '../types/index.js'
export * from './string.js'

// Noteably, we don't include password in this list, because it's a security risk to send the user's password to the server
const allowedInputTypes = ['text', 'search', 'email', 'url', 'number', 'tel', 'color', 'date', 'time', 'month', 'week']

export function isOverlayable(node: Node): node is Overlayable {
	if (node instanceof HTMLTextAreaElement) {
		if (node.readOnly || node.hasAttribute('readonly')) {
			return false
		}
		return true
	}
	if (node instanceof HTMLInputElement) {
		if (node.readOnly || node.hasAttribute('readonly')) {
			return false
		}
		return allowedInputTypes.includes(node.type)
	}
	return false
}

export function isRegistered(overlayable: Overlayable): boolean {
	return overlayable.classList.contains('sentir-registered')
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
