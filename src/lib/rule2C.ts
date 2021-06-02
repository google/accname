/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ComputeTextAlternative} from './compute_text_alternative';
import {Context} from './context';
import {AccnameOptions} from './options';
import {rule2E} from './rule2E';
import {isElement} from './util';

/**
 * Implementation for rule 2C
 * @param node - node whose text alternative is being computed
 * @param context - information relevant to the computation of node's text
 *     alternative
 * @return text alternative for 'node' if rule 2C accepts 'node', null
 *     otherwise.
 */
export function rule2C(
    node: Node,
    options: AccnameOptions,
    context: Context,
    computeTextAlternative: ComputeTextAlternative,
    ): string|null {
  if (!isElement(node)) {
    return null;
  }

  const ariaLabel = node.getAttribute('aria-label') ?? '';
  if (ariaLabel.trim() === '') {
    return null;
  }

  // #SPEC_ASSUMPTION (C.1) : 'part of name' implies 'traversal
  // due to recursion'.
  if (context.inherited.partOfName) {
    // 'rule2EResult !== null' indicates that 'node' is an embedded
    // control as defined in step 2E.
    const rule2EResult = rule2E(
        node, options, {inherited: context.inherited}, computeTextAlternative);
    if (rule2EResult !== null) {
      return rule2EResult;
    }
  }

  return ariaLabel;
}
