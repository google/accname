// Example function used to experiment with testing & DOM access/manipulation
export function getTextNodeAccessibleName(textNode: Node): string {
    let accessibleName: string = '';
    if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
        accessibleName = textNode.textContent;
    }
    return accessibleName;
}
