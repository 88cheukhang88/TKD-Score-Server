

var mongoose = require('mongoose');
var mongules = require('mongules');
var timestamps = require('mongoose-timestamp');
var Stopwatch = require('timer-stopwatch');

var SchemaName = "Match";
var Schema = new mongoose.Schema({

	player1: {
		type: String,
	},
 
	player2: {
		type: String,
	},

	player1Points: {
		type: Number,
		default: 0,
	},
	
	player2Points: {
		type: Number,
		default: 0,
	},

	player1Penalies: {
		type: Number,
		default: 0,
	},

	player2Penalies: {
		type: Number,
		default: 0,
	},

	numberOfRounds: {
		type: Number,
		default: 3,
	},

	round: {
		type: Number,
		default: 1,
	},

	roundLengthMS: {
		type: Number,
		default: 120000,
	},

	roundTimeMS: {
		type: Number,
		default: 120000,
	},

	breakLengthMS: {
		type: Number,
		default: 60000,
	},

	breakTimeMS: {
		type: Number,
		default: 60000,
	},

	pauseTime: {
		type: Number,
		default: 0,
	},

	matchStatus: {
		type: String, // round, break, pending, complete, pausedround, pausedbreak 
		default: 'pending',
	},






});
Schema.plugin(timestamps);
Schema.plugin(mongules.validate);






Schema.methods.toString = function() {
	return '[match] ' + this.player1 + ' vs. ' + this.player2;
};

Schema.statics.toString = function() {
	return "[model " + SchemaName + "Model]";
};



Schema.methods.pauseResumeMatch = function () {
	if(!roundTimer[this._id]) {
		_createTimers(this);
	}

	switch(this.matchStatus) {
		case 'round':
			roundTimer[this._id].stop();
			pauseWatch[this._id].start();
			this.matchStatus = 'pausedround';
			break;
		case 'break':
			roundTimer[this._id].stop();
			pauseWatch[this._id].start();
			this.matchStatus = 'pausedbreak';
			break;
		case 'pausedround':
		case 'pending':
			pauseWatch[this._id].stop();
			roundTimer[this._id].start();
			this.matchStatus = 'round';
			break;
		case 'pausedbreak':
			pauseWatch[this._id].stop();
			breakTimer[this._id].start();
			this.matchStatus = 'break';
			break;
	}
	this.save();
	return this.matchStatus;
};	


Schema.methods.getRoundTimer = function () {
	if(!roundTimer[this._id]) {_createTimers(this);}
	return roundTimer[this._id];
};

Schema.methods.getBreakTimer = function () {
	if(!breakTimer[this._id]) {_createTimers(this);}
	return breakTimer[this._id];
};

Schema.methods.getPauseWatch = function () {
	if(!pauseWatch[this._id]) {_createTimers(this);}
	return pauseWatch[this._id];
};



// hmmmm perhaps not the best design - but allows the model to loaded using require at any time
try {
	var Model = mongoose.model(SchemaName); // Call to return the model from mongoose
} catch (e) {
	var Model = mongoose.model(SchemaName, Schema); // Call to CREATE the model in mongoose
}

module.exports = Model;




/////////////////////////////////////////////
// Timer managment
//
// The timers cannot be stored by mongo. 
// They are memory only and need to be created on demand
/////////////////////////////////////////////

var roundTimer = [];
var breakTimer = [];
var pauseWatch = [];


var _createTimers = function _createTimers(match) {
	roundTimer[match._id] = new Stopwatch(match.roundTimeMS);
	breakTimer[match._id] = new Stopwatch(match.breakTimeMS);
	pauseWatch[match._id] = new Stopwatch();
};

