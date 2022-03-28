/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ComputationStep, computeTextAlternative} from '../lib/compute_text_alternative';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
      compare(nodeOrHtml: Node|string, expected: string) {
        let textAlternative;
        if (typeof nodeOrHtml === 'string') {
          const div = document.createElement('div');
          div.innerHTML = nodeOrHtml;
          document.body.appendChild(div);
          textAlternative = computeTextAlternative(div.querySelector('#test')!);
          document.body.removeChild(div);
        } else {
          textAlternative = computeTextAlternative(nodeOrHtml);
        }

        return {
          pass: util.equals(textAlternative.name, expected),
          message: `Text alternative check failed:

Expected name: "${expected}"
Actual name: "${textAlternative.name}"

Details:
${textAlternative.steps.map(printStep).join('\n')}
`
        };
      },
    };
  },
};

function printStep(step: ComputationStep): string {
  return ` - Got '${step.text}' by applying rule ${step.rule} on ${
      serialize(step.node)}`;
}

function serialize(node: Node): string {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return `Text("${(node as Text).data.replace(/\n/g, '\\n')}")`;
    case Node.ELEMENT_NODE:
      return (node as Element).outerHTML;
    default:
      return `{unknown node: ${node}}`;
  }
}
