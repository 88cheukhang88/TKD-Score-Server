module.exports = function(grunt) {


	var sftpConfig = {};

	try{
		sftpConfig = require('./sftp-config.js');
	} catch(e) {
	}


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		nodewebkit: {
		    options: {
		    	"node-main": 'app.js',
		    	main: 'web/index.html',
		    	version: "0.12.2",
		        platforms: ['osx64'],
		        buildDir: './webkitbuilds', // Where the build version of my node-webkit app is saved
		    },
		    src: ['**'] // Your node-webkit app
		 },

		nodemon: {
		  	dev: {
		    	script: 'app.js',
		    	
		  	},
		  	production: {
		    	script: 'app.js',
		    	options: {
		    		env: {
		    			NODE_ENV:'production',
		    		},
		    	}
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
	          		reporter: 'spec',
	          		timeout: 2000,
	        	},
	        	src: ['test/unit/*spec.js']
	      	},

	      	integration: {
	        	options: {
	          		reporter: 'spec',
	          		timeout: 2000,
	          		slow: 200,
	        	},
	        	src: ['test/integration/*spec.js']
	      	},

	      	all: {
	        	options: {
	          		reporter: 'spec',
	          		timeout: 2000,
	          		slow: 200,
	        	},
	        	src: ['test/unit/*spec.js', 'test/integration/*spec.js']
	      	},
	    },


		watch: {
			options: {
				atBegin: true,
			},

			testall: {
				files: ['*.js', 'config/**/*js', 'lib/**/*js', 'api/**/*js', 'test/unit/*js', 'test/integration/*js'],
				//tasks: ['jshint:all', 'mochaTest:unit', 'startMongo', 'wait:giveMongoSomeTimeToLoad', 'force:on','mochaTest:integration', 'force:restore', 'stopMongo'],
				tasks: ['jshint:all', 'mochaTest:all'],
				options: {
					// spawn: false,
				},
			},


			testu: {
				files: ['*.js', 'config/**/*js', 'lib/**/*js', 'api/**/*js', 'test/unit/*js',],
				tasks: ['jshint:testu', 'mochaTest:unit'],
				options: {
					//spawn: false,
				}
			},


			testi: {
				files: ['*.js', 'config/**/*js', 'lib/**/*js', 'api/**/*js', 'test/unit/*js', 'test/integration/*js'],
				tasks: ['jshint:testi', 'mochaTest:integration'],
				options: {
					// spawn: false,
				},
			},

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
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-node-webkit-builder');
	grunt.loadNpmTasks('grunt-node-inspector');
	grunt.loadNpmTasks('grunt-sftp-deploy');


	grunt.registerTask('serve', 'Starts the server with nodemon', ['nodemon:dev']);
	grunt.registerTask('launch', 'Starts the server with nodemon in production mode', ['nodemon:production']);
	grunt.registerTask('build', 'Builds executables', ['nodewebkit']);
	grunt.registerTask('debug', 'Starts the server using node inspector', ['node-inspector:dev']);
	grunt.registerTask('deploy:staging', 'Deploys to staging server', ['sftp-deploy:staging']);
	grunt.registerTask('prod',[]);

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

	grunt.registerTask('utest', 'Runs Mocha tests add --watch for continuous', function () {
		
	    if(grunt.option('watch')) {

      		grunt.task.run([
    			'watch:testu'
    		]);
	    } else {

		    grunt.task.run([
		        'jshint:testu',
		        'mochaTest:unit'
		    ]);
	    }
	});

	grunt.registerTask('default', []);
};