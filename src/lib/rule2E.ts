/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {hasTagName} from './util';

// Input types that imply role 'textbox' if list attribute is not present,
// and imply role 'combobox' if list attribute is present.
export const TEXT_INPUT_TYPES = ['email', 'tel', 'text', 'url', 'search'];

/**
 * Determines whether a given node has role 'textbox' and,
 * if so, gets the value of that textbox.
 * @param node - element whose role is being calculated
 * @return - textbox value if node is a textbox, null otherwise
 * (null indicates that node is not a textbox).
 */
export function getValueIfTextbox(node: HTMLElement): string|null {
  // #SPEC_ASSUMPTION (E.3) : Explicit role='textbox' are handled by rule2F.

  // Handles the case where node role is explictly overwritten
  const nodeRole = node.getAttribute('role');
  if (nodeRole && nodeRole !== 'textbox') {
    return null;
  }

  // type <textarea> implies role='textbox'
  if (hasTagName(node, 'textarea')) {
    return node.value;
  }

  // <input> with certain type values & no list attribute implies role='textbox'
  if (hasTagName(node, 'input') &&
      TEXT_INPUT_TYPES.includes(node.type) && !node.hasAttribute('list')) {
    return node.value;
  }

  return null;
}

// Input types that imply role 'range'
const RANGE_INPUT_TYPES = ['number', 'range'];

// Roles for whom 'range' is a superclass.
// Each of these roles explicitly defines the 'range' role.
const RANGE_ROLES = ['spinbutton', 'slider', 'progressbar', 'scrollbar'];

/**
 * Determines whether a given node has role 'range' and,
 * if so, gets the text alternative for that node.
 * @param node - node whose role is being calculated
 * @return - text alternative for node if node is a 'range',
 * null otherwise (indicating that node is not a range).
 */
export function getValueIfRange(node: HTMLElement): string|null {
  const nodeRoleAttribute = node.getAttribute('role') ?? '';
  const isExplicitRange = RANGE_ROLES.includes(nodeRoleAttribute);

  // Handles the case where node role is explictly overwritten
  if (nodeRoleAttribute && !isExplicitRange) {
    return null;
  }

  const isImplicitRange = (hasTagName(node, 'input') &&
                           RANGE_INPUT_TYPES.includes(node.type)) ||
      hasTagName(node, 'progress');

  if (isExplicitRange || isImplicitRange) {
    if (node.hasAttribute('aria-valuetext')) {
      return node.getAttribute('aria-valuetext');
    }
    if (node.hasAttribute('aria-valuenow')) {
      return node.getAttribute('aria-valuenow');
    }
    if (hasTagName(node, 'input')) {
      return node.value;
    }
    if (hasTagName(node, 'progress')) {
      return node.value.toString();
    }
  }

  return null;
}
