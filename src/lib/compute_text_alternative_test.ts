import {html, render} from 'lit';

import {customMatchers} from '../testing/custom_matchers';

import {computeTextAlternative} from './compute_text_alternative';

describe('The computeTextAlternative function', () => {
  beforeAll(() => {
    jasmine.addMatchers(customMatchers);
  });

  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns text alternative of element referenced with aria-labelledby',
     () => {
       expect(`
          <div id="fee" hidden>world</div>
          <div id="bee">
            Hello
            <div aria-labelledby="fee"></div>
          </div>
          <div id="test" aria-labelledby="bee"></div>
      `).toHaveTextAlernative('Hello world');
     });

  it('uses aria-labelledby references when computing \'name from content\' nodes',
     () => {
       expect(`
        <div id="bar">Hello world</div>
        <button id="test">
          <div aria-labelledby="bar">hi</div>
        </button>
      `).toHaveTextAlernative('Hello world');
     });

  it('prefers input value to aria-label for embedded controls', () => {
    expect(`
        <div id="test" role="link">
          Say hello <input aria-label="100" type="range" value="5" /> times
        </div>
      `).toHaveTextAlernative('Say hello 5 times');
  });

  it('returns correct computation details for simple button input', () => {
    render(html`<button id="test">Hello world</button>`, container);
    const elem = document.getElementById('test')!;
    expect(computeTextAlternative(elem)).toEqual({
      name: 'Hello world',
      steps: [
        {rule: '2G', node: elem.childNodes[0], text: 'Hello world'},
        {rule: '2F', node: elem, text: 'Hello world'},
      ],
    });
  });

  it('returns correct computation details for aria-labelledby references',
     () => {
       render(
           html`
        <div id="test" aria-labelledby="bar">Hi</div>
        <div id="bar">Hello world</div>
      `,
           container);
       const elem1 = document.getElementById('test')!;
       const elem2 = document.getElementById('bar')!;
       expect(computeTextAlternative(elem1)).toEqual({
         name: 'Hello world',
         steps: [
           {rule: '2G', node: elem2.childNodes[0], text: 'Hello world'},
           {rule: '2F', node: elem2, text: 'Hello world'},
           {rule: '2B', node: elem1, text: 'Hello world'},
         ],
       });
     });

  it('check title attribute for name when subtree is empty', () => {
    expect(`<input type="checkbox" title="Hello world" id="test" />`)
        .toHaveTextAlernative('Hello world');
  });

  it('check title attribute for name when subtree is hidden', () => {
    expect(`
        <button title="Hello world" id="test">
          <div aria-hidden="true">Invisible text</div>
        </button>
      `).toHaveTextAlernative('Hello world');
  });

  it('allows name from content through elements with 0 height and width',
     () => {
       expect(`
          <div role="button" id="test">
            <span><div>Hello world</div></span>
          </div>
        `).toHaveTextAlernative('Hello world');
     });

  it('doesnt add whitespace between inline elements (span in this case)',
     () => {
       expect(`<h1 id="test"><span>E</span><span>E</span></h1>`)
           .toHaveTextAlernative('EE');
     });

  it('does add whitespace if inline elements are on different lines', () => {
    expect(`
        <h1 id="test">
          <span>E</span>
          <span>E</span>
        </h1>
      `).toHaveTextAlernative('E E');
  });

  it('can handle elements in iframes', async () => {
    render(html`<iframe srcdoc="<body></body>"></iframe>`, container);
    const iframe = container.querySelector('iframe')!;
    await iframeLoadedPromise(iframe);
    const iframeDocument = iframe.contentWindow!.document;
    render(html`<button>Inside iframe</button>`, iframeDocument.body);
    const button = iframeDocument.querySelector('button')!;
    expect(button).toHaveTextAlernative('Inside iframe');
  });

  it('can handle Unicode BiDi control characters', () => {
    render(
        html`
        <button class="target" aria-label="يلا&#x202C; foo &#x202A;يلا bar &#x202B;يلا">foo</button>
        <button class="target">يلا&#x202C; foo &#x202A;يلا bar &#x202B;يلا</button>

        <select class="target">
          <option>يلا&#x202C;</option>
          <option>foo</option>
          <option>&#x202A;يلا</option>
          <option>bar</option>
          <option>&#x202B;يلا</option>
        </select>
        `,
        container);
    const targets = document.getElementsByClassName('target');
    expect(targets.length).toBeGreaterThan(0);
    for (const elem of targets) {
      expect(elem).toHaveTextAlernative(
          'يلا\u202C foo \u202Aيلا bar \u202Bيلا');
    }

    const options = document.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
    for (const elem of options) {
      expect(elem).toHaveTextAlernative(elem.textContent!);
    }
  });
});

async function iframeLoadedPromise(iframe: HTMLIFrameElement) {
  return new Promise((resolve) => {
    iframe.addEventListener('load', resolve, {once: true});
  });
}
