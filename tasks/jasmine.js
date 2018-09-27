/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // local lib
  var jasmine = require('./lib/jasmine').init(grunt);

  grunt.registerMultiTask('jasmine', 'Run jasmine specs headlessly through PhantomJS.', function() {

    // Merge task-specific options with these defaults.
    var options = this.options({
      timeout : 10000,
      styles : [],
      specs : [],
      helpers : [],
      vendor : [],
      outfile : '_SpecRunner.html',
      template : __dirname + '/jasmine/templates/DefaultRunner.tmpl',
      templateOptions : {},
      ignoreEmpty: grunt.option('force') === true,
  });

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    jasmine.buildSpecrunner(this.filesSrc, options);
  });
};
