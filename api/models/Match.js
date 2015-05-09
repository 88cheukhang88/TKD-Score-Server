var scoreBuffer = [];
var scoreTimer = [];

module.exports = {

	attributes: {

		player1: {
			type: 'string',
			defaultsTo: 'Hong',
		},

		player2: {
			type: 'string',
			defaultsTo: 'Chong',
		},

		player1Points: {
			type: 'integer',
			defaultsTo: 0,
		},

		player2Points: {
			type: 'integer',
			defaultsTo: 0,
		},

		player1Penalties: {
			type: 'integer',
			defaultsTo: 0,
		},

		player2Penalties: {
			type: 'integer',
			defaultsTo: 0,
		},

		numberOfRounds: {
			type: 'integer',
			defaultsTo: 3,
		},

		round: {
			type: 'integer',
			defaultsTo: 1,
		},

		roundLengthMS: {
			type: 'integer',
			defaultsTo: 120000,
		},

		roundTimeMS: {
			type: 'integer',
			defaultsTo: 120000,
		},

		breakLengthMS: {
			type: 'integer',
			defaultsTo: 60000,
		},

		breakTimeMS: {
			type: 'integer',
			defaultsTo: 60000,
		},

		matchStatus: {
			type: 'string',
			defaultsTo: 'pending',
		},

		breakTimeMS: {
			type: 'integer',
			defaultsTo: 2,
		},

		scoreTimeout: {
			type: 'integer',
			defaultsTo: 1000,
		},

		toString: function() {
			return '[match] ' + this.player1 + ' vs. ' + this.player2;
		};


		pauseResume = function () {
			MatchService.createTimers(this);
			
			var oldStatus = this.matchStatus;
			switch(this.matchStatus) {
				case 'round':
					MatchService.roundTimer[this.id].stop();
					MatchService.pauseWatch[this.id].start();
					this.matchStatus = 'pausedround';
					break;
					
				case 'break': // only pause break if the bell has not sounded. Otherwise start the round
					if (MatchService.breakTimer[this.id].ms > MatchService.breakTimer[this.id].almostDoneMS) {
						MatchService.breakTimer[this.id].stop();
						this.breakTimeMS = MatchService.breakTimer[this.id].ms;
						pauseWatch[this.id].start();
						this.matchStatus = 'pausedbreak';
						break;
					} 	
					/* falls through */
				case '_endbreakearly':	// internal use to force the break to end
				case 'pausedround':
				case 'pending':
					MatchService.breakTimer[this.id].reset();
					MatchService.pauseWatch[this.id].reset();
					MatchService.breakTimer[this.id].reset();
					MatchService.roundTimer[this.id].start();
					this.matchStatus = 'round';
					break;
				case 'pausedbreak':

					MatchService.pauseWatch[this.id].reset();
					MatchService.breakTimer[this.id].start();
					this.matchStatus = 'break';
					break;
			}

			this.save();
			
			log.verbose('Pause resume match: ' + this.id + '. Status old: ' + oldStatus + ' now: ' + this.matchStatus);
			return this.matchStatus;
		},

		points: function (player, points) {
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
		},


		changeRound: function (round) {
			if(this.matchStatus === "break" && breakTimer[this.id].ms > breakTimer[this.id].almostDoneMS) {
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

		},

		penalties: function (player, points) {
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
		},

		resetMatch = function () {
			MatchService.createTimers(this);

			MatchService.roundTimer[this.id].reset(this.roundLengthMS);
			this.roundTimeMS = this.roundLengthMS;
			if(io) {
				io.in(this.id).emit('roundtime', {ms:this.roundTimeMS});
			}

			MatchService.breakTimer[this.id].reset(this.breakLengthMS);
			
			this.breakTimeMS = this.breakLengthMS;
			pauseWatch[this.id].reset();

			/*   // we send the whole match in the this.save()
			if(io) {
				io.in(this.id).emit('breaktime', {ms:this.breakTimeMS});
			}
			if(io) {
				io.in(this.id).emit('pausetime', {ms:0});
			}
			*/

			this.round = 1;
			this.player1Points = 0;
			this.player2Points = 0;
			this.player1Penalties = 0;
			this.player2Penalties = 0;
			this.matchStatus = 'pending';
			this.save();
		},

		resetTimer = function () {
			MatchService.createTimers(this);
			switch(this.matchStatus) {
				case 'round':
				case 'pausedround':
					MatchService.roundTimer[this.id].reset();
					MatchService.pauseWatch[this.id].start();
					break;
				case 'break':
				case 'pausedbreak':
					MatchService.breakTimer[this.id].reset();
					MatchService.pauseWatch[this.id].start();
					break;
			}
		},

		getRoundTimer = function () {
			MatchService.createTimers(this);
			return MatchService.roundTimer[this.id];
		},

		getBreakTimer = function () {
			MatchService.createTimers(this);
			return breakTimer[this.id];
		},

		getPauseWatch = function () {
			MatchService.createTimers(this),
			return pauseWatch[this.id];
		},

		registerScore = function(data) {

			///// Used for corner judges only

			var match = this;

			var player = data.player;
			var points = data.points;

			var source = data.source;
			var aggregatePoints = 0;
			
			var id = match.id;
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
			
			// For judge pressed indicators
			Match.message(this.id, {command: 'judge', source:source, player:player, points:points});

		};
	},

	///////// Lifecycle Functions /////////

	beforeValidate: function(values, next) {
		next();
	},


	beforeCreate: function(values, next) {
		if(values.matchStatus === 'pending') {
			values.roundTimeMS = values.roundLengthMS;
			values.breakLengthMS = values.breakLengthMS;
		}
		next();
	},

	beforeUpdate: function(values, next) {
		if(values.matchStatus === 'pending') {
			values.roundTimeMS = values.roundLengthMS;
			values.breakLengthMS = values.breakLengthMS;
		}
		next();
	},

	afterCreate: function(record, next) {
		// Save to memory
		MatchService.matchStore.save(record);
	}

	afterUpdate: function(record, next) {
		// Save to memory
		MatchService.matchStore.save(record);

		// Publish the match update to all subscribed clients
		Match.publishUpdate(record.id, record);
	},





	//////// Collection Methods ///////////
	toString: function() {
		return "[model " + "Match" + "Model]";
	},
    

	pauseResumeMatch: function(id, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.pauseResume();
			cb(null, match);
		});
	},

	resetMatch: function(id, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.resetMatch();
			cb(null, match);
		});
	},


	resetTimer: function(id, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.resetTimer();
			cb(null, match);
		});
	},

	points: function(id, player, points, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.points(player, points);
			cb(null, match);
		});
	},

	changeRound: function(id, value, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.changeRound(value);
			cb(null, match);
		});
	},

	penalties: function(id, player, points, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.penalties(player, points);
			cb(null, match);
		});
	},

	registerScore: function(id, data, cb) {
		Match.findById(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.registerScore(data);
			cb(null, match);
		});
	},

	soundhorn: function(id) {
		Match.message(id, {command:'soundhorn'});
	}

};
