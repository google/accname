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

/**
 * @param node - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 *     computation for node. Optional paramater is 'getDefaultContext' by default.
 * @return - The text alternative for node
 */
export function computeTextAlternative(
  node: Node,
  context: Context = getDefaultContext()
): {name: string; nodesUsed: Set<Node>; rulesApplied: Set<Rule>} {
  context.inherited.nodesUsed.add(node);
  let result: string | null = null;

  result = rule2A(node, context);
  if (result !== null) {
    context.inherited.rulesApplied.add('2A');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2B(node, context);
  if (result !== null) {
    context.inherited.rulesApplied.add('2B');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2C(node, context);
  if (result !== null) {
    context.inherited.rulesApplied.add('2C');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2D(node, context);
  if (result !== null) {
    context.inherited.rulesApplied.add('2D');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2E(node, context);
  if (result !== null) {
    context.inherited.rulesApplied.add('2E');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2F(node, context);
  if (result !== null) {
    context.inherited.rulesApplied.add('2F');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2G(node);
  if (result !== null) {
    context.inherited.rulesApplied.add('2G');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  result = rule2I(node);
  if (result !== null) {
    context.inherited.rulesApplied.add('2I');
    return {
      name: result,
      nodesUsed: context.inherited.nodesUsed,
      rulesApplied: context.inherited.rulesApplied,
    };
  }

  return {
    name: '',
    nodesUsed: context.inherited.nodesUsed,
    rulesApplied: context.inherited.rulesApplied,
  };
}
