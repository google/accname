import {hiddenNode} from './hidden_node';
import {html, render} from 'lit-html';

describe('The hiddenNode function for rule 2A', () => {

  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns empty string for hidden elems that aren\'t referenced', () => {
    render(html`<div id="foo" hidden>Hello world</div>`, container);
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem, {})).toBe('');
    }
  });

  it('returns null for hidden elems that are referenced in an aria-labelledby', () => {
    render(html`<div id="foo" hidden>Hello world</div>`, container);
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem, {ariaLabelledbyReference: true})).toBe(null);
    }
  });

  it('returns null for hidden elems that are referenced by a label element', () => {
    render(html`<div id="foo" hidden>Hello world</div>`, container);
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem, {nativeTextAlternativeReference: true})).toBe(null);
    }
  });

  it('returns null for elem that is not hidden', () => {
    render(html`<div id="foo">Hello world</div>`, container);
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem, {})).toBe(null);
    }
  });
});
