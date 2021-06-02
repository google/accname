/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ComputeTextAlternative} from './compute_text_alternative';
import {Context} from './context';
import {AccnameOptions} from './options';
import {hasTagName, isHTMLElement, isSVGElement} from './util';

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

/** Checks if `control` is the element that is labelled by `label` */
function isLabelledControl(
    label: HTMLLabelElement, control: HTMLElement): boolean {
  if (label.control !== undefined) {
    return label.control === control;
  } else {
    // For ie & edge
    if (label.htmlFor !== '' && label.htmlFor === control.id) {
      return true;
    } else if (label.htmlFor === '' && label.contains(control)) {
      return true;
    } else {
      return false;
    }
  }
}

function hasPresentationRole(el: HTMLElement): boolean {
  const explicitRole = el.getAttribute('role');
  if (explicitRole === 'presentation' || explicitRole === 'none') {
    return true;
  }

  // Implicit presentation role.
  if (explicitRole === null && hasTagName(el, 'img') &&
      el.getAttribute('alt') === '') {
    return true;
  }

  return false;
}

/**
 * Gets the text alternative as defined by one or more native <label>s.
 * @param elem - element whose text alternative is being calculated
 * @param context - information relevant to the computation of elem's text
 *     alternative
 * @return - the text alternative for elem if elem is legally labelled by a
 *     native
 * <label>, null otherwise.
 */
function getTextIfLabelled(
    elem: HTMLElement,
    options: AccnameOptions,
    context: Context,
    computeTextAlternative: ComputeTextAlternative,
    ): string|null {
  // Using querySelectorAll to get <label>s in DOM order.
  const allLabelElems = document.querySelectorAll('label');
  const labelElems =
      Array.from(allLabelElems).filter(label => isLabelledControl(label, elem));

  const textAlternative =
      labelElems
          .map(labelElem => computeTextAlternative(labelElem, options, {
                              directLabelReference: true,
                              inherited: context.inherited,
                            }).name)
          .filter(text => text !== '')
          .join(' ');

  return textAlternative || null;
}

/**
 * Implementation for rule 2D
 * @param node - the node whose text alternative is being computed
 * @param context - information relevant to the text alternative computation
 * for node
 * @return - text alternative for node if the conditions for applying
 * rule 2D are satisfied, null otherwise.
 */
export function rule2D(
    node: Node,
    options: AccnameOptions,
    context: Context,
    computeTextAlternative: ComputeTextAlternative,
    ): string|null {
  // <title>s define text alternatives for <svg>s
  // See: https://www.w3.org/TR/svg-aam-1.0/#mapping_additional_nd
  if (isSVGElement(node)) {
    for (const child of node.childNodes) {
      if (isSVGElement(child) && hasTagName(child, 'title')) {
        return child.textContent;
      }
    }
  }

  if (!isHTMLElement(node)) {
    return null;
  }

  if (hasPresentationRole(node)) {
    return null;
  }

  // #SPEC_ASSUMPTION (D.1) : html-aam (https://www.w3.org/TR/html-aam-1.0/)
  // specifies all native attributes and elements that define a text
  // alternative.
  if (LABELLABLE_ELEMENT_TYPES.includes(node.tagName)) {
    const labelText =
        getTextIfLabelled(node, options, context, computeTextAlternative);
    if (labelText) {
      return labelText;
    }
  }

  // If input is not <label>led, use native attribute /
  // element information to compute a text alternative
  if (hasTagName(node, 'input')) {
    const inputTextAlternative = getUnlabelledInputText(node);
    if (inputTextAlternative) {
      return inputTextAlternative;
    }
  }

  // <caption>s define text alternatives for <table>s
  if (hasTagName(node, 'table')) {
    const captionElem = node.querySelector('caption');
    if (captionElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(captionElem, options, {
               inherited: context.inherited,
             })
          .name;
    }
  }

  // <figcaption>s define text alternatives for <figure>s
  if (hasTagName(node, 'figure')) {
    const figcaptionElem = node.querySelector('figcaption');
    if (figcaptionElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(figcaptionElem, options, {
               inherited: context.inherited,
             })
          .name;
    }
  }

  // <legend>s define text alternatives for <fieldset>s
  if (hasTagName(node, 'fieldset')) {
    const legendElem = node.querySelector('legend');
    if (legendElem) {
      context.inherited.partOfName = true;
      return computeTextAlternative(legendElem, options, {
               inherited: context.inherited,
             })
          .name;
    }
  }

  // alt attributes define text alternatives for
  // <img>s and <area>s
  const altAttribute = node.getAttribute('alt');
  if (altAttribute && (hasTagName(node, 'img') || hasTagName(node, 'area'))) {
    return altAttribute;
  }

  return null;
}
