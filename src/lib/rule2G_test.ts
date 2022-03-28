import {html, render} from 'lit';

import {rule2G} from './rule2G';

describe('The function for rule 2G', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns text content text nodes', () => {
    render(html` <div id="foo">Hello world</div> `, container);
    const node = document.getElementById('foo')?.childNodes[0];
    expect(rule2G(node!)).toBe('Hello world');
  });

  it('returns the empty string if no text content is present', () => {
    const node = document.createTextNode('');
    expect(rule2G(node)).toBe('');
  });

  it('returns null if the node is not a text node', () => {
    render(
        html`
        <div id="foo">
          Hello world newline
        </div>
      `,
        container);
    const node = document.getElementById('foo');
    expect(rule2G(node!)).toBe(null);
  });
});
