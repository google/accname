import {computeTextAlternative} from './compute_text_alternative';
import {Context, resetUninherited} from './context';

/**
 * Get any HTMLElement referenced in the aria-labelledby attribute
 * of 'elem' that exist in the document (i.e is 'valid')
 * @param elem - element whose aria-labelledby attribute is considered
 * @return - An array of any HTMLElement in the document that is referenced
 * by elem's aria-labelledby
 */
function resolveValidAriaLabelledbyIdrefs(elem: HTMLElement): HTMLElement[] {
  const idrefs = elem.getAttribute('aria-labelledby')?.split(' ') ?? [];

  const validElems: HTMLElement[] = [];
  for (const id of idrefs) {
    const elem = document.getElementById(id);
    if (elem) {
      validElems.push(elem);
    }
  }
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

  if (context.ariaLabelledbyReference) {
    return null;
  }

  const labelElems = resolveValidAriaLabelledbyIdrefs(node);
  if (labelElems.length === 0) {
    return null;
  }

  return labelElems
    .map(labelElem => {
      context = resetUninherited(context);
      context.ariaLabelledbyReference = true;
      return computeTextAlternative(labelElem, context);
    })
    .join(' ')
    .trim();
}
