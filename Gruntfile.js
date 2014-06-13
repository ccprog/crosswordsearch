module.exports = function(grunt) {

  // use `msginit -i crw-text.pot -l <ll_CC> -o crw-text-<ll_CC>.po` to start new translations
  
  grunt.registerMultiTask('msgmerge', function() {

    var options = this.options({
        text_domain: 'messages',
        template: './',
    });

	if( grunt.file.isDir(options.template) ) {
	    options.template = options.template.replace(/\/$/, '') + '/' + options.text_domain + '.pot';
    }

	if( !grunt.file.exists(options.template) ) {
        grunt.fail.warn('Template file not found: ' + options.template, 3);
    }

    grunt.verbose.writeln('Template: ' + options.template);
    
	var done = this.async();
    var counter = this.files.length;

    this.files.forEach(function(file) {

	  grunt.util.spawn( {
	    cmd: 'msgmerge',
	    args: ['-U', file.src, options.template]
	  }, function(error, result, code){

		grunt.verbose.write('Updating: ' + file.src + ' ...');

		if (error) {
			grunt.verbose.error();
		} else {
		    grunt.verbose.ok();
		}

		counter--;

		if (error || counter === 0) {
			done(error);
		}

	  });
		
	});

  });

  var srcdir = 'src/js/',
    destdir = 'plugin/js/',
    l10ndir = 'plugin/languages/';

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
    pot: {
        options: {
            text_domain: text_domain,
            copyright_holder: 'Claus Colloseus <ccprog@gmx.de>',
            dest: l10ndir,
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
            src:  [ 'plugin/*.php' ],
            expand: true,
        }
    },
    msgmerge: {
      options: {
        text_domain: text_domain,
        template: l10ndir,
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-pot');
  grunt.loadNpmTasks('grunt-po2mo');

  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
  grunt.registerTask('msgupdate', ['pot', 'msgmerge']);
};
