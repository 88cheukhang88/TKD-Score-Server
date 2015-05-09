
var _ = require('lodash');


var self = this;
var testData = this;

/*
this.shows = [
	{
		id:1,
		name: 'Show1',
	},
	{
		id:2,
		name: 'Show2',
	}
];

this.roles = [
	{
		id:1,
		show:1,
		name:'Role1',
		callsign:'R1',
	},
	{
		id:2,
		show:1,
		name:'Role2',
		callsign:'R2',
	}
];

this.cues = [
	{
		id:1,
		role: 1,
		number: 1,
		text: 'R1 C1',
	},
	{
		id:2,
		role: 1,
		number: 2,
		text: 'R1 C2',
	},
	{
		id:3,
		role: 1,
		number: 3,
		follow:1,
		text: 'R1 C3',
	},
	{
		id:4,
		role: 1,
		number: 4,
		text: 'R1 C4',
	},
	{
		id:5,
		role: 1,
		number: 5,
		text: 'R1 C5',
	},
	{
		id:6,
		role: 1,
		number: 6,
		text: 'R1 C6',
	}
];

this.tasks = [
	{
		id:1,
		role: 1,
		description: "R1 T1",
		status: TASK_STATUS.NEW,
	},
	{
		id:1,
		role: 1,
		description: "R1 T2",
		status: TASK_STATUS.COMPLETE,
	}

];



var beforeFunctions = {

  shows: function(done) {
    Show.create(self.shows).exec(done);
  },

  roles:  function(done) {
    Role.create(self.roles).exec(done);
  },

  cues:  function(done) {
    Cue.create(self.cues).exec(done);
  },

  tasks: function(done) {
  	Task.create(self.tasks).exec(done);
  }
  

};

var afterFunctions = {
  destroyCues: function(done) {
    Cue.destroy(done);
  },
  destroyRoles: function(done) {
    Role.destroy(done);
  },
  destroyShows: function(done) {
    Show.destroy(done);
  },
  destroyTasks: function(done) {
  	Task.destroy(done);
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
*/

module.exports = this;
