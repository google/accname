import { Context, getDefaultContext } from './context';

const TEXTBOX_INPUT_TYPES = [
  'email',
  'tel',
  'text',
  'url'
];

function isTextbox(elem: HTMLElement): boolean {
  if (elem.nodeName === 'textarea') {
    return true;
  }

  if (elem.nodeName !== 'input') {
    return false;
  }

  const inputType = elem.getAttribute('type')?.toLowerCase() ?? '';
  return (
    TEXTBOX_INPUT_TYPES.includes(inputType) &&
    !elem.hasAttribute('list')
  );
}

function isList(elem: HTMLElement): boolean {
  
}

export function rule2E(node: Node, context: Context = getDefaultContext()): string | null {
  if (!context.inherited.isRecursive) {
    return null;
  }

  if (!(node instanceof HTMLElement)) {
    return null;
  }

  if (isTextbox(node)) {
    return node.nodeValue;
  }

  if (isList(node)) {

  }
}