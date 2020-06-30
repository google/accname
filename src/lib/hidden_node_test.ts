import { hiddenNode } from './hidden_node';

describe('The hiddenNode function for rule 2A', function() {

  beforeEach(function() {
    document.body.innerHTML = '';
  });

  it('returns empty string for hidden elems that aren\'t referenced', function() {
    document.body.innerHTML = '<div id="foo" hidden>Hello world</div>';
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem)).toBe('');
    }
  });

  it('returns null for hidden elems that are referenced in an aria-labelledby', function() {
    document.body.innerHTML = '<div id="foo" hidden>Hello world</div>'
    + '<div aria-labelledby="foo"></div>';
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem)).toBe(null);
    }
  });

  it('returns null for hidden elems that are referenced by a label element', function() {
    document.body.innerHTML = '<div id="foo" hidden>Hello world</div>'
    + '<label for="foo"></div>';
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem)).toBe(null);
    }
  });

  it('returns null for elem that is not hidden', function() {
    document.body.innerHTML = '<div id="foo">Hello world</div>';
    const elem = document.getElementById('foo');
    if (elem) {
      expect(hiddenNode(elem)).toBe(null);
    }
  });
});
