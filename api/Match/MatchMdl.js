
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

	player1Penalties: {
		type: Number,
		default: 0,
	},

	player2Penalties: {
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


	matchStatus: {
		type: String, // round, break, pending, complete, pausedround, pausedbreak 
		default: 'pending',
	},





});
Schema.plugin(timestamps);
Schema.plugin(mongules.validate);




////// TODO: Need to write 'pre' function to send model updates over socket.io ///////
Schema.post('save', function(next) {
	if(io) {
		io.in(this._id).emit('match', this.toJSON());
	}
});



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
	_createTimers(this);

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
			pauseWatch[this._id].reset();
			roundTimer[this._id].start();
			this.matchStatus = 'round';
			break;
		case 'pausedbreak':
			pauseWatch[this._id].reset();
			breakTimer[this._id].start();
			this.matchStatus = 'break';
			break;
	}
	this.save();
	log.debug('Pause resume match: ' + this._id + '. Status now: ' + this.matchStatus);
	return this.matchStatus;
};	

Schema.methods.points = function (player, points) {
	var playerPoints = 0;
	var playerPenalties = 0;

	if(player === 1) {
		playerPoints = this.player1Points;
		playerPenalties = this.player1Penalties;
	} else {
		playerPoints = this.player2Points;
		playerPenalties = this.player2Penalties;
	}

	playerPoints += points;
	if (playerPoints < 0) {playerPoints = 0;}



	if(player === 1) {
		this.player1Points = playerPoints;
		this.player1Penalies = playerPenalties;
	} else {
		this.player2Points = playerPoints;
		this.player2Penalies = playerPenalties;
	}
	this.save();
};

Schema.methods.penalties = function (player, points) {
	var playerPoints = 0;
	var playerPenalties = 0;
	if(player === 1) {
		playerPoints = this.player1Points;
		playerPenalties = this.player1Penalties;
	} else {
		playerPoints = this.player2Points;
		playerPenalties = this.player2Penalties;
	}


	playerPenalties += points;
	if (playerPenalties < 0) {playerPenalties = 0;}
	if (playerPenalties > 8) {playerPenalties = 8;}


	if(player === 1) {
		this.player1Points = playerPoints;
		this.player1Penalties = playerPenalties;
	} else {
		this.player2Points = playerPoints;
		this.player2Penalties = playerPenalties;
	}
	this.save();
};

Schema.methods.resetMatch = function () {
	_createTimers(this);

	roundTimer[this._id].reset(this.roundLengthMS);
	this.roundTimeMS = this.roundLengthMS;
	breakTimer[this._id].reset(this.breakLengthMS);
	this.breakTimeMS = this.breakLengthMS;
	pauseWatch[this._id].reset();
	this.round = this.numberOfRounds;
	this.player1Points = 0;
	this.player2Points = 0;
	this.player1Penalies = 0;
	this.player2Penalies = 0;
	this.matchStatus = 'pending';
	this.save();
};

Schema.methods.resetTimer = function () {
	_createTimers(this);
	switch(this.matchStatus) {
		case 'round':
		case 'pausedround':
			roundTimer[this._id].reset();
			pauseWatch[this._id].start();
			break;
		case 'break':
		case 'pausedbreak':
			breakTimer[this._id].reset();
			pauseWatch[this._id].start();
			break;
	}
};


Schema.methods.getRoundTimer = function () {
	_createTimers(this);
	return roundTimer[this._id];
};

Schema.methods.getBreakTimer = function () {
	_createTimers(this);
	return breakTimer[this._id];
};

Schema.methods.getPauseWatch = function () {
	_createTimers(this);
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

Schema.statics.resetMatch = function(id, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.resetMatch();
		cb(null, match);
	});
};

Schema.statics.resetTimer = function(id, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.resetTimer();
		cb(null, match);
	});
};

Schema.statics.points = function(id, player, points, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.points(player, points);
		cb(null, match);
	});
};

Schema.statics.penalties = function(id, player, points, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.penalties(player, points);
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

	roundTimer[match._id] = new Stopwatch(match.roundLengthMS);
	roundTimer[match._id].ms = match.roundTimeMS;
	breakTimer[match._id] = new Stopwatch(match.breakLengthMS);
	breakTimer[match._id].ms = match.breakTimeMS;
	pauseWatch[match._id] = new Stopwatch();








	////////////////////
	// Timer automation
	////////////////////
	roundTimer[match._id].on('done', function() {
		if(match.round < match.numberOfRounds) {
			// break
			roundTimer[match._id].reset();
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

