/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Process elem's text alternative if elem is an <input>, assuming
 * that no <label> element references elem.
 * @param elem - element whose text alternative is being processed
 * @return - text alternative of elem if elem is an <input>
 */
export function getUnlabelledInputText(elem: HTMLInputElement): string|null {
  // Implementation reflects rules defined in sections 5.1 - 5.3 of html-aam
  // spec:
  // https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation

  const inputType = elem.getAttribute('type') ?? '';
  if ((inputType === 'button' || inputType === 'submit' ||
       inputType === 'reset') &&
      elem.hasAttribute('value')) {
    return elem.value;
  }

  if (inputType === 'submit' || inputType === 'reset') {
    // This should be a localised string, but for now we are
    // just supporting English.
    return inputType;
  }

  if (inputType === 'image' && elem.hasAttribute('alt')) {
    return elem.getAttribute('alt');
  }

  if (inputType === 'image' && !elem.hasAttribute('title')) {
    // This should be a localised string, but for now we are
    // just supporting English.
    return 'Submit Query';
  }

  // Title attribute handled by 2I.

  return null;
}

// Only certain element types are labellable
// See: https://html.spec.whatwg.org/multipage/forms.html#category-label
export const LABELLABLE_ELEMENT_TYPES = [
  'BUTTON',
  'INPUT',
  'METER',
  'OUTPUT',
  'PROGRESS',
  'SELECT',
  'TEXTAREA',
];
