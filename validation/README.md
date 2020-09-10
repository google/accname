# AccName Comparison App
This is a Node.js app that allows users to compare implementations of the [Accessible Name Computation algorithm](https://www.w3.org/TR/accname-1.1/#step1).

The purpose of this app is to identify disparities between different implementations.

## Implementations Included
- [Chrome DevTools](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/)
- [Deque Labs' Axe](https://github.com/dequelabs/axe-core/blob/9066900f322dd90f8b1e48cd16c39b9758e47e64/lib/commons/text/accessible-text-virtual.js#L20)
- [Accessibility Object Model](https://wicg.github.io/aom/)
- [Bryan Garaventa’s Prototype](https://github.com/WhatSock/w3c-alternative-text-computation/blob/master/docs/Sample%20JavaScript%20Recursion%20Algorithm/recursion.js)
- [AccName](https://github.com/googleinterns/accessible-name)

## Running the app
Run the following commands in terminal:
```
git clone https://github.com/googleinterns/accessible-name.git
cd accessible-name/validation/
npm install
npm run serve
```
Then visit `http://localhost:3000/` to use the app.

## Main Features

### HTML Snippet Comparison
- Enter a HTML snippet containing a `target element`, marked as such by the presence of an `ac` attribute.
- Upon clicking the 'Run Comparison' button, each of the implementations will be run on this `target element`, and their outputs will be displayed in a table below.


### Web-Page Comparison
- Enter a URL into the input text-box.
- A comparison will be run on each node in the document of the web-page referenced by the URL provided.
- A summary of these comparisons will appear once all comparisons are complete.
