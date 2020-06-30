import {rules} from './lib/rules';
import {Context} from './lib/context';

/**
 * @param {HTMLElement} elem - The element whose accessible name will be calculated
 * @param {Context} context - Additional information relevant to the name computation for elem
 * @return {string} - The accessible name for elem
 */
function _getAccessibleName(elem: HTMLElement, context: Context): string {
  let accessibleName = '';
  let result;
  // Iterate over the rules used to calculate the accessible name, stop
  // iterating if a valid string is returned (i.e. if result is not null).
  const ruleKeys = Object.keys(rules);
  for (let i = 0; i < ruleKeys.length && !result; ++i) {
    result = rules[ruleKeys[i]](elem, context);
    if (result) {
      accessibleName = result;
    }
  }
  return accessibleName;
}

/**
 * Main exported function for the library. Initialises traversal with an empty context.
 * @param {HTMLElement} elem - The element whose accessible name will be calculated
 * @return {string} - The accessible name for elem
 */
export function getAccessibleName(elem: HTMLElement): string {
  const initialContext = {};
  return _getAccessibleName(elem, initialContext);
}
