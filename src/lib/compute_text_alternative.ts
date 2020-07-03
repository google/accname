import {Context} from './context';
import {rule2A} from './rule2A';
import {rule2B} from './rule2B';

/**
 * @param currentNode - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 *     computation for node
 * @return - The text alternative for node
 */
export function computeTextAlternative(
  currentNode: Node,
  context: Context
): string {
  let result: string | null = '';

  result = rule2A(currentNode, context);
  if (result !== null) {
    return result;
  }

  result = rule2B(currentNode, context);
  if (result !== null) {
    return result;
  }

  // If no result is found, the empty string is the text alternative
  return '';
}
