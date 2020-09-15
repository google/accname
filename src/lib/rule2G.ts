/**
 * Implementation for rule 2G
 * @param node - node whose text alternative is being computed
 * @return - text alternative of node if node is a TEXT_NODE,
 * null otherwise.
 */
export function rule2G(node: Node): string | null {
  if (node.nodeType === Node.TEXT_NODE) {
    // 'Flattening' the string with .replace()
    // #SPEC_ASSUMPTION (G.1) : that the resulting text alternative
    // from 2G should be a flat string.
    return node.textContent?.replace(/\s\s+/g, ' ') ?? '';
  }
  return null;
}
