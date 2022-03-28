# Developing AccName
Thanks for considering making a contribution to AccName! 🎉

### Setup

-   Fork this repository.
-   Clone your fork to download a local copy.

```sh
git clone <your-fork-url>
```

-   In the root folder of the project `accessible-name/`:

```sh
npm install
```

### Testing

Tests are run using [Jasmine](https://jasmine.github.io/) and
[Karma](https://karma-runner.github.io/latest/index.html)

-   To run tests:

```sh
npm run test
```

-   Any new features added to AccName should be appropriately tested with unit
    tests in a corresponding `_test.ts` file in the same directory as the edited
    file. For example, tests for `lib/ruleA.ts` should be in
    `lib/ruleA_test.ts`.

### Code Formatting

-   [Google TypeScript Style](https://www.npmjs.com/package/gts) (GTS) is used
    to format the TypeScript code for AccName. The code is automatically
    formatted using a commit-hook. This means that the code is often
    automatically changed by GTS when it is committed, in which case you can
    simply `$ git add .` and `$ git commit --amend` to update your commit with
    the newly-formatted code.
-   AccName uses [JSDoc](https://jsdoc.app/) style comments.

### Output Accuracy

It is important to keep in mind the accuracy of AccName's output with respect to
other implementations of the algorithm. Accuracy is currently being measured
using the
[AccName Comparison App](https://github.com/google/accessible-name/tree/master/validation).
Specifically, we use the following metrics:

-   % of [Web Platform Tests](http://wpt.live/accname/) passed.
-   % Nodes in real world web-pages for which AccName is likely incorrect. This
    is defined as the % of Nodes for which AccName produces an accessible name
    of X with all comparison implementations producing an accessible name of Y.
    In the context of the Comparison App, this can be described with an
    agreement grouping of the following form: `{{chrome, aom, axe,
    bg},{accname}}`.

### Spec-oriented Design

#### Mirror the Spec

This implementation is based on
[the accname spec](https://www.w3.org/TR/accname-1.1/), which is a living
document subject to regular change. For this reason, we follow the philosophy of
mirroring the spec as closely as possible, to a reasonable degree. Our code
should have the same logical structure as the spec as well as using similar
language to that used in the spec.

#### Spec Assumptions

The spec can be vague or ambiguous at times. To combat this we keep a list of
spec assumptions in `SPEC_ASSUMPTIONS.md`. Any time that an assumption about
Accessible Name Computation needs to made in order to implement some feature,
that assumption should be labelled in the code as well as documented in
`SPEC_ASSUMPTIONS.md`. These assumptions often highlight areas of the spec that
could be improved. Consider making a PR to the accname spec to save future
implementors from having to make assumptions in their code, this will improve
implementation parity and standardisation in the long run :)
