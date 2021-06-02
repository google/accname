/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ComputeTextAlternative} from './compute_text_alternative';
import {Context} from './context';
import {AccnameOptions} from './options';
import {isHTMLElement} from './util';

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

/**
 * Implementation of rule 2B
 * @param node - node whose text alternative is being computed
 * @param context - Additional information relevant to the text alternative
 * computation for node
 * @return - The text alternative string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was
 * not satisfied.
 */
export function rule2B(
    node: Node,
    options: AccnameOptions,
    context: Context,
    computeTextAlternative: ComputeTextAlternative,
    ): string|null {
  if (!isHTMLElement(node)) {
    return null;
  }

  // #SPEC_ASSUMPTION (B.1) : definition of 'part of an aria-labelledby
  // traversal'
  if (context.directLabelReference) {
    return null;
  }

  const labelElems = resolveValidAriaLabelledbyIdrefs(node);
  if (labelElems.length === 0) {
    return null;
  }

  return labelElems
      .map(labelElem => {
        context.inherited.partOfName = true;
        return computeTextAlternative(labelElem, options, {
                 directLabelReference: true,
                 inherited: context.inherited,
               })
            .name;
      })
      .join(' ')
      .trim();
}
