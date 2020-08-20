# accname
A TypeScript implementation of the [Accessible Name
Computation](https://www.w3.org/TR/accname-1.1/).

## Overview
`accname` provides the function `getAccessibleName()` which allows you to calculate the [accessible name](https://www.w3.org/TR/accname-1.1/#dfn-accessible-name) for a `HTMLElement`.
## Usage
`accname` depends on the [HTML DOM API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API), which is implemented by web browsers such as Chrome and Firefox. For this reason it is recommended that `accname` be run in a browser.

`accname` can be imported using NPM, or directly imported into a web-page:
### NPM
To install `accname` with NPM, run:
```bash
$ npm install accname
```
Once installed, import and use `accname` as follows:
```typescript
import {getAccessibleName} from 'accname';

const elem = document.getElementById('target');

// Returns the accessible name for 'elem'
const name = getAccessibleName(elem);
```
### Web-page
`accname` can be added directly into a web-page via a `<script>` tag. The exports of the function may then be accessed through the `accname` object as follows:
```html
<head>
  <script src="https://gitcdn.link/repo/googleinterns/accessible-name/master/bundle.js"></script>
</head>
<body>
  <button id="foo">Hello world</button>
  <script>
    const elem = document.getElementById('foo');
    const name = accname.getAccessibleName(elem);
  </script>
</body>
```

Disclaimer: This is not an officially supported Google product.
