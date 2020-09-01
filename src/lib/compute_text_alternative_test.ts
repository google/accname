import {html, render} from 'lit-html';
import {computeTextAlternative, Rule} from './compute_text_alternative';

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
    expect(computeTextAlternative(elem!).name).toBe('Hello world');
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
    expect(computeTextAlternative(elem!).name).toBe('Hello world');
  });

  it('prefers input value to aria-label for embedded controls', () => {
    render(
      html`
        <div id="foo" role="link">
          Say hello
          <input aria-label="100" type="range" value="5" />
          times
        </div>
      `,
      container
    );
    const elem = document.getElementById('foo');
    expect(computeTextAlternative(elem!).name).toBe('Say hello 5 times');
  });

  it('returns correct nodesUsed and rulesApplied sets for simple button input', () => {
    render(html` <button id="foo">Hello world</button> `, container);
    const elem = document.getElementById('foo')!;
    expect(computeTextAlternative(elem)).toEqual({
      name: 'Hello world',
      nodesUsed: new Set<Node>([elem, elem.childNodes[0]]),
      rulesApplied: new Set<Rule>(['2G', '2F']),
    });
  });

  it('returns correct nodesUsed and rulesApplied sets for aria-labelledby references', () => {
    render(
      html`
        <div id="foo" aria-labelledby="bar">Hi</div>
        <div id="bar">Hello world</div>
      `,
      container
    );
    const elem1 = document.getElementById('foo')!;
    const elem2 = document.getElementById('bar')!;
    expect(computeTextAlternative(elem1)).toEqual({
      name: 'Hello world',
      nodesUsed: new Set<Node>([elem1, elem2, elem2.childNodes[0]]),
      rulesApplied: new Set<Rule>(['2B', '2F', '2G']),
    });
  });

  it('check title attribute for name when subtree is empty', () => {
    render(
      html` <input type="checkbox" title="Hello world" id="foo" /> `,
      container
    );
    const elem = document.getElementById('foo')!;
    expect(computeTextAlternative(elem).name).toEqual('Hello world');
  });

  it('check title attribute for name when subtree is hidden', () => {
    render(
      html`
        <button title="Hello world" id="foo">
          <div aria-hidden="true">Invisible text</div>
        </button>
      `,
      container
    );
    const elem = document.getElementById('foo')!;
    expect(computeTextAlternative(elem).name).toEqual('Hello world');
  });
});
