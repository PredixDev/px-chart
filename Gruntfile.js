'use strict';
module.exports = function(grunt) {

	//Local server ports
	var LIVERELOAD_PORT = 35724;
	var SERVER_PORT = 9001;
	var RUNNER_PORT = 9002;

	//Project config
	var CONFIG = {
		app: 'src',
		test: 'test',
		src: 'src',
		dist: 'dist',
		bower: 'bower_components',
		tmp: '.tmp'
	};


	// Time grunt tasks
	require('time-grunt')(grunt);

	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);

	// Livereload setup
	var lrSnippet = require('connect-livereload')({
		port: LIVERELOAD_PORT
	});
	var mountFolder = function (connect, dir) {
		return connect.static(require('path').resolve(dir));
	};

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: CONFIG,
		meta: {
			banner: '/*Banner*/'
		},

		//Clean
		clean: {
			dist: {
				files: [{
					dot: true,
					src: ['.tmp', '<%= config.dist %>/*', '!<%= config.dist %>/.git*']
				}]
			},
			test: 'test/temp',
			temp: '.tmp'
		},

		//Watch
		watch: {
			options: {
				nospawn: true,
				livereload: LIVERELOAD_PORT
			},
			less: {
				files: ['src/{,*/}*.less'],
				tasks: ['less:dist']
			},
			app: {
				files: [
					'index.html',
					'src/{,*/}*.html',
					'src/*.js',
					'dist/*.js'
				],
				tasks: ['jshint:app']
			},
			test: {
				files: '<%= jshint.test.src %>',
				tasks: ['jshint:test', 'karma:unit']
			}
		},

		//Connect
		connect: {
			options: {
				livereload: LIVERELOAD_PORT,
				port: SERVER_PORT,
				hostname: 'localhost',
				open: true
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [lrSnippet, mountFolder(connect, '.'), mountFolder(connect, '.tmp')];
					}
				}
			},
			docs: {
				options: {
					keepalive: true,
					middleware: function (connect) {
						return [mountFolder(connect, '.'), mountFolder(connect, '.tmp'), mountFolder(connect, 'docs')];
					}
				}
			}
		},

		//JSHint
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			app: {				
				src: ['<%= config.src %>/{,*/}*.js']
			},
			test: {
				src: ['test/spec/**/*.js']
			}
		},

		//Karma
		karma: {
			options: {
				configFile: 'karma.conf.js',
				browsers: ['PhantomJS']
			},
			unit: {
				singleRun: true
			},
			server: {
				autoWatch: true
			}
		}
	});

	// Grunt Tasks
	grunt.registerTask('serve', [ 'build', 'connect:livereload', 'watch' ]);
	grunt.registerTask('build', [ 'jshint']);
	grunt.registerTask('test', [ 'clean:test', 'jshint', 'karma:unit' ]);
	grunt.registerTask('default', [ 'test' ]);
};
