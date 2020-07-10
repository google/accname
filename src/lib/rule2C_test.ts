import {html, render} from 'lit-html';
import {rule2C} from './rule2C';

describe('The function for rule 2C', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns null if node does not contain an aria-label attribute', () => {
    render(html`<div id="foo"></div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2C(elem!)).toBe(null);
  });

  it('returns aria-label value if node contains a non-empty aria-label attribute', () => {
    render(html`<div id="foo" aria-label="hello"></div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2C(elem!)).toBe('hello');
  });

  it('returns null if node contains an empty aria-label attribute, when trimmed of whitespace', () => {
    render(html`<div id="foo" aria-label="   "></div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2C(elem!)).toBe(null);
  });
});