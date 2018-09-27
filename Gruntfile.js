module.exports = function(grunt) {

  var srcdir = 'src/js/',
    destdir = 'plugin/js/',
    l10ndir = 'plugin/languages/',
    testdir = 'tests/';

  var text_domain = 'crosswordsearch';

  var jslist = [
    srcdir + 'customSelectElement.js',
    srcdir + 'app.js',
    srcdir + 'ajax.js',
    srcdir + 'common.js',
    srcdir + 'basics.js',
    srcdir + 'crosswordFactory.js',
    srcdir + 'AdminController.js',
    srcdir + 'timerElement.js',
    srcdir + 'CrosswordController.js',
    srcdir + 'sizeDirectives.js',
    srcdir + 'GridController.js',
    srcdir + 'EntryController.js',
    srcdir + 'ImmediateController.js'
  ],
  wzlist = [
    srcdir + 'app-wizzard.js',
    srcdir + 'ajax.js',
    srcdir + 'common.js',
    srcdir + 'WizzardController.js',
    srcdir + 'thickbox-size-hack.js'
  ],
  vendor = [
    testdir + 'vendor/jquery-1.12.4.min/index.js',
    testdir + 'vendor/tv4/tv4.js',
    testdir + 'vendor/uri.js/src/URI.min.js',
    destdir + 'angular.js',
    destdir + 'angular-route.js',
    testdir + 'vendor/angular-mocks-1.7.4/index.js'
  ];

  var processJasmineTemplate = function (grunt, context) {
    var letterData = grunt.file.readJSON('src/json/letter.json', {encoding:'utf8'}),
        localeData = grunt.file.readJSON('src/json/locale.json', {encoding:'utf8'});
    context.crwBasics = JSON.stringify({
        locale: localeData.locale,
        letterDist: letterData.en.letterDist,
        numerals: letterData.en.numerals,
        dimensions: {},
        letterRegEx: letterData.en.letterRegEx,
        textDirection: 'ltr',
        imagesPath: 'mock/',
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
        files: [
          { src: jslist, dest: destdir + '<%= pkg.name %>.js' },
          { src: wzlist, dest: destdir + 'wizzard.js' }
        ]
      },
      mini: {
        options: {
          compress: {
            drop_console: true
          }
        },
        files: [
          { src: jslist, dest: destdir + '<%= pkg.name %>.min.js' },
          { src: wzlist, dest: destdir + 'wizzard.min.js' }
        ]
      },
    },
    sass: {
      options: {
        outputStyle: 'compressed',
        importer: function (url, prev, done) {
          if ('./paths' === url) {
            return {contents: '$image-dir: "../images/"'};
          } else {
            return {file: url};
          }
        }
      },
      main: {
        files: {
          'plugin/css/crosswordsearch.css': ['src/css/crosswordsearch.sass'],
          'plugin/css/block-editor.css': ['src/css/block-editor.sass']
        }
      },
      rtl: {
        files: {
          'plugin/css/rtl.css': ['src/css/rtl.sass']
        }
      }
    },
    jshint: {
      options: {
        force: true
      },
      main: {
        jshintrc: '.jshintrc',
        src: jslist
      },
      spec: {
        jshintrc: testdir + '.jshintrc',
        src: testdir + 'unit/*Spec.js',
      }
    },
    jasmine: {
      options: {
        template: { process: processJasmineTemplate },
        keepRunner: true
      },
      app_wp: {
        src: jslist,
        options: {
          specs: testdir + 'unit/*Spec.js',
          vendor: vendor,
          outfile: testdir + '_SpecRunner-app.html'
        }
      },
      wizzard_wp: {
        src:  wzlist.slice(0, 4),
        options: {
          specs: testdir + 'unit/*Spec2.js',
          vendor: vendor,
          outfile: testdir + '_SpecRunner-wizzard.html'
        }
      },
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
            src:  [ 'plugin/*.php', destdir + 'block-editor.js' ],
            expand: true,
        }
    },
    msgmerge: {
      options: {
        text_domain: text_domain,
        template: l10ndir,
        blockfile: destdir + 'block-editor.js',
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
    writel10n: {
      options: {
        text_domain: text_domain,
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-pot');
  grunt.loadNpmTasks('grunt-po2mo-multiFiles');
  grunt.task.loadTasks('tasks/');

  grunt.registerTask('msgupdate', ['block', 'pot', 'msgmerge']);
  grunt.registerTask('default', ['jshint:main', 'uglify', 'writel10n', 'sass', 'msgupdate']);
};
