import {html, render} from 'lit-html';
import {rule2F} from './rule2F';
import {getDefaultContext} from './context';

describe('The function for rule 2F', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
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
    expect(rule2F(elem!)).toBe('Hello world');
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
    const context = getDefaultContext();
    context.inherited.isRecursive = true;
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
    const context = getDefaultContext();
    context.inherited.isRecursive = true;
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
    const context = getDefaultContext();
    context.inherited.isRecursive = true;
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
    const context = getDefaultContext();
    context.inherited.isRecursive = true;
    expect(rule2F(elem!, context)).toBe('Hello world !');
  });
});
