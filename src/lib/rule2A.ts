/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, getDefaultContext} from './context';
import {closest} from './polyfill';
import {isFocusable, isHTMLElement, hasTagName} from './util';

/**
 * Looks at a variety of characteristics (CSS, size on screen, attributes)
 * to determine if 'node' should be considered hidden
 * @param node - node whose hidden-ness is being calculated
 * @return - whether or not the node is considered hidden
 */
// #SPEC_ASSUMPTION (A.2) : definition of 'hidden'
function isHidden(node: Node, context: Context): boolean {
  if (!isHTMLElement(node)) {
    return false;
  }

  // #SPEC_ASSUMPTION (A.3) : options shouldn't be hidden
  if (hasTagName(node, 'option') && closest(node, 'select') !== null &&
      context.inherited.partOfName) {
    return false;
  }

  const styles = window.getComputedStyle(node);

  if (parseInt(styles.height) === 0 && parseInt(styles.width) === 0 &&
      !isFocusable(node)) {
    return true;
  }

  if (styles.visibility === 'hidden') {
    return true;
  }

  if (closest(node, '[hidden],[aria-hidden="true"]') !== null) {
    return true;
  }

  // The "display" style isn't inherited so check ancestors directly
  let ancestor: HTMLElement|null = node;
  while (ancestor !== null) {
    if (window.getComputedStyle(ancestor).display === 'none') {
      return true;
    }
    ancestor = ancestor.parentElement;
  }

  return false;
}

/**
 * Condition for applying rule 2A
 * @param node - The node whose text alternative is being calculated
 * @param context - Additional information relevant to the text alternative
 *     computation for node
 * @return - Whether or not node satisfies the condition for rule 2A
 */
function rule2ACondition(node: Node, context: Context): boolean {
  // #SPEC_ASSUMPTION (A.1) : definition of 'directly referenced'
  return isHidden(node, context) && !context.directLabelReference;
}

/**
 * Implementation of rule 2A
 * @param node - The element whose text alternative is being calculated
 * @param context - Additional information relevant to the text alternative
 *     computation for node
 * @return - The text alternative string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was
 * not satisfied.
 */
export function rule2A(node: Node, context = getDefaultContext()): string|null {
  let result = null;
  if (rule2ACondition(node, context)) {
    result = '';
  }
  return result;
}
