var testData = require('./_testData.js');

var testMatch;

function emptyTestData() {
	// Empty the database
	var MatchCollection = require('../../api/Match/MatchMdl.js');
	var LoggerCollection = require('../../api/Logger/LoggerMdl.js');
	

	MatchCollection.remove({}, function(err) {
		
	});
	LoggerCollection.remove({}, function(err) {
		
	});
}

function insertTestData(done) {
	emptyTestData();
	var MatchCollection = require('../../api/Match/MatchMdl.js');

	MatchCollection.create(testData.fakeMatch, function(err, returnedMatch) {
		if(err) {
			console.log(err);
			throw new Error(err);
		}

		testMatch = returnedMatch;
		done();
	});
}

describe('Match timers and clocks', function() {
	beforeEach(insertTestData);
	afterEach(emptyTestData);



	it('should countdown, pause, then continue', function(done) {
		var matchCtrl = require('../../api/Match/MatchCtrl.js');


		matchCtrl._getMatchById(testMatch._id, function(err, match) {
			
			var startTime = matchCtrl._getRoundTimerMS(match);
			var splittime = 0;
			matchCtrl._pauseResumeMatch(match);
			setTimeout(function(){
				matchCtrl._pauseResumeMatch(match);
				splittime = matchCtrl._getRoundTimerMS(match);
				expect(splittime).to.be.below(startTime);
			}, 60);

			setTimeout(function(){
				expect(splittime).to.be(matchCtrl._getRoundTimerMS(match));
				matchCtrl._pauseResumeMatch(match);
			}, 80);

			setTimeout(function(){
				matchCtrl._pauseResumeMatch(match);
				expect(matchCtrl._getRoundTimerMS(match)).to.be.below(splittime);
				done();
			}, 120);
		});

		
	});


	xit('should have independant control over different matches', function(done) {
		var testMatch2 = {};

		var MatchCollection = require('../../api/Match/MatchMdl.js');

		MatchCollection.create(testData.fakeMatch2, function(err, returnedMatch) {
			if(err) {
				console.log(err);
				throw new Error(err);
			}

			testMatch2 = returnedMatch;
			testMatch2.roundTimer.start();
			setTimeout(function(){
				testMatch2.roundTimer.stop();
				expect(testMatch.roundTimer.ms).to.be.above(testMatch2.roundTimer.ms);
				done();
			}, 500);



			
		});


	});
});





describe('Match Route', function() {

	beforeEach(insertTestData);
	afterEach(emptyTestData);


	it('POST /match should create and return a new match', function(done) {
		var checkData = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.player1 !== 'test2Player1') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.post(app.get('API_ROUTE_PREFIX') + '/match')
			.send(testData.fakeMatch2)
			.set('Accept', 'application/json')
			.expect(checkData)
			.end(done);
	});

	xit('POST /match with ? name cause a validatiom error', function(done) {
		var checkData = function(res) {
			var data = res;
			if(data.statusCode !== 400) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.name === 'testerCompany2') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};



		
		request(app)
			.post(app.get('API_ROUTE_PREFIX') + '/match')
			.send(testData.fakeOrganisation2)
			.set('Accept', 'application/json')
			.expect(checkData)
			.end(done);

	});

	xit('POST /match with invalid data should return a validation error', function(done) {
		var checkBody = function(res) {
			//console.log(res);
			var data = res;
			if(data.statusCode !== 400) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(!data.body.errors.primaryUser_id) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.post(app.get('API_ROUTE_PREFIX') + '/match')
			.send(testData.fakeMatch2) //this time does not have the primaryUser_id set//
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
	});



	it('GET /match/id should return the match', function(done) {
		var checkData = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.player1 !== 'test1Player1') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};


		request(app)
			.get(app.get('API_ROUTE_PREFIX') + '/match/' + testMatch._id)
			.set('Accept', 'application/json')
			.expect(checkData)
			.end(done);
		
	});


	it('GET /match/ should return a list of matches', function(done) {
		var checkData = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body[0].player1 !== 'test1Player1') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get(app.get('API_ROUTE_PREFIX') + '/match')
			.set('Accept', 'application/json')
			.expect(checkData)
			.end(done);
	});


	it('GET /match/ should return an empty list', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body[0]) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get(app.get('API_ROUTE_PREFIX') + '/match')
			.send({name:'MonkeyMan'})
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
	});


	it('DELETE /match/id should delete the match', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 204) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.player1) {
				return 'Does not respond as expected - should be no player1: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.delete(app.get('API_ROUTE_PREFIX') + '/match/' + testMatch._id)
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);

		
	});


	it('PUT /match/id should update the match', function(done) {
		var checkData = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}
			if(data.body.player1 !== 'changedPlayer1') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.put(app.get('API_ROUTE_PREFIX') + '/match/' + testMatch._id)
			.send({player1:'changedPlayer1'})
			.set('Accept', 'application/json')
			.expect(checkData)
			.end(done);
	});

	xit('PUT /match/id with bad data should return a validation error', function(done) {
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 400) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}

			if(!data.body.errors.name) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.put(app.get('API_ROUTE_PREFIX') + '/match/' + testOrganisation.code)
			.send({name:null})
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
		
	});

});

describe('Match Route Commands', function() {
	beforeEach(insertTestData);
	afterEach(emptyTestData);
	it('GET /match/:id/pauseresume should start the match', function(done) {
		
		var checkBody = function(res) {
			var data = res;
			if(data.statusCode !== 200) {
				return 'Does not respond with correct status code: got ' + data.statusCode + ' ' + JSON.stringify(data.body);
			}

			if(data.body.matchStatus !== 'round') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get(app.get('API_ROUTE_PREFIX') + '/match/' + testMatch._id + '/pauseresume')
			.set('Accept', 'application/json')
			.expect(checkBody)
			.end(done);
	});
});

