
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


describe('Logger Model', function() {
	var LoggerCollection = require('../../api/Logger/LoggerMdl.js');

	beforeEach(function() {
		// Mock mongoose save function
		var mongooseCreate = sinon.stub(LoggerCollection.prototype, 'save', function(callback) {
			var mockReturnLogItem = {
				user: this.user,
				description: this.description
			};

			callback(null, mockReturnLogItem);
		});
	});
	
	afterEach(function() {
		// Restore mocked functions
		LoggerCollection.prototype.save.restore();
	});



	it('should produce a log item', function(done) {
		LoggerCollection.add({username: 'dummy'}, 'Testing', function(err, item) {
			if(err) {throw new Error(err);}
			expect(item.message).to.be('Testing');
			expect(item.user.username).to.be('dummy');
			done();
		});
	});



});