import {computeTextAlternative} from './compute_text_alternative';
import {Context} from './context';

/**
 * Get any HTMLElement referenced in the aria-labelledby attribute
 * of 'elem' that exist in the document (i.e is 'valid')
 * @param elem - element whose aria-labelledby attribute is considered
 * @return - An array of any HTMLElement in the document that is referenced
 * by elem's aria-labelledby
 */
function resolveValidAriaLabelledbyIdrefs(elem: HTMLElement): HTMLElement[] {
  // Get a list of idref strings
  const idrefs = elem.getAttribute('aria-labelledby')?.split(' ') ?? [];
  // Any idref that points to an element that exists in the document
  // is considered valid here.
  const validElems: HTMLElement[] = [];
  idrefs.forEach(idref => {
    const elem = document.getElementById(idref);
    if (elem) {
      validElems.push(elem);
    }
  });
  return validElems;
}

/**
 * Implementation of rule 2B
 * @param node - node whose text alternative is being computed
 * @param context - Additional information relevant to the text alternative
 * computation for node
 * @return - The text alternative string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was
 * not satisfied.
 */
export function rule2B(node: Node, context: Context): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  // Check if node is part of an aria-labelledby traversal
  if (context.ariaLabelledbyReference) {
    return null;
  }

  // Check that aria-labelledby contains at least one valid idref
  const labelElems = resolveValidAriaLabelledbyIdrefs(node);
  if (labelElems.length === 0) {
    return null;
  }

  // Node text alternative = concatenate the text alternative for each labelElem.
  return labelElems
    .map(labelElem =>
      computeTextAlternative(labelElem, {ariaLabelledbyReference: true})
    )
    .join(' ')
    .trim(); // (styles by gts - I swear I'm not responsible)
}
