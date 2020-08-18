import {Context, getDefaultContext} from './context';
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
export type Rule = '2A' | '2B' | '2C' | '2D' | '2E' | '2F' | '2G' | '2I';

const ruleToImpl: {
  [rule in Rule]: (node: Node, context: Context) => string | null;
} = {
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
  node: Node,
  context: Context = getDefaultContext()
): ComputationDetails {
  context.inherited.nodesUsed.add(node);

  // Try each rule sequentially on the target Node.
  for (const [rule, impl] of Object.entries(ruleToImpl)) {
    const result = impl(node, context);
    // A rule has been applied if its implementation has
    // returned a string.
    if (result !== null) {
      context.inherited.rulesApplied.add(<Rule>rule);
      return {
        name: result,
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
