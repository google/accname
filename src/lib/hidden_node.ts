import {Context} from './context';

/**
 * Condition for applying rule 2A
 * @param {HTMLElement} elem - The element whose accessible name is being calculated
 * @param {Context} context - Additional information relevant to the name computation for elem
 * @return {boolean} - Whether of not elem satisfies the condition for rule 2A
 */
function hiddenNodeCondition(elem: HTMLElement, context: Context): boolean {
  const hidden: boolean = elem.hasAttribute('hidden');
  return (
    hidden &&
    !context.ariaLabelledbyReference &&
    !context.nativeTextAlternativeReference
  );
}

/**
 * Implementation of rule 2A
 * @param {HTMLElement} elem - The element whose accessible name is being calculated
 * @param {Context} context - Additional information relevant to the name computation for elem
 * @return {string | null} - The accessible name string is returned if condition is true,
 * null is returned otherwise, indicating that the condition of this rule was not satisfied.
 */
export function hiddenNode(elem: HTMLElement, context: Context): string | null {
  let result = null;
  if (hiddenNodeCondition(elem, context)) {
    result = '';
  }
  return result;
}
