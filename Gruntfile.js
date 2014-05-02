module.exports = function(grunt) {

  var jslist = [
    'src/js/customSelectElement.js',
    'src/js/basics.js',
    'src/js/crossword.js',
    'src/js/markers.js',
    'src/js/SizeController.js',
    'src/js/TableController.js',
    'src/js/WordController.js'
  ];
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    licence: grunt.file.read('./LICENCE'),
    uglify: {
      options: {
        banner: '/*\n<%= pkg.name %>.js v<%= pkg.version %>\n\n<%= licence %>*/\n'
      },
      readable: {
          options: {
            mangle: false,
            compress: false,
            beautify: true
          },
        src: jslist,
        dest: 'plugin/js/<%= pkg.name %>.js'
      },
      mini: {
        options: {
          compress: {
            drop_console: true
          }
        },
        src: jslist,
        dest: 'plugin/js/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      combine: {
        files: {
          'plugin/css/<%= pkg.name %>.css': ['src/css/crosswordsearch.css', 'src/css/cse.css']
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
    pot: {
        options: {
            text_domain: 'crw-text',
            dest: 'plugin/languages/',
            encoding: 'UTF-8',
            overwrite: true,
            keywords: [
                '__:1',
                '_e:1',
                '_x:1,2c',
                'esc_html__:1',
                'esc_html_e:1',
                'esc_html_x:1,2c',
                'esc_attr__:1', 
                'esc_attr_e:1', 
                'esc_attr_x:1,2c', 
                '_ex:1,2c',
                '_n:1,2', 
                '_nx:1,2,4c',
                '_n_noop:1,2',
                '_nx_noop:1,2,3c'
            ],
        },
        files:{
            src:  [ 'plugin/**/*.php' ],
            expand: true,
        }
    },
    po2mo: {
      files: {
        src: 'plugin/languages/*.po',
        expand: true,
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-pot');
  grunt.loadNpmTasks('grunt-po2mo');

  grunt.registerTask('default', ['uglify', 'cssmin']);
};
