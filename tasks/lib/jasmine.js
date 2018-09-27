
'use strict';

exports.init = function(grunt) {
  // node api
  var fs = require('fs'),
      path = require('path');

  // npm
  var rimraf = require('rimraf'),
      _ = require('lodash');

  var baseDir = '.',
      tempDir = '.grunt/jasmine';

  var exports = {};

  exports.copyTempFile = function(src, dest) {
    var file = path.join(tempDir,dest);
    grunt.file.copy(src, file);
  };

  exports.cleanTemp = function(cb) {
    rimraf(tempDir, function(){
      // if this fails, then ./.grunt isn't empty and that's ok.
      fs.rmdir('.grunt', cb);
    });
  };

  exports.buildSpecrunner = function (src, options){
    var source = '',
      outfile = options.outfile,
      specrunner = path.join(baseDir,outfile),
      outdir = path.dirname(outfile),
      gruntfilter = grunt.option("filter"),
      filteredSpecs = exports.getRelativeFileList(outdir, options.specs);

    // Let's filter through the spec files here,
    // there's no need to go on if no specs matches
    if (gruntfilter) {
      filteredSpecs = specFilter(gruntfilter, filteredSpecs);

      if(filteredSpecs.length === 0) {
        grunt.log.warn("the --filter flag did not match any spec within " + grunt.task.current.target);
        return null;
      }
    }

    ['jasmine.css', 'jasmine.js', 'jasmine-html.js', 'boot.js'].forEach(function(name){
        var path = __dirname + '/../../node_modules/jasmine-core/lib/jasmine-core/' + name;
        if (fs.existsSync(path)) exports.copyTempFile(path, name);
    });
    var favicon = __dirname + '/../../node_modules/jasmine-core/images/jasmine_favicon.png'
    if (fs.existsSync(favicon)) exports.copyTempFile(favicon,  'jasmine_favicon.png');

    var jasmineCss = [
      tempDir + '/jasmine.css'
    ];

    jasmineCss = jasmineCss.concat(options.styles);

    var jasmineCore = [
      tempDir + '/jasmine.js',
      tempDir + '/jasmine-html.js'
    ];

    var context = {
      temp : tempDir,
      outfile: outfile,
      css : exports.getRelativeFileList(outdir, jasmineCss, { nonull : true }),
      scripts : {
        jasmine : exports.getRelativeFileList(outdir, jasmineCore),
        helpers : exports.getRelativeFileList(outdir, options.helpers, { nonull : true }),
        specs : filteredSpecs,
        src : exports.getRelativeFileList(outdir, src, { nonull : true }),
        vendor : exports.getRelativeFileList(outdir, options.vendor, { nonull : true }),
        boot : exports.getRelativeFileList(outdir, tempDir + '/boot.js')
      },
      options : options.templateOptions || {}
    };

    if (options.template.process) {
      source = options.template.process(grunt, context);
      grunt.file.write(specrunner, source);
    } else {
      grunt.file.copy(options.template, specrunner, {
        process : function(src) {
          source = _.template(src, context);
          return source;
        }
      });
    }

    return source;
  };

  exports.getRelativeFileList = function(outdir, patterns, options) {
    patterns = patterns instanceof Array ? patterns : [ patterns ];
    options = options || {};

    var files = grunt.file.expand(options, grunt.util._(patterns).compact());
    files = grunt.util._(files).map(function(file){
      return (/^https?:/).test(file) ? file : path.relative(outdir, file).replace(/\\/g, '/');
    });
    return files;
  };

  // Allows for a spec file to be specified via the command line
  function specFilter(pattern, files) {
    var specPattern,
      patternArray,
      filteredArray = [],
      scriptSpecs = [],
      matchPath = function(path) {
        return !!path.match(specPattern);
      };

    if(pattern) {
      // For '*' to work as a wildcard.
      pattern = pattern.split("*").join("[\\S]*").replace(/\./g, "\\.");
      // This allows for comma separated strings to which we can match the spec files.
      patternArray = pattern.split(",");

      while(patternArray.length > 0) {
        pattern = (patternArray.splice(0, 1)[0]);

        if(pattern.length > 0) {
          if(pattern.indexOf('/') === -1) {
            specPattern = new RegExp("("+pattern+"[^/]*)(?!/)$", "ig");
          } else if(pattern.indexOf('/') === 0) {
            specPattern = new RegExp("("+pattern+"[^/]*)(?=/)", "ig");
          } else {
            throw new TypeError("--filter flag seems to be in the wrong format.");
          }

          // push is usually faster than concat.
          [].push.apply(scriptSpecs, files.filter(matchPath));
        }
      }

      filteredArray = _.uniq(scriptSpecs);
    }

    return filteredArray;
  }

  return exports;
};

