/**
 * @license
 * Copyright © web-platform-tests contributors
 * SPDX-License-Identifier: BSD-3-Clause
 */

/** The structure of a test case */
export interface TestCase {
  title: string;
  expectedName: string;
  htmlInput: string;
  skipFirefox?: boolean;
}

const IMG_URL =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * All the test cases present in the Web Platform tests for accname.
 *
 * The only modification we do is to replace the img url with a valid img data
 * url to ensure images load in every environment.
 */
export const WPT_TEST_CASES: TestCase[] = [
  {
    title: 'Name 1.0 combobox-focusable-alternative',
    expectedName: 'Choose your language',
    htmlInput: `
            <input id="test" role="combobox" type="text" title="Choose your language" value="English">
        `,
  },
  {
    title: 'Name 1.0 combobox-focusable',
    expectedName: 'Choose your language.',
    htmlInput: `
            <div id="test" role="combobox" tabindex="0" title="Choose your language.">
            <span> English </span>
          </div>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-combobox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">Flash the screen
            <div role="combobox">
              <div role="textbox"></div>
              <ul role="listbox" style="list-style-type: none;">
                <li role="option" aria-selected="true">1</li>
            <li role="option">2</li>
            <li role="option">3</li>
              </ul>
            </div>
            times.
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-listbox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">Flash the screen
            <ul role="listbox" style="list-style-type: none;">
              <li role="option" aria-selected="true">1</li>
              <li role="option">2</li>
              <li role="option">3</li>
            </ul>
            times.
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-menu',
    expectedName: 'Flash the screen times.',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">Flash the screen
            <span role="menu">
              <span role="menuitem" aria-selected="true">1</span>
                <span role="menuitem" hidden>2</span>
            <span role="menuitem" hidden>3</span>
              </span>
              times.
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-select',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">Flash the screen
            <select size="1">
              <option selected="selected">1</option>
              <option>2</option>
              <option>3</option>
            </select>
            times.
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-slider',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">foo <input role="slider" type="range" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-spinbutton',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">foo <input role="spinbutton" type="number" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-embedded-textbox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="checkbox" id="test" />
          <label for="test">Flash the screen
            <div role="textbox" contenteditable>1</div>
            times.
          </label>
        `,
  },
  {
    title: 'Name checkbox-label-multiple-label-alternative',
    expectedName: 'a test This is',
    htmlInput: `
            <label for="test">a test</label>
          <label>This <input type="checkbox" id="test" /> is</label>
        `,
  },
  {
    title: 'Name checkbox-label-multiple-label',
    expectedName: 'This is a test',
    htmlInput: `
            <label>This <input type="checkbox" id="test" /> is</label>
          <label for="test">a test</label>
        `,
  },
  {
    title: 'Name checkbox-title',
    expectedName: 'foo',
    htmlInput: `
            <input type="checkbox" id="test" title="foo" />
        `,
  },
  {
    title: 'Name file-label-embedded-combobox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">Flash the screen
            <div role="combobox">
              <div role="textbox"></div>
              <ul role="listbox" style="list-style-type: none;">
                <li role="option" aria-selected="true">1 </li>
            <li role="option">2 </li>
            <li role="option">3 </li>
              </ul>
            </div>
            times.
          </label>
        `,
  },
  {
    title: 'Name file-label-embedded-menu',
    expectedName: 'Flash the screen times.',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">Flash the screen
            <span role="menu">
              <span role="menuitem" aria-selected="true">1</span>
              <span role="menuitem" hidden>2</span>
              <span role="menuitem" hidden>3</span>
            </span>
            times.
          </label>
        `,
  },
  {
    title: 'Name file-label-embedded-select',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">Flash the screen
            <select size="1">
              <option selected="selected">1</option>
              <option>2</option>
              <option>3</option>
            </select>
            times.
          </label>
        `,
  },
  {
    title: 'Name file-label-embedded-slider',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">foo <input role="slider" type="range" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name file-label-embedded-spinbutton',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">foo <input role="spinbutton" type="number" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name file-label-inline-block-elements',
    expectedName: 'What is your name?',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">W<i>h<b>a</b></i>t<br>is<div>your<div>name<b>?</b></div></div></label>
        `,
  },
  {
    title: 'Name file-label-inline-block-styles',
    // Should be "This is a test." but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'is a test',
    htmlInput: `
            <style>
            label:before { content: "This"; display: block; }
            label:after { content: "."; }
          </style>
          <label for="test">is a test</label>
          <input type="text" id="test"/>
        `,
  },
  {
    title: 'Name file-label-inline-hidden-elements',
    expectedName: '2 4 6 8 10',
    htmlInput: `
            <style>
            .hidden { display: none; }
          </style>
          <input type="file" id="test" />
          <label for="test">
            <span class="hidden">1</span><span>2</span>
            <span style="visibility: hidden;">3</span><span>4</span>
            <span hidden>5</span><span>6</span>
            <span aria-hidden="true">7</span><span>8</span>
            <span aria-hidden="false" class="hidden">9</span><span>10</span>
          </label>
        `,
  },
  {
    title: 'Name file-label-owned-combobox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">Flash <span aria-owns="id1">the screen</span> times.</label>
          <div id="id1">
            <div role="combobox">
              <div role="textbox"></div>
              <ul role="listbox" style="list-style-type: none;">
                <li role="option" aria-selected="true">1 </li>
            <li role="option">2 </li>
            <li role="option">3 </li>
              </ul>
            </div>
          </div>
        `,
  },
  {
    title: 'Name file-label-owned-combobox-owned-listbox',
    expectedName: 'Flash the screen 2 times.',
    htmlInput: `
            <input type="file" id="test" />
          <label for="test">Flash <span aria-owns="id1">the screen</span> times.</label>
          <div>
            <div id="id1" role="combobox" aria-owns="id2">
              <div role="textbox"></div>
            </div>
          </div>
          <div>
            <ul id="id2" role="listbox" style="list-style-type: none;">
              <li role="option" >1 </li>
              <li role="option" aria-selected="true">2 </li>
              <li role="option">3 </li>
            </ul>
          </div>
        `,
  },
  {
    title: 'Name file-title',
    expectedName: 'foo',
    htmlInput: `
            <input type="file" id="test" title="foo" />
        `,
  },
  {
    title: 'Name from content',
    // Should be 'My name is Eli the weird. (QED) Where are my marbles?',
    expectedName: 'My name is Bryan Eli the weird. (QED) Where are my marbles?',
    htmlInput: `
            <style>
            .hidden { display: none; }
          </style>
          <div id="test" role="link" tabindex="0">
            <span aria-hidden="true"><i> Hello, </i></span>
            <span>My</span> name is
            <div><img src="${
        IMG_URL}" title="Bryan" alt="" role="presentation" /></div>
            <span role="presentation" aria-label="Eli">
              <span aria-label="Garaventa">Zambino</span>
            </span>
            <span>the weird.</span>
            (QED)
            <span class="hidden"><i><b>and don't you forget it.</b></i></span>
            <table>
              <tr>
                <td>Where</td>
                <td style="visibility:hidden;"><div>in</div></td>
                <td><div style="display:none;">the world</div></td>
                <td>are my marbles?</td>
              </tr>
            </table>
          </div>
        `,
  },
  {
    title: 'Name from content of labelledby element',
    // Should be 'My name is Eli the weird. (QED) Where are my marbles?',
    expectedName: 'My name is Bryan Eli the weird. (QED) Where are my marbles?',
    htmlInput: `
            <style>
            .hidden { display: none; }
          </style>
          <input id="test" type="text" aria-labelledby="lblId" />
          <div id="lblId" >
            <span aria-hidden="true"><i> Hello, </i></span>
            <span>My</span> name is
            <div><img src="${
        IMG_URL}" title="Bryan" alt="" role="presentation" /></div>
            <span role="presentation" aria-label="Eli">
              <span aria-label="Garaventa">Zambino</span>
            </span>
            <span>the weird.</span>
            (QED)
            <span class="hidden"><i><b>and don't you forget it.</b></i></span>
            <table>
              <tr>
                <td>Where</td>
                <td style="visibility:hidden;"><div>in</div></td>
                <td><div style="display:none;">the world</div></td>
                <td>are my marbles?</td>
              </tr>
            </table>
          </div>
        `,
  },
  {
    title: 'Name from content of labelledby elements one of which is hidden',
    expectedName: 'Important stuff',
    htmlInput: `
            <style>
            .hidden { display: none; }
          </style>
          <div>
            <input id="test" type="text" aria-labelledby="lbl1 lbl2" aria-describedby="descId" />
            <span>
              <span aria-hidden="true" id="lbl1">Important</span>
              <span class="hidden">
                <span aria-hidden="true" id="lbl2">stuff</span>
              </span>
            </span>
          </div>
          <div class="hidden">
            <div id="descId">
              <span aria-hidden="true"><i> Hello, </i></span>
              <span>My</span> name is
              <div><img src="${
        IMG_URL}" title="Bryan" alt="" role="presentation" /></div>
              <span role="presentation" aria-label="Eli">
                <span aria-label="Garaventa">Zambino</span>
              </span>
              <span>the weird.</span>
              (QED)
              <span class="hidden"><i><b>and don't you forget it.</b></i></span>
              <table>
                <tr>
                  <td>Where</td>
                  <td style="visibility:hidden;"><div>in</div></td>
                  <td><div style="display:none;">the world</div></td>
                  <td>are my marbles?</td>
                </tr>
              </table>
            </div>
          </div>
        `,
  },
  {
    title: 'Name from content of label',
    // Should be 'My name is Eli the weird. (QED) Where are my marbles?',
    expectedName: 'My name is Bryan Eli the weird. (QED) Where are my marbles?',
    htmlInput: `
            <style>
            .hidden { display: none; }
          </style>
          <input type="text" id="test" />
          <label for="test" id="label">
            <span aria-hidden="true"><i> Hello, </i></span>
            <span>My</span> name is
            <div><img src="${
        IMG_URL}" title="Bryan" alt="" role="presentation" /></div>
            <span role="presentation" aria-label="Eli">
              <span aria-label="Garaventa">Zambino</span>
           </span>
           <span>the weird.</span>
           (QED)
           <span class="hidden"><i><b>and don't you forget it.</b></i></span>
           <table>
             <tr>
               <td>Where</td>
               <td style="visibility:hidden;"><div>in</div></td>
               <td><div style="display:none;">the world</div></td>
               <td>are my marbles?</td>
            </tr>
           </table>
          </label>
        `,
  },
  {
    title: 'Name  heading-combobox-focusable-alternative',
    expectedName: 'Country of origin: United States',
    htmlInput: `
            <h2 id="test">
          Country of origin:
          <input role="combobox" type="text" title="Choose your country." value="United States">
          </h2>
        `,
  },
  {
    title: 'Name image-title',
    expectedName: 'foo',
    htmlInput: `
            <input type="image" src="${IMG_URL}" id="test" title="foo" />
        `,
  },
  {
    title: 'Name link-mixed-content',
    // Should be 'My name is Eli the weird. (QED)',
    expectedName: 'My name is Bryan Eli the weird. (QED)',
    htmlInput: `
            <style>
            .hidden { display: none; }
          </style>
          <div id="test" role="link" tabindex="0">
            <span aria-hidden="true"><i> Hello, </i></span>
            <span>My</span> name is
            <div><img src="${
        IMG_URL}" title="Bryan" alt="" role="presentation" /></div>
            <span role="presentation" aria-label="Eli"><span aria-label="Garaventa">Zambino</span></span>
            <span>the weird.</span>
            (QED)
            <span class="hidden"><i><b>and don't you forget it.</b></i></span>
          </div>
        `,
  },
  {
    title: 'Name link-with-label',
    expectedName: 'California',
    htmlInput: `
            <a id="test" href="#" aria-label="California" title="San Francisco" >United States</a>
        `,
  },
  {
    title: 'Name password-label-embedded-combobox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="password" id="test" />
          <label for="test">Flash the screen
            <div role="combobox">
              <div role="textbox"></div>
              <ul role="listbox" style="list-style-type: none;">
                <li role="option" aria-selected="true">1</li>
            <li role="option">2</li>
            <li role="option">3</li>
              </ul>
            </div>
            times.
          </label>
        `,
  },
  {
    title: 'Name password-label-embedded-menu',
    expectedName: 'Flash the screen times.',
    htmlInput: `
            <input type="password" id="test" />
          <label for="test">Flash the screen
            <span role="menu">
              <span role="menuitem" aria-selected="true">1</span>
              <span role="menuitem" hidden>2</span>
              <span role="menuitem" hidden>3</span>
            </span>
            times.
          </label>
        `,
  },
  {
    title: 'Name password-label-embedded-select',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="password" id="test" />
          <label for="test">Flash the screen
            <select size="1">
              <option selected="selected">1</option>
              <option>2</option>
              <option>3</option>
            </select>
            times.
          </label>
        `,
  },
  {
    title: 'Name password-label-embedded-slider',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="password" id="test" />
          <label for="test">foo <input role="slider" type="range" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name password-label-embedded-spinbutton',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="password" id="test" />
          <label for="test">foo <input role="spinbutton" type="number" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name password-title',
    expectedName: 'foo',
    htmlInput: `
            <input type="password" id="test" title="foo" />
        `,
  },
  {
    title: 'Name radio-label-embedded-combobox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="radio" id="test" />
          <label for="test">Flash the screen
            <div role="combobox">
              <div role="textbox"></div>
              <ul role="listbox" style="list-style-type: none;">
                <li role="option" aria-selected="true">1</li>
            <li role="option">2</li>
            <li role="option">3</li>
              </ul>
            </div>
            times.
          </label>
        `,
  },
  {
    title: 'Name radio-label-embedded-menu',
    expectedName: 'Flash the screen times.',
    htmlInput: `
            <input type="radio" id="test" />
          <label for="test">Flash the screen
            <span role="menu">
              <span role="menuitem" aria-selected="true">1</span>
              <span role="menuitem" hidden>2</span>
              <span role="menuitem" hidden>3</span>
            </span>
            times.
          </label>
        `,
  },
  {
    title: 'Name radio-label-embedded-select',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="radio" id="test" />
          <label for="test">Flash the screen
            <select size="1">
              <option selected="selected">1</option>
              <option>2</option>
              <option>3</option>
            </select>
            times.
          </label>
        `,
  },
  {
    title: 'Name radio-label-embedded-slider',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="radio" id="test" />
          <label for="test">foo <input role="slider" type="range" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name radio-label-embedded-spinbutton',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="radio" id="test" />
          <label for="test">foo <input role="spinbutton"  type="number" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name radio-title',
    expectedName: 'foo',
    htmlInput: `
            <input type="radio" id="test" title="foo" />
        `,
  },
  {
    title: 'Name test case 539',
    expectedName: 'Rich',
    htmlInput: `
            <input type="button" aria-label="Rich" id="test">
        `,
  },
  {
    title: 'Name test case 540',
    expectedName: 'Rich\'s button',
    htmlInput: `
            <div id="ID1">Rich's button</div>
          <input type="button" aria-labelledby="ID1" id="test">
        `,
  },
  {
    title: 'Name test case 541',
    expectedName: 'Rich\'s button',
    htmlInput: `
            <div id="ID1">Rich's button</div>
          <input type="button" aria-label="bar" aria-labelledby="ID1" id="test"/>
        `,
  },
  {
    title: 'Name test case 543',
    expectedName: 'reset',  // Should be 'Reset',
    htmlInput: `
            <input type="reset" id="test"/>
        `,
  },
  {
    title: 'Name test case 544',
    expectedName: 'foo',
    htmlInput: `
            <input type="button" id="test" value="foo"/>
        `,
  },
  {
    title: 'Name test case 545',
    expectedName: 'foo',
    htmlInput: `
            <input src="${IMG_URL}" type="image" id="test" alt="foo"/>
        `,
  },
  {
    title: 'Name test case 546',
    expectedName: 'States:',
    htmlInput: `
            <label for="test">States:</label>
          <input type="text" id="test"/>
        `,
  },
  {
    title: 'Name test case 547',
    expectedName: 'foo David',
    htmlInput: `
            <label for="test">
          foo
          <input type="text" value="David"/>
          </label>
          <input type="text" id="test" value="baz"/>
        `,
  },
  {
    title: 'Name test case 548',
    expectedName: 'crazy',
    htmlInput: `
            <label for="test">
          crazy
            <select name="member" size="1" role="menu" tabindex="0">
              <option role="menuitem" value="beard" selected="true">clown</option>
              <option role="menuitem" value="scuba">rich</option>
            </select>
          </label>
          <input type="text" id="test" value="baz"/>
        `,
  },
  {
    title: 'Name test case 549',
    expectedName: 'crazy Monday',
    htmlInput: `
            <label for="test">
            crazy
             <div role="spinbutton" aria-valuetext="Monday" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
             </div>
          </label>
          <input type="text" id="test" value="baz"/>
        `,
  },
  {
    title: 'Name test case 550',
    expectedName: 'crazy 4',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="text" id="test" value="baz"/>
        `,
  },
  {
    title: 'Name test case 551',
    expectedName: 'crazy',
    htmlInput: `
            <input type="text" id="test" title="crazy" value="baz"/>
        `,
  },
  {
    title: 'Name test case 552',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fruit',
    htmlInput: `
            <style>
            label:before { content:"fancy "; }
          </style>
          <label for="test">fruit</label>
          <input type="text" id="test"/>
        `,
  },
  {
    title: 'Name test case 553',
    // Should be "test content" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: '',
    htmlInput: `
            <style type="text/css">
            [data-after]:after { content: attr(data-after); }
          </style>
          <label for="test" data-after="test content"></label>
          <input type="text" id="test">
        `,
    skipFirefox: true,  // Firefox does not seem to support content from attr.
  },
  {
    title: 'Name test case 556',
    expectedName: '1',
    htmlInput: `
            <img id="test" src="${IMG_URL}" aria-label="1"/>
        `,
  },
  {
    title: 'Name test case 557',
    expectedName: '1',
    htmlInput: `
            <img id="test" src="${IMG_URL}" aria-label="1" alt="a" title="t"/>
        `,
  },
  {
    title: 'Name test case 558',
    expectedName: '',
    htmlInput: `
            <input type="text" value="peanuts" id="test">
          <img aria-labelledby="test" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 559',
    expectedName: '',
    htmlInput: `
            <img id="test" aria-labelledby="test" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 560',
    expectedName: '',
    htmlInput: `
            <input type="text" value="peanuts" id="test">
          <img aria-labelledby="test" aria-label="1" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 561',
    expectedName: '1',
    htmlInput: `
            <img id="test" aria-labelledby="test" aria-label="1" src="${
        IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 562',
    expectedName: 'peanuts popcorn apple jacks',
    htmlInput: `
            <input type="text" value="peanuts" id="ID1">
          <input type="text" value="popcorn" id="ID2">
          <input type="text" value="apple jacks" id="ID3">
          <img aria-labelledby="ID1 ID2 ID3" id="test" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 563',
    expectedName: 'l peanuts',
    htmlInput: `
            <input type="text" value="peanuts" id="ID1">
          <img id="test" aria-label="l" aria-labelledby="test ID1" src="${
        IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 564',
    expectedName: 'l peanuts popcorn',
    htmlInput: `
            <input type="text" value="peanuts" id="ID1">
          <input type="text" value="popcorn" id="ID2">
          <img id="test" aria-label="l" aria-labelledby="test ID1 ID2" src="${
        IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 565',
    expectedName: 'l peanuts popcorn apple jacks',
    htmlInput: `
            <input type="text" value="peanuts" id="ID1">
          <input type="text" value="popcorn" id="ID2">
          <input type="text" value="apple jacks" id="ID3">
          <img id="test" aria-label="l" aria-labelledby="test ID1 ID2 ID3" alt= "a" title="t" src="${
        IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 566',
    expectedName: 't peanuts popcorn apple jacks',
    htmlInput: `
            <input type="text" value="peanuts" id="ID1">
          <input type="text" value="popcorn" id="ID2">
          <input type="text" value="apple jacks" id="ID3">
          <img id="test" aria-label="" aria-labelledby="test ID1 ID2 ID3" alt="" title="t" src="${
        IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 596',
    expectedName: 'bar',
    htmlInput: `
            <div id="test" aria-labelledby="ID1">foo</div>
          <span id="ID1">bar</span>
        `,
  },
  {
    title: 'Name test case 597',
    expectedName: 'Tag',
    htmlInput: `
            <div id="test" aria-label="Tag">foo</div>
        `,
  },
  {
    title: 'Name test case 598',
    expectedName: 'bar',
    htmlInput: `
            <div id="test" aria-labelledby="ID1" aria-label="Tag">foo</div>
          <span id="ID1">bar</span>
        `,
  },
  {
    title: 'Name test case 599',
    expectedName: 'bar baz',
    htmlInput: `
            <div id="test" aria-labelledby="ID0 ID1" aria-label="Tag">foo</div>
          <span id="ID0">bar</span>
          <span id="ID1">baz</span>
        `,
  },
  {
    title: 'Name test case 600',
    expectedName: '',
    htmlInput: `
            <div id="test">Div with text</div>
        `,
  },
  {
    title: 'Name test case 601',
    expectedName: 'foo',
    htmlInput: `
            <div id="test" role="button">foo</div>
        `,
  },
  {
    title: 'Name test case 602',
    expectedName: 'Tag',
    htmlInput: `
            <div id="test" role="button" title="Tag" style="outline:medium solid black; width:2em; height:1em;">
          </div>
        `,
  },
  {
    title: 'Name test case 603',
    expectedName: 'foo',
    htmlInput: `
            <div id="ID1">foo</div>
          <a id="test" href="test.html" aria-labelledby="ID1">bar</a>
        `,
  },
  {
    title: 'Name test case 604',
    expectedName: 'Tag',
    htmlInput: `
            <a id="test" href="test.html" aria-label="Tag">ABC</a>
        `,
  },
  {
    title: 'Name test case 605',
    expectedName: 'bar',
    htmlInput: `
            <a href="test.html" id="test" aria-labelledby="ID1" aria-label="Tag">foo</a>
          <p id="ID1">bar</p>
        `,
  },
  {
    title: 'Name test case 606',
    expectedName: 'Tag foo',
    htmlInput: `
            <a href="test.html" id="test" aria-labelledby="test ID1" aria-label="Tag"></a>
          <p id="ID1">foo</p>
        `,
  },
  {
    title: 'Name test case 607',
    expectedName: 'ABC',
    htmlInput: `
            <a href="test.html" id="test">ABC</a>
        `,
  },
  {
    title: 'Name test case 608',
    expectedName: 'Tag',
    htmlInput: `
            <a href="test.html" id="test" title="Tag"></a>
        `,
  },
  {
    title: 'Name test case 609',
    expectedName: 'foo bar baz',
    htmlInput: `
            <input id="test" type="text" aria-labelledby="ID1 ID2 ID3">
          <p id="ID1">foo</p>
          <p id="ID2">bar</p>
          <p id="ID3">baz</p>
        `,
  },
  {
    title: 'Name test case 610',
    expectedName: 'foo bar',
    htmlInput: `
            <input id="test" type="text" aria-label="bar" aria-labelledby="ID1 test">
          <div id="ID1">foo</div>
        `,
  },
  {
    title: 'Name test case 611',
    expectedName: 'foo',
    htmlInput: `
            <input id="test" type="text"/>
          <label for="test">foo</label>
        `,
  },
  {
    title: 'Name test case 612',
    expectedName: 'foo',
    htmlInput: `
            <input type="password" id="test">
          <label for="test">foo</label>
        `,
  },
  {
    title: 'Name test case 613',
    expectedName: 'foo',
    htmlInput: `
            <input type="checkbox" id="test">
          <label for="test">foo</label></body>
        `,
  },
  {
    title: 'Name test case 614',
    expectedName: 'foo',
    htmlInput: `
            <input type="radio" id="test">
          <label for="test">foo</label>
        `,
  },
  {
    title: 'Name test case 615',
    expectedName: 'foo',
    htmlInput: `
            <input type="file" id="test">
          <label for="test">foo</label>
        `,
  },
  {
    title: 'Name test case 616',
    expectedName: 'foo',
    htmlInput: `
            <input type="image" id="test">
          <label for="test">foo</label>
        `,
  },
  {
    title: 'Name test case 617',
    expectedName: 'foo bar baz',
    htmlInput: `
            <input type="checkbox" id="test">
          <label for="test">foo<input type="text" value="bar">baz</label>
        `,
  },
  {
    title: 'Name test case 618',
    expectedName: 'foo bar baz',
    htmlInput: `
            <input type="text" id="test">
          <label for="test">foo<input type="text" value="bar">baz</label>
        `,
  },
  {
    title: 'Name test case 619',
    expectedName: 'foo bar baz',
    htmlInput: `
            <input type="password" id="test">
          <label for="test">foo<input type="text" value="bar">baz</label>
        `,
  },
  {
    title: 'Name test case 620',
    expectedName: 'foo bar baz',
    htmlInput: `
            <input type="radio" id="test">
          <label for="test">foo<input type="text" value="bar">baz</label>
        `,
  },
  {
    title: 'Name test case 621',
    expectedName: 'foo bar baz',
    htmlInput: `
            <input type="file" id="test">
          <label for="test">foo <input type="text" value="bar"> baz</label>
        `,
  },
  {
    title: 'Name test case 659',
    expectedName: 'bar',  // Should be 'foo bar baz',
    htmlInput: `
            <style type="text/css">
            label:before { content: "foo"; }
            label:after { content: "baz"; }
          </style>
          <form>
            <label for="test" title="bar"><input id="test" type="text" name="test" title="buz"></label>
          </form>
        `,
  },
  {
    title: 'Name test case 660',
    expectedName: 'bar',  // Should be 'foo bar baz',
    htmlInput: `
            <style type="text/css">
            label:before { content: "foo"; }
            label:after { content: "baz"; }
          </style>
          <form>
            <label for="test" title="bar"><input id="test" type="password" name="test" title="buz"></label>
          </form>
        `,
  },
  {
    title: 'Name test case 661',
    expectedName: 'bar',  // Should be 'foo baz',
    htmlInput: `
            <style type="text/css">
            label:before { content: "foo"; }
            label:after { content: "baz"; }
          </style>
          <form>
            <label for="test"><input id="test" type="checkbox" name="test" title=" bar "></label>
          </form>
        `,
  },
  {
    title: 'Name test case 662',
    expectedName: 'bar',  // Should be 'foo baz',
    htmlInput: `
            <style type="text/css">
            label:before { content: "foo"; }
            label:after { content: "baz"; }
          </style>
          <form>
            <label for="test"><input id="test" type="radio" name="test" title=" bar "></label>
          </form>
        `,
  },
  {
    title: 'Name test case 663a',
    expectedName: 'bar',  // Should be 'foo baz',
    htmlInput: `
            <style type="text/css">
            label:before { content: "foo"; }
            label:after { content: "baz"; }
          </style>
          <form>
            <label for="test"><input id="test" type="image" src="${
        IMG_URL}" name="test" title="bar"></label>
          </form>
        `,
  },
  {
    title: 'Name test case 721',
    expectedName: 'States:',
    htmlInput: `
            <label for="test">States:</label>
          <input type="password" id="test"/>
        `,
  },
  {
    title: 'Name test case 723',
    expectedName: 'States:',
    htmlInput: `
            <label for="test">States:</label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 724',
    expectedName: 'States:',
    htmlInput: `
            <label for="test">States:</label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 725',
    expectedName: 'File:',
    htmlInput: `
            <label for="test">File:</label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 726',
    expectedName: 'States:',
    htmlInput: `
            <label for="test">States:</label>
          <input type="image" id="test" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 727',
    expectedName: 'foo David',
    htmlInput: `
            <label for="test">
            foo
            <input type="text" value="David"/>
          </label>
          <input type="password" id="test" value="baz"/>
        `,
  },
  {
    title: 'Name test case 728',
    expectedName: 'foo David',
    htmlInput: `
            <label for="test">
            foo
            <input type="text" value="David"/>
          </label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 729',
    expectedName: 'foo David',
    htmlInput: `
            <label for="test">
            foo
            <input type="text" value="David"/>
          </label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 730',
    expectedName: 'foo David',
    htmlInput: `
            <label for="test">
            foo
            <input type="text" value="David"/>
          </label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 731',
    expectedName: 'foo David',
    htmlInput: `
            <label for="test">
            foo
            <input type="text" value="David"/>
          </label>
          <input type="image" id="test" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 733',
    expectedName: 'crazy',
    htmlInput: `
            <label for="test">
            crazy
            <select name="member" size="1" role="menu" tabindex="0">
              <option role="menuitem" value="beard" selected="true">clown</option>
              <option role="menuitem" value="scuba">rich</option>
            </select>
          </label>
          <input type="password" id="test"/>
        `,
  },
  {
    title: 'Name test case 734',
    expectedName: 'crazy',
    htmlInput: `
            <label for="test">
            crazy
            <select name="member" size="1" role="menu" tabindex="0">
              <option role="menuitem" value="beard" selected="true">clown</option>
              <option role="menuitem" value="scuba">rich</option>
            </select>
          </label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 735',
    expectedName: 'crazy',
    htmlInput: `
            <label for="test">
            crazy
            <select name="member" size="1" role="menu" tabindex="0">
              <option role="menuitem" value="beard" selected="true">clown</option>
              <option role="menuitem" value="scuba">rich</option>
            </select>
          </label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 736',
    expectedName: 'crazy',
    htmlInput: `
            <label for="test">
            crazy
            <select name="member" size="1" role="menu" tabindex="0">
              <option role="menuitem" value="beard" selected="true">clown</option>
              <option role="menuitem" value="scuba">rich</option>
            </select>
          </label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 737',
    expectedName: 'crazy',
    htmlInput: `
            <label for="test">
            crazy
            <select name="member" size="1" role="menu" tabindex="0">
              <option role="menuitem" value="beard" selected="true">clown</option>
              <option role="menuitem" value="scuba">rich</option>
            </select>
          </label>
          <input type="image" id="test" src="${IMG_URL}"/>
        `,
  },
  {
    title: 'Name test case 738',
    expectedName: 'crazy Monday',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuetext="Monday" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="password" value="baz" id="test"/>
        `,
  },
  {
    title: 'Name test case 739',
    expectedName: 'crazy Monday',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuetext="Monday" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 740',
    expectedName: 'crazy Monday',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuetext="Monday" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 741',
    expectedName: 'crazy Monday',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuetext="Monday" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 742',
    expectedName: 'crazy Monday',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuetext="Monday" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="image" src="${IMG_URL}" id="test"/>
        `,
  },
  {
    title: 'Name test case 743',
    expectedName: 'crazy 4',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="password" id="test" value="baz"/>
        `,
  },
  {
    title: 'Name test case 744',
    expectedName: 'crazy 4',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 745',
    expectedName: 'crazy 4',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 746',
    expectedName: 'crazy 4',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 747',
    expectedName: 'crazy 4',
    htmlInput: `
            <label for="test">
            crazy
            <div role="spinbutton" aria-valuemin="1" aria-valuemax="7" aria-valuenow="4">
            </div>
          </label>
          <input type="image" src="${IMG_URL}" id="test"/>
        `,
  },
  {
    title: 'Name test case 748',
    expectedName: 'crazy',
    htmlInput: `
            <input type="password" id="test" title="crazy" value="baz"/>
        `,
  },
  {
    title: 'Name test case 749',
    expectedName: 'crazy',
    htmlInput: `
            <input type="checkbox" id="test" title="crazy"/>
        `,
  },
  {
    title: 'Name test case 750',
    expectedName: 'crazy',
    htmlInput: `
            <input type="radio" id="test" title="crazy"/>
        `,
  },
  {
    title: 'Name test case 751',
    expectedName: 'crazy',
    htmlInput: `
            <input type="file" id="test" title="crazy"/>
        `,
  },
  {
    title: 'Name test case 752',
    expectedName: 'crazy',
    htmlInput: `
            <input type="image" src="${IMG_URL}" id="test" title="crazy"/>
        `,
  },
  {
    title: 'Name test case 753',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fruit',
    htmlInput: `
            <style>
            label:before { content:"fancy "; }
          </style>
          <label for="test">fruit</label>
          <input type="password" id="test"/>
        `,
  },
  {
    title: 'Name test case 754',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fruit',
    htmlInput: `
            <style>
            label:before { content:"fancy "; }
          </style>
          <label for="test">fruit</label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 755',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fruit',
    htmlInput: `
            <style>
            label:before { content:"fancy "; }
          </style>
          <label for="test">fruit</label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 756',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fruit',
    htmlInput: `
            <style>
            label:before { content:"fancy "; }
          </style>
          <label for="test">fruit</label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 757',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fruit',
    htmlInput: `
            <style>
            label:before { content:"fancy "; }
          </style>
          <label for="test">fruit</label>
          <input type="image" src="${IMG_URL}" id="test"/>
        `,
  },
  {
    title: 'Name test case 758',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fancy',
    htmlInput: `
            <style>
            label:after { content:" fruit"; }
          </style>
          <label for="test">fancy</label>
          <input type="password" id="test"/>
        `,
  },
  {
    title: 'Name test case 759',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fancy',
    htmlInput: `
            <style>
            label:after { content:" fruit"; }
          </style>
          <label for="test">fancy</label>
          <input type="checkbox" id="test"/>
        `,
  },
  {
    title: 'Name test case 760',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fancy',
    htmlInput: `
            <style>
            label:after { content:" fruit"; }
          </style>
          <label for="test">fancy</label>
          <input type="radio" id="test"/>
        `,
  },
  {
    title: 'Name test case 761',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fancy',
    htmlInput: `
            <style>
            label:after { content:" fruit"; }
          </style>
          <label for="test">fancy</label>
          <input type="file" id="test"/>
        `,
  },
  {
    title: 'Name test case 762',
    // Should be "fancy fruit" but we match browser behaviour by ignoring
    // :before and :after
    expectedName: 'fancy',
    htmlInput: `
            <style>
            label:after { content:" fruit"; }
          </style>
          <label for="test">fancy</label>
          <input type="image" src="${IMG_URL}" id="test"/>
        `,
  },
  {
    title: 'Name text-label-embedded-combobox',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="text" id="test" />
          <label for="test">Flash the screen
            <div role="combobox">
              <div role="textbox"></div>
              <ul role="listbox" style="list-style-type: none;">
                <li role="option" aria-selected="true">1</li>
            <li role="option">2</li>
            <li role="option">3</li>
              </ul>
            </div>
            times.
          </label>
        `,
  },
  {
    title: 'Name text-label-embedded-menu',
    expectedName: 'Flash the screen times.',
    htmlInput: `
            <input type="text" id="test" />
          <label for="test">Flash the screen
            <span role="menu">
              <span role="menuitem" aria-selected="true">1</span>
              <span role="menuitem" hidden>2</span>
              <span role="menuitem" hidden>3</span>
            </span>
            times.
          </label>
        `,
  },
  {
    title: 'Name text-label-embedded-select',
    expectedName: 'Flash the screen 1 times.',
    htmlInput: `
            <input type="text" id="test" />
          <label for="test">Flash the screen
            <select size="1">
              <option selected="selected">1</option>
              <option>2</option>
              <option>3</option>
            </select>
            times.
          </label>
        `,
  },
  {
    title: 'Name text-label-embedded-slider',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="text" id="test" />
          <label for="test">foo <input role="slider" type="range" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name text-label-embedded-spinbutton',
    expectedName: 'foo 5 baz',
    htmlInput: `
            <input type="text" id="test" />
          <label for="test">foo <input role="spinbutton" type="number" value="5" min="1" max="10" aria-valuenow="5" aria-valuemin="1" aria-valuemax="10"> baz
          </label>
        `,
  },
  {
    title: 'Name text-title',
    expectedName: 'foo',
    htmlInput: `
            <input type="text" id="test" title="foo" />
        `,
  },
];
