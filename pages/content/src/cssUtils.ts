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
