

var log = require('../../lib/logger.js');
var mongoose = require('mongoose');
var mongules = require('mongules');
var timestamps = require('mongoose-timestamp');
var Stopwatch = require('timer-stopwatch');

var SchemaName = "Match";
var Schema = new mongoose.Schema({

	player1: {
		type: String,
		default: 'Hong'
	},
 
	player2: {
		type: String,
		default: 'Chong'
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

	agree: {
		type: Number,
		default: 2,
	},

	scoreTimeout: {
		type: Number,
		default: 1000,
	},

});
Schema.plugin(timestamps);
Schema.plugin(mongules.validate);


// matchStore will hold an in memory copy of the matches. This is important for time sensitive events - such as timer done events.
// matchStore is updated by the 'post save' moongoose event.
// Might need a way to get data out of mongo to start with.
// Need to extrapolate and refactor

var matchStore = [];
matchStore.save = function(match) {
	this[match._id] = match;
};
matchStore.get = function(id) {
	return this[id];
};
matchStore.remove = function(id) {
	delete(this[id]);
};
Schema.statics.matchStore = matchStore; // declared for unit testing mock purposes


//////////////////////////////////////////////////////
// Send entire Match data over socket when it changes
//////////////////////////////////////////////////////
Schema.post('save', function(next) {
	matchStore.save(this);
	if(io) {
		io.in(this._id).emit('match', this.toJSON());
	}
	
});

Schema.pre('save', function(next) {
	if(this.matchStatus === 'pending') {
		this.roundTimeMS = this.roundLengthMS;
		this.breakLengthMS = this.breakLengthMS;
	}
	next();
});




////////////////////////////////////////////////
// Model Methods
////////////////////////////////////////////////
Schema.methods.toString = function() {
	return '[match] ' + this.player1 + ' vs. ' + this.player2;
};

Schema.methods.pauseResume = function () {
	_createTimers(this);
	
	var oldStatus = this.matchStatus;
	switch(this.matchStatus) {
		case 'round':
			roundTimer[this._id].stop();
			pauseWatch[this._id].start();
			this.matchStatus = 'pausedround';
			break;
			
		case 'break': // only pause break if the bell has not sounded. Otherwise start the round
			if (breakTimer[this._id].ms > breakTimer[this._id].almostDoneMS) {
				breakTimer[this._id].stop();
				this.breakTimeMS = breakTimer[this._id].ms;
				pauseWatch[this._id].start();
				this.matchStatus = 'pausedbreak';
				break;
			} 	
			/* falls through */
		case '_endbreakearly':	// internal use to force the break to end
		case 'pausedround':
		case 'pending':
			breakTimer[this._id].reset();
			pauseWatch[this._id].reset();
			breakTimer[this._id].reset();
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
	
	log.verbose('Pause resume match: ' + this._id + '. Status old: ' + oldStatus + ' now: ' + this.matchStatus);
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

Schema.methods.changeRound = function (round) {
	if(this.matchStatus === "break" && breakTimer[this._id].ms > breakTimer[this._id].almostDoneMS) {
		this.matchStatus = '_endbreakearly';
		this.pauseResume();
	} else {
		if(round > this.numberOfRounds) {
			round = this.numberOfRounds;
		}

		if(round < 1) {
			round = 1;
		}

		this.round = round;
		this.save();
	}

	
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
	if(io) {
		io.in(this.id).emit('roundtime', {ms:this.roundTimeMS});
	}

	breakTimer[this._id].reset(this.breakLengthMS);
	
	this.breakTimeMS = this.breakLengthMS;
	if(io) {
		io.in(this.id).emit('breaktime', {ms:this.breakTimeMS});
	}

	pauseWatch[this._id].reset();
	if(io) {
		io.in(this.id).emit('pausetime', {ms:0});
	}

	this.round = 1;
	this.player1Points = 0;
	this.player2Points = 0;
	this.player1Penalties = 0;
	this.player2Penalties = 0;
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

Schema.methods.registerScore = function(data) {

	///// Used for corner judges only

	var match = this;

	var player = data.player;
	var points = data.points;

	var source = data.source;
	var aggregatePoints = 0;
	
	var id = match._id;
	var scoreTimeout = match.scoreTimeout;
	var agree = match.agree;

	if(!scoreBuffer[id]) {
		scoreBuffer[id] = [];
	}

	if(!scoreBuffer[id][player]) {
		scoreBuffer[id][player] = [];
	}

	if(!scoreTimer[id]) {
		scoreTimer[id] = [];
	}




	if(scoreBuffer[id][player].length === 0) { // no score is present (the timer will not be running)
		
		/// Set the timer to add the score and clear the score buffer
		scoreTimer[id][player] = setTimeout(function(){
			
			if(scoreBuffer[id][player].length >= agree) { //if enough judges have scored **** THIS IS NOT THE END - JUDGES MAY STILL VOTE, IT JUST GETS REPROCESSED UNTIL THE TIMER RUNS OUT
				var high = 0;
				var low = 4;
				var scoreCount = [0,0,0,0,0];

				for(var i=0;i<scoreBuffer[id][player].length;i++) {
					///// compare scores in buffer - set the lowest and hifgest scores given
					
					low = Math.min(scoreBuffer[id][player][i].points,low);
					high = Math.max(scoreBuffer[id][player][i].points,high);
					
					//// how votes for each score (1-4)
					var val = scoreBuffer[id][player][i].points;
					scoreCount[val] += 1;
					
				}
				/// Set the score to be awarded as the lowest value given (just in case they don't all agree - but enough have voted at least 1 point
				aggregatePoints = low;
				
				// Check the score count - if a score has enough votes set it as the score to be awarded
				for(i=1; i<5; i++) { // must iterate through all to get the highest score (except 0) 
					
					if(scoreCount[i] >= agree) {
						aggregatePoints = i;
					}
				}
			}

			match.points(player, aggregatePoints);

			//console.log(player + ' awarded ' + aggregatePoints + ' points');

			scoreBuffer[id][player] = [];
		}, scoreTimeout);
	}





	// Push the score into the vote buffer
	if(!scoreBuffer[id][player].length) { // need to add the first one regeardless
		scoreBuffer[id][player].push({points:points, source:source});
		log.verbose(source + ' voted player' + player + ' ' + points + ' points');
	} else {
		//Check if the source already exist in array? if not, add the data
		var alreadyGotIt = false;
		for(var i=0;i<scoreBuffer[id][player].length;i++) {
			if(scoreBuffer[id][player][i].source === source) {
				alreadyGotIt = true;
				break;
			}
			
		}
		// if the judge has not already cast a vote - add this judges score to the buffer
		if(!alreadyGotIt) {
			scoreBuffer[id][player].push({points:points, source:source}); 
		 	log.verbose(source + ' voted player' + player + ' ' + points + ' points');
		}
	}
	
	if(io) {
		io.in(id).emit('judge', {source:source, player:player, points:points});
	}

};



/////////////////////////////////////
// Collection Methods
/////////////////////////////////////
Schema.statics.toString = function() {
	return "[model " + SchemaName + "Model]";
};


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

Schema.statics.changeRound = function(id, value, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.changeRound(value);
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

Schema.statics.registerScore = function(id, data, cb) {
	this.model(SchemaName).findById(id, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, null);}

		match.registerScore(data);
		cb(null, match);
	});
};









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

	if(io) {
		roundTimer[match._id].on('time', function (time) {
	    	io.in(match._id + "").emit('roundtime', time);
	    });

	    roundTimer[match._id].on('done', function () {
	    	io.in(match._id + "").emit('soundhorn');
	    });

	    breakTimer[match._id].on('time', function (time) {
	    	io.in(match._id + "").emit('breaktime', time);
	    });

	    breakTimer[match._id].on('almostdone', function () {
	    	io.in(match._id + "").emit('soundhorn');
	    });

	    pauseWatch[match._id].on('time', function (time) {
	    	io.in(match._id + "").emit('pausetime', time);

	    	if(time.ms > 120000) {
	    		// STOP AFTER 2 MINUTES
	    		// !!!!!!!!!!!!!!!!!!REMOVE FOR PRODUCTION!!!!!!!!!!!!!!!!!!!!!!
	    		pauseWatch[match._id].stop();
	    	}
	    });
	}


	// Timer automation //

	roundTimer[match._id].on('done', function() {
		var updatedMatch = matchStore.get(match._id); // get updated match data from memory - then HIDE the original match with a new variable in this scope
		var oldStatus = updatedMatch.matchStatus;
		if(updatedMatch.round < updatedMatch.numberOfRounds) {
			// break
			roundTimer[updatedMatch._id].reset();
			breakTimer[updatedMatch._id].start();
			updatedMatch.matchStatus = 'break';
			updatedMatch.round = updatedMatch.round + 1;
			updatedMatch.save();
			log.verbose('Round Done: ' + updatedMatch._id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
		} 
		else if (updatedMatch.round === updatedMatch.numberOfRounds) {
			if(updatedMatch.player1Points === updatedMatch.player2Points) {
				// sudden death
				updatedMatch.player1Points = 0;
				updatedMatch.player2Points = 0;
				roundTimer[match._id].reset();
				breakTimer[match._id].start();
				updatedMatch.matchStatus = 'break';
				updatedMatch.round = match.round + 1;
				log.verbose('Round Done - going sudden death: ' + updatedMatch._id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
				updatedMatch.save();
			} else {
				// End of match
				log.verbose('Match Done: ' + updatedMatch._id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
				updatedMatch.matchStatus = 'complete';
				updatedMatch.save();
			}
		}
		else {
			log.verbose('Match Done: ' + updatedMatch._id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
			updatedMatch.matchStatus = 'complete';
			updatedMatch.save();
		}
	});	
		

	breakTimer[match._id].on('done', function() {
		var updatedMatch = matchStore.get(match._id); // get updated match data from memory - then HIDE the original match with a new variable in this scope

		//if(match.round <= match.numberOfRounds) {
			// Pause round clock waiting for operator input
			pauseWatch[updatedMatch._id].start();
			updatedMatch.matchStatus = 'pausedround';
			updatedMatch.save();
			
		//} 
	});
};


//////////////////////////////////////////
//// Remote Score Managment
//////////////////////////////////////////


var scoreBuffer = [];
var scoreTimer = [];



var Model = {};
// hmmmm perhaps not the best design - but allows the model to loaded using require at any time
try {
	Model = mongoose.model(SchemaName); // Call to return the model from mongoose
} catch (e) {
	Model = mongoose.model(SchemaName, Schema); // Call to CREATE the model in mongoose
}

module.exports = Model;

