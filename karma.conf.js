/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],

    files: ['src/**/*.ts'],

    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false,
    },

    preprocessors:
        {'**/*.ts': ['karma-typescript'], '**/*[!_test].ts': ['coverage']},

    reporters: ['spec', 'progress', 'karma-typescript', 'coverage'],

    plugins: [
      'karma-jasmine',
      'karma-typescript',
      'karma-coverage',
      'karma-spec-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox'],
    singleRun: false,
    concurrency: Infinity,

    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
      bundlerOptions: {
        transforms: [
          require('karma-typescript-es6-transform')({
            plugins: ["@babel/transform-runtime"]
          }),
        ],
      },
    },

    coverageReporter: {
      includeAllSources: true,
      dir: 'coverage/',
      reporters: [{type: 'html', subdir: 'html'}, {type: 'text-summary'}]
    }
  });
};
