import {customMatchers} from '../testing/custom_matchers';
import {WPT_TEST_CASES} from '../testing/wpt_testdata';

const isFirefox = navigator.userAgent.includes('Firefox');

describe('accname Web Platform Tests', () => {
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

  for (const testcase of WPT_TEST_CASES) {
    if (isFirefox && testcase.skipFirefox) {
      continue;
    }

    it(testcase.title, async () => {
      container.innerHTML = testcase.htmlInput;

      // Ensure images are loaded
      if (testcase.htmlInput.includes('<img')) {
        await new Promise((resolve) => void setTimeout(resolve, 0));
      }

      const elem = container.querySelector('#test')!;
      expect(elem).toHaveTextAlernative(testcase.expectedName);
    });
  }
});
