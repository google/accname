import {html, render} from 'lit';

import {rule2I} from './rule2I';

describe('The function for rule 2I', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns title attribute value if present', () => {
    render(html` <div id="foo" title="Hello world"></div> `, container);
    expect(rule2I(document.getElementById('foo')!)).toBe('Hello world');
  });

  it('returns null if title attribute is not present', () => {
    render(html` <div id="foo"></div> `, container);
    expect(rule2I(document.getElementById('foo')!)).toBe(null);
  });

  it('returns placeholder for textual inputs if title not present', () => {
    render(
        html` <input id="foo" type="text" placeholder="Hello world" /> `,
        container);
    expect(rule2I(document.getElementById('foo')!)).toBe('Hello world');
  });

  it('returns placeholder for textareas if title not present', () => {
    render(
        html` <textarea id="foo" placeholder="Hello world"></textarea> `,
        container);
    expect(rule2I(document.getElementById('foo')!)).toBe('Hello world');
  });

  it('returns title with priority over placeholder', () => {
    render(
        html`
        <textarea
          id="foo"
          placeholder="Goodbye world"
          title="Hello world"
        ></textarea>
      `,
        container);
    expect(rule2I(document.getElementById('foo')!)).toBe('Hello world');
  });
});
