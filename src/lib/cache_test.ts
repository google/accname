import 'jasmine';

import {html, render} from 'lit-html';

import * as cache from './cache';
import {Rule} from './computation_details';

describe('Cache', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    cache.init();
  });

  afterEach(() => {
    document.body.removeChild(container);
    cache.clear();
  });

  it('remembers entries', () => {
    render(html`<div id="target">foo</div>`, container);
    const node = document.getElementById('target')!;
    const options = {includePseudoElements: false};
    const result = {name: 'foo', steps: []};
    cache.set(node, options, result);

    expect(cache.get(node, options)).toEqual(result);

    const result2 = {
      name: 'bar',
      steps: [{rule: '2A' as Rule, node, text: 'blah'}]
    };
    cache.set(node, options, result2);

    expect(cache.get(node, options)).toEqual(result2);
  });

  it('saves different results for different options', () => {
    render(html`<div id="target">foo</div>`, container);
    const node = document.getElementById('target')!;
    const options1 = {includePseudoElements: false};
    const options2 = {includePseudoElements: true};
    const result = {name: 'foo', steps: []};

    cache.set(node, options1, result);

    expect(cache.get(node, options1)).toEqual(result);
    expect(cache.get(node, options2)).toBeNull();
  });

  describe('invalidates on DOM changes', () => {
    const cacheMutations = [
      {
        name: 'childList',
        mutation: (element: HTMLElement) => {
          const div = document.createElement('div');
          element.appendChild(div);
        }
      },
      {
        name: 'setAttribute',
        mutation: (element: HTMLElement) => {
          element.setAttribute('aria-label', 'bar');
        }

      },
      {
        name: 'characterData',
        mutation: (element: HTMLElement) => {
          element.innerText = 'bar';
        }
      },
    ];
    for (const {name, mutation} of cacheMutations) {
      it(`for ${name}`, () => {
        render(html`<div id="target">foo</div>`, container);
        const node = document.getElementById('target')!;
        const options = {includePseudoElements: false};
        const result = {name: 'foo', steps: []};
        cache.set(node, options, result);
        expect(cache.get(node, options)).toEqual(result);

        mutation(node);

        expect(cache.get(node, options)).toBeNull();
      })
    }
  });
});
