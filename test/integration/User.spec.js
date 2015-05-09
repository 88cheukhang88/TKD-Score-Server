/*
var testData = require('./_testData.js');

var testUser = {};
var testContact = {};

function emptyData(done) {
			// Empty the database
			
	var UserCollection = sails.models.user;
	var OrganisationCollection = sails.models.organisation;
	var ContactCollection = sails.models.contact;

		User.destroy().exec(function(){
			ContactCollection.destroy().exec(function(){
				OrganisationCollection.destroy().exec(done);
			});
		});
	}

function insertData(done) {


	var UserCollection = sails.models.user;
	var OrganisationCollection = sails.models.organisation;
	var ContactCollection = sails.models.contact;

	UserCollection.create({username:'test', password:'pass'}, function(err, returnedUser) {
		if(err) {
			console.log(err);
			throw new Error(err);
		}

		testUser = returnedUser;
		testData.fakeContact.user = returnedUser.id; // add user id to our contact

		OrganisationCollection.create(testData.fakeOrganisation, function(err, returnedOrganisation) {
			if(err) {
				console.log(err);
				throw new Error(err);
			}

			var testOrganisation = returnedOrganisation;
			testData.fakeContact.organisation = returnedOrganisation.id;
			//testData.fakeContact.u = returnedOrganisation.id;
			ContactCollection.create(testData.fakeContact, function(err, returnedContact) {
				if(err) {
					console.log(err);
					throw new Error(err);
				}

				testContact = returnedContact;
				done();
			});
		});
	});
}


describe('User Login / Logout', function() {


		

	beforeEach(emptyData);
	beforeEach(insertData);
	afterEach(emptyData);

	it('POST /login should log the user in returning the users session info', function(done) {
		var checkBody = function(res) {
			var data = res;
			
			if(data.statusCode !== 200) {
				console.log(data); 
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(!data.body.session) {
				console.log(data); 
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}

			if(data.body.session.user.contacts[0].firstName !== testData.fakeContact.firstName) {
				console.log(data); 
				return 'Does not respond with contact in session as expected: ' + JSON.stringify(data.body);
			}
		};

		request(serverApp)
			.post(sails.config.blueprints.prefix + '/login/')
			.send({username : 'test', password : 'pass'})
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
	});


	it('POST /login, then make GET /login to again return the users authority (using the cookie)', function(done){
		testhelp.login(
		'test',
		'pass',
		function(cookie){
			request(serverApp)
			.get(sails.config.blueprints.prefix + "/login")
			.set('cookie', cookie)
			.expect(200)
			.end(function(err, res){
			    if(err){
			        done(err);
			    }
			    expect(res.body.session).to.be.ok();
			    done();
			});
		});
	});

	it('POST /login, then make GET /login and get not authenticated (without the cookie)', function(done){
		var checkBody = function(res) {
			var data = res;
			
			if(data.body.session.authenticated) {
				console.log(data); 
				return 'Expected to be NOT authenticatd: ' + JSON.stringify(data.body);
			}
	
		};


		testhelp.login(
		'test',
		'pass',
		function(cookie){
			request(serverApp)
			.get(sails.config.blueprints.prefix + "/login")
			.set('cookie', {})
			.expect(200)
			.expect(checkBody)
			.end(done);
		});
	});


// NOT SURE WHAT GOING ON WITH THIS ONE
	it('POST /login, GET /login to again get the user authority, GET /logout, finally GET /login for a NOT authenticated (all with the cookie)', function(done){
		var checkBody = function(res) {
			var data = res;
			
			if(data.body.session.authenticated) {
				console.log(data); 
				return 'Expected to be NOT authenticatd: ' + JSON.stringify(data.body);
			}
	
		};



		testhelp.login(
		'test',
		'pass',
		function(cookie){
			request(serverApp)
			.get(sails.config.blueprints.prefix + "/login")
			.set('cookie', cookie)
			.expect(200)
			.end(function(err, res){
			    if(err){
			        return done(err);
			    }

			    expect(res.body.session.user).to.be.ok();

			    request(serverApp)
					.get(sails.config.blueprints.prefix + "/logout")
					.set('cookie', cookie)
					.expect(204)
					.end(function(err, res){
					    if(err){
					        return done(err);
					    }

					    request(serverApp)
							.get(sails.config.blueprints.prefix + "/login")
							.set('cookie', cookie)
							.expect(200)
							.expect(checkBody)
							.end(done);
			   		});
	
			});
		});
	});
});





describe('Users Route', function() {





	beforeEach(emptyData);
	beforeEach(insertData);
	afterEach(emptyData);

	
	it('POST /user should create and return a new user', function(done) {
		var checkUsername = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.username !== 'test2') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		var checkPassword = function(res) {
			var data = res;
			if(data.body.password) {
				return 'Password should not be passed back!';
			}
		};

		request(serverApp)
			.post(sails.config.blueprints.prefix + '/user')
			.send(testData.fakeUser2)
			.set('Accept', 'application/json')
			.expect(checkUsername)
			.expect(checkPassword)
			.end(function(err, res) {
				if(err) {throw new Error(err);}
				done();
			});

	});


	it('POST /user with invalid data should return a validation error', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 400) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(!data.body.invalidAttributes.username) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(serverApp)
			.post(sails.config.blueprints.prefix + '/user')
			.send(testData.invalidUser)
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
	});



	it('GET /user/id should return the user', function(done) {
		var checkUsername = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.username !== 'test') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		var checkPassword = function(res) {
			var data = res;
			if(data.body.password) {
				return 'Password should not be passed back!';
			}
		};


		request(serverApp)
			.get(sails.config.blueprints.prefix + '/user/' + testUser.id)
			.set('Accept', 'application/json')
			.expect(checkUsername)
			.expect(checkPassword)
			.end(done);

	});



	it('GET /user/ should return a list of users', function(done) {
		var checkUsername = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body[0].username !== 'test') {
				return 'Does not respond as expected - should have s list: ' + JSON.stringify(data.body);
			}
		};

		var checkPassword = function(res) {
			var data = res;
			if(data.body[0].password) {
				return 'Password should not be passed back!';
			}
		};

		request(serverApp)
			.get(sails.config.blueprints.prefix + '/user')
			.set('Accept', 'application/json')
			.expect(checkUsername)
			.expect(checkPassword)
			.end(done);
	});



	it('GET /user/:user/contacts should return a list of contacts for the user', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}

			if(data.body[0].firstName !== testContact.firstName) {
				return 'Expected different firstName of first item in list. Got: ' + JSON.stringify(data.body);
			}
		};

		request(serverApp)
			.get(sails.config.blueprints.prefix + '/user/' + testUser.id + '/contacts')
			.set('Accept', 'application/json')
			.expect(checkBody)

			.end(done);
	});



	it('GET /user/ should return an empty list', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body[0]) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};


			request(serverApp)
				.get(sails.config.blueprints.prefix + '/user/?username=fred')
				.set('Accept', 'application/json')
				.expect(checkBody)
				.end(done);

	});


	it('DELETE /user/id should delete the user', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(!data.body.id) {
				return 'Does not respond as expected - should be no username: ' + JSON.stringify(data.body);
			}
		};

			request(serverApp)
				.delete(sails.config.blueprints.prefix + '/user/' + testUser.id)
				.set('Accept', 'application/json')
				.expect(checkBody)
				.end(done);
		
	});


	it('PUT /user/id should update the user', function(done) {
		var checkUsername = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.username !== 'changedTest') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		var checkPassword = function(res) {
			var data = res;
			if(data.body.password) {
				return 'Password should not be passed back!';
			}
		};

		request(serverApp)
			.put(sails.config.blueprints.prefix + '/user/' + testUser.id)
			.send({username:'changedTest'})
			.set('Accept', 'application/json')
			.expect(checkUsername)
			.expect(checkPassword)
			.end(done);

		
	});

	it('PUT /user/id with bad data should return a validation error', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 400) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}

			if(!data.body.invalidAttributes.username) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(serverApp)
			.put(sails.config.blueprints.prefix + '/user/' + testUser.id)
			.send({username:''})
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
		
	});


});

*/


