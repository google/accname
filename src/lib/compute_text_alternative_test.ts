import {html, render} from 'lit-html';
import {computeTextAlternative} from './compute_text_alternative';

/**
 * These tests look at interactions between rules.
 */
describe('The computeTextAlternative function', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns text alternative of element referenced with aria-labelledby', () => {
    render(
      html`
        <div id="fee" hidden>world</div>
        <div id="bee">
          Hello
          <div aria-labelledby="fee"></div>
        </div>
        <div id="foo" aria-labelledby="bee"></div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(computeTextAlternative(elem!)).toBe('Hello world');
  });

  it("uses aria-labelledby references when computing 'name from content' nodes", () => {
    render(
      html`
        <div id="bar">Hello world</div>
        <button id="foo">
          <div aria-labelledby="bar">hi</div>
        </button>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(computeTextAlternative(elem!)).toBe('Hello world');
  });

  it('prefers input value to aria-label for embedded controls', () => {
    render(
      html`
        <button id="foo">
          Say hello
          <input aria-label="100" type="range" value="5" />
          times
        </button>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(computeTextAlternative(elem!)).toBe('Say hello 5 times');
  });
});
