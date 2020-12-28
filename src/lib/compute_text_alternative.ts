/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {Context, getDefaultContext} from './context';
import {rule2A} from './rule2A';
import {rule2B} from './rule2B';
import {rule2C} from './rule2C';
import {rule2D} from './rule2D';
import {rule2E} from './rule2E';
import {rule2F} from './rule2F';
import {rule2G} from './rule2G';
import {rule2I} from './rule2I';

// taze: SVG types from //javascript/externs:svg_lib

/**
 * A reference to the rules outlined in the accname spec.
 */
export type Rule = '2A'|'2B'|'2C'|'2D'|'2E'|'2F'|'2G'|'2I';

/** Type signature for the computeTextAlternative function. */
export type ComputeTextAlternative = (node: Node, context: Context) =>
    ComputationDetails;

/**
 * We pass the main function to compute textAlternative to avoid having build
 * time circular references between files
 */
export type RuleImpl =
    (node: Node, context: Context, textAlterantive: ComputeTextAlternative) =>
        string|null;

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
 * Provides details about the computation of some accessible name, such as
 * the Nodes used and rules applied during computation.
 */
export interface ComputationDetails {
  name: string;
  nodesUsed: Set<Node>;
  rulesApplied: Set<Rule>;
}

/**
 * @param node - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 * computation for node. Optional paramater is 'getDefaultContext' by default.
 * @return - The text alternative for node
 */
export function computeTextAlternative(
    node: Node, context: Context = getDefaultContext()): ComputationDetails {
  const result = computeRawTextAlternative(node, context);
  return {
    // # SPEC ASSUMPTION: The result of the name computation is trimmed.
    name: result.name.trim(),
    nodesUsed: result.nodesUsed,
    rulesApplied: result.rulesApplied,
  };
}

/**
 * Compute the text alternative without trimming leading and trailing
 * whitespace.
 */
function computeRawTextAlternative(
    node: Node, context: Context = getDefaultContext()): ComputationDetails {
  context.inherited.nodesUsed.add(node);

  // Try each rule sequentially on the target Node.
  for (const [rule, impl] of Object.entries(ruleToImpl)) {
    const result = impl(node, context, computeRawTextAlternative);
    // A rule has been applied if its implementation has
    // returned a string.
    if (result !== null) {
      context.inherited.rulesApplied.add(rule as Rule);
      return {
        // # SPEC ASSUMPTION: Even though not called out explicitly, every rule
        // should return an (untrimmed) flat string.
        name: result.replace(/\s+/g, ' '),
        nodesUsed: context.inherited.nodesUsed,
        rulesApplied: context.inherited.rulesApplied,
      };
    }
  }

  return {
    name: '',
    nodesUsed: context.inherited.nodesUsed,
    rulesApplied: context.inherited.rulesApplied,
  };
}

export const TEST_ONLY = {computeRawTextAlternative};