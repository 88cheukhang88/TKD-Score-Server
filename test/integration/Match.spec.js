var testData = require('./_testData.js');

describe('Match Model', function() {

	

		testData.beforeEach();
		testData.afterEach();

	it('should add points to player scores', function(done) {
		Match.create({}).exec(function(err, match) {
			if(err) {
				throw new Error(err);
			}
			expect(match.player1Points).to.equal(0);
			match.points(1, 3);
			expect(match.player1Points).to.equal(3);
			match.points(2, 1);
			match.points(1, 2);
			expect(match.player1Points).to.equal(5);
			expect(match.player2Points).to.equal(1);
			done();
		});

		
	});

	it('should add points to player penalties', function(done) {
		Match.create().exec(function(err, match) {
			expect(match.player1Penalties).to.equal(0);
			match.penalties(1, 3);
			expect(match.player1Penalties).to.equal(3);
			match.penalties(2, 1);
			match.penalties(1, 2);
			expect(match.player1Penalties).to.equal(5);
			expect(match.player2Penalties).to.equal(1);
			done();
		});
	});

	it('should add an opposing point on full penalty', function(done) {
		Match.create().exec(function(err, match) {
			expect(match.player1Penalties).to.equal(0);
			expect(match.player2Points).to.equal(0);
			match.penalties(1, 2);
			expect(match.player1Penalties).to.equal(2);
			expect(match.player2Points).to.equal(1);
			done();
		});
	});

	it('should minus an opposing point if the penalty is dropped', function(done) {
		Match.create().exec(function(err, match) {
			//match.penalties(1, 2);
			match.player1Penalties = 2;
			match.player2Points = 1;
			match.penalties(1, -1);
			expect(match.player1Penalties).to.equal(1);
			expect(match.player2Points).to.equal(0);
			done();
		});
	});

	describe('Match Scoring', function() {

		it('should correctly assess 2 judge scoring 2 points (= 2 points)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
			};

			Match.create(record).exec(function(err, match) {

				match.registerScore({
					source:'10101',
					player:1,
					points:2,
				});
				setTimeout(function() {
					expect(match.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					match.registerScore({
						source:'10102',
						player:1,
						points:2,
					});
				}, 100);

				setTimeout(function() {
					expect(match.player1Points).to.equal(2);
					done();
				}, 250);
			});
		});

		it('should correctly assess 2 judge scoring 2 points and 1 point (= 1 point)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
			};
			Match.create(record).exec(function(err, match) {

				match.registerScore({
					source:'10101',
					player:1,
					points:2,
				});
				setTimeout(function() {
					expect(match.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					match.registerScore({
						source:'10102',
						player:1,
						points:1,
					});
				}, 100);

				setTimeout(function() {
					expect(match.player1Points).to.equal(1);
					done();
				}, 250);
			});
		});

		it('should correctly assess 2 judge scoring 2 points with 1 late (= 0 points)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
			};
			Match.create(record).exec(function(err, match) {
				match.registerScore({
					source:'10101',
					player:1,
					points:2,
				});
				setTimeout(function() {
					expect(match.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					match.registerScore({
						source:'10102',
						player:1,
						points:1,
					});
				}, 250);

				setTimeout(function() {
					expect(match.player1Points).to.equal(0);
					done();
				}, 300);
			});
		});
	});
	///////// !!!!!!!! NEED A FEW MORE TESTS HERE !!!!!!!!! ///////////


	
});

describe('Match timers and clocks', function() {
	testData.beforeEach();
	testData.afterEach();


	it('should countdown, pause, then continue', function(done) {

		Match.create({}).exec(function(err, match) {

			var startTime = match.getRoundTimer().ms;
			var splittime = 0;
			match.pauseResume();
			setTimeout(function(){
				match.pauseResume();
				splittime = match.getRoundTimer().ms;
				expect(splittime).to.be.below(startTime);
			}, 60);

			setTimeout(function(){
				expect(splittime).to.be(match.getRoundTimer().ms);
				match.pauseResume();
			}, 80);

			setTimeout(function(){
				match.pauseResume();
				expect(match.getRoundTimer().ms).to.be.below(splittime);
				done();
			}, 120);
		});
	});



	it('should have independant control over different matches', function(done) {
		Match.create([{},{}]).exec(function(err, matches) {

			var testMatch = matches[0];
			var testMatch2 = matches[1];
			
			testMatch2.getRoundTimer().start();
			setTimeout(function(){
				testMatch2.getRoundTimer().stop();
				expect(testMatch.getRoundTimer().ms).to.be.above(testMatch2.getRoundTimer().ms);
				done();
			}, 200);
		});

	});


	xit('should create roundTimers of different lengths', function(done) {
		
		done();
	});

	xit('should auto start the break clock on round end', function(done) {
		
		done();
	});

	xit('should auto start the pause clock on break end', function(done) {
		
		done();
	});

});



