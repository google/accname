import {html, render} from 'lit';

import {createRuleRunner} from '../testing/utils';

import {rule2D as rule2DImpl} from './rule2D';

const rule2D = createRuleRunner(rule2DImpl);

describe('The function for rule 2D', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns text alternative for native label if present', () => {
    render(
        html`
        <input id="foo" type="text" />
        <label for="foo">
          Hello world
        </label>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('does not allow double label traversal', () => {
    render(
        html`
        <input id="foo" type="text" />
        <label for="foo" aria-labelledby="bar">
          Hello world
        </label>
        <div id="bar">Hello there</div>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('concatenates label text alternatives for multiple labels', () => {
    render(
        html`
        <input id="foo" type="text" />
        <label for="foo">
          Hello
        </label>
        <label for="foo">
          world
        </label>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('recognises label elements that label nested inputs', () => {
    render(
        html`
        <label>
          Hello world
          <input id="foo" />
        </label>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('processes multiple <label>s in DOM order.', () => {
    render(
        html`
        <label for="foo">Hello</label>
        <label>
          there
          <input id="foo" />
        </label>
        <label for="foo">world!</label>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello there world!');
  });

  it('returns null for elements with role presentation', () => {
    render(
        html`
        <input id="foo" type="text" role="presentation" />
        <label for="foo">
          Hello world
        </label>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe(null);
  });

  it('returns null for elements with role none', () => {
    render(
        html`
        <input id="foo" type="text" role="none" />
        <label for="foo">
          Hello world
        </label>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe(null);
  });

  it('returns null for elements with implicit role presentation', () => {
    render(html`<img alt="">`, container);

    const target = container.querySelector('img');
    expect(rule2D(target!)).toBe(null);
  });

  it('returns null if node is not a HTMLElement', () => {
    const node = document.createTextNode('Hello');
    expect(rule2D(node)).toBe(null);
  });

  it('returns text alternative of caption element for table, if present',
     () => {
       render(
           html`
        <table id="foo">
          <caption>
            Hello world
          </caption>
        </table>
      `,
           container);
       const elem = document.getElementById('foo');
       expect(rule2D(elem!)).toBe('Hello world');
     });

  it('returns text alternative of figcaption element for figure, if present',
     () => {
       render(
           html`
        <figure id="foo">
          <figcaption>Hello world</figcaption>
        </figure>
      `,
           container);
       const elem = document.getElementById('foo');
       expect(rule2D(elem!)).toBe('Hello world');
     });

  it('returns text alternative of legend element for fieldset, if present',
     () => {
       render(
           html`
        <fieldset id="foo">
          <legend>Hello world</legend>
        </fieldset>
      `,
           container);
       const elem = document.getElementById('foo');
       expect(rule2D(elem!)).toBe('Hello world');
     });

  it('returns alt attribute value for image, if present', () => {
    render(html` <img id="foo" alt="Hello world" /> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('returns alt attribute value for area, if present', () => {
    render(html` <area id="foo" alt="Hello world" /> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('returns null if rule 2D cannot be applied to the given node', () => {
    render(html` <div id="foo"></div> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe(null);
  });

  it('returns input.value for inputs whose value defines alt text', () => {
    render(
        html` <input id="foo" type="button" value="Hello world" /> `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('returns input.type for submit inputs with no value ', () => {
    render(html` <input id="foo" type="submit" /> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('submit');
  });

  it('returns input.type for reset inputs with no value ', () => {
    render(html` <input id="foo" type="reset" /> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('reset');
  });

  it('returns input.alt for image inputs', () => {
    render(
        html` <input id="foo" type="image" alt="Hello world" /> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe('Hello world');
  });

  it('returns Submit Query for image inputs that have no alt nor title attributes',
     () => {
       render(html` <input id="foo" type="image" /> `, container);
       const elem = document.getElementById('foo');
       expect(rule2D(elem!)).toBe('Submit Query');
     });

  it('returns null for inputs whose type isnt specified', () => {
    render(html` <input id="foo" /> `, container);
    const elem = document.getElementById('foo');
    expect(rule2D(elem!)).toBe(null);
  });

  it('returns the text content of a direct child <title> for <svg> elements',
     () => {
       render(
           html` <svg id="foo"><title>Hello world</title></svg> `, container);
       const elem = document.getElementById('foo');
       expect(rule2D(elem!)).toBe('Hello world');
     });
});
