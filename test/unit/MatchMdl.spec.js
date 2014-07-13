
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



describe('Match Model', function() {
	var MatchCollection = require('../../api/Match/MatchMdl.js');

		beforeEach(function() {
			// Mock mongoose save function
			var mongooseSave = sinon.stub(MatchCollection.prototype, 'save', function(callback) {
				if(callback) {callback();}
			});
		});
		
		afterEach(function() {
			// Restore mocked functions
			MatchCollection.prototype.save.restore();
		});
	

	it('should add points to player scores', function(done) {
		var match = new MatchCollection();

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
});