describe('Match Auto Operations', function() {
	testData.beforeEach();
	testData.afterEach();

	it('should advance round, until round 3', function(done) {

		var record = {
			roundLengthMS: 500,
			breakLengthMS: 500,
		};

		Match.create(record).exec(function(err, match) {
		
			setTimeout(function() {
				match.resetMatch();
				match.player1Points = 2; // ensure we do not go to sudden death
				match.save();
				match.pauseResume();
				console.log('hey1');
			}, 100);
			
			setTimeout(function() {
				expect(match.round).to.equal(1);
			}, 400); // in R1

			setTimeout(function() {
				expect(match.player1Points).to.equal(2);
				expect(match.round).to.equal(2);
			}, 900); // in R1 break

			setTimeout(function() { // coming out of R2 break, for some reason roundTimer done is fired stright away
				expect(match.matchStatus).to.be('pausedround');
				expect(match.round).to.equal(2);
				match.pauseResume();
				expect(match.round).to.equal(2);
				console.log('hey2');
			}, 1300); // end of break

			setTimeout(function() {
				expect(match.round).to.equal(2);
			}, 1600); // In R2

			setTimeout(function() {
				expect(match.matchStatus).to.be('pausedround');
				match.pauseResume();
				console.log('hey3');
			}, 2500); // end if break

			setTimeout(function() {
				expect(match.round).to.equal(3);
			}, 2800); // in R3

			setTimeout(function() {
				expect(match.round).to.equal(3);
				expect(match.matchStatus).to.equal('complete');
				done();
			}, 3200); // End of Match
		});
	});

	
});





describe('Match Route', function() {

	testData.beforeEach();
	testData.afterEach();


	it('POST /match should create and return a new match', function(done) {
		sails.request({
			method: 'post',
			url: '/api/match/',
			params: {
				//limit: 10,
				//sort: 'number ASC',
				player1: 'test2Player1',
			}
		}, function (err, clientRes, body) {
			if (err) {return done(err);}
			expect(clientRes.statusCode).to.equal(201);
			expect(body.player1).to.equal('test2Player1');
			return done();
		});

	});






	it('GET /match/id should return the match', function(done) {
		sails.request({
			method: 'get',
			url: '/api/match/' + testData.matches[0].id,
			params: {
				//limit: 10,
				//sort: 'number ASC',
			}
		}, function (err, clientRes, body) {
			if (err) {return done(err);}
			expect(clientRes.statusCode).to.equal(200);
			expect(body.id).to.equal(testData.matches[0].id);
			return done();
		});

		
	});


	it('GET /match/ should return a list of matches', function(done) {
		
		sails.request({
			method: 'get',
			url: '/api/match/',
			params: {
				//limit: 10,
				//sort: 'number ASC',
			}
		}, function (err, clientRes, body) {
			if (err) {return done(err);}
			expect(clientRes.statusCode).to.equal(200);
			expect(body.length).to.equal(2);
			expect(body[0].id).to.equal(testData.matches[0].id);
			return done();
		});


	});



	it('PUT /match/id should update the match', function(done) {
		sails.request({
			method: 'put',
			url: '/api/match/' + testData.matches[0].id,
			params: {
				//limit: 10,
				//sort: 'number ASC',
				player1:'changedPlayer1',
			}
		}, function (err, clientRes, body) {
			if (err) {return done(err);}
			expect(clientRes.statusCode).to.equal(200);
			expect(body.player1).to.equal('changedPlayer1');

			return done();
		});

	});



});