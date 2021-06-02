/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {ComputationDetails, computeTextAlternative} from './lib/compute_text_alternative';
import {AccnameOptions} from './lib/options';

/**
 * Compute the accessible name for a given `Element`.
 * @param elem - The `Element` whose accessible name will be calculated.
 */
export function getAccessibleName(
    elem: Element, options: Partial<AccnameOptions> = {}): string {
  return computeTextAlternative(elem, options).name;
}

/**
 * Get details surrounding the computation of the accessible name for a given
 * `Element`
 * @param elem - The `Element` whose accessible name will be calculated.
 */
export function getNameComputationDetails(
    elem: Element, options: Partial<AccnameOptions> = {}): ComputationDetails {
  return computeTextAlternative(elem, options);
}
