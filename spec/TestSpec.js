import * as an from '../dist/accessible-name';

describe("A spec", function() {
  it("that checks some feature", function() {
    document.body.innerHTML = "<div id='foo'>Hello there</div>"
    let elem = document.getElementById('foo').childNodes[0];
    expect(an.getAccessibleName(elem)).toBe('Hello there');
  });
});
