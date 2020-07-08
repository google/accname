import {html, render} from 'lit-html';
import {rule2F, allowsNameFromContent_TEST} from './rule2F';
import {Context, getDefaultContext} from './context';

describe('The function for rule 2F', () => {
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

  it('returns text content of role="button" nodes', () => {
    render(
      html`
        <div id="foo" role="button">
          Hello world
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(rule2F(elem!, context)).toBe('Hello world');
  });

  it('returns text content of subtree if node is a label element', () => {
    render(
      html`
        <label id="foo">
          <div>
            Hello
            <div>
              <div>
                world
              </div>
            </div>
          </div>
          <div>!</div>
        </label>
      `,
      container
    );
    const elem = document.getElementById('foo');
    context.isLabelReference = true;
    expect(rule2F(elem!, context)).toBe('Hello world !');
  });

  it('returns a string concatenated with CSS generated text content', () => {
    render(
      html`
        <div id="foo">
          world
          <div>
            <style>
              #foo:before {
                content: 'Hello';
              }
              #foo:after {
                content: '!';
              }
            </style>
          </div>
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    context.isLabelReference = true;
    expect(rule2F(elem!, context)).toBe('Helloworld!');
  });

  it('doesn\'t visit the same node twice during a recursive traversal', () => {
    render(
      html`
        <div id="foo">
          Hello
          <div aria-labelledby="bar"></div>
        </div>
        <div id="bar">
          world
          <div aria-labelledby="foo"></div>
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    context.isLabelReference = true;
    expect(rule2F(elem!, context)).toBe('Hello world');
  });

  it('returns text alternative for entire subtree of node referenced by aria-labelledby', () => {
    render(
      html`
        <div id="foo" aria-labelledby="bar">
        <div id="bar">
          Hello
          <div>
            world
            <div>
              !
            </div>
          </div>
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    context.isLabelReference = true;
    expect(rule2F(elem!, context)).toBe('Hello world !');
  });
});

describe('The function allowsNameFromContent', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns true for roles that allow name from content', () => {
    render(
      html`
        <div id="foo" role="button">
          Hello world
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });

  it('returns false for roles that do not allow name from content', () => {
    render(
      html`
        <div id="foo" role="presentation">
          Hello world
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(false);
  });

  it('returns true for semantic html elements that imply a role that allows name from content', () => {
    render(
      html`
        <h1 id="foo">
          Hello world
        </h1>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });

  it('returns true for td elements only if they are within a table', () => {
    render(
      html`
        <table>
          <td id="foo"></td>
        </table>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });

  it('returns false for option elements if they are not within a datalist or select', () => {
    render(html` <option id="foo"></option> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(false);
  });

  it('returns true for option elements only if they are within a datalist or select', () => {
    render(
      html`
        <select>
          <option id="foo"></option>
        </select>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });

  it('returns true for option elements only if they are within a datalist or select', () => {
    render(
      html`
        <datalist>
          <option id="foo"></option>
        </datalist>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });

  it('returns true for inputs with a type that allows name from content (i.e. button)', () => {
    render(html` <input id="foo" type="button" /> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });

  it('returns false for inputs whose type does not allow name from content', () => {
    render(html` <input id="foo" type="other" /> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(false);
  });

  it('returns true for links only if they have a href attribute', () => {
    render(html` <a id="foo"></a> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(false);
  });

  it('returns false for links if they do not have a href attribute', () => {
    render(html` <a id="foo" href="#"></a> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent_TEST(elem!)).toBe(true);
  });
});
