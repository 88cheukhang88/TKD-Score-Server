var testData = require('./_testData.js');

describe('Mat Model', function() {

	

		testData.beforeEach();
		testData.afterEach();

	it('should add points to player scores', function(done) {
		Mat.create({}).exec(function(err, mat) {
			if(err) {
				throw new Error(err);
			}
			expect(mat.player1Points).to.equal(0);
			mat.points(1, 3);
			expect(mat.player1Points).to.equal(3);
			mat.points(2, 1);
			mat.points(1, 2);
			expect(mat.player1Points).to.equal(5);
			expect(mat.player2Points).to.equal(1);
			done();
		});

		
	});

	it('should add points to player penalties', function(done) {
		Mat.create().exec(function(err, mat) {
			expect(mat.player1Penalties).to.equal(0);
			mat.penalties(1, 3);
			expect(mat.player1Penalties).to.equal(3);
			mat.penalties(2, 1);
			mat.penalties(1, 2);
			expect(mat.player1Penalties).to.equal(5);
			expect(mat.player2Penalties).to.equal(1);
			done();
		});
	});

	it('should add an opposing point on full penalty', function(done) {
		Mat.create().exec(function(err, mat) {
			expect(mat.player1Penalties).to.equal(0);
			expect(mat.player2Points).to.equal(0);
			mat.penalties(1, 2);
			expect(mat.player1Penalties).to.equal(2);
			expect(mat.player2Points).to.equal(1);
			done();
		});
	});

	it('should minus an opposing point if the penalty is dropped', function(done) {
		Mat.create().exec(function(err, mat) {
			//mat.penalties(1, 2);
			mat.player1Penalties = 2;
			mat.player2Points = 1;
			mat.penalties(1, -1);
			expect(mat.player1Penalties).to.equal(1);
			expect(mat.player2Points).to.equal(0);
			done();
		});
	});

	describe('Mat Scoring', function() {

		it('should correctly assess 2 judge scoring 2x BT (= 2 points)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
				judge1: '10101',
				judge2: '10102',
				pointsBody: 1,
				pointsBodyTurning: 2,
				pointsHead: 3,
				pointsHeadTurning: 4,
				judgeTurning: true,
			};

			Mat.create(record).exec(function(err, mat) {

				mat.registerScore({
					source:'10101',
					player:1,
					target:'body',
					turning: true,
				});

				setTimeout(function() {
					expect(mat.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					mat.registerScore({
						source:'10102',
						player:1,
						target:'body',
						turning: true,
					});
				}, 100);

				setTimeout(function() {
					// Register score may blindly update the points - we need to re-get the reference to test
					Mat.findOne(mat.id).exec(function(err, updatedMatch) {
						expect(updatedMatch.player1Points).to.equal(2);
						done();
					});
				}, 250);
			});
		});

		it('should correctly assess 2 judge scoring 1xB and 1x BT (= 1 point)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
				judge1: '10101',
				judge2: '10102',
				pointsBody: 1,
				pointsBodyTurning: 2,
				pointsHead: 3,
				pointsHeadTurning: 4,
				judgeTurning: true,
			};

			Mat.create(record).exec(function(err, mat) {

				mat.registerScore({
					source:'10101',
					player:1,
					target:'body',
					turning: true,
				});
				setTimeout(function() {
					expect(mat.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					mat.registerScore({
						source:'10102',
						player:1,
						target:'body',
						turning: false,
					});
				}, 100);

				setTimeout(function() {
					// Register score may blindly update the points - we need to re-get the reference to test
					Mat.findOne(mat.id).exec(function(err, updatedMatch) {
						expect(updatedMatch.player1Points).to.equal(1);
						done();
					});
				
				}, 250);
			});
		});

		it('should correctly assess 2 judge scoring 2x H with 1 late (= 0 points)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
				judge1: '10101',
				judge2: '10102',
				pointsBody: 1,
				pointsBodyTurning: 2,
				pointsHead: 3,
				pointsHeadTurning: 4,
				judgeTurning: true,
			};

			Mat.create(record).exec(function(err, mat) {
				mat.registerScore({
					source:'10101',
					player:1,
					target:'head',
					turning: false,
				});
				setTimeout(function() {
					expect(mat.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					mat.registerScore({
						source:'10102',
						player:1,
						target:'head',
						turning: false,
					});
				}, 250);

				setTimeout(function() {
					// Register score may blindly update the points - we need to re-get the reference to test
					Mat.findOne(mat.id).exec(function(err, updatedMatch) {
						expect(updatedMatch.player1Points).to.equal(0);
						done();
					});
				}, 300);
			});
		});

		it('should correctly assess 2 judge scoring 2x B with master registering turn (= 2 points)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
				judge1: '10101',
				judge2: '10102',
				pointsBody: 1,
				pointsBodyTurning: 2,
				pointsHead: 3,
				pointsHeadTurning: 4,
				judgeTurning: false,
			};

			Mat.create(record).exec(function(err, mat) {

				mat.registerScore({
					source:'10101',
					player:1,
					target:'body',
					turning: false,
				});

				setTimeout(function() {
					expect(mat.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					mat.registerScore({
						source:'10102',
						player:1,
						target:'body',
						turning: false,
					});
				}, 100);

				setTimeout(function() {
					mat.registerTurn({
						player:1,
					});
				}, 150);

				setTimeout(function() {
					// Register score may blindly update the points - we need to re-get the reference to test
					Mat.findOne(mat.id).exec(function(err, updatedMatch) {
						expect(updatedMatch.player1Points).to.equal(2);
						done();
					});
				}, 250);
			});
		});

 
		it('should correctly assess 2 judge scoring 2x B with master NOT registering turn (= 1 points)', function(done) {
			var record = {
				agree: 2,
				scoreTimeout: 200,
				judge1: '10101',
				judge2: '10102',
				pointsBody: 1,
				pointsBodyTurning: 2,
				pointsHead: 3,
				pointsHeadTurning: 4,
				judgeTurning: false,
			};

			Mat.create(record).exec(function(err, mat) {

				mat.registerScore({
					source:'10101',
					player:1,
					target:'body',
					turning: true,
				});

				setTimeout(function() {
					expect(mat.player1Points).to.equal(0);
				}, 50);

				setTimeout(function() {
					mat.registerScore({
						source:'10102',
						player:1,
						target:'body',
						turning: true,
					});
				}, 100);

				

				setTimeout(function() {
					// Register score may blindly update the points - we need to re-get the reference to test
					Mat.findOne(mat.id).exec(function(err, updatedMatch) {
						expect(updatedMatch.player1Points).to.equal(1);
						done();
					});
				}, 250);
			});
		});
	});
	///////// !!!!!!!! NEED A FEW MORE TESTS HERE !!!!!!!!! ///////////


	
});

