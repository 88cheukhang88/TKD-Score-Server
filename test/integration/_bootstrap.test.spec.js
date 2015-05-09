// INTENTIONALLY GLOBAL


expect = require('expect.js');

serverApp = {};


console.log('_____Integration Tests______');
console.log(' ');

var Sails = require('sails');


before(function beforeRunningAnyTests(done) {
	this.timeout(20000);
	console.log('Lifting Sails...');
	Sails.load({
		//environment: 'testing',
		models: {
		    connection: 'testMysqlServer',
		    migrate: 'drop',
		},

	  	port: 1338,
		log: {
			level: "debug",
		},

	}, function whenAppIsReady(err, sailsapp) {
		if(err) { return done(err);}
		serverApp = sails.hooks.http.app;
		sails = sailsapp;
		done(err, sailsapp);
	});
});


after(function afterTestsFinish(done) {
	console.log('');
	console.log('Lowering Sails...');
	sails.lower(done);
});




testhelp = {
	login: function(user, pass, cb) {
		request(serverApp)
			.post(sails.config.blueprints.prefix + "/login")
			.send({username : user, password : pass})
			.end(function(err, res){
			    if(err){
			        throw err;
			    }
			    cookie = res.headers['set-cookie'];
			 	cb(cookie);
			});
	},
};
