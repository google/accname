/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {computeTextAlternative, RuleImpl} from '../lib/compute_text_alternative';
import {Context, getDefaultContext} from '../lib/context';

type RuleRunner = (node: Node, context?: Context) => string|null;

/**
 * Helper to abstract over the exact interface of a rule and avoid having to
 * explicitly pass a default context of the textAlternative function.
 */
export function createRuleRunner(rule: RuleImpl): RuleRunner {
  return (node: Node, context = getDefaultContext()) => {
    return rule(node, context, computeTextAlternative);
  };
}
