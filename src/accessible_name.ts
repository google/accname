import {computeTextAlternative} from './lib/compute_text_alternative';
import {getEmptyContext} from './lib/context';

/**
 * Main exported function for the library. Initialises traversal with an empty
 * context.
 * @param elem - The element whose accessible name will be calculated
 * @return - The accessible name for elem
 */
export function getAccessibleName(elem: HTMLElement): string {
  const initialContext = getEmptyContext();
  return computeTextAlternative(elem, initialContext);
}
