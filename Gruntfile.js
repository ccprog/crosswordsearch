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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['uglify', 'cssmin']);
};
