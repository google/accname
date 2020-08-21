# accname
A TypeScript library for calculating the [accessible name](https://www.w3.org/TR/accname-1.1/#dfn-accessible-name) of `HTMLElement`s.

## Usage
To install `accname` with NPM, run:
```bash
$ npm install accname
```
Once installed, import and use `accname` as follows:
```typescript
import {getAccessibleName} from 'accname';

const elem = document.getElementById('target');
const name = getAccessibleName(elem);
```

## Disclaimer
This is not an officially supported Google product.
