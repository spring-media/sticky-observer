// @ts-check
module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['karma-typescript', 'mocha'],

    // framework settings
    client: {
      captureConsole: true,
      chai: {
        includeStack: true
      }
    },

    // list of files / patterns to load in the browser
    files: ['setupTests.ts', 'src/**/*.ts'],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': 'karma-typescript'
    },

    // options for the karma-typescript plugin
    // available: https://github.com/monounity/karma-typescript/
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.test.json',
      coverageOptions: {
        threshold: {
          global: {
            statements: 95,
            branches: 90,
            functions: 100
          }
        },
      },
      reports: {
        html: './coverage/html',
        json: './coverage',
        'text-summary': ''
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'karma-typescript'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
