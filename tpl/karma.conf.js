// Karma configuration
// Generated on Fri May 01 2015 13:45:17 GMT+0200 (W. Europe Daylight Time)

module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        // The order is very important. `@require.js` must be loaded before jasmin specs.
        files: [
            'spec/mod/@require.js',
            'spec/mod/*.js',
            'spec/inc/*.js',
            'spec/*.spec.js'
        ],

        // For Trail-Passion services.
        proxies: {
            '/tfw': 'http://localhost/TP/tfw'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome', 'Firefox'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Send `console.log` to the console.
        "client.captureConsole": true
    });
};
