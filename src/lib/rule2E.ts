/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ComputeTextAlternative} from './compute_text_alternative';
import {Context} from './context';
import {AccnameOptions} from './options';
import {hasTagName, isHTMLElement} from './util';


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
  if (hasTagName(node, 'input') && TEXT_INPUT_TYPES.includes(node.type) &&
      !node.hasAttribute('list')) {
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

  const isImplicitRange =
      (hasTagName(node, 'input') && RANGE_INPUT_TYPES.includes(node.type)) ||
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
    options: AccnameOptions,
    context: Context,
    computeTextAlternative: ComputeTextAlternative,
    ): string|null {
  // Handles the case where node role is explictly overwritten
  const nodeRole = node.getAttribute('role');
  if (nodeRole && nodeRole !== 'listbox' && nodeRole !== 'combobox') {
    return null;
  }

  // Combobox role implied by input type and presence of list attribute,
  // chosen option is the input value.
  if (hasTagName(node, 'input') && TEXT_INPUT_TYPES.includes(node.type) &&
      (node.hasAttribute('list') || nodeRole === 'combobox')) {
    return node.value;
  }

  // Text alternative for elems of role 'listbox' and 'combobox'
  // consists of the text alternatives for their selected options.
  let selectedOptions: HTMLElement[] = [];
  // Listbox may be defined explicitly using 'role',
  // and using 'aria-selected' attribute to mark selected options.
  if (nodeRole && nodeRole === 'listbox') {
    selectedOptions = Array.from(
        node.querySelectorAll('[role="option"][aria-selected="true"]'));
  }
  // A <select> element is always implicitly either a listbox or a combobox
  else if (hasTagName(node, 'select')) {
    selectedOptions = Array.from(node.selectedOptions);
  }

  // If the current node has any selected options (either by aria-selected
  // or semantic <option selected>) they will be stored in selectedOptions.
  if (selectedOptions.length > 0) {
    // #SPEC_ASSUMPTION (E.2) : consider multiple selected options' text
    // alternatives, joining them with a space as in 2B.ii.c
    return selectedOptions
        .map(optionElem => computeTextAlternative(optionElem, options, {
                             inherited: context.inherited,
                           }).name)
        .filter(alternativeText => alternativeText !== '')
        .join(' ');
  }

  return null;
}

/**
 * Implementation for rule 2E.
 * @param node - node whose text alternative is being calculated
 * @param context - additional information relevant to the computation of a text
 * alternative for node.
 * @return text alternative for 'node' if rule 2E accepts 'node', null
 *     otherwise.
 */
export function rule2E(
    node: Node,
    options: AccnameOptions,
    context: Context,
    computeTextAlternative: ComputeTextAlternative,
    ): string|null {
  if (!isHTMLElement(node)) {
    return null;
  }

  // #SPEC_ASSUMPTION (E.1) : that 'embedded within the label
  // for another widget' is equivalent to 'part of a name computation'
  if (!context.inherited.partOfName) {
    return null;
  }

  const textboxValue = getValueIfTextbox(node);
  if (textboxValue) {
    return textboxValue;
  }

  // #SPEC_ASSUMPTION (E.4) : menu button is handled by 2F

  const comboboxOrListboxValue = getValueIfComboboxOrListbox(
      node, options, context, computeTextAlternative);
  if (comboboxOrListboxValue) {
    return comboboxOrListboxValue;
  }

  const rangeValue = getValueIfRange(node);
  if (rangeValue) {
    return rangeValue;
  }

  return null;
}
