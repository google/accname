/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A reference to the rules outlined in the accname spec.
 */
export type Rule = '2A'|'2B'|'2C'|'2D'|'2E'|'2F'|'2G'|'2I';

/**
 * Represents a step in the accessible name computation.
 */
export interface ComputationStep {
  rule: Rule;
  node: Node;
  text: string;
}

/**
 * Provides details about the computation of some accessible name, such as
 * the Nodes used and rules applied during computation.
 */
export interface ComputationDetails {
  name: string;
  steps: ComputationStep[];
}