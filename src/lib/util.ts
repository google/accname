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
  if ((hasTagName(elem, 'a') || hasTagName(elem, 'area') ||
       hasTagName(elem, 'link')) &&
      elem.hasAttribute('href')) {
    return true;
  }

  if ((hasTagName(elem, 'input') || hasTagName(elem, 'select') ||
       hasTagName(elem, 'textarea') || hasTagName(elem, 'button')) &&
      !elem.hasAttribute('disabled')) {
    return true;
  }

  return elem.hasAttribute('tabindex') || elem.isContentEditable;
}

/** Whether this `node` is an `Element` */
export function isElement(n: Node): n is Element {
  return n.nodeType === Node.ELEMENT_NODE;
}

/** Whether this `node` is an `HTMLElement` */
export function isHTMLElement(n: Node): n is HTMLElement {
  return isElement(n) && n.namespaceURI === `http://www.w3.org/1999/xhtml`;
}

/** Whether this `node` is an `SVGElement` */
export function isSVGElement(n: Node): n is SVGElement {
  return isElement(n) && n.namespaceURI === `http://www.w3.org/2000/svg`;
}

/**
 * Checks whether the `tagName` of a particular element matches a known
 * tagName. The `tagName` is constrained by the same type mappings that are used
 * in `document.querySelector`, which allows us to constrain the return type as
 * well.
 */
export function hasTagName<TagName extends keyof HTMLElementTagNameMap>(
    el: HTMLElement, name: TagName): el is HTMLElementTagNameMap[TagName];
export function hasTagName<TagName extends keyof SVGElementTagNameMap>(
    el: SVGElement, name: TagName): el is SVGElementTagNameMap[TagName];
export function hasTagName(el: Element, name: string): boolean {
  return el.tagName.toLowerCase() === name;
}
