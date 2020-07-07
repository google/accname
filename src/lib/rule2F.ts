import {Context, resetUninherited} from './context';
import {computeTextAlternative} from './compute_text_alternative';

// Explicit roles allowing 'name from content'
// (https://www.w3.org/TR/wai-aria/#namefromcontent)
const nameFromContentRoles = [
  'button',
  'cell',
  'checkbox',
  'columnheader',
  'gridcell',
  'heading',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'row',
  'rowgroup',
  'rowheader',
  'switch',
  'tab',
  'tooltip',
  'tree',
  'treeitem',
];

/**
 * HTML element types that allow name from content according
 * to their implicit aria roles.
 * (https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings)
 */
const nameFromContentElemNodeName = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'tbody',
  'thead',
  'tfoot',
];

/**
 * HTML input elements allow name from content when
 * they have the following values for 'type' attribute
 * (https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings)
 */
const nameFromContentInputTypes = [
  'button',
  'checkbox',
  'image',
  'radio',
  'reset',
  'submit',
];

/**
 * Some HTML elements allow name from context only if certain
 * conditions apply. This maps element types to functions that
 * determine if a specific element of that type allows name from content
 * (https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings)
 */
const nameFromContentFunctionOfElem: {[key: string]: Function} = {
  th: (elem: HTMLElement) => {
    return (
      elem.closest('table') !== null ||
      elem.closest('[role="table"]') !== null ||
      elem.closest('[role="grid"]') !== null
    );
  },
  td: (elem: HTMLElement) => {
    return (
      elem.closest('table') !== null ||
      elem.closest('[role="table"]') !== null ||
      elem.closest('[role="grid"]') !== null
    );
  },
  option: (elem: HTMLElement) => {
    return elem.closest('select') !== null || elem.closest('datalist') !== null;
  },
  input: (elem: HTMLElement) => {
    const inputType = elem.getAttribute('type')?.trim().toLowerCase() ?? '';
    return nameFromContentInputTypes.includes(inputType);
  },
  a: (elem: HTMLElement) => {
    return elem.hasAttribute('href');
  },
  area: (elem: HTMLElement) => {
    return elem.hasAttribute('href');
  },
};

/**
 * @param elem - the function checks if 'elem' allows name from content
 * @return - true if elem allows name from content, false otherwise
 */
function allowsNameFromContent(elem: HTMLElement): boolean {
  const elemRole: string =
    elem.getAttribute('role')?.trim().toLowerCase() ?? '';
  if (nameFromContentRoles.includes(elemRole)) {
    return true;
  }

  const elemNodeName: string = elem.nodeName.toLowerCase();
  if (nameFromContentElemNodeName.includes(elemNodeName)) {
    return true;
  }

  const nameFromContentFunction = nameFromContentFunctionOfElem[elemNodeName];
  if (nameFromContentFunction) {
    return nameFromContentFunction(elem);
  }

  return false;
}

export {allowsNameFromContent as allowsNameFromContent_TEST};

/**
 * Checks if 'elem' in with 'context' satisfies the conditions
 * necessary to apply rule 2F.
 * @param elem - elem whose text alternative is being computed
 * @param context - additional information about the context of elem
 * @return - whether or not rule 2Fs condition has been satisfied
 */
function rule2FCondition(elem: HTMLElement, context: Context): boolean {
  if (allowsNameFromContent(elem)) {
    return true;
  }

  if (context.ariaLabelledbyReference) {
    return true;
  }

  if (context.isLabelReference) {
    context.inherited.isLabelDescendant = true;
    return true;
  }

  if (context.inherited.isLabelDescendant) {
    return true;
  }

  return false;
}

/**
 * Implementation of rule 2F
 * @param node - node whose text alternative is being calculated
 * @param context - additional info relevant to the calculation of nodes
 * text alternative
 * @return - text alternative for node if the conditions of 2F are satisfied,
 * null otherwise.
 */
export function rule2F(node: Node, context: Context): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  if (!rule2FCondition(node, context)) {
    return null;
  }

  // CSS generated text seems to have value 'on' if it doesn't exist. (rather than null?)
  // Not sure if this is a bug or I've done something wrong.
  let cssBeforeContent: string = window
    .getComputedStyle(node, ':before')
    .content.slice(1, -1);
  if (cssBeforeContent === 'on') {
    cssBeforeContent = '';
  }
  let cssAfterContent: string = window
    .getComputedStyle(node, ':after')
    .content.slice(1, -1);
  if (cssAfterContent === 'on') {
    cssAfterContent = '';
  }

  const textAlterantives: string[] = [];
  node.childNodes.forEach(childNode => {
    if (!context.inherited.visitedNodes.includes(childNode)) {
      context.inherited.visitedNodes.push(childNode);
      const textAlterantive = computeTextAlternative(
        childNode,
        resetUninherited(context)
      );
      // Only consider non-empty text alternatives to avoid multiple spaces
      // between words from .join(' ')
      if (textAlterantive !== '') {
        textAlterantives.push(textAlterantive);
      }
    }
  });

  const accumulatedText = textAlterantives.join(' ');

  return (
    cssBeforeContent +
    ' ' +
    accumulatedText +
    ' ' +
    cssAfterContent
  ).trim();
}
