import {html, render} from 'lit';

import {createRuleRunner} from '../testing/utils';

import {getDefaultContext} from './context';
import {withDefaults} from './options';
import {rule2F as rule2FImpl, TEST_ONLY} from './rule2F';

const rule2F = createRuleRunner(rule2FImpl);

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
        container);
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
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.directLabelReference = true;
    expect(rule2F(elem!, context)).toBe('Hello world !');
  });

  it('returns a string concatenated with CSS generated text content for inline elements if includePseudoElements is true',
     () => {
       render(
           html`
        <style>
          #foo:before {
            content: 'Hello';
          }
          #foo:after {
            content: '!';
          }
        </style>
        <div id="foo">world</div>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       const options = withDefaults({includePseudoElements: true});
       context.directLabelReference = true;
       expect(rule2F(elem!, context, options)).toBe('Helloworld!');
     });

  it('returns a string concatenated with CSS generated text content for block elements if includePseudoElements is true',
     () => {
       render(
           html`
        <style>
          #foo:before {
            content: 'Hello';
            display: block;
          }
          #foo:after {
            content: '!';
          }
        </style>
        <div id="foo">world</div>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       const options = withDefaults({includePseudoElements: true});
       context.directLabelReference = true;
       expect(rule2F(elem!, context, options)).toBe('Hello world!');
     });

  it('doesn\'t include non-textual CSS content', () => {
    render(
        html`
        <style>
          #foo:before {
            content: url('a/url/to/some/image');
          }
        </style>
        <div id="foo">
          Hello world
        </div>
      `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    const options = withDefaults({includePseudoElements: true});
    context.directLabelReference = true;
    expect(rule2F(elem!, context, options)).toBe('Hello world');
  });

  it('ignores CSS generated text content by default', () => {
    render(
        html`
        <style>
          #foo:before {
            content: 'Hello';
          }
          #foo:after {
            content: '!';
          }
        </style>
        <div id="foo">world</div>
      `,
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.directLabelReference = true;
    expect(rule2F(elem!, context)).toBe('world');
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
        container);
    const elem = document.getElementById('foo');
    const context = getDefaultContext();
    context.directLabelReference = true;
    expect(rule2F(elem!, context)).toBe('Hello world');
  });

  it('returns text alternative for entire subtree of node referenced by aria-labelledby',
     () => {
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
        </div>
      `,
           container);
       const elem = document.getElementById('foo');
       const context = getDefaultContext();
       context.directLabelReference = true;
       expect(rule2F(elem!, context)).toBe('Hello world !');
     });

  it('returns null if the conditions for applying rule2F are not satisfied',
     () => {
       render(html` <div id="foo"></div> `, container);
       const elem = document.getElementById('foo');
       expect(rule2F(elem!)).toBe(null);
     });
});


describe('name from content tables', () => {
  const tables = new Map([
    ['always', TEST_ONLY.ALWAYS_NAME_FROM_CONTENT],
    ['sometimes', TEST_ONLY.SOMETIMES_NAME_FROM_CONTENT],
    ['never', TEST_ONLY.NEVER_NAME_FROM_CONTENT],
  ]);

  for (const [name1, table1] of tables.entries()) {
    describe(`the set of roles that take name from content "${name1}"`, () => {
      for (const [name2, table2] of tables.entries()) {
        if (name1 !== name2) {
          it(`should not contain any of the roles that take name from content "${
                 name2}"`,
             () => {
               for (const role of table2.roles) {
                 expect(table1.roles).not.toContain(role);
               }
             });
        }
      }
    });
  }
});
