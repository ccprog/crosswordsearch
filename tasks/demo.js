module.exports = function(grunt) {
  var relative = require('path').relative;

  var jslist = [
    'src/js/customSelectElement.js',
    'demo/js/app-demo.js',
    'demo/js/ajax.js',
    'src/js/common.js',
    'src/js/basics.js',
    'src/js/crosswordFactory.js',
    'src/js/markerFactory.js',
    'src/js/timerElement.js',
    'src/js/CrosswordController.js',
    'src/js/SizeController.js',
    'src/js/TableController.js',
    'src/js/EntryController.js',
    'src/js/ImmediateController.js'
];

    grunt.registerTask('demo', 'compile static demo files', function() {
        var config = grunt.file.readJSON('demo/config.json');
        var paths = {};
        for (var item of Object.entries(config.compile_paths)) {
            paths[item[0]] = 'demo/build/' + item[1];
        }
        var sassfiles = {};
        sassfiles[paths.css + 'crosswordsearch.css'] = 'src/css/crosswordsearch.sass';
        sassfiles[paths.css + 'rtl.css'] = 'src/css/rtl.sass';
        var cssPath = relative(config.exec_paths.css, config.exec_paths.images);

        grunt.config.merge({
          sass: {
            demo: {
              options: {
                importer: function (url, prev, done) {
                  if ('./paths' === url) {
                    return {contents: '$image-dir: "' + cssPath + '"'};
                  } else {
                    return {file: url};
                  }
                }
              },
              files: sassfiles
            }
          },
          uglify: {
            demo: {
              options: {
                mangle: false,
                compress: false,
                beautify: true
                //compress: { drop_console: true }
              },
              files: [
                { src: jslist, dest: paths.js + 'crosswordsearch.min.js' }
              ]
            }
          }
        });

        var done = this.async();

        grunt.util.spawn({
            cmd: './compile',
            opts: { cwd: 'demo/'}
        }, function(error, result, code){
            grunt.log.write('Writing templates...');
            if (error) {
                grunt.fail.warn('\n' + error + '\n', 3);
            } else {
                grunt.log.ok('OK');
            }
            done();
          });

        grunt.file.expandMapping('plugin/images/*',  paths.images, {flatten: true})
        .forEach(function(pair) {
            grunt.file.copy(pair.src,  pair.dest);
        });

        grunt.task.run(['sass:demo', 'uglify:demo']);
    });
};