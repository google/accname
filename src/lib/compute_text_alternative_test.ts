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
  it('includes aria-owned nodes in the subtree of the current node', () => {
    render(
      html`
        <input type="file" id="test" />
        <label for="test">
          Flash <span aria-owns="id1">the screen</span> times.
        </label>
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
  it('allows aria-owned nodes to be chained together across multiple nodes', () => {
    render(
      html`
        <input type="file" id="test" />
        <label for="test">
          Flash <span aria-owns="id1">the screen</span> times.
        </label>
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

  // http://wpt.live/accname/name_checkbox-label-embedded-menu-manual.html
  it('ignores elements who should never allow name from content, in this case role="menu"', () => {
    render(
      html`
        <input type="checkbox" id="test" />
        <label for="test"
          >Flash the screen
          <span role="menu">
            <span role="menuitem" aria-selected="true">1</span>
            <span role="menuitem" hidden="">2</span>
            <span role="menuitem" hidden="">3</span>
          </span>
          times.
        </label>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('Flash the screen times.');
  });

  // http://wpt.live/accname/name_test_case_733-manual.html
  it('Does not allow name from content for role=menu even if focusable', () => {
    render(
      html`
        <label for="test">
          crazy
          <select name="member" size="1" role="menu" tabindex="0">
            <option role="menuitem" value="beard" selected="true">clown</option>
            <option role="menuitem" value="scuba">rich</option>
          </select>
        </label>
        <input type="password" id="test" />
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('crazy');
  });

  // http://wpt.live/accname/name_from_content-manual.html
  it('Allows name from content for <tbody>', () => {
    render(
      html`
        <style>
          .hidden {
            display: none;
          }
        </style>
        <div id="test" role="link" tabindex="0">
          <span aria-hidden="true"><i> Hello, </i></span>
          <span>My</span> name is
          <div>
            <img src="file.jpg" title="Bryan" alt="" role="presentation" />
          </div>
          <span role="presentation" aria-label="Eli">
            <span aria-label="Garaventa">Zambino</span>
          </span>
          <span>the weird.</span>
          (QED)
          <span class="hidden"
            ><i><b>and don't you forget it.</b></i></span
          >
          <table>
            <tbody>
              <tr>
                <td>Where</td>
                <td style="visibility:hidden;"><div>in</div></td>
                <td><div style="display:none;">the world</div></td>
                <td>are my marbles?</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe(
      'My name is Eli the weird. (QED) Where are my marbles?'
    );
  });

  // http://wpt.live/accname/name_file-label-inline-block-elements-manual.html
  it('passes WPT testing whitespace', () => {
    render(
      // prettier-ignore
      html`
        <input type="file" id="test">
        <label for="test">W<i>h<b>a</b></i>t<br>is<div>your<div>name<b>?</b></div></div></label>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('What is your name?');
  });

  it('doesnt add whitespace between inline elements (span in this case)', () => {
    render(html` <h1 id="test"><span>E</span><span>E</span></h1> `, container);
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('EE');
  });

  it('does add whitespace if inline elements are on different lines', () => {
    render(
      html`
        <h1 id="test">
          <span>E</span>
          <span>E</span>
        </h1>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('E E');
  });

  // http://wpt.live/accname/name_test_case_619-manual.html
  it('does not consider <input> to be inline', () => {
    render(
      html`
        <input type="password" id="test" />
        <label for="test">foo<input type="text" value="bar" />baz</label>
      `,
      container
    );
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem).name).toBe('foo bar baz');
  });
});
