import {Context} from './lib/context';
import {rule2A} from './lib/rule2A';

/**
 * @param currentNode - The node whose text alternative will be calculated
 * @param  context - Additional information relevant to the text alternative
 *     computation for node
 * @return - The text alternative for node
 */
function computeTextAlternative(currentNode: Node, context: Context): string {
  let result: string|null = '';

  result = rule2A(currentNode, context);
  if (result !== null) {
    return result;
  }

  // If no result is found, the empty string is the text alternative
  return '';
}

/**
 * Main exported function for the library. Initialises traversal with an empty
 * context.
 * @param elem - The element whose accessible name will be calculated
 * @return - The accessible name for elem
 */
export function getAccessibleName(elem: HTMLElement): string {
  return computeTextAlternative(elem, {});
}
