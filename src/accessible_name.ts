import {rules} from './lib/rules';

/**
 * @param {HTMLElement} elem - The element whose accessible name will be calculated
 * @return {string} - The accessible name for elem
 */
export function getAccessibleName(elem: HTMLElement): string {
  let accessibleName = '';
  let result;
  // Iterate over the rules used to calculate the accessible name, stop
  // iterating if a valid string is returned (i.e. if result is not null).
  const ruleKeys = Object.keys(rules);
  for (let i = 0; i < ruleKeys.length && !result; ++i) {
    result = rules[ruleKeys[i]](elem);
    if (result) {
      accessibleName = result;
    }
  }
  return accessibleName;
}
