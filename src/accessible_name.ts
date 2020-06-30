import {Context} from './lib/context';
import {rule2A} from './lib/rule2A';

/**
 * @param elem - The element whose accessible name will be calculated
 * @param  context - Additional information relevant to the name computation for elem
 * @return - The accessible name for elem
 */
function computeTextAlternative(currentNode: Node, context: Context): string {

  let result: string | null = '';

  result = rule2A(currentNode, context);
  if (result !== null) {
    return result;
  }

  // If no result is found, the empty string is the text alternative
  return '';
}

/**
 * Main exported function for the library. Initialises traversal with an empty context.
 * @param elem - The element whose accessible name will be calculated
 * @return - The accessible name for elem
 */
export function getAccessibleName(elem: HTMLElement): string {
  const initialContext = {};
  return computeTextAlternative(elem, initialContext);
}
