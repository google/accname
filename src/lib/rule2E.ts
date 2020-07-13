import {Context, getDefaultContext} from './context';
import {computeTextAlternative} from './compute_text_alternative';

// Input types that imply role 'textbox'
const TEXTBOX_INPUT_TYPES = ['email', 'tel', 'text', 'url'];

/**
 * Checks if input elem has role 'textbox' or has a list attribute
 * @param elem - input element whose role is being calculated
 * @return - true if elem has role 'textbox' or list attribute,
 * false otherwise.
 */
function isTextboxOrListInput(elem: HTMLInputElement): boolean {
  const inputType = elem.getAttribute('type')?.toLowerCase() ?? '';
  return TEXTBOX_INPUT_TYPES.includes(inputType) || elem.hasAttribute('list');
}

// Input types that imply role 'range'
const RANGE_INPUT_TYPES = ['number', 'range'];

/**
 * Checks if input elem has role 'range'
 * @param elem - input element whose role is being calculated
 * @return - true if elem has role 'range', false otherwise
 */
function isRangeInput(elem: HTMLInputElement): boolean {
  const inputType = elem.getAttribute('type')?.toLowerCase() ?? '';
  return RANGE_INPUT_TYPES.includes(inputType);
}

/**
 * Implementation for rule 2E.
 * @param node - node whose text alternative is being calculated
 * @param context - additional information relevant to the computation of a text
 * alternative for node.
 * @return text alternative for 'node' if rule 2E accepts 'node', null otherwise.
 */
export function rule2E(
  node: Node,
  context: Context = getDefaultContext()
): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  // #SPEC_ASSUMPTION (E.1) : that 'embedded within the label
  // for another widget' is equivalent to 'part of a name computation'
  if (!context.inherited.partOfName) {
    return null;
  }

  if (node instanceof HTMLTextAreaElement) {
    return node.value;
  }

  if (node instanceof HTMLInputElement && isTextboxOrListInput(node)) {
    return node.value;
  }

  if (node instanceof HTMLSelectElement) {
    const textAlterantives = [];
    // #SPEC_ASSUMPTION (E.2) : consider multiple selected options' text
    // alternatives, joining them with a space as in 2B.ii.c
    for (const optionNode of node.selectedOptions) {
      context.inherited.partOfName = true;
      const textAlterantive = computeTextAlternative(optionNode, {
        inherited: context.inherited,
      });
      textAlterantives.push(textAlterantive);
    }
    return textAlterantives.filter(text => text !== '').join(' ');
  }

  if (node instanceof HTMLInputElement && isRangeInput(node)) {
    if (node.hasAttribute('aria-valuetext')) {
      return node.getAttribute('aria-valuetext');
    }
    if (node.hasAttribute('aria-valuenow')) {
      return node.getAttribute('aria-valuenow');
    }
    return node.value;
  }

  return null;
}
