import {Context, getDefaultContext} from './context';
import {computeTextAlternative} from './compute_text_alternative';

// Input types that imply role 'textbox'
const TEXTBOX_INPUT_TYPES = ['email', 'tel', 'text', 'url'];

/**
 * Checks if input elem has role 'textbox' or 'combobox'
 * @param elem - input element whose role is being calculated
 * @return - true if elem has role 'textbox' or list attribute,
 * false otherwise.
 */
function isTextboxOrComboboxInput(elem: HTMLInputElement): boolean {
  const inputType = elem.getAttribute('type')?.toLowerCase() ?? '';
  return TEXTBOX_INPUT_TYPES.includes(inputType) || elem.hasAttribute('list');
}

// Input types that imply role 'range'
const RANGE_INPUT_TYPES = ['number', 'range'];

/**
 * Checks if input elem is a 'range' input,
 * i.e has role 'slider' or 'spinbutton'
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

  // #SPEC_ASSUMPTION (E.3) : controls with explicit roles are
  // handled by rule2F

  // #SPEC_ASSUMPTION (E.1) : that 'embedded within the label
  // for another widget' is equivalent to 'part of a name computation'
  if (!context.inherited.partOfName) {
    return null;
  }

  // textarea nodeName implies role=textbox
  if (node instanceof HTMLTextAreaElement) {
    return node.value;
  }

  // Handles textboxes and comboboxes that are <input> elements
  if (node instanceof HTMLInputElement && isTextboxOrComboboxInput(node)) {
    return node.value;
  }

  // Handles comboboxes and listboxes that are <select> elements
  if (node instanceof HTMLSelectElement) {
    // #SPEC_ASSUMPTION (E.2) : consider multiple selected options' text
    // alternatives, joining them with a space as in 2B.ii.c
    return Array.from(node.selectedOptions).map((optionElem) => {
      return computeTextAlternative(optionElem, {inherited: context.inherited});
    }).filter(alternativeText => alternativeText !== '').join(' ');
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
