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

  // http://wpt.live/accname/name_file-label-owned-combobox-manual.html
  it("doesn't visit the same node twice during a recursive traversal", () => {
    render(
      html`
        <input type="file" id="test" />
        <label for="test"
          >Flash <span aria-owns="id1">the screen</span> times.</label
        >
        <div id="id1">
          <div role="combobox">
            <div role="textbox"></div>
            <ul role="listbox" style="list-style-type: none;">
              <li role="option" aria-selected="true">1</li>
              <li role="option">2</li>
              <li role="option">3</li>
            </ul>
          </div>
        </div>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('Flash the screen 1 times.');
  });

  // http://wpt.live/accname/name_file-label-owned-combobox-owned-listbox-manual.html
  it("doesn't visit the same node twice during a recursive traversal", () => {
    render(
      html`
        <input type="file" id="test" />
        <label for="test"
          >Flash <span aria-owns="id1">the screen</span> times.</label
        >
        <div>
          <div id="id1" role="combobox" aria-owns="id2">
            <div role="textbox"></div>
          </div>
        </div>
        <div>
          <ul id="id2" role="listbox" style="list-style-type: none;">
            <li role="option">1</li>
            <li role="option" aria-selected="true">2</li>
            <li role="option">3</li>
          </ul>
        </div>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('Flash the screen 2 times.');
  });
});
