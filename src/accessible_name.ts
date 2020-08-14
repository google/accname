import {
  computeTextAlternative,
  ComputationDetails,
} from './lib/compute_text_alternative';

/**
 * Compute the accessible name for a given HTMLElement.
 * @param elem - The HTMLElement whose accessible name will be calculated.
 */
export function getAccessibleName(elem: HTMLElement): string {
  return computeTextAlternative(elem).name;
}

/**
 * Get details surrounding the computation of the accessible name for a given HTMLElement
 * @param elem - The HTMLElement whose accessible name will be calculated.
 */
export function getNameComputationDetails(
  elem: HTMLElement
): ComputationDetails {
  return computeTextAlternative(elem);
}
