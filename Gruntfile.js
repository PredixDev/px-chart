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
		tmp: '.tmp',
		artifactory: {
			host: 'https://devcloud.swcoe.ge.com',
			repo: 'DSP',
			username: 'svc-dsp-reader',
			password: '4wxKT8u8E2'
		}
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
			temp: '.tmp',
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
				tasks: ['jshint:app', 'requirejs']
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

		//Copy
		copy: {
			dist: {
				files: [
					{ src: 'src/main.js', dest: 'dist/main.js' },
					{ src: 'src/schema.json', dest: 'dist/schema.json' },
					{ src: 'src/<%= pkg.name %>.tmpl.html', dest: 'dist/<%= pkg.name %>.tmpl.html' }
				]
			}
		},

		//Less
		less: {
			options: {
				// dumpLineNumbers: 'all',
				paths: ['<%= config.src %>']
			},
			dist: {
				files: {
					'<%= config.dist %>/<%= pkg.name %>.css': '<%= config.src %>/<%= pkg.name %>.less'
				}
			}
		},

		//JSHint
		jshint: {
			app: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: ['<%= config.src %>/{,*/}*.js']
			},
			test: {
				options: {
					jshintrc: 'test/.jshintrc'
				},
				src: ['test/**/*.js']
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
		},

		//ngAnnotate task
		ngAnnotate: {
			options: {
				singleQuotes: true,
				remove: false,
				add: true
			},
			dist: {
				files: [
					{
						expand: true,
						src: ['<%= config.src %>/**/*.js'],
						dest: '<%= config.tmp %>/',
						ext: '.annotated.js',
						extDot: 'last'
					}
				]
			}
		},

		//ngDocs
		ngdocs: {
			options: {
				html5Mode: false,
				title: '<%= pkg.name %> Documentation',
				scripts: ['angular.js', '<%= config.dist %>/main.js']
			},
			api: {
				src: ['src/**/*.js'],
				title: 'API Documentation'
			}
		},

		//Concat
		concat: {
			options: {
				banner: '<%= meta.banner %>',
				stripBanners: true
			},
			dist: {
				src: ['<%= config.src %>/main.js'],
				dest: '<%= config.dist %>/main.js'
			}
		},

		//Uglify
		uglify : {
			options : {
				banner : '<%= meta.banner %>'
			},
			dist : {
				src : '<%= concat.dist.dest %>',
				dest : '<%= config.dist %>/main.min.js'
			}
		},

		// Protractor runner - https://www.npmjs.org/package/grunt-protractor-runner
		protractor: {
			options: {
				keepAlive: false,
				noColor: false
			},
			e2e: {
				options: {
					configFile: 'protractor.conf.js'
				}
			}
		},

		// Protractor webdriver - https://www.npmjs.org/package/grunt-protractor-webdriver
		protractor_webdriver: {
			e2e: {
				options: {
					path: './node_modules/protractor/bin/webdriver-manager',
					command: 'webdriver-manager start'
				}
			}
		},

		// Requirejs build configuration
		requirejs: {
			options: {
				baseUrl: '<%= config.src %>/',
				separateCSS: true,
				mainConfigFile: 'requirejs.build.js',
				stubModules: [ 'json', 'text', 'css' ],
				include: [ 'main' ],
				excludes: ['text', 'json', 'css'],
				paths: {
					text: '../bower_components/requirejs-plugins/lib/text',
					json: '../bower_components/requirejs-plugins/src/json',
					css: '../bower_components/require-css/css'
				},
				done: function (done, output) {
					var duplicates = require('rjs-build-analysis').duplicates(output);
					if (duplicates.length > 0) {
						grunt.log.subhead('Duplicates found in requirejs build:');
						grunt.log.warn(duplicates);
						done(new Error('r.js built duplicate modules, please check the excludes option.'));
					}
					done();
				}
			},
			optimized: {
				options: {
					optimize: 'uglify',
					out: '<%= config.dist %>/main.min.js'
				}
			}
		},

		// Artifactory task
		artifactory: {

			//vClient library
			vclient: {
				options: {
					url: '<%=config.artifactory.host %>',
					repository: '<%=config.artifactory.repo %>',
					username: '<%= config.artifactory.username %>',
					password: '<%= config.artifactory.password %>',
					fetch: [
						{
							group_id: 'com.ge.predix.js',
							name: 'vruntime',
							ext: 'zip',
							version: '1.9.0',
							path: '<%= config.bower %>/vruntime'
						}
					]
				}
			},

			//UX library
			ux: {
				options: {
					url: '<%=config.artifactory.host %>',
					repository: '<%=config.artifactory.repo %>',
					username: '<%=config.artifactory.username %>',
					password: '<%=config.artifactory.password %>',
					fetch: [
						{
							group_id: 'com.ge.predix',
							name: 'iidx',
							ext: 'zip',
							version: '3.0.0',
							path: '<%= config.bower %>/iids'
						}
						
					]
				}
			}
		}
	});

	//TODO - Grunt Tasks
	//TODO - pull the vclient/iidx distributions from artifactory (configured above)
	grunt.registerTask('predix:update', [ 'clean', 'artifactory' ]);
	grunt.registerTask('serve', [ 'build', 'connect:livereload', 'watch' ]);
	grunt.registerTask('build', [ 'clean:dist', 'jshint', 'less:dist', 'copy:dist', 'ngAnnotate', 'requirejs', 'uglify']);
	grunt.registerTask('test', [ 'clean:test', 'jshint', 'karma:unit' ]);
	grunt.registerTask('test:e2e', [ 'clean:test', 'jshint', 'protractor_webdriver', 'protractor' ]);
	grunt.registerTask('release', [ 'test', 'bump-only', 'build', 'ngdocs', 'bump-commit' ]);
	grunt.registerTask('docs', [ 'build', 'connect:docs' ]);
	grunt.registerTask('default', [ 'build', 'test' ]);
};
