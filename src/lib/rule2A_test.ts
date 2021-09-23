import {html, render} from 'lit';

import {createRuleRunner} from '../testing/utils';

import {getDefaultContext} from './context';
import {rule2A as rule2AImpl} from './rule2A';

const rule2A = createRuleRunner(rule2AImpl);

describe('The function for rule 2A', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns `null` for elements that are not hidden', () => {
    render(html`<div id="foo">Hello world</div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe(null);
  });

  it('returns an empty string for hidden elements', () => {
    render(html`<div id="foo" aria-hidden="true">Hello world</div>`, container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe('');
  });

  it('considers elements with an id that is not referenced somewhere else as hidden',
     () => {
       render(html`<div id="foo" hidden>Hello world</div>`, container);
       const elem = document.getElementById('foo');
       expect(rule2A(elem!)).toBe('');
     });

  it('considers elements with an id whose value is referenced by an `aria-labelledby` attribute as not hidden',
     () => {
       render(html`<div id="foo" hidden>Hello world</div>`, container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.directLabelReference = true;
       expect(rule2A(elem!, context)).toBe(null);
     });

  it('considers elements directly referenced by a `label[for]` attribute as not hidden',
     () => {
       render(html`<div id="foo" hidden>Hello world</div>`, container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.directLabelReference = true;
       expect(rule2A(elem!, context)).toBe(null);
     });

  it('considers elements with `style="display:none;"` as hidden', () => {
    render(
        html`
        <div id="foo">Hello world</div>
        <style>
          #foo {
            display: none;
          }
        </style>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe('');
  });

  it('considers elements with `style="visibility:hidden;"` as hidden', () => {
    render(
        html`
        <div id="foo">Hello world</div>
        <style>
          #foo {
            visibility: hidden;
          }
        </style>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe('');
  });

  it('considers elements with `hidden` ancestors as hidden', () => {
    render(
        html`
        <div hidden>
          <div>
            <div>
              <div id="foo">Hello world</div>
            </div>
          </div>
        </div>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe('');
  });

  it('considers elements with `display:none` ancestors as hidden', () => {
    render(
        html`
        <div id="bar">
          <div>
            <div>
              <div id="foo">Hello world</div>
            </div>
          </div>
        </div>
        <style>
          #bar {
            display: none;
          }
        </style>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe('');
  });

  it('considers elements with `visibility:hidden` ancestors as hidden', () => {
    render(
        html`
        <div id="bar">
          <div>
            <div>
              <div id="foo">Hello world</div>
            </div>
          </div>
        </div>
        <style>
          #bar {
            visibility: hidden;
          }
        </style>
      `,
        container);
    const elem = document.getElementById('foo');
    expect(rule2A(elem!)).toBe('');
  });

  it('considers input elements with zero width and height as not hidden',
     () => {
       render(
           html`<input type="radio" disabled style="height: 0; width: 0;">`,
           container);

       const target = container.querySelector('input');
       expect(rule2A(target!)).toBe(null);
     });
});
