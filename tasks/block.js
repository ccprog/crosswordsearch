module.exports = function(grunt) {
    var srcdir = 'src/js/',
    destdir = 'plugin/js/';

    grunt.registerTask('block', 'compile block editor', function() {
        grunt.loadNpmTasks('grunt-babel');
        grunt.task.registerTask('cleanup', '', function () {
            grunt.file.delete(destdir + 'block-editor.temp.js');
        })
    
            grunt.config.merge({
            babel: {
                options: {
                  presets: ['@babel/preset-env'],
                  plugins: [
                    ["@babel/plugin-transform-react-jsx", {
                      "pragma": "el"
                    }]
                  ]
                },
                dist: {
                    files: [
                        { src: srcdir + 'block-editor.js', dest: destdir + 'block-editor.temp.js' }
                    ]
                }
            },
            uglify: {
                block_dev: {
                    options: {
                      banner: '',
                      enclose: {
                        'window.wp': 'wp',
                        'window.lodash': '_'
                      },
                      mangle: false,
                      compress: false,
                      beautify: true
                    },
                    files: [
                      { src: destdir + 'block-editor.temp.js', dest: destdir + 'block-editor.js' }
                    ]
                  },
                  block_min: {
                    options: {
                      banner: '',
                      enclose: {
                        'window.wp': 'wp',
                        'window.lodash': '__'
                      },
                      compress: {
                        drop_console: true
                      }
                    },
                    files: [
                      { src: destdir + 'block-editor.temp.js', dest: destdir + 'block-editor.min.js' }
                    ]
                }
            },
        });

        grunt.task.run(['babel', 'uglify:block_dev', 'uglify:block_min', 'cleanup']);
    });
};
