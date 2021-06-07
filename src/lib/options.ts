/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** Options for computing accname. */
export interface AccnameOptions {
  /**
   * Whether CSS :before and:after elements should be included in the
   * computation. The spec includes them in step 2.F.ii, but browsers generally
   * ignore them so we default to false.
   */
  readonly includePseudoElements: boolean;
}

/** Fills in missing options with their default values */
export function withDefaults(opts: Partial<AccnameOptions>): AccnameOptions {
  return {includePseudoElements: opts.includePseudoElements ?? false};
}