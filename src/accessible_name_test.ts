import { getTextNodeAccessibleName } from './accessible_name';

describe('The getTextNodeAccessibleName function', function() {

  beforeEach(function() {
    document.body.innerHTML = '';
  });

  it('returns text content if there is any', function() {
    document.body.innerHTML = '<div id="foo">Hello there</div>';
    const textNode: Node = document.getElementById('foo')!.childNodes[0];
    expect(getTextNodeAccessibleName(textNode)).toBe('Hello there');
  });

  it('returns empty string if there is no text content', function() {
    document.body.innerHTML = '<div id="foo"></div>';
    const textNode: Node = document.getElementById('foo')!.childNodes[0];
    expect(getTextNodeAccessibleName(textNode)).toBe('');
  });
});
