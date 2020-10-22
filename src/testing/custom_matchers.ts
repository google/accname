/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import 'jasmine';
import {computeTextAlternative} from '../lib/compute_text_alternative';

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toHaveTextAlernative(expected: string): void;
    }
  }
}

/** Custom helpers for assertions. */
export const customMatchers: jasmine.CustomMatcherFactories = {
  toHaveTextAlernative(util: jasmine.MatchersUtil) {
    return {
      compare(node: Node, expected: string) {
        const textAlternative = computeTextAlternative(node);
        return {
          pass: util.equals(textAlternative.name, expected),
          message: `Text alternative check failed:

Expected name: "${expected}"
Actual name: "${textAlternative.name}"

Rules applied: ${JSON.stringify(Array.from(textAlternative.rulesApplied))}
Nodes used:
${Array.from(textAlternative.nodesUsed).map(serialize).join('\n')}
`
        };
      },
    };
  },
};


function serialize(node: Node): string {
  switch(node.nodeType){
    case Node.TEXT_NODE:
      return `Text("${(node as Text).data}")`;
    case Node.ELEMENT_NODE:
      return (node as Element).outerHTML;
    default:
      return `{unknown node: ${node}}`;
  }
}
