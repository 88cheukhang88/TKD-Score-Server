
var _ = require('lodash');


var self = this;
var testData = this;


this.mats = [
	{
		id: 1,
	},
	{
		id: 2,
	}
];

var beforeFunctions = {

  mats: function(done) {
    Mat.create(self.mats).exec(done);
  },

};

var afterFunctions = {
  destroyMatches: function(done) {
    Mat.destroy(done);
  },
  


};

this.beforeEach = function() {
	_.forEach(beforeFunctions, function(func) {
		beforeEach(func);
	});
};

this.before = function() {
	_.forEach(beforeFunctions, function(func) {
		before(func);
	});
};

this.afterEach = function() {
	_.forEach(afterFunctions, function(func) {
		afterEach(func);
	});
};

this.after = function() {
	_.forEach(afterFunctions, function(func) {
		after(func);
	});
};


module.exports = this;
