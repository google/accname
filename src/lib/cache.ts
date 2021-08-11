/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A cache of ComputationDetails to avoid duplicated calculations.
 * The cache is invalidated whenever there is a change to the DOM which could
 * cause a change in accnames, and doesn't persist across page loads.
 */
import {ComputationDetails} from './computation_details';
import {AccnameOptions} from './options';

/**
 * Cache going from node, to hashed options, to the cached ComputationDetails
 * value.
 */
let computationDetailsCache: WeakMap<Node, Map<string, ComputationDetails>>|
    null = null;
const cacheClearer = new MutationObserver(() => {
  // TODO(b/190646579) We know the relevant nodes for each element (in
  // ComputationDetails). This cache could be smart in only invalidating entries
  // when a relevant node mutates. Would also need to consider new/changed
  // elements elsewhere if a <label for="foo"> is added later
  clear();
});

document.onreadystatechange = () => {
  if (document.readyState !== 'loading') {
     init();
  }
};
if (document.readyState !== 'loading') {
   init();
}

/**
 * Gets ComputationDetails from the cache, returning null if `node` doesn't
 * appear with `options` in the cache.
 */
export function get(node: Node, options: AccnameOptions): ComputationDetails|
    null {
  maybeClearCache();
  return computationDetailsCache?.get(node)?.get(hash(options)) ?? null;
}

/** Set the cached value for `node` and `options` to `value`. */
export function set(
    node: Node, options: AccnameOptions, value: ComputationDetails) {
  maybeClearCache();
  if (computationDetailsCache === null) {
    return;
  }
  const nodeCache = computationDetailsCache.get(node) ?? new Map();
  nodeCache.set(hash(options), value);
  computationDetailsCache.set(node, nodeCache);
}

export function clear() {
  computationDetailsCache = new WeakMap();
}

export function init() {
  if (document.body === null) {
    return;
  }
  computationDetailsCache = new WeakMap();
  cacheClearer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'role', 'aria-label', 'aria-labelledby', 'aria-owns', 'aria-valuetext',
      'aria-valuenow', 'placeholder', 'type', 'alt'
    ],
    characterData: true,
  });
}

/** Clear the cachce if there are detected but not yet processed mutations. */
function maybeClearCache() {
  if (cacheClearer.takeRecords().length > 0) {
    clear();
  }
}

/**
 * Hash options which can determine the accessible name. This excludes
 * steps and visited nodes, as this is only useful for explaining the
 * computation.
 */
function hash(options: AccnameOptions) {
  return `ipe:${options.includePseudoElements}`;
}