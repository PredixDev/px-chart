'use strict';

var importOnce = require('node-sass-import-once');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: {
      css: ['css'],
      bower: ['bower_components'],
      reports: ['reports'],
      test: ['bower_components/test']
    },

    sass: {
      options: {
        sourceMap: false, //no source maps b/c web-components inline css anyway...
        importer: importOnce,
        importOnce: {
          index: true,
          bower: true
        }
      },
      dist: {
        files: {
          'css/noprefix/px-time-series-sketch.css': 'sass/px-time-series-sketch.scss',
          'css/noprefix/px-time-series.css': 'sass/px-time-series-predix.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 version']
      },
      multiple_files: {
        expand: true,
        flatten: true,
        src: 'css/noprefix/*.css',
        dest: 'css'
      }
    },

    shell: {
      options: {
        stdout: true,
        stderr: true
      },
      bower: {
        command: 'bower install'
      }
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'js/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    copy: {
      icons: {
        expand: true,
        flatten: true,
        src: '*/font-awesome/fonts/*',
        dest: 'icons'
      },
      type: {
        expand: true,
        flatten: true,
        src: '*/px-typography-design/type/*',
        dest: 'type'
      },
      test: {
        files: [
          {
            cwd: '',
            expand: true,
            src: [
              '*.html',
              '*.js'
            ],
            dest: 'bower_components/test'
          }
        ]
      }
    },

    watch: {
      sass: {
        files: ['sass/**/*.scss'],
        tasks: ['sass', 'autoprefixer'],
        options: {
          interrupt: true
        }
      }
    },

    depserve: {
      options: {
        open: '<%= depserveOpenUrl %>'
      }
    },

    // Karma Unit configuration
    karma: {
      runner: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', 'Basic build', [
    'sass',
    'autoprefixer',
    'copy'
  ]);

  // First run task.
  grunt.registerTask('firstrun', 'Basic first run', function() {
    grunt.config.set('depserveOpenUrl', '/index.html');
    grunt.task.run('default');
    grunt.task.run('depserve');
  });

  grunt.registerTask('test', 'Test', [
    'jshint',
    'clean:test',
    'copy:test',
    'karma'
  ]);

  grunt.registerTask('release', 'Release', [
    'clean',
    'shell:bower',
    'default',
    'test'
  ]);

};
