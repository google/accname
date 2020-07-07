import {html, render} from 'lit-html';
import {Context, getDefaultContext} from './context';
import {rule2B} from './rule2B';

describe('The function for rule 2B', () => {
  let container: HTMLElement;
  let context: Context;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    context = getDefaultContext();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns null if the element has no aria-labelledby attribute', () => {
    render(html`<div id="foo">Hello</div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2B(elem!, context)).toBe(null);
  });

  it('returns null if the element has no valid aria-labelledby idrefs', () => {
    render(html`<div id="foo" aria-labelledby="bar">Hello</div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2B(elem!, context)).toBe(null);
  });

  it('returns concatenation of text alternatives of idreffed elements', () => {
    render(
      html`
        <div id="foo" aria-labelledby="bar baz">Hello</div>
        <div id="bar"></div>
        <div id="baz"></div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(rule2B(elem!, context)).toBe('');
  });

  it('returns null if the node is already part of an aria-labelledby traversal', () => {
    render(
      html`
        <div id="foo" aria-labelledby="bar">Hello</div>
        <div id="bar"></div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    context.ariaLabelledbyReference = true;
    expect(rule2B(elem!, context)).toBe(null);
  });

  it('returns text alternative of aria-labelledby referenced node', () => {
    render(
      html`
        <div id="foo" aria-labelledby="bar"></div>
        <div id="bar">Hello</div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(rule2B(elem!, context)).toBe('Hello');
  });

  /*
   * TODO: Add tests to check aria-labelledby traversal (using rules 2F, 2G)
   */
});
