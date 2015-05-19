var scoreBuffer = [];
var scoreTimer = [];

module.exports = {

	attributes: {

		number: {
			type: 'integer',
		},

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

		agree: {
			type: 'integer',
			defaultsTo: 2,
		},

		scoreTimeout: {
			type: 'integer',
			defaultsTo: 1000,
		},

		pointsBody: {
			type: 'integer',
			defaultsTo: 1,
		},

		pointsBodyTurning: {
			type: 'integer',
			defaultsTo: 3,
		},

		pointsHead: {
			type: 'integer',
			defaultsTo: 4,
		},

		pointsHeadTurning: {
			type: 'integer',
			defaultsTo: 5,
		},

		showIndicators: {
			type: 'boolean',
			defaultsTo: false,
		},

		judge1: {
			type: 'string',
		},

		judge2: {
			type: 'string',
		},

		judge3: {
			type: 'string',
		},

		judge4: {
			type: 'string',
		},


		toString: function() {
			return '[match] ' + this.player1 + ' vs. ' + this.player2;
		},

		getJudgeArray: function() {
			var judges = [
				this.judge1,
				this.judge2,
				this.judge3,
				this.judge4,
			];
			return judges;
		},


		registerJudge: function(identifier, cb) {
			// For judge pressed indicators
			var judges = [
				this.judge1,
				this.judge2,
				this.judge3,
				this.judge4,
			];

			var judge = false;
			var noJudge = false;
			_.forEachRight(judges, function(judgeSource, key) {
				if(judgeSource === identifier) {
					judge = false;
					noJudge = true;
					return;
				}

				if(!judgeSource && !noJudge) {
					judge = key + 1;
				}
			});

			log.match('Registering Judge ' + identifier + ' into slot ' + judge);
			
			if(judge !== false) {
			
				switch(judge) {
					case 1:
						this.judge1 = identifier;
						break;
					case 2:
						this.judge2 = identifier;
						break;
					case 3:
						this.judge3 = identifier;
						break;
					case 4:
						this.judge4 = identifier;
						break;
				}
				this.save(cb);
			}
		},

		removeJudge: function(num, cb) {
			switch(num) {
				case 1:
					this.judge1 = "";
					break;
				case 2:
					this.judge2 = "";
					break;
				case 3:
					this.judge3 = "";
					break;
				case 4:
					this.judge4 = "";
					break;
			}
			this.save(cb);
		},



		pauseResume: function (cb) {
			MatchService.createTimers(this);
			
			var oldStatus = this.matchStatus;
			switch(this.matchStatus) {
				case 'round':
				case 'suddendeath':
					MatchService.roundTimer[this.id].stop();
					MatchService.pauseWatch[this.id].start();
					this.matchStatus = 'pausedround';
					break;
					
				case 'break': // only pause break if the bell has not sounded. Otherwise start the round
					if (MatchService.breakTimer[this.id].ms > MatchService.breakTimer[this.id].almostDoneMS) {
						MatchService.breakTimer[this.id].stop();
						this.breakTimeMS = MatchService.breakTimer[this.id].ms;
						MatchService.pauseWatch[this.id].start();
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
					if(this.round > this.numberOfRounds) {
						this.matchStatus = 'suddendeath';
					} else {
						this.matchStatus = 'round';

					}
					
					break;
				case 'pausedbreak':

					MatchService.pauseWatch[this.id].reset();
					MatchService.breakTimer[this.id].start();
					this.matchStatus = 'break';
					break;
			}

			this.save(cb);
			//Match.update(this.id, this.toJSON());
	
			log.verbose('Pause resume match: ' + this.id + '. Status old: ' + oldStatus + ' now: ' + this.matchStatus);

			
		},

		points: function (player, points, cb) {
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

			if(this.round > this.numberOfRounds) { // is sudden death
				MatchService.roundTimer[this.id].stop();
				Match.completeMatch(this);
			}

			var playerString = (player === 1) ? this.player1 : this.player2;

			log.match(this.toString() + ': ' + playerString + ' awarded ' + points + ' points');
			this.save(cb);
		},


		changeRound: function (round, cb) {
			if(this.matchStatus === "break" && breakTimer[this.id].ms > breakTimer[this.id].almostDoneMS) {
				this.matchStatus = '_endbreakearly';
				this.pauseResume();
			} else {
				if(round > this.numberOfRounds + 1) {
					round = this.numberOfRounds + 1;
				}

				if(round < 1 || typeof round !== 'number') {
					round = 1;
				}

				this.round = round;
				this.save(cb);
			}

		},

		penalties: function (player, penalties, cb) {
			var opposingPlayerPoints = 0;
			var playerPenalties = 0;
			if(player === 1) {
				opposingPlayerPoints = this.player2Points;
				playerPenalties = this.player1Penalties;
			} else {
				opposingPlayerPoints = this.player1Points;
				playerPenalties = this.player2Penalties;
			}

	
			// Remove the opposingExtraPoints already paid
			var opposingExtraPoints = Math.floor(playerPenalties / 2);
			opposingPlayerPoints = opposingPlayerPoints - opposingExtraPoints;

		

			playerPenalties += penalties;
			if (playerPenalties < 0) {playerPenalties = 0;}
			if (playerPenalties > 8) {playerPenalties = 8;}


			// Add the newly calculated opposing extra points
			opposingExtraPoints = Math.floor(playerPenalties / 2);
			opposingPlayerPoints += opposingExtraPoints;
		

			if(player === 1) {
				this.player2Points = opposingPlayerPoints;
				this.player1Penalties = playerPenalties;
			} else {
				this.player1Points = opposingPlayerPoints;
				this.player2Penalties = playerPenalties;
			}
			this.save(cb);
		},

		resetMatch: function (cb) {
			MatchService.createTimers(this);

			MatchService.roundTimer[this.id].reset(this.roundLengthMS);
			this.roundTimeMS = this.roundLengthMS;
			
			Match.sendmessage(this.id, 'roundtime', {ms:this.roundTimeMS});
			

			MatchService.breakTimer[this.id].reset(this.breakLengthMS);
			
			this.breakTimeMS = this.breakLengthMS;
			MatchService.pauseWatch[this.id].reset();

			/*   // we send the whole match in the this.save()
			if(io) {
				io.in(this.id).emit('breaktime', {ms:this.breakTimeMS});
			}
			if(io) {
				io.in(this.id).emit('pausetime', {ms:0});
			}
			*/
			log.match('Reseting Match ' + this.toString());

			this.round = 1;
			this.player1Points = 0;
			this.player2Points = 0;
			this.player1Penalties = 0;
			this.player2Penalties = 0;
			this.matchStatus = 'pending';
			this.save(cb);
		},

		resetTimer: function (cb) {
			MatchService.createTimers(this);
			switch(this.matchStatus) {
				case 'round':
				case 'pausedround':
					MatchService.roundTimer[this.id].reset();
					MatchService.pauseWatch[this.id].start();
					this.roundTimeMS = MatchService.roundTimer[this.id].ms;
					break;
				case 'break':
				case 'pausedbreak':
					MatchService.breakTimer[this.id].reset();
					MatchService.pauseWatch[this.id].start();
					this.breakTimeMS = MatchService.breakTimer[this.id].ms;
					break;
			}
			this.save(cb);
		},

		getRoundTimer: function () {
			MatchService.createTimers(this);
			return MatchService.roundTimer[this.id];
		},

		getBreakTimer: function () {
			MatchService.createTimers(this);
			return breakTimer[this.id];
		},

		getPauseWatch: function () {
			MatchService.createTimers(this);
			return pauseWatch[this.id];
		},

		registerScore: function(data) {

			

			var points_table = [
				{turning: true, target:'head', points: this.pointsHeadTurning},
				{turning: false, target:'head', points: this.pointsHead},
				{turning: true, target:'body', points: this.pointsBodyTurning},
				{turning: false, target:'body', points: this.pointsBody},
			];

			var match = this;

			var player = data.player;
			var target = data.target;
			var turning = data.turning || false;

			var points = _.result(_.find(points_table, {turning:turning, target:target}), 'points');
			data.points = points;
			var source = data.source;
			var aggregatePoints = 0;
			
			var id = match.id;
			var scoreTimeout = match.scoreTimeout;
			var agree = match.agree;

			var judges = this.getJudgeArray();
			var judgeIsInList = false;

			_.forEach(judges, function(judge) {
				if(judge === source) {
					judgeIsInList = true;
					return;
				}
			});

			if(!judgeIsInList) {
				log.error('Device ' + source + ' is not registered for match ' + this.match);
				return;
			}

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
						var low = 5;
						var scoreCount = [0,0,0,0,0];
						_.forEach(scoreBuffer[id][player], function(pointsObj) {
							///// compare scores in buffer - set the lowest and hifgest scores given
							
							low = Math.min(pointsObj.points,low);
							high = Math.max(pointsObj.points,high);
							
							//// how votes for each score (1-4)
							scoreCount[pointsObj.points] += 1;
						});
						
						/// Set the score to be awarded as the lowest value given (just in case they don't all agree - but enough have voted at least 1 point
						aggregatePoints = low;
						


						// Check the score count - if a score has enough votes set it as the score to be awarded
						_.forEach(scoreCount, function(count, points) {
							if(count >= agree && points > aggregatePoints) {
								aggregatePoints = points;
							}
						});

						
					}
					

					scoreBuffer[id][player] = [];

					//match.points(player, aggregatePoints);
					// CAN'T USE the 'match' var here - it's the match from a second ago!
					// Get it from the db again to be sure we are up to date!!!!!
					Match.points(match.id,player,aggregatePoints, function(err, updatedMatch) {
						match = updatedMatch;
					});
					
				}, scoreTimeout);
			}


			var playerString = (player === 1) ? this.player1 : this.player2;
			// Push the score into the vote buffer
			if(!scoreBuffer[id][player].length) { // need to add the first one regeardless
				scoreBuffer[id][player].push({source: source, points: points});
				
				log.match(this.toString() + ': ' + source + ' voted ' + playerString + ' ' + points + ' points');
			
			} else {
				//Check if the source already exist in array? if not, add the data
				var alreadyGotIt = false;
				

			
				if(_.find(scoreBuffer[id][player], {source:source})) {
					alreadyGotIt = true;
				}
					
				// if the judge has not already cast a vote - add this judges score to the buffer
				if(!alreadyGotIt) {
					scoreBuffer[id][player].push({source: source, points: points});
				
				 	log.match(this.toString() + ': ' + source + ' voted ' + playerString + ' ' + points + ' points');
				}
			}
			return data; // Return modified data... namely adds the points property
			

		}
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

		if(!values.number) {
			// find the highest 'number' and make it the next highest by default
			Match.find({ 
				where: { /* need to find parent id when implemented */ },  
				limit: 1,
				sort: 'number DESC',
			}, function(err, found) {
				if(err) {return next(err);}
				if(found.length < 1) {
					values.number = 1;
				} else {
					values.number = parseInt(found[0].number + 1);
				}
				return next();
			});
		} else {
			
			return next();
		}


		//next();
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
		/*
		if(record.matchStatus !== 'complete') {
			MatchService.matchStore.save(record);
		}
		*/
		next();
	},

	afterUpdate: function(record, next) {
		// Save to memory
		/*
		if(record.matchStatus !== 'complete') {
			MatchService.matchStore.save(record);
		}
		*/
		// Publish the match update to all subscribed clients
		Match.publishUpdate(record.id, record);
		next();
	},





	//////// Collection Methods ///////////
	toString: function() {
		return "[model " + "Match" + "Model]";
	},
    

	pauseResumeMatch: function(id, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.pauseResume(cb); 
		});
	},

	resetMatch: function(id, cb) {

		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.resetMatch(cb);
		});
	},


	resetTimer: function(id, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.resetTimer(cb);
		});
	},

	points: function(id, player, points, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.points(player, points, cb);
		});
	},

	changeRound: function(id, value, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.changeRound(value, cb);
		});
	},

	penalties: function(id, player, points, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.penalties(player, points, cb);
		});
	},

	registerScore: function(id, data, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			var newData = match.registerScore(data);
			newData.match = match;
			cb(null, newData);
		});
	},

	completeMatch: function(match) {
		match.matchStatus = 'complete';
		//match.roundTimeMS = MatchService.roundTimer[match.id];
		//match.breakTimeMS = MatchService.breakTimer[match.id];
		////// TODO - REMOVE MATCH FROM MEMORY ********//
		//MatchService.matchStore.remove(match.id);
	},

	soundhorn: function(id) {
		this.sendmessage(id, 'soundhorn');
	},

	sendmessage: function(match, event, data) {
		var id = null;
		if(typeof match === 'number') {
			id = match;
		} else {
			id = match.id;
		}
		var room = 'sails_model_match_' + id + ':message';
		sails.log.silly('Published data to ' + room + ' Event: ' + event, data);
		sails.sockets.broadcast(room, event, data);
	},

	registerJudge: function(id, indentifier, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.registerJudge(indentifier, cb);
		});
	},

	removeJudge: function(id, num, cb) {
		Match.findOne(id, function(err, match) {
			if(err) {return cb(err);}
			if(!match) {return cb(null, null);}

			match.removeJudge(num, cb);
		});
	},



};
