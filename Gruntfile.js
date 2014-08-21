module.exports = function(grunt) {

  var srcdir = 'src/js/',
    destdir = 'plugin/js/',
    l10ndir = 'plugin/languages/',
    testdir = 'tests/';

  var text_domain = 'crw-text';

  var jslist = [
    srcdir + 'customSelectElement.js',
    srcdir + 'basics.js',
    srcdir + 'ajaxFactory.js',
    srcdir + 'crosswordFactory.js',
    srcdir + 'markerFactory.js',
    srcdir + 'AdminController.js',
    srcdir + 'CrosswordController.js',
    srcdir + 'SizeController.js',
    srcdir + 'TableController.js',
    srcdir + 'EntryController.js',
    srcdir + 'ImmediateController.js'
  ];

  var processJasmineTemplate = function (grunt, task, context) {
    var letterData = grunt.file.readJSON('src/json/letter.json', {encoding:'utf8'}),
        localeData = grunt.file.readJSON('src/json/locale.json', {encoding:'utf8'});
    context.crwBasics = JSON.stringify({
        locale: localeData.locale,
        letterDist: letterData.en.letterDist,
        letterRegEx: letterData.en.letterRegEx,
        pluginPath: 'mock/',
        ajaxUrl: 'mock/admin-ajax.php'
    });
    context.crossword = grunt.file.read(testdir + 'test1.json', {encoding:'utf8'}).trim();
    context.schema = grunt.file.read('plugin/schema/schema.json', {encoding:'utf8'}).trim();

    var source = grunt.file.read(testdir + 'CrosswordRunner.tmpl');
    return grunt.util._.template(source, context);
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    licence: grunt.file.read('./LICENCE'),
    uglify: {
      options: {
        banner: '/*\n<%= licence %>*/\n'
      },
      readable: {
          options: {
            mangle: false,
            compress: false,
            beautify: true
          },
        src: jslist,
        dest: destdir + '<%= pkg.name %>.js'
      },
      mini: {
        options: {
          compress: {
            drop_console: true
          }
        },
        src: jslist,
        dest: destdir + '<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      combine: {
        files: {
          'plugin/css/<%= pkg.name %>.css': ['src/css/*.css']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true
      },
      all: jslist
    },
    jasmine: {
      src: jslist,
      options: {
        template: { process: processJasmineTemplate },
        vendor: [
          testdir + 'vendor/tv4/tv4.js',
          testdir + 'vendor/URI.min/index.js',
          testdir + 'vendor/jquery-1.10.2.min/index.js',
          destdir + 'angular.min.js',
          destdir + 'angular-route.min.js',
          testdir + 'vendor/angular-mocks/index.js',
          destdir + 'qantic.angularjs.stylemodel.min.js'
        ],
        specs: testdir + 'unit/*Spec.js',
        outfile: testdir + '_SpecRunner.html',
//        keepRunner: true
      }
    },
    pot: {
        options: {
            text_domain: text_domain,
            copyright_holder: 'Claus Colloseus <ccprog@gmx.de>',
            dest: l10ndir,
            encoding: 'UTF-8',
            overwrite: true,
            keywords: [
                '__:1,2t',
                '_e:1,2t',
                '_x:1,2c,3t',
                'esc_html__:1,2t',
                'esc_html_e:1,2t',
                'esc_html_x:1,2c,3t',
                'esc_attr__:1,2t', 
                'esc_attr_e:1,2t', 
                'esc_attr_x:1,2c,3t', 
                '_ex:1,2c,3t',
                '_n:1,2,3t', 
                '_nx:1,2,4c,5t',
                '_n_noop:1,2,3t',
                '_nx_noop:1,2,3c,4t'
            ],
        },
        files:{
            src:  [ 'plugin/*.php' ],
            expand: true,
        }
    },
    msgmerge: {
      options: {
        text_domain: text_domain,
        template: l10ndir,
        version: '<%= pkg.version %>',
      },
      files: {
        src: l10ndir + text_domain + '-*.po',
        expand: true,
      }
    },
    po2mo: {
      files: {
        src: l10ndir + '*.po',
        expand: true,
      },
    },
    writel10n: {}
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-pot');
  grunt.loadNpmTasks('grunt-po2mo');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.task.loadTasks('tasks/');

  grunt.registerTask('msgupdate', ['pot', 'msgmerge']);
  grunt.registerTask('default', ['jshint', 'uglify', 'writel10n', 'cssmin', 'msgupdate']);
};
