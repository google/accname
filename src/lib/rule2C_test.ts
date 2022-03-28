import {html, render} from 'lit';

import {createRuleRunner} from '../testing/utils';

import {getDefaultContext} from './context';
import {rule2C as rule2CImpl} from './rule2C';

const rule2C = createRuleRunner(rule2CImpl);

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

  it('returns null if node is not an Element', () => {
    const elem = document.createTextNode('Hello');
    container.appendChild(elem);
    expect(rule2C(elem)).toBe(null);
  });

  it('returns aria-label value if node contains a non-empty aria-label attribute',
     () => {
       render(html`<div id="foo" aria-label="hello"></div>`, container);
       const elem = document.getElementById('foo');
       expect(rule2C(elem!)).toBe('hello');
     });

  it('returns null if node contains an empty aria-label attribute, when trimmed of whitespace',
     () => {
       render(html`<div id="foo" aria-label="   "></div>`, container);
       const elem = document.getElementById('foo');
       expect(rule2C(elem!)).toBe(null);
     });

  it('returns aria-label value for SVGElements', () => {
    render(html`<svg id="foo" aria-label="hello"></svg>`, container);
    const elem = document.getElementById('foo');
    expect(rule2C(elem!)).toBe('hello');
  });

  it('returns aria-label value for controls if they are not already part of a name',
     () => {
       render(
           html`
        <input id="foo" aria-label="hello there" type="range" value="5" />
      `,
           container);
       const elem = document.getElementById('foo');
       expect(rule2C(elem!)).toBe('hello there');
     });

  it('returns text alternative for controls if they are part of a name', () => {
    render(
        html`
        <input id="foo" aria-label="hello there" type="range" value="5" />
      `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.inherited.partOfName = true;
    expect(rule2C(elem!, context)).toBe('5');
  });

  it('returns aria-label value for elements that are not controls, even if they are part of a name',
     () => {
       render(html`<div id="foo" aria-label="hello there"></div>`, container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.inherited.partOfName = true;
       expect(rule2C(elem!, context)).toBe('hello there');
     });
});