/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Implementation for rule 2G
 * @param node - node whose text alternative is being computed
 * @return - text alternative of node if node is a TEXT_NODE,
 * null otherwise.
 */
export function rule2G(node: Node): string|null {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node as Text).data;
  }
  return null;
}
