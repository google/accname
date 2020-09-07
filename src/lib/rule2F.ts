import {Context, getDefaultContext} from './context';
import {computeTextAlternative} from './compute_text_alternative';
import {closest} from './polyfill';

// Explicit roles allowing 'name from content'
// (https://www.w3.org/TR/wai-aria-1.1/#namefromcontent)
const NAME_FROM_CONTENT_ROLES = [
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
 * (https://www.w3.org/TR/html-aria/#docconformance)
 */
const NAME_FROM_CONTENT_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'tbody',
  'thead',
  'tfoot',
  'summary',
  'button',
];

/**
 * HTML input elements allow name from content when
 * they have the following values for 'type' attribute
 * (https://www.w3.org/TR/html-aria/#docconformance)
 */
const NAME_FROM_CONTENT_INPUT_TYPES = [
  'button',
  'checkbox',
  'image',
  'radio',
  'reset',
  'submit',
];

/**
 * Some HTML elements allow name from context only if certain
 * conditions apply. This function maps element types to functions that
 * determine if a specific element of that type allows name from content
 * (https://www.w3.org/TR/html-aria/#docconformance)
 * @param elemNodeName - the nodeName (tag type) of the element whose ability
 * to allow name from content is being calculated.
 * @return - a function that may be applied to an element of type elemNodeName
 * that returns true if that node allows name from content, and false otherwise.
 */
function getFunctionCalculatingAllowsNameFromContent(
  elemNodeName: string
): ((elem: HTMLElement) => boolean) | null {
  switch (elemNodeName) {
    case 'th':
      return (elem: HTMLElement) => {
        return closest(elem, 'table') !== null;
      };
    case 'td':
      return (elem: HTMLElement) => {
        return closest(elem, 'table') !== null;
      };
    case 'option':
      return (elem: HTMLElement) => {
        return closest(elem, 'select,datalist') !== null;
      };
    case 'input':
      return (elem: HTMLElement) => {
        const inputType = elem.getAttribute('type')?.trim().toLowerCase() ?? '';
        return NAME_FROM_CONTENT_INPUT_TYPES.includes(inputType);
      };
    case 'a':
      return (elem: HTMLElement) => {
        return elem.hasAttribute('href');
      };
    case 'area':
      return (elem: HTMLElement) => {
        return elem.hasAttribute('href');
      };
    case 'link':
      return (elem: HTMLElement) => {
        return elem.hasAttribute('href');
      };
    default:
      return null;
  }
}

/**
 * Calculates whether or not an element's name may be calculated using
 * its contents. Elements may allow name from content when they have certain
 * roles, be they explicit (role attribute) or implicit (semantic HTML).
 * @param elem - the function checks if 'elem' allows name from content
 * @return - true if elem allows name from content, false otherwise
 */
function roleAllowsNameFromContent(elem: HTMLElement): boolean {
  const explicitRole = elem.getAttribute('role')?.trim().toLowerCase() ?? '';
  if (NAME_FROM_CONTENT_ROLES.includes(explicitRole)) {
    return true;
  }

  const elemNodeName = elem.nodeName.toLowerCase();
  if (NAME_FROM_CONTENT_TAGS.includes(elemNodeName)) {
    return true;
  }

  const nameFromContentFunction = getFunctionCalculatingAllowsNameFromContent(
    elemNodeName
  );
  if (nameFromContentFunction) {
    return nameFromContentFunction(elem);
  }

  return false;
}

export const TEST_ONLY = {roleAllowsNameFromContent};

// See https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html
// for discussion of roles & tags that forbid name from content.
//
// *This case is not explicitly included in version 1.1 of the spec, however,
// as per the thread linked above we have included it (as have other implementations).
const NEVER_NAME_FROM_CONTENT_ROLES = [
  'application',
  'alert',
  'log',
  'marquee',
  'timer',
  'alertdialog',
  'dialog',
  'banner',
  'complementary',
  'form',
  'main',
  'navigation',
  'region',
  'search',
  'article',
  'document',
  'feed',
  'figure',
  'img',
  'math',
  'toolbar',
  'menu',
  'menubar',
  'grid',
  'listbox',
  'radiogroup',
  'textbox',
  'searchbox',
  'spinbutton',
  'scrollbar',
  'slider',
  'tablist',
  'tabpanel',
  'tree',
  'treegrid',
  'separator',
  'rowgroup',
  'group',
];
// These tag names imply roles that forbid name from content.
const NEVER_NAME_FROM_CONTENT_TAGS = [
  'article',
  'aside',
  'body',
  'select',
  'datalist',
  'optgroup',
  'dialog',
  'figure',
  'footer',
  'form',
  'header',
  'hr',
  'img',
  'textarea',
  'input',
  'main',
  'math',
  'menu',
  'nav',
  'section',
  'thead',
  'tbody',
  'tfoot',
  'fieldset',
];

/**
 * Checks if 'elem' is forbidden from allowing 'name from content'
 * @param elem - element whose text alternative is being computed
 */
function roleForbidsNameFromContent(elem: HTMLElement): boolean {
  const explicitRole = elem.getAttribute('role')?.trim().toLowerCase() ?? '';
  if (NEVER_NAME_FROM_CONTENT_ROLES.includes(explicitRole)) {
    return true;
  }

  // Implicit roles : implied by current node tag name.
  const elemNodeName = elem.nodeName.toLowerCase();
  if (NEVER_NAME_FROM_CONTENT_TAGS.includes(elemNodeName)) {
    return true;
  }

  return false;
}

/**
 * Checks if the contents of 'elem' with context 'context' should
 * be used in its accesssible name. This is the condition for
 * rule 2F.
 * @param elem - elem whose text alternative is being computed
 * @param context - additional information about the context of elem
 * @return - whether or not rule 2Fs condition has been satisfied
 */
function allowsNameFromContent(elem: HTMLElement, context: Context): boolean {
  if (roleForbidsNameFromContent(elem)) {
    return false;
  }

  if (roleAllowsNameFromContent(elem)) {
    return true;
  }

  if (context.directLabelReference) {
    return true;
  }

  if (context.inherited.partOfName) {
    return true;
  }

  return false;
}

/**
 * Gets text content generated by CSS pseudo elements for a given HTMLElement
 * @param elem - element whose css generated content is being calculated
 * @param pseudoElementName - the name of the pseudo element whose content is
 * being resolved.
 * @return - css generated content for pseudoElementName if such content exists,
 * empty string otherwise.
 */
function getCssContent(elem: HTMLElement, pseudoElementName: string): string {
  const cssContent: string = window.getComputedStyle(elem, pseudoElementName)
    .content;
  // <string> CSS content identified by surrounding quotes
  // see: https://developer.mozilla.org/en-US/docs/Web/CSS/content
  // and: https://developer.mozilla.org/en-US/docs/Web/CSS/string
  if (
    (cssContent[0] === '"' && cssContent[cssContent.length - 1] === '"') ||
    (cssContent[0] === "'" && cssContent[cssContent.length - 1] === "'")
  ) {
    return cssContent.slice(1, -1);
  }
  return '';
}

/**
 * Implementation of rule 2F
 * @param node - node whose text alternative is being calculated
 * @param context - additional info relevant to the calculation of nodes
 * text alternative
 * @return - text alternative for node if the conditions of 2F are satisfied,
 * null otherwise.
 */
export function rule2F(
  node: Node,
  context = getDefaultContext()
): string | null {
  if (!(node instanceof HTMLElement)) {
    return null;
  }

  // The condition for rule 2F determines if the contents of the
  // current node should be used in its accessible name.
  if (!allowsNameFromContent(node, context)) {
    return null;
  }

  const a11yChildNodes = Array.from(node.childNodes);

  // Include any aria-owned Nodes in the list of 'child nodes'
  const ariaOwnedNodeIds = node.getAttribute('aria-owns');
  if (ariaOwnedNodeIds) {
    for (const idref of ariaOwnedNodeIds.split(' ')) {
      const referencedNode = document.getElementById(idref);
      if (referencedNode) {
        a11yChildNodes.push(referencedNode);
      }
    }
  }

  const textAlterantives: string[] = [];
  for (const childNode of a11yChildNodes) {
    if (!context.inherited.visitedNodes.includes(childNode)) {
      context.inherited.visitedNodes.push(childNode);
      context.inherited.partOfName = true;

      const textAlterantive = computeTextAlternative(childNode, {
        inherited: context.inherited,
      }).name;

      textAlterantives.push(textAlterantive);
    }
  }

  // Consider only non-empty text alternatives to prevent double
  // spacing between text alternatives in accumulatedText.
  // #SPEC_ASSUMPTION (F.1) : that accumulated texts should be space separated
  // for readability
  const accumulatedText = textAlterantives
    .filter(textAlterantive => textAlterantive !== '')
    .join(' ');

  const cssBeforeContent = getCssContent(node, ':before');
  const cssAfterContent = getCssContent(node, ':after');

  // #SPEC_ASSUMPTION (F.2) : that CSS generated content should be
  // concatenated to accumulatedText
  const result = (cssBeforeContent + accumulatedText + cssAfterContent).trim();

  return result || null;
}
