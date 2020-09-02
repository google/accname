// Input types for whom placeholders should be considered when computing
// a text alternative. See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-name-computation
const TEXTUAL_INPUT_TYPES = [
  'text',
  'password',
  'search',
  'tel',
  'email',
  'url',
];

/**
 * Implementation for rule 2I
 * @param node - node whose text alternative is being computed
 * @return - text alternative if rule 2I applies to node, null otherwise.
 */
export function rule2I(node: Node): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  if (node.title) {
    return node.title;
  }

  // Placeholder considered if no title is present.
  // See https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-name-computation

  if (
    node instanceof HTMLInputElement &&
    TEXTUAL_INPUT_TYPES.includes(node.type)
  ) {
    return node.placeholder;
  }

  if (node instanceof HTMLTextAreaElement && node.hasAttribute('placeholder')) {
    return node.getAttribute('placeholder');
  }

  return null;
}
