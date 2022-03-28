/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {RuleImpl, TEST_ONLY} from '../lib/compute_text_alternative';
import {Context, getDefaultContext} from '../lib/context';
import {AccnameOptions, withDefaults} from '../lib/options';

type RuleRunner = (node: Node, context?: Context, options?: AccnameOptions) =>
    string|null;

/**
 * Helper to abstract over the exact interface of a rule and avoid having to
 * explicitly pass a default context of the textAlternative function.
 */
export function createRuleRunner(rule: RuleImpl): RuleRunner {
  return (
             node: Node,
             context = getDefaultContext(),
             options = withDefaults({}),
             ) => {
    const result =
        rule(node, options, context, TEST_ONLY.computeRawTextAlternative);
    // Tests expect a trimmed flat string.
    return result?.replace(/\s+/g, ' ').trim() ?? null;
  };
}
