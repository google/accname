/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Karma configuration
// Generated on Thu Jun 25 2020 17:12:25 GMT+0200 (Central European Summer Time)

module.exports = function(config) {
  config.set({
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: ['src/**/*.ts', 'src/lib/*.ts'],

    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false,
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors:
    // https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors:
        {'**/*.ts': ['karma-typescript'], '**/*[!_test].ts': ['coverage']},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'progress', 'karma-typescript', 'coverage'],

    plugins: [
      'karma-jasmine', 'karma-typescript', 'karma-coverage',
      'karma-spec-reporter', 'karma-chrome-launcher', 'karma-firefox-launcher'
    ],
    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file
    // changes
    autoWatch: true,

    // start these browsers
    // available browser launchers:
    // https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],  // TODO: Add more browsers (Edge, IE)

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Config for karma-typescript
    karmaTypescriptConfig: {
      tsconfig: './test_tsconfig.json',
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      },
    },

    coverageReporter: {
      includeAllSources: true,
      dir: 'coverage/',
      reporters: [{type: 'html', subdir: 'html'}, {type: 'text-summary'}]
    }
  });
};
