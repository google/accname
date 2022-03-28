/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, getDefaultContext} from './context';
import {AccnameOptions, withDefaults} from './options';
import {rule2A} from './rule2A';
import {rule2B} from './rule2B';
import {rule2C} from './rule2C';
import {rule2D} from './rule2D';
import {rule2E} from './rule2E';
import {rule2F} from './rule2F';
import {rule2G} from './rule2G';
import {rule2I} from './rule2I';


/**
 * A reference to the rules outlined in the accname spec.
 */
export type Rule = '2A'|'2B'|'2C'|'2D'|'2E'|'2F'|'2G'|'2I';

/** Type signature for the computeTextAlternative function. */
export type ComputeTextAlternative =
    (node: Node, options: AccnameOptions, context: Context) =>
        ComputationDetails;

/**
 * We pass the main function to compute textAlternative to avoid having build
 * time circular references between files
 */
export type RuleImpl = (
    node: Node,
    options: AccnameOptions,
    context: Context,
    textAlternative: ComputeTextAlternative,
    ) => string|null;

const ruleToImpl: {[rule in Rule]: RuleImpl} = {
  '2A': rule2A,
  '2B': rule2B,
  '2C': rule2C,
  '2D': rule2D,
  '2E': rule2E,
  '2F': rule2F,
  '2G': rule2G,
  '2I': rule2I,
};

/**
 * Represents a step in the accessible name computation.
 */
export interface ComputationStep {
  rule: Rule;
  node: Node;
  text: string;
}

/**
 * Provides details about the computation of some accessible name, such as
 * the Nodes used and rules applied during computation.
 */
export interface ComputationDetails {
  name: string;
  steps: ComputationStep[];
}

/**
 * @param node - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 * computation for node. Optional paramater is 'getDefaultContext' by default.
 * @return - The text alternative for node
 */
export function computeTextAlternative(
    node: Node,
    options: Partial<AccnameOptions> = {},
    context: Context = getDefaultContext(),
    ): ComputationDetails {
  const result =
      computeRawTextAlternative(node, withDefaults(options), context);
  return {
    // # SPEC ASSUMPTION: The result of the name computation is trimmed.
    name: result.name.trim(),
    steps: result.steps,
  };
}

/**
 * Compute the text alternative without trimming leading and trailing
 * whitespace.
 */
function computeRawTextAlternative(
    node: Node,
    options: AccnameOptions = withDefaults({}),
    context: Context = getDefaultContext(),
    ): ComputationDetails {
  // Try each rule sequentially on the target Node.
  for (const [rule, impl] of Object.entries(ruleToImpl)) {
    const result = impl(node, options, context, computeRawTextAlternative);
    // A rule has been applied if its implementation has
    // returned a string.
    if (result !== null) {
      // # SPEC ASSUMPTION: Even though not called out explicitly, every rule
      // should return an (untrimmed) flat string.
      const text = result.replace(/\s+/g, ' ');
      context.inherited.steps.push({
        rule: rule as Rule,
        node,
        text,
      });

      return {
        name: text,
        steps: context.inherited.steps,
      };
    }
  }

  return {
    name: '',
    steps: context.inherited.steps,
  };
}

export const TEST_ONLY = {computeRawTextAlternative};
