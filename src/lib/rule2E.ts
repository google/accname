import {Context, getDefaultContext} from './context';
import {computeTextAlternative} from './compute_text_alternative';

// Input types that imply role 'textbox' if list attribute is not present,
// and imply role 'combobox' if list attribute is present.
const TEXT_INPUT_TYPES = ['email', 'tel', 'text', 'url', 'search'];

/**
 * Determines whether a given node has role 'textbox' and,
 * if so, gets the value of that textbox.
 * @param node - element whose role is being calculated
 * @return - textbox value if node is a textbox, null otherwise
 * (null indicates that node is not a textbox).
 */
function getValueIfTextbox(node: HTMLElement): string | null {
  // Explicit role='textbox' (elements not of type <input>) handled by rule2F

  // type <textarea> implies role='textbox'
  if (node instanceof HTMLTextAreaElement) {
    return node.value;
  }

  if (!(node instanceof HTMLInputElement)) {
    return null;
  }

  // <input> with certain type values & no list attribute implies role='textbox'
  const nodeInputType = node.getAttribute('type')?.toLowerCase() ?? '';
  if (TEXT_INPUT_TYPES.includes(nodeInputType) && !node.hasAttribute('list')) {
    return node.value;
  }

  return null;
}

/**
 * Determines whether a given node has role 'combobox'
 * or 'listbox' and, if so, gets the text alternative for the
 * option(s) selected by that combobox / listbox.
 * @param node - node whose role is being calculated
 * @param context - information relevant to the calculation of that role
 * @return - text alternative for selected option(s) if node is a
 * combobox or listbox, null otherwise.
 * (null indicates that node is neither combobox nor listbox).
 */
function getValueIfComboboxOrListbox(
  node: HTMLElement,
  context: Context
): string | null {
  // Combobox role implied by input type and presence of list attribute,
  // chosen option is the input value.
  if (node instanceof HTMLInputElement) {
    const nodeInputType = node.getAttribute('type')?.toLowerCase() ?? '';
    if (TEXT_INPUT_TYPES.includes(nodeInputType) && node.hasAttribute('list')) {
      return node.value;
    }
  }

  // Listbox may be defined explicitly using 'role',
  // and using 'aria-selected' attribute to mark selected options.
  const nodeRole = node.getAttribute('role') ?? '';
  if (nodeRole.toLowerCase() === 'listbox') {
    // #SPEC_ASSUMPTION (E.2) : consider multiple selected options' text
    // alternatives, joining them with a space as in 2B.ii.c
    const selectedOptionsTextAlternative = Array.from(node.childNodes)
      .map(childNode => {
        if (
          childNode instanceof HTMLElement &&
          childNode.getAttribute('aria-selected') === 'true'
        ) {
          return computeTextAlternative(childNode, {
            inherited: context.inherited,
          });
        }
        return '';
      })
      .filter(alternativeText => alternativeText !== '')
      .join(' ');
    if (selectedOptionsTextAlternative) {
      return selectedOptionsTextAlternative;
    }
  }

  // A <select> element is always implicitly either a listbox or a combobox
  if (node instanceof HTMLSelectElement) {
    // #SPEC_ASSUMPTION (E.2) : consider multiple selected options' text
    // alternatives, joining them with a space as in 2B.ii.c
    const selectedOptionsTextAlternative = Array.from(node.selectedOptions)
      .map(optionElem => {
        return computeTextAlternative(optionElem, {
          inherited: context.inherited,
        });
      })
      .filter(alternativeText => alternativeText !== '')
      .join(' ');
    if (selectedOptionsTextAlternative) {
      return selectedOptionsTextAlternative;
    }
  }

  return null;
}

// Input types that imply role 'range'
const RANGE_INPUT_TYPES = ['number', 'range'];

/**
 * Determines whether a given node has role 'range' and,
 * if so, gets the text alternative for that node.
 * @param node - node whose role is being calculated
 * @return - text alternative for node if node is a 'range',
 * null otherwise (indicating that node is not a range).
 */
function getValueIfRange(node: HTMLElement): string | null {
  const nodeRoleAttribute = node.getAttribute('role')?.toLowerCase() ?? '';
  const isExplicitRange =
    nodeRoleAttribute === 'spinbutton' ||
    nodeRoleAttribute === 'slider' ||
    nodeRoleAttribute === 'progressbar' ||
    nodeRoleAttribute === 'scrollbar';

  const nodeTypeAttribute = node.getAttribute('type')?.toLowerCase() ?? '';
  const isImplicitRange =
    RANGE_INPUT_TYPES.includes(nodeTypeAttribute) ||
    node instanceof HTMLProgressElement;

  if (isExplicitRange || isImplicitRange) {
    if (node.hasAttribute('aria-valuetext')) {
      return node.getAttribute('aria-valuetext');
    }
    if (node.hasAttribute('aria-valuenow')) {
      return node.getAttribute('aria-valuenow');
    }
    if (node instanceof HTMLInputElement) {
      return node.value;
    }
    if (node instanceof HTMLProgressElement) {
      return node.value.toString();
    }
  }

  return null;
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
  context = getDefaultContext()
): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  // #SPEC_ASSUMPTION (E.3) : controls whose text alternative
  // is their text content are handled by rule2F.

  // #SPEC_ASSUMPTION (E.1) : that 'embedded within the label
  // for another widget' is equivalent to 'part of a name computation'
  if (!context.inherited.partOfName) {
    return null;
  }

  const textboxValue = getValueIfTextbox(node);
  if (textboxValue) {
    return textboxValue;
  }

  // menu button is handled by 2F (buttons allow name from content)

  const comboboxOrListboxValue = getValueIfComboboxOrListbox(node, context);
  if (comboboxOrListboxValue) {
    return comboboxOrListboxValue;
  }

  const rangeValue = getValueIfRange(node);
  if (rangeValue) {
    return rangeValue;
  }

  return null;
}
