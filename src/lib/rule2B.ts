import {computeTextAlternative} from './compute_text_alternative';
import {Context} from './context';

/**
 * Gets the valid idrefs listed in the aria-labelledby attribute of elem.
 * @param elem - the element whose valid aria-labelledby idrefs are being
 * calculated
 * @return - a list of idref strings for whom elements exist in the document.
 */
function getValidAriaLabelledbyIdrefs(elem: HTMLElement): string[] {
  let idrefs: string[] = [];
  const idrefStr = elem.getAttribute('aria-labelledby');
  if (idrefStr) {
    idrefs = idrefStr.split(' ');
  }
  // A valid idref is considered here to mean an idref that identifies an
  // existing element in the document.
  const validIdrefs = idrefs.filter(idref => !!document.getElementById(idref));
  return validIdrefs;
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
  let result = null;
  if (node instanceof HTMLElement) {
    const validIdrefs = getValidAriaLabelledbyIdrefs(node);
    const rule2BCondition =
      validIdrefs.length > 0 && !context.ariaLabelledbyReference;
    if (rule2BCondition) {
      let accumulatedText = '';
      validIdrefs.forEach(idref => {
        const node = document.getElementById(idref);
        if (node) {
          // ariaLabelledbyReference property in context indicates that
          // node is part of an aria-labelledby traversal
          accumulatedText +=
            computeTextAlternative(node, {ariaLabelledbyReference: true}) + ' ';
        }
      });
      result = accumulatedText.trim();
    }
  }
  return result;
}
