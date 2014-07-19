module.exports = function(grunt) {


	var sftpConfig = {};

	try{
		sftpConfig = require('./sftp-config.js');
	} catch(e) {
	};


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		nodemon: {
		  	dev: {
		    	script: 'app.js',
		    	
		  	}
		},

		'node-inspector': {
			dev: {
				options: {
					'debug-port': 3000,
					'save-live-edit': true,
				}
			}
		},

		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				node: true,
				globals: {
					
				},
		    },
		    all: ['*.js', 'lib/**/*.js', 'api/**/*js', 'test/**/*.js'],
		    testu: ['*.js', 'lib/**/*js', 'api/**/*js', 'test/unit/*js'],
		    testi: ['test/integration/*js'],
		},


		mochaTest: {
	      	
	      	unit: {
	        	options: {
	          		reporter: 'spec'
	        	},
	        	src: ['test/unit/*spec.js']
	      	},

	      	integration: {
	        	options: {
	          		reporter: 'spec',
	          		slow: 200,
	        	},
	        	src: ['test/integration/*spec.js']
	      	},

	      	all: {
	        	options: {
	          		reporter: 'spec'
	        	},
	        	src: ['test/unit/*spec.js', 'test/integration/*spec.js']
	      	},
	    },


		watch: {
			options: {
				atBegin: true,
			},

			testall: {
				files: ['*.js', 'lib/**/*js', 'api/**/*js', 'test/unit/*js', 'test/integration/*js'],
				//tasks: ['jshint:all', 'mochaTest:unit', 'startMongo', 'wait:giveMongoSomeTimeToLoad', 'force:on','mochaTest:integration', 'force:restore', 'stopMongo'],
				tasks: ['jshint:all', 'mochaTest:all'],
				options: {
					// spawn: false,
				},
			},


			testu: {
				files: ['*.js', 'lib/**/*js', 'api/**/*js', 'test/unit/*js'],
				tasks: ['jshint:testu', 'mochaTest:unit'],
				options: {
					//spawn: false,
				}
			},


			testi: {
				files: ['*.js', 'lib/**/*js', 'api/**/*js', 'test/integration/*js'],
				tasks: ['jshint:testi', 'mochaTest:integration'],
				options: {
					// spawn: false,
				},
			},

		},

		wait: {
			giveMongoSomeTimeToLoad: {      
	            options: {
	            	delay: 1000,
	                before : function(options) {
	                    //console.log('pausing %dms', options.delay);
	                },
	                after : function() {
	                    //console.log('pause end');
	                }
	            }
	        },
		},

		concurrent: {
			serve: ['watch:testu','nodemon:dev'],
			options: {
                logConcurrentOutput: true
            }
		},

		'sftp-deploy': {
	      staging: {
	          auth: {
	            host: '54.206.61.99',
	            port: 22,
	            authKey: 'mcAWS'
	          },
	          src: './',
	          dest: 'projects/TKD-Score-Server',
	          exclusions: ['./**/.DS_Store', './Thumbs.db', './tmp', './.tmp', './test', './.git', './node_modules', './.ftppass'],
	          server_sep: '/'
	      }
	    }

	});
	

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-services');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-node-inspector');
	grunt.loadNpmTasks('grunt-sftp-deploy');


	grunt.registerTask('serve', 'Starts the server with nodemon', ['nodemon:dev']);
	grunt.registerTask('debug', 'Starts the server using node inspector', ['node-inspector:dev']);
	grunt.registerTask('deploy:staging', 'Deploys to staging server', ['sftp-deploy:staging']);


	grunt.registerTask('test', 'Runs Mocha tests add --watch for continuous', function () {

	    if(grunt.option('watch')) {
      		grunt.task.run([
    			'watch:testall'
    		]);
	    } else {
		    grunt.task.run([
		        'jshint:all',
		        'mochaTest:all'
		    ]);
	    }
	});

};