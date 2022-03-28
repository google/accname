import {html, render} from 'lit';

import {createRuleRunner} from '../testing/utils';

import {getDefaultContext} from './context';
import {rule2E as rule2EImpl} from './rule2E';

const rule2E = createRuleRunner(rule2EImpl);

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
    render(html`<input id="foo" type="email" value="hello" />`, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('hello');
  });

  it('returns text content for type=email inputs with list attributes (combobox role)',
     () => {
       render(
           html`<input id="foo" type="email" list="emails" value="hello" />`,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('hello');
     });

  it('returns text content for inputs explicitly defined as comboboxes', () => {
    render(
        html`<input id="foo" type="text" role="combobox" value="hello" />`,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('hello');
  });

  it('returns text alternative of selected option in select element', () => {
    render(
        html`
        <select id="foo">
          <option>Hello</option>
          <option selected>world</option>
        </select>
      `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('world');
  });

  it('returns text alternative for multiple selected options in select element',
     () => {
       render(
           html`
        <select id="foo" multiple>
          <option selected>Hello</option>
          <option selected>world</option>
        </select>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('Hello world');
     });

  it('returns text alternative for selected options in explicitly defined listbox',
     () => {
       render(
           html`
        <div id="foo" role="listbox">
          <div role="option" aria-selected="true">Green</div>
          <div role="option">Orange</div>
          <div role="option">Red</div>
          <div role="option">Blue</div>
        </div>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('Green');
     });

  it('returns text alternative for multiple selected options in explicitly defined listbox',
     () => {
       render(
           html`
        <div id="foo" role="listbox">
          <div role="option" aria-selected="true">Green</div>
          <div role="option" aria-selected="true">Orange</div>
          <div role="option">Red</div>
          <div role="option">Blue</div>
        </div>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('Green Orange');
     });

  // Should empty string be returned in this case?
  it('returns null if no options are selected in explicitly defined listbox',
     () => {
       render(
           html`
        <div id="foo" role="listbox">
          <div role="option">Green</div>
          <div role="option">Orange</div>
          <div role="option">Red</div>
          <div role="option">Blue</div>
        </div>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe(null);
     });

  it('returns aria-valuetext value if present in range input', () => {
    render(
        html` <input id="foo" type="range" aria-valuetext="5" /> `, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('5');
  });

  it('returns aria-valuenow value if present in range input', () => {
    render(
        html` <input id="foo" type="range" aria-valuenow="5" /> `, container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('5');
  });

  it('gives aria-valuetext priority over aria-valuenow for range input', () => {
    render(
        html`
        <input id="foo" type="range" aria-valuenow="6" aria-valuetext="5" />
      `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('5');
  });

  it('returns range input value if neither aria-valuetext nor aria-valuenow are present',
     () => {
       render(html` <input id="foo" type="range" value="5" /> `, container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('5');
     });

  it('gives aria-valuetext priority over native value for range input', () => {
    render(
        html` <input id="foo" type="range" value="6" aria-valuetext="5" /> `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('5');
  });

  it('gives aria-valuenow priority over native value for range input', () => {
    render(
        html` <input id="foo" type="range" value="6" aria-valuenow="5" /> `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe('5');
  });

  it('returns value attribute if input is explicitly defined as range and neither aria-valuenow nor aria-valuetext are present',
     () => {
       render(
           html` <input id="foo" role="spinbutton" value="5" /> `, container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('5');
     });

  it('returns value attribute of progress element if neither aria-valuenow nor aria-valuetext are present',
     () => {
       render(
           html` <progress id="foo" max="10" value="5"></progress> `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe('5');
     });

  it('considers implicit textbox role being explicitly overwritten', () => {
    render(
        html` <textarea id="foo" role="spinbutton">Hello world</textarea> `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe(null);
  });

  it('considers implicit listbox / combobox role being explicitly overwritten',
     () => {
       render(
           html`
        <select id="foo" role="spinbutton">
          <option selected>Hello world</option>
        </select>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2E(elem!, context)).toBe(null);
     });

  it('considers implicit range role being explicitly overwritten', () => {
    render(
        html` <input id="foo" type="number" role="textbox" value="5" /> `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2E(elem!, context)).toBe(null);
  });
});
