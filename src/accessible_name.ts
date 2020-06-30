/** This function is just an example to check the testing frameworks out
 * and will not be included in the actual implementation
 * @param {Node} textNode - A DOM node
 * @return {string} The accessible name for textNode
 */
export function getTextNodeAccessibleName(textNode: Node): string {
    let accessibleName: string = '';
    if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
        accessibleName = textNode.textContent;
    }
    return accessibleName;
}
