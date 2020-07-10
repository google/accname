import {html, render} from 'lit-html';
import {TEST_ONLY} from './rule2F';

const {allowsNameFromContent} = TEST_ONLY;

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
    expect(allowsNameFromContent(elem!)).toBe(true);
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
    expect(allowsNameFromContent(elem!)).toBe(false);
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
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns true for td elements if they are within a table', () => {
    render(
      html`
        <table>
          <td id="foo"></td>
        </table>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns true for th elements if they are within a table', () => {
    render(
      html`
        <table>
          <th id="foo"></th>
        </table>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns false for option elements if they are not within a datalist or select', () => {
    render(html` <option id="foo"></option> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(false);
  });

  it('returns true for option elements if they are within a select', () => {
    render(
      html`
        <select>
          <option id="foo"></option>
        </select>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns true for option elements if they are within a datalist', () => {
    render(
      html`
        <datalist>
          <option id="foo"></option>
        </datalist>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns true for inputs with a type that allows name from content', () => {
    render(html` <input id="foo" type="button" /> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns false for inputs whose type does not allow name from content', () => {
    render(html` <input id="foo" type="color" /> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(false);
  });

  it('returns true for links if they have a href attribute', () => {
    render(html` <a id="foo" href="#"></a> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns false for links if they do not have a href attribute', () => {
    render(html` <a id="foo"></a> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(false);
  });

  it('returns true for area elements if they have a href attribute', () => {
    render(html` <area id="foo" href="#"></area> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns false for area elements if they do not have a href attribute', () => {
    render(html` <area id="foo"></area> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(false);
  });

  it('returns true for link elements if they have a href attribute', () => {
    render(html` <link id="foo" href="#"></link> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(true);
  });

  it('returns false for link elements if they do not have a href attribute', () => {
    render(html` <link id="foo"></link> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(false);
  });

  it('returns false for input elements if they do not have a type attribute', () => {
    render(html` <input id="foo"></link> `, container);
    const elem = document.getElementById('foo');
    expect(allowsNameFromContent(elem!)).toBe(false);
  });
});
