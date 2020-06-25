import getAccessibleName from '../src/accessible-name';

describe("A spec", function() {
  it("that checks some feature", function() {
    document.body.innerHTML = "<div id='foo'>Hello there</div>"
    let elem = document.getElementById('foo')!.childNodes[0] as HTMLElement;
    expect(getAccessibleName(elem)).toBe('Hello there');
  });
});
