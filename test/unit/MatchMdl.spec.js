
// These 3 lines required for Mocha --watch. ////////
// Due to require cache breaking - very old  ////////
// bug that does not appear to be fixable   /////////
// https://github.com/LearnBoost/mongoose/issues/1251
// Copy and paste to each test file 		/////////
var mongoose = require('mongoose');		    /////////
mongoose.models = {};						/////////
mongoose.modelSchemas = {};					/////////
/////////////////////////////////////////////////////
var expect = require('expect.js');			/////////
/////////////////////////////////////////////////////

var sinon = require('sinon');


io = false; // ignore socket calls in unit tests


describe('Match Model', function() {
	var MatchCollection = require('../../api/Match/MatchMdl.js');
	var match = {};

		beforeEach(function() {
			match = {};
			// Mock mongoose save function
			sinon.stub(MatchCollection.prototype, 'save', function(callback) {
				if(callback) {callback();}
			});

			sinon.stub(MatchCollection.matchStore, 'get', function(id) {
				console.log('should be winning');
				return match;
			});

			
		});
		
		afterEach(function() {
			// Restore mocked functions
			MatchCollection.prototype.save.restore();
			MatchCollection.matchStore.get.restore();
		});
	

	it('should add points to player scores', function(done) {
		match = new MatchCollection();


		expect(match.player1Points).to.equal(0);
		match.points(1, 3);
		expect(match.player1Points).to.equal(3);
		match.points(2, 1);
		match.points(1, 2);
		expect(match.player1Points).to.equal(5);
		expect(match.player2Points).to.equal(1);
		done();
	});

	it('should add points to player penalties', function(done) {
		var match = new MatchCollection();

		expect(match.player1Penalties).to.equal(0);
		match.penalties(1, 3);
		expect(match.player1Penalties).to.equal(3);
		match.penalties(2, 1);
		match.penalties(1, 2);
		expect(match.player1Penalties).to.equal(5);
		expect(match.player2Penalties).to.equal(1);
		done();
	});

	describe('Match Scoring', function() {

		it('should correctly assess 2 judge scoring 2 points (= 2 points)', function(done) {
			var match = new MatchCollection({scoreTimeout:200});

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

		it('should correctly assess 2 judge scoring 2 points and 1 point (= 1 point)', function(done) {
			var match = new MatchCollection({scoreTimeout:200});


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

		it('should correctly assess 2 judge scoring 2 points with 1 late (= 0 points)', function(done) {
			var match = new MatchCollection({scoreTimeout:200});

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
	///////// !!!!!!!! NEED A FEW MORE TESTS HERE !!!!!!!!! ///////////


	
});