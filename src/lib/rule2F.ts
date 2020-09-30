/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context} from './context';
import {closest} from './polyfill';
import {isFocusable} from './util';


const ALWAYS_NAME_FROM_CONTENT = {
  // Explicit roles allowing 'name from content'
  // (https://www.w3.org/TR/wai-aria-1.1/#namefromcontent)
  roles: [
    'button',        'cell',     'checkbox',
    'columnheader',  'gridcell', 'heading',
    'link',          'menuitem', 'menuitemcheckbox',
    'menuitemradio', 'option',   'radio',
    'row',           'rowgroup', 'rowheader',
    'switch',        'tab',      'tooltip',
    'tree',          'treeitem',
  ],
  // HTML element types that allow name from content according
  // to their implicit aria roles.
  // (https://www.w3.org/TR/html-aria/#docconformance)
  tags: [
    'button',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'summary',
    'tbody',
    'tfoot',
    'thead',
  ],
};

// See https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html
// for discussion of roles & tags that forbid name from content.
//
// *This case is not explicitly included in version 1.1 of the spec, however,
// as per the thread linked above we have included it (as have other
// implementations).
const NEVER_NAME_FROM_CONTENT = {
  roles: [
    'alert',         'alertdialog', 'application', 'article',   'banner',
    'complementary', 'contentinfo', 'definition',  'dialog',    'directory',
    'document',      'feed',        'figure',      'form',      'grid',
    'group',         'img',         'list',        'listbox',   'log',
    'main',          'marquee',     'math',        'menu',      'menubar',
    'navigation',    'note',        'radiogroup',  'region',    'row',
    'rowgroup',      'scrollbar',   'search',      'searchbox', 'separator',
    'slider',        'spinbutton',  'status',      'table',     'tablist',
    'tabpanel',      'term',        'textbox',     'timer',     'toolbar',
    'tree',          'treegrid',
  ],
  tags: [
    'article', 'aside', 'body',   'datalist', 'dialog',  'fieldset', 'figure',
    'footer',  'form',  'header', 'hr',       'img',     'input',    'main',
    'math',    'menu',  'nav',    'optgroup', 'section', 'select',   'textarea',
  ],
};

// List 3 from
// https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html
const SOMETIMES_NAME_FROM_CONTENT = {
  roles: [
    'contentinfo',
    'definition',
    'directory',
    'list',
    'note',
    'status',
    'table',
    'term',
  ],
  tags: ['dd', 'details', 'dl', 'ol', 'output', 'table', 'ul'],
};

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
function getFunctionCalculatingAllowsNameFromContent(elemNodeName: string):
    ((elem: HTMLElement) => boolean)|null {
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
 * A container for lists of roles (explicit) and tags (implicit) that
 * together account for a certain genre / type of role.
 */
interface RoleType {
  roles: string[];
  tags: string[];
}

/**
 * Checks if a given HTMLElement matches any of the roles in a given RoleType.
 * @param elem - element whose role type is in question.
 * @param roleType - lists of indicators for some role type.
 */
function matchesRole(elem: HTMLElement, roleType: RoleType): boolean {
  // Explicit roles : specified using 'role' attribute
  const explicitRole = elem.getAttribute('role')?.trim().toLowerCase() ?? '';
  if (roleType.roles.includes(explicitRole)) {
    return true;
  }

  // Implicit roles : implied by current node tag name.
  const elemNodeName = elem.nodeName.toLowerCase();
  if (roleType.tags.includes(elemNodeName)) {
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
export function allowsNameFromContent(
    elem: HTMLElement, context: Context): boolean {
  // The terms 'list 1', 'list 2', 'list 3' are used in reference
  // to the following thread: see:
  // https://lists.w3.org/Archives/Public/public-aria/2017Jun/0057.html

  // Handles list 3 roles
  if (context.inherited.partOfName && elem.parentElement) {
    const parent = elem.parentElement;
    if (matchesRole(parent, ALWAYS_NAME_FROM_CONTENT) &&
        matchesRole(elem, SOMETIMES_NAME_FROM_CONTENT)) {
      return true;
    }
  }

  // Handles list 2 roles
  if (matchesRole(elem, NEVER_NAME_FROM_CONTENT)) {
    // role=menu should not allow name from content even if focusable.
    // See http://wpt.live/accname/name_test_case_733-manual.html
    if (elem.getAttribute('role')?.toLowerCase() === 'menu') {
      return false;
    }
    return isFocusable(elem);
  }

  // Handles list 1 roles
  if (matchesRole(elem, ALWAYS_NAME_FROM_CONTENT)) {
    return true;
  }

  // Elements that conditionally have an implicit role that matches
  // ALWAYS_NAME_FROM_CONTENT
  const elemNodeName = elem.nodeName.toLowerCase();
  const nameFromContentFunction =
      getFunctionCalculatingAllowsNameFromContent(elemNodeName);
  if (nameFromContentFunction && nameFromContentFunction(elem)) {
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

export const TEST_ONLY = {allowsNameFromContent};

/**
 * Gets text content generated by CSS pseudo elements for a given HTMLElement
 * @param elem - element whose css generated content is being calculated
 * @param pseudoElementName - the name of the pseudo element whose content is
 * being resolved.
 * @return - css generated content for pseudoElementName if such content exists,
 * empty string otherwise.
 */
export function getCssContent(
    elem: HTMLElement, pseudoElementName: string): string {
  const computedStyle = window.getComputedStyle(elem, pseudoElementName);
  const cssContent: string = computedStyle.content;
  const isBlockDisplay = computedStyle.display === 'block';
  // <string> CSS content identified by surrounding quotes
  // see: https://developer.mozilla.org/en-US/docs/Web/CSS/content
  // and: https://developer.mozilla.org/en-US/docs/Web/CSS/string
  if ((cssContent[0] === '"' && cssContent[cssContent.length - 1] === '"') ||
      (cssContent[0] === '\'' && cssContent[cssContent.length - 1] === '\'')) {
    return isBlockDisplay ? ' ' + cssContent.slice(1, -1) + ' ' :
                            cssContent.slice(1, -1);
  }
  return '';
}

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
// 'br' removed as it should add a whitespace to the accessible name.
export const inlineTags = [
  'a',      'abbr',     'acronym',  'b',     'bdi',    'bdo',      'big',
  'button', 'canvas',   'cite',     'code',  'data',   'datalist', 'del',
  'dfn',    'em',       'embed',    'i',     'iframe', 'img',      'ins',
  'kbd',    'label',    'map',      'mark',  'meter',  'noscript', 'object',
  'output', 'picture',  'progress', 'q',     'ruby',   's',        'samp',
  'script', 'select',   'slot',     'small', 'span',   'strong',   'sub',
  'sup',    'template', 'textarea', 'time',  'tt',     'u',        'var',
  'video',  'wbr',
];
