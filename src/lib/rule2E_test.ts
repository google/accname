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

  it('returns text content for inputs whose types imply textbox role', () => {
    render(html`<input id="foo" type="email" value="hello"/>`, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('hello');
  });

  it('returns text content for inputs with list attributes', () => {
    render(html`<input id="foo" list value="hello"/>`, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('hello');
  });

  it('returns text alternative of selected option in select element', () => {
    render(html`
      <select id="foo">
        <option>Hello</option>
        <option selected>world</option>
      </select>
    `, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    context.directLabelReference = true;
    expect(rule2E(elem!, context)).toBe('world');
  });

  it('returns text alternative for multiple selected options in select element', () => {
    render(html`
      <select id="foo" multiple>
        <option selected>Hello</option>
        <option selected>world</option>
      </select>
    `, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    context.directLabelReference = true;
    expect(rule2E(elem!, context)).toBe('Hello world');
  });
});