/*
	This file is part of TKD Score Server.
	Copyright 2015 Mick Crozier

    TKD Score Server is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    TKD Score Server is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with TKD Score Server.  If not, see <http://www.gnu.org/licenses/>.
 */


var scoreBuffer = [];
var scoreTimer = [];

function initScoreBuffer(id) {
	if(!scoreBuffer[id]) {
		scoreBuffer[id] = [];
		scoreBuffer[id][1] = [];
		scoreBuffer[id][2] = [];
	}
}

module.exports = {

	attributes: {

		match: {
	    	collection: 'Match',
	    	via: 'mat',
	    },

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
			defaultsTo: 3,
		},

		pointsHeadTurning: {
			type: 'integer',
			defaultsTo: 4,
		},

		showIndicators: {
			type: 'boolean',
			defaultsTo: false,
		},

		judgeTurning: {
			type: 'boolean',
			defaultsTo: false,
		},

		novice: {
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

		winner: {
			type: 'integer',
			defaultsTo: 0,
		},


		toString: function() {
			return '[mat] ' + this.number;
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

		declareWinner: function(winner, cb) {
			this.winner = winner || 0;
			var winnertext = '';
			switch(winner) {
				case 1:
					winnertext = 'Hong';
					break;
				case 2:
					winnertext = 'Chong';
					break;
				default:
					winnertext = 'None';
			}
			log.mat(this.toString() + ': Winner declared - ' + winnertext);
			this.save(cb);
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

			log.mat(this.toString() = ': Registering Judge ' + identifier + ' into slot ' + judge);
			
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
			MatService.createTimers(this);
			
			var oldStatus = this.matchStatus;
			switch(this.matchStatus) {
				case 'round':
				case 'suddendeath':
					MatService.roundTimer[this.id].stop();
					MatService.pauseWatch[this.id].start();
					this.matchStatus = 'pausedround';
					break;
					
				case 'break': // only pause break if the bell has not sounded. Otherwise start the round
					if (MatService.breakTimer[this.id].ms > MatService.breakTimer[this.id].almostDoneMS) {
						MatService.breakTimer[this.id].stop();
						this.breakTimeMS = MatService.breakTimer[this.id].ms;
						MatService.pauseWatch[this.id].start();
						this.matchStatus = 'pausedbreak';
						break;
					} 	
					/* falls through */
				case '_endbreakearly':	// internal use to force the break to end
				case 'pausedround':
				case 'pending':
					MatService.breakTimer[this.id].reset();
					MatService.pauseWatch[this.id].reset();
					MatService.breakTimer[this.id].reset();
					MatService.roundTimer[this.id].start();
					if(this.round > this.numberOfRounds) {
						this.matchStatus = 'suddendeath';
					} else {
						this.matchStatus = 'round';

					}
					
					break;
				case 'pausedbreak':

					MatService.pauseWatch[this.id].reset();
					MatService.breakTimer[this.id].start();
					this.matchStatus = 'break';
					break;
			}

			this.save(cb);
			//Mat.update(this.id, this.toJSON());
	
			log.verbose('Pause resume mat: ' + this.id + '. Status old: ' + oldStatus + ' now: ' + this.matchStatus);

			
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
				MatService.roundTimer[this.id].stop();
				Mat.completeMatch(this);
			}

			var playerString = (player === 1) ? this.player1 : this.player2;

			log.mat(this.toString() + ': ' + playerString + ' awarded ' + points + ' points');
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
			MatService.createTimers(this);

			MatService.roundTimer[this.id].reset(this.roundLengthMS);
			this.roundTimeMS = this.roundLengthMS;
			
			Mat.sendmessage(this.id, 'roundtime', {ms:this.roundTimeMS});
			

			MatService.breakTimer[this.id].reset(this.breakLengthMS);
			
			this.breakTimeMS = this.breakLengthMS;
			MatService.pauseWatch[this.id].reset();

			/*   // we send the whole mat in the this.save()
			if(io) {
				io.in(this.id).emit('breaktime', {ms:this.breakTimeMS});
			}
			if(io) {
				io.in(this.id).emit('pausetime', {ms:0});
			}
			*/
			log.mat('Reseting Mat ' + this.toString());

			this.round = 1;
			this.player1Points = 0;
			this.player2Points = 0;
			this.player1Penalties = 0;
			this.player2Penalties = 0;
			this.matchStatus = 'pending';
			this.save(cb);
		},

		resetTimer: function (cb) {
			MatService.createTimers(this);
			switch(this.matchStatus) {
				case 'round':
				case 'pausedround':
					MatService.roundTimer[this.id].reset();
					MatService.pauseWatch[this.id].start();
					this.roundTimeMS = MatService.roundTimer[this.id].ms;
					break;
				case 'break':
				case 'pausedbreak':
					MatService.breakTimer[this.id].reset();
					MatService.pauseWatch[this.id].start();
					this.breakTimeMS = MatService.breakTimer[this.id].ms;
					break;
			}
			this.save(cb);
		},

		getRoundTimer: function () {
			MatService.createTimers(this);
			return MatService.roundTimer[this.id];
		},

		getBreakTimer: function () {
			MatService.createTimers(this);
			return breakTimer[this.id];
		},

		getPauseWatch: function () {
			MatService.createTimers(this);
			return pauseWatch[this.id];
		},



		registerTurn: function (data) {
			var mat = this;
			var id = mat.id;
			var player = data.player;

			// just do both for now - bit only if the buffer is in play
			initScoreBuffer(id);

			if(scoreBuffer[id][1].active) {
				scoreBuffer[id][1].turning = true;
			}
			if(scoreBuffer[id][2].active) {
				scoreBuffer[id][2].turning = true;
			}

			
			
		},

		registerScore: function(data) {

			var points_table = [
				{turning: true, target:'head', points: this.pointsHeadTurning},
				{turning: false, target:'head', points: this.pointsHead},
				{turning: true, target:'body', points: this.pointsBodyTurning},
				{turning: false, target:'body', points: this.pointsBody},
			];

			var mat = this;

			var player = data.player;
			var target = data.target;
			var turning = data.turning || false;

			var source = data.source;
			var aggregatePoints = 0;
			
			var id = mat.id;
			var scoreTimeout = mat.scoreTimeout;
			var agree = mat.agree;

			var judges = this.getJudgeArray();
			var judgeIsInList = false;

			_.forEach(judges, function(judge) {
				if(judge === source) {
					judgeIsInList = true;
					return;
				}
			});

			if(!judgeIsInList) {
				log.error('Device ' + source + ' is not registered for mat ' + this.mat);
				return;
			}

			initScoreBuffer(id);

			if(!scoreTimer[id]) {
				scoreTimer[id] = [];
			}


			if(scoreBuffer[id][player].length === 0) { // no score is present (the timer will not be running)
				
				/// Set the timer to add the score and clear the score buffer
				scoreTimer[id][player] = setTimeout(function(){
					

					if(scoreBuffer[id][player].length >= agree) { //if enough judges have scored **** THIS IS NOT THE END - JUDGES MAY STILL VOTE, IT JUST GETS REPROCESSED UNTIL THE TIMER RUNS OUT
						
						var isTurning = false;

						if(mat.judgeTurning) {
							var turningCount = 0;
							_.forEach(scoreBuffer[id][player], function(pointsObj) {
								if(pointsObj.turning) {
									turningCount++;
								}
							}); 
							if(turningCount >= mat.agree) {
								isTurning = true;
							}
						} else {
							isTurning = scoreBuffer[id][player].turning || false;
						}

						var votedPoints = [];
						_.forEach(scoreBuffer[id][player], function(pointsObj) { 
							votedPoints.push(_.result(_.find(points_table, {turning:isTurning, target:pointsObj.target}), 'points'));
						});


						var high = 0;
						var low = 5;
						var scoreCount = [0,0,0,0,0];
						_.forEach(votedPoints, function(points) {
							///// compare scores in buffer - set the lowest and hifgest scores given
							
							low = Math.min(points,low);
							high = Math.max(points,high);
							
							//// how votes for each score (1-4)
							scoreCount[points] += 1;
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

					//mat.points(player, aggregatePoints);
					// CAN'T USE the 'mat' var here - it's the mat from a second ago!
					// Get it from the db again to be sure we are up to date!!!!!
					Mat.points(mat.id,player,aggregatePoints, function(err, updatedMatch) {
						mat = updatedMatch;
					});
					
				}, scoreTimeout);
			}


			var playerString = (player === 1) ? this.player1 : this.player2;
			// Push the score into the vote buffer
			if(!scoreBuffer[id][player].length) { // need to add the first one regeardless
				scoreBuffer[id][player].push({source: source, target: data.target, turning: data.turning});
				scoreBuffer[id][player].active = true;
				log.mat(this.toString() + ': ' + source + ' voted ' + playerString + ' ' + data.target + ' turning ' + data.turning);
			
			} else {
				//Check if the source already exist in array? if not, add the data
				var alreadyGotIt = false;
				

			
				if(_.find(scoreBuffer[id][player], {source:source})) {
					alreadyGotIt = true;
				}
					
				// if the judge has not already cast a vote - add this judges score to the buffer
				if(!alreadyGotIt) {
					scoreBuffer[id][player].push({source: source, target: data.target, turning: data.turning});
				
				 	log.mat(this.toString() + ': ' + source + ' voted ' + playerString + ' ' + data.target + ' turning ' + data.turning);
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
			Mat.find({ 
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
			MatService.matchStore.save(record);
		}
		*/
		next();
	},

	afterUpdate: function(record, next) {
		// Save to memory
		/*
		if(record.matchStatus !== 'complete') {
			MatService.matchStore.save(record);
		}
		*/
		// Publish the mat update to all subscribed clients
		Mat.publishUpdate(record.id, record);
		next();
	},





	//////// Collection Methods ///////////
	toString: function() {
		return "[model " + "Mat" + "Model]";
	},
    

	pauseResumeMatch: function(id, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.pauseResume(cb); 
		});
	},

	resetMatch: function(id, cb) {

		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.resetMatch(cb);
		});
	},


	resetTimer: function(id, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.resetTimer(cb);
		});
	},

	points: function(id, player, points, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.points(player, points, cb);
		});
	},

	changeRound: function(id, value, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.changeRound(value, cb);
		});
	},

	penalties: function(id, player, points, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.penalties(player, points, cb);
		});
	},

	registerScore: function(id, data, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			var newData = mat.registerScore(data);
			newData.mat = mat;
			cb(null, newData);
		});
	},

	registerTurn: function(id, data, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.registerTurn(data);
			cb(null, {});
		});
	},

	completeMatch: function(mat) {
		mat.matchStatus = 'complete';
		//mat.roundTimeMS = MatService.roundTimer[mat.id];
		//mat.breakTimeMS = MatService.breakTimer[mat.id];
		////// TODO - REMOVE MATCH FROM MEMORY ********//
		//MatService.matchStore.remove(mat.id);
	},

	soundhorn: function(id) {
		this.sendmessage(id, 'soundhorn');
	},

	sendmessage: function(mat, event, data) {
		var id = null;
		if(typeof mat === 'number') {
			id = mat;
		} else {
			id = mat.id;
		}
		var data = data || {};
		var room = 'sails_model_mat_' + id + ':message';
		data.id = id;
		sails.log.silly('Published data to ' + room + ' Event: ' + event, data);
		sails.sockets.broadcast(room, event, data);
	},

	registerJudge: function(id, indentifier, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.registerJudge(indentifier, cb);
		});
	},



	removeJudge: function(id, num, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.removeJudge(num, cb);
		});
	},

	declareWinner: function(id, winner, cb) {
		Mat.findOne(id, function(err, mat) {
			if(err) {return cb(err);}
			if(!mat) {return cb(null, null);}

			mat.declareWinner(winner, cb);
		});
	}



};
