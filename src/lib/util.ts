/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates whether or not a given element is focusable.
 * @param elem - The element whose focusability is to be calculated.
 */
export function isFocusable(elem: HTMLElement): boolean {
  // See
  // https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
  if ((elem instanceof HTMLAnchorElement || elem instanceof HTMLAreaElement ||
       elem instanceof HTMLLinkElement) &&
      elem.hasAttribute('href')) {
    return true;
  }

  if ((elem instanceof HTMLInputElement || elem instanceof HTMLSelectElement ||
       elem instanceof HTMLTextAreaElement ||
       elem instanceof HTMLButtonElement) &&
      !elem.hasAttribute('disabled')) {
    return true;
  }

  return elem.hasAttribute('tabindex') || elem.isContentEditable;
}
