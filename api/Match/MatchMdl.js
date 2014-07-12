
var log = require('../../lib/logger.js');
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

	roundTime: {
		type: mongoose.Schema.Types.Mixed,
		default: {ms: 120000, clock: '02:00'},
	},

	breakLengthMS: {
		type: Number,
		default: 60000,
	},

	breakTime: {
		type: mongoose.Schema.Types.Mixed,
		default: {ms: 60000, clock: '01:00'},
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



////////////////////////////////////////////////
// Model Methods
////////////////////////////////////////////////

Schema.methods.pauseResume = function () {
	if(!roundTimer[this._id]) {
		_createTimers(this);
	}

	switch(this.matchStatus) {
		case 'round':
			roundTimer[this._id].stop();
			this.roundTime = {clock:roundTimer[this._id].clock, ms:roundTimer[this._id].ms};
			pauseWatch[this._id].start();
			this.matchStatus = 'pausedround';
			break;
		case 'break':
			breakTimer[this._id].stop();
			this.breakTime = {clock:breakTimer[this._id].clock, ms:breakTimer[this._id].ms};
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
	log.debug('Pause resume match: ' + this._id + '. Status now: ' + this.matchStatus);
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



/////////////////////////////////////
// Collection Methods
/////////////////////////////////////
Schema.statics.pauseResumeMatch = function(id, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.pauseResume();
		cb(null, match);
	});
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
	if(roundTimer[match._id]) {return;}
	
	roundTimer[match._id] = new Stopwatch(match.roundTime.ms);
	breakTimer[match._id] = new Stopwatch(match.breakTime.ms);
	pauseWatch[match._id] = new Stopwatch();


	////////////////////
	// Timer automation
	////////////////////
	roundTimer[match._id].on('done', function() {
		if(match.round < match.numberOfRounds) {
			// break
			breakTimer[match._id].reset();
			breakTimer[match._id].start();
			match.matchStatus = 'break';
			match.round++;
			match.save();
		} 
		else if (match.round === match.numberOfRounds && match.player1Points === match.player2Points) {
			// sudden death
			match.player1Points = 0;
			match.player2Points = 0;
			breakTimer[match._id].reset();
			breakTimer[match._id].start();
			match.matchStatus = 'break';
			match.round++;
			match.save();
		}
		else if (match.round === match.numberOfRounds && match.player1Points !== match.player2Points) {
			// End of match
			match.matchStatus = 'complete';
			match.save();
		}
	});

	breakTimer[match._id].on('done', function() {
		if(match.round <= match.numberOfRounds) {
			// Pause round clock waiting for operator input
			pauseWatch[match._id].start();
			match.matchStatus = 'pausedround';
			match.save();
		} 
	});

};

