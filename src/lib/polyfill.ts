/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** `element.matches(selector)` with a polyfill for IE */
function matches(element: Element, selector: string): boolean {
  interface IEElement extends Element {
    msMatchesSelector(selectors: string): boolean;
  }

  return (
      element.matches?.(selector) ??
      (element as IEElement).msMatchesSelector?.(selector) ??
      element.webkitMatchesSelector(selector));
}

/** `element.closest(selector)` with a polyfill for IE */
export function closest(element: HTMLElement, selector: string): HTMLElement|
    null {
  if (element.closest) {
    return element.closest(selector);
  }

  while (!matches(element, selector)) {
    if (element.parentElement === null) {
      return null;
    }
    element = element.parentElement;
  }
  return element;
}
