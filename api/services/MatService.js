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

 
/*
	//////////////////////////////
	// matchStore will hold an in memory copy of the matches. This is important for time sensitive events - such as timer done events.
	// matchStore is updated by the 'afterUpdate' lifecycle.
	//////////////////////////////

	var matchStore = [];
	matchStore.save = function(mat) {
		this[mat.id] = mat;
	};
	matchStore.get = function(id) {
		return this[id];
	};
	matchStore.remove = function(id) {
		delete(this[id]);
	};
*/

	/////////////////////////////////////////////
	// Timer managment
	//
	// The timers cannot be stored by database. 
	// They are memory only and need to be created on demand
	/////////////////////////////////////////////

	var Stopwatch = require('timer-stopwatch');

	var roundTimer = [];
	var breakTimer = [];
	var pauseWatch = [];

	function createTimers(mat) {
		if(roundTimer[mat.id]) {return;}

		roundTimer[mat.id] = new Stopwatch(mat.roundLengthMS);
		roundTimer[mat.id].ms = mat.roundTimeMS;
		breakTimer[mat.id] = new Stopwatch(mat.breakLengthMS);
		breakTimer[mat.id].ms = mat.breakTimeMS;
		pauseWatch[mat.id] = new Stopwatch();


		roundTimer[mat.id].on('time', function (time) {
	    	//io.in(mat.id + "").emit('roundtime', time);
	    	//Mat.message(mat.id, {command:'roundtime', ms:time});
	    	Mat.sendmessage(mat, 'roundtime', time);
	    });

	    roundTimer[mat.id].on('done', function () {
	    	//io.in(mat.id + "").emit('soundhorn');
	    	Mat.soundhorn(mat.id);
	    });

	    breakTimer[mat.id].on('time', function (time) {
	    	//io.in(mat.id + "").emit('breaktime', time);
	    	Mat.sendmessage(mat, 'breaktime', time);
	    	//Mat.message(mat.id, {command:'breaktime', ms:time});
	    });

	    breakTimer[mat.id].on('almostdone', function () {
	    	//io.in(mat.id + "").emit('soundhorn');

	    	Mat.soundhorn(mat.id);
	    });

	    pauseWatch[mat.id].on('time', function (time) {
	    	//io.in(mat.id + "").emit('pausetime', time);
	    	Mat.sendmessage(mat, 'pausetime', time);
	    	//Mat.message(mat.id, {command:'pausetime', ms:time});

	    	//if(time.ms > 120000) {
	    		// STOP AFTER 2 MINUTES
	    		// !!!!!!!!!!!!!!!!!!REMOVE FOR PRODUCTION!!!!!!!!!!!!!!!!!!!!!!
	    	//	pauseWatch[mat.id].stop();
	    	//}
	    });
		


		// Timer automation //

		roundTimer[mat.id].on('done', function() {

			//var updatedMatch = matchStore.get(mat.id); // get updated mat data from memory
			Mat.findOne(mat.id).exec(function(err, updatedMatch) {

				var oldStatus = updatedMatch.matchStatus;
				if(updatedMatch.round < updatedMatch.numberOfRounds) {
					// break
					roundTimer[updatedMatch.id].reset();
					breakTimer[updatedMatch.id].start();
					updatedMatch.matchStatus = 'break';
					updatedMatch.round = updatedMatch.round + 1;
					//Mat.changeRound(updatedMatch.id, updatedMatch.round + 1);
					
					log.mat('Round Done: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
				} 
				else if (updatedMatch.round === updatedMatch.numberOfRounds) {
					if(updatedMatch.player1Points === updatedMatch.player2Points) {
						// sudden death
						updatedMatch.player1Points = 0;
						updatedMatch.player2Points = 0;
						roundTimer[mat.id].reset();
						breakTimer[mat.id].start();
						updatedMatch.matchStatus = 'break';
						updatedMatch.round = updatedMatch.round + 1;
						log.mat('Round Done - going sudden death: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
						
					} else {
						// End of match after sudden death
						
						Mat.completeMatch(updatedMatch);
						log.mat('Mat Done: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
						
					}
				}
				else {
					// no more rounds - end
					Mat.completeMatch(updatedMatch);
					log.mat('Mat Done: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
					
					
				}
				//console.log('updating mat:', updatedMatch);
				
				Mat.update(updatedMatch.id, updatedMatch).exec(function(err, returnedMatch) {
					if(err) {throw new Error(err);}
					//console.log('RETURNED MATCH', returnedMatch);
				});
		
			});
		});	
			

		breakTimer[mat.id].on('done', function() {
			//var updatedMatch = matchStore.get(mat.id); // get updated mat data from memory
			Mat.findOne(mat.id).exec(function(err, updatedMatch) {

			//if(mat.round <= mat.numberOfRounds) {
				// Pause round clock waiting for operator input
				pauseWatch[updatedMatch.id].start();
				updatedMatch.matchStatus = 'pausedround';
				Mat.update(updatedMatch.id, updatedMatch);
				
			//} 
			});
	
		});
	}

	
	
	module.exports = {
		//matchStore: matchStore,
		roundTimer: roundTimer,
		breakTimer: breakTimer,
		pauseWatch: pauseWatch,

		createTimers: createTimers,

	};