describe('Mat timers and clocks', function() {
	testData.beforeEach();
	testData.afterEach();


	it('should countdown, pause, then continue', function(done) {

		Mat.create({}).exec(function(err, mat) {

			var startTime = mat.getRoundTimer().ms;
			var splittime = 0;
			mat.pauseResume();
			setTimeout(function(){
				mat.pauseResume();
				splittime = mat.getRoundTimer().ms;
				expect(splittime).to.be.below(startTime);
			}, 60);

			setTimeout(function(){
				expect(splittime).to.be(mat.getRoundTimer().ms);
				mat.pauseResume();
			}, 80);

			setTimeout(function(){
				mat.pauseResume();
				expect(mat.getRoundTimer().ms).to.be.below(splittime);
				done();
			}, 120);
		});
	});



	it('should have independant control over different mats', function(done) {
		Mat.create([{},{}]).exec(function(err, mats) {

			var testMatch = mats[0];
			var testMatch2 = mats[1];
			
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



describe('Mat Auto Operations', function() {
	testData.beforeEach();
	testData.afterEach();

	xit('should advance round, until round 3', function(done) {

		var record = {
			roundLengthMS: 500,
			breakLengthMS: 500,
		};

		Mat.create(record).exec(function(err, mat) {
		
			setTimeout(function() {
				mat.resetMatch();
				mat.player1Points = 2; // ensure we do not go to sudden death
				mat.save();
				mat.pauseResume();
				
			}, 100);
			
			setTimeout(function() {
				expect(mat.round).to.equal(1);
			}, 400); // in R1

			setTimeout(function() {
				expect(mat.player1Points).to.equal(2);
				expect(mat.round).to.equal(2);
			}, 900); // in R1 break

			setTimeout(function() { // coming out of R2 break, for some reason roundTimer done is fired stright away
				expect(mat.matchStatus).to.be('pausedround');
				expect(mat.round).to.equal(2);
				mat.pauseResume();
				expect(mat.round).to.equal(2);
				
			}, 1300); // end of break

			setTimeout(function() {
				expect(mat.round).to.equal(2);
			}, 1600); // In R2

			setTimeout(function() {
				expect(mat.matchStatus).to.be('pausedround');
				mat.pauseResume();
				
			}, 2500); // end if break

			setTimeout(function() {
				expect(mat.round).to.equal(3);
			}, 2800); // in R3

			setTimeout(function() {
				expect(mat.round).to.equal(3);
				expect(mat.matchStatus).to.equal('complete');
				done();
			}, 3200); // End of Mat
		});
	});

	
});





describe('Mat Route', function() {

	testData.beforeEach();
	testData.afterEach();


	it('POST /mat should create and return a new mat', function(done) {
		sails.request({
			method: 'post',
			url: '/api/mat/',
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






	it('GET /mat/id should return the mat', function(done) {
		sails.request({
			method: 'get',
			url: '/api/mat/' + testData.mats[0].id,
			params: {
				//limit: 10,
				//sort: 'number ASC',
			}
		}, function (err, clientRes, body) {
			if (err) {return done(err);}
			expect(clientRes.statusCode).to.equal(200);
			expect(body.id).to.equal(testData.mats[0].id);
			return done();
		});

		
	});


	it('GET /mat/ should return a list of mats', function(done) {
		
		sails.request({
			method: 'get',
			url: '/api/mat/',
			params: {
				//limit: 10,
				//sort: 'number ASC',
			}
		}, function (err, clientRes, body) {
			if (err) {return done(err);}
			expect(clientRes.statusCode).to.equal(200);
			expect(body.length).to.equal(2);
			expect(body[0].id).to.equal(testData.mats[0].id);
			return done();
		});


	});



	it('PUT /mat/id should update the mat', function(done) {
		sails.request({
			method: 'put',
			url: '/api/mat/' + testData.mats[0].id,
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