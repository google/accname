/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Get any HTMLElement referenced in the aria-labelledby attribute
 * of 'elem' that exist in the document (i.e is 'valid')
 * @param elem - element whose aria-labelledby attribute is considered
 * @return - An array of any HTMLElement in the document that is referenced
 * by elem's aria-labelledby
 */
export function resolveValidAriaLabelledbyIdrefs(elem: HTMLElement):
    HTMLElement[] {
  const idrefs = elem.getAttribute('aria-labelledby')?.split(' ') ?? [];

  const validElems: HTMLElement[] = [];
  for (const id of idrefs) {
    const elem = document.getElementById(id);
    if (elem) {
      validElems.push(elem);
    }
  }
  return validElems;
}
