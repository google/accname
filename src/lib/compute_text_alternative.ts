import {Context, getDefaultContext} from './context';
import {rule2A} from './rule2A';
import {rule2B} from './rule2B';
import {rule2C} from './rule2C';
import {rule2D} from './rule2D';
import {rule2E} from './rule2E';
import {rule2F} from './rule2F';
import {rule2G} from './rule2G';

/**
 * @param node - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 *     computation for node. Optional paramater is 'getDefaultContext' by default.
 * @return - The text alternative for node
 */
export function computeTextAlternative(
  node: Node,
  context: Context = getDefaultContext()
): string {
  let result: string | null = '';

  result = rule2A(node, context);
  if (result !== null) {
    return result;
  }

  result = rule2B(node, context);
  if (result !== null) {
    return result;
  }

  result = rule2C(node, context);
  if (result !== null) {
    return result;
  }

  result = rule2D(node, context);
  if (result !== null) {
    return result;
  }

  result = rule2E(node, context);
  if (result !== null) {
    return result;
  }

  result = rule2F(node, context);
  if (result !== null) {
    return result;
  }

  result = rule2G(node);
  if (result !== null) {
    return result;
  }

  // If no result is found, the empty string is the text alternative
  return '';
}
