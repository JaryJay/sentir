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
