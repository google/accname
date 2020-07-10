import {html, render} from 'lit-html';
import {getDefaultContext} from './context';
import {rule2E} from './rule2E';

describe('The function for rule 2E', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns null if the node is not part of a name', () => {
    render(html`<div id="foo">Hello</div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2E(elem!)).toBe(null);
  });

  it('returns null if the node is not a HTMLElement', () => {
    const node = document.createTextNode('Hello');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(node, context)).toBe(null);
  });

  it('returns text content of textArea', () => {
    render(html`<textarea id="foo">Hello world</textarea>`, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('Hello world');
  });
});