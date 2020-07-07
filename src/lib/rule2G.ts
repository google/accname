/**
 * Implementation for rule 2G
 * @param node - node whose text alternative is being computed
 * @return - text alternative of node if node is a TEXT_NODE,
 * null otherwise.
 */
export function rule2G(node: Node): string | null {
  if (node.nodeType === Node.TEXT_NODE) {
    // 'Flattening' the string with .replace()
    return node.textContent?.replace(/\s\s+/g, ' ').trim() ?? '';
  }
  return null;
}
