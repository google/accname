import { Context, getDefaultContext } from './context';
import { computeTextAlternative } from './compute_text_alternative';

const TEXTBOX_INPUT_TYPES = [
  'email',
  'tel',
  'text',
  'url'
];

function isTextboxOrListInput(elem: HTMLInputElement): boolean {
  const inputType = elem.getAttribute('type')?.toLowerCase() ?? '';
  return (
    TEXTBOX_INPUT_TYPES.includes(inputType) ||
    elem.hasAttribute('list')
  );
}

const RANGE_INPUT_TYPES = [
  'number',
  'range'
];

function isRangeInput(elem: HTMLElement): boolean {
  if (elem.nodeName !== 'input') {
    return false;
  }

  const inputType = elem.getAttribute('type')?.toLowerCase() ?? '';
  return RANGE_INPUT_TYPES.includes(inputType);
}

export function rule2E(node: Node, context: Context = getDefaultContext()): string | null {
  if (!context.inherited.partOfName) {
    return null;
  }

  if (!(node instanceof HTMLElement)) {
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
    for (const optionNode of node.selectedOptions) {
      const textAlterantive = computeTextAlternative(optionNode);
      textAlterantives.push(textAlterantive);
    }
    return textAlterantives.filter((text) => text !== '').join(' ');
  }

  if (isRangeInput(node)) {
    if (node.hasAttribute('aria-valuetext')) {
      return node.getAttribute('aria-valuetext');
    }
    if (node.hasAttribute('aria-valuenow')) {
      return node.getAttribute('aria-valuenow');
    }
    return node.nodeValue;
  }

  return null;
}