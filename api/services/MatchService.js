

	//////////////////////////////
	// matchStore will hold an in memory copy of the matches. This is important for time sensitive events - such as timer done events.
	// matchStore is updated by the 'afterUpdate' lifecycle.
	//////////////////////////////

	var matchStore = [];
	matchStore.save = function(match) {
		this[match.id] = match;
	};
	matchStore.get = function(id) {
		return this[id];
	};
	matchStore.remove = function(id) {
		delete(this[id]);
	};


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

	function createTimers(match) {
		if(roundTimer[match.id]) {return;}

		roundTimer[match.id] = new Stopwatch(match.roundLengthMS);
		roundTimer[match.id].ms = match.roundTimeMS;
		breakTimer[match.id] = new Stopwatch(match.breakLengthMS);
		breakTimer[match.id].ms = match.breakTimeMS;
		pauseWatch[match.id] = new Stopwatch();


		roundTimer[match.id].on('time', function (time) {
	    	//io.in(match.id + "").emit('roundtime', time);
	    	//Match.message(match.id, {command:'roundtime', ms:time});
	    	Match.sendmessage(match, 'roundtime', time);
	    });

	    roundTimer[match.id].on('done', function () {
	    	//io.in(match.id + "").emit('soundhorn');
	    	Match.soundhorn(match.id);
	    });

	    breakTimer[match.id].on('time', function (time) {
	    	//io.in(match.id + "").emit('breaktime', time);
	    	Match.sendmessage(match, 'breaktime', time);
	    	//Match.message(match.id, {command:'breaktime', ms:time});
	    });

	    breakTimer[match.id].on('almostdone', function () {
	    	//io.in(match.id + "").emit('soundhorn');

	    	Match.soundhorn(match.id);
	    });

	    pauseWatch[match.id].on('time', function (time) {
	    	//io.in(match.id + "").emit('pausetime', time);
	    	Match.sendmessage(match, 'pausetime', time);
	    	//Match.message(match.id, {command:'pausetime', ms:time});

	    	//if(time.ms > 120000) {
	    		// STOP AFTER 2 MINUTES
	    		// !!!!!!!!!!!!!!!!!!REMOVE FOR PRODUCTION!!!!!!!!!!!!!!!!!!!!!!
	    	//	pauseWatch[match.id].stop();
	    	//}
	    });
		


		// Timer automation //

		roundTimer[match.id].on('done', function() {

			var updatedMatch = matchStore.get(match.id); // get updated match data from memory
			
			
				var oldStatus = updatedMatch.matchStatus;
				if(updatedMatch.round < updatedMatch.numberOfRounds) {
					// break
					roundTimer[updatedMatch.id].reset();
					breakTimer[updatedMatch.id].start();
					updatedMatch.matchStatus = 'break';
					updatedMatch.round = updatedMatch.round + 1;
					//Match.changeRound(updatedMatch.id, updatedMatch.round + 1);
					console.log('ABOUT TO SAVE NEW ROUND', updatedMatch.round);
					
					log.verbose('Round Done: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
				} 
				else if (updatedMatch.round === updatedMatch.numberOfRounds) {
					if(updatedMatch.player1Points === updatedMatch.player2Points) {
						// sudden death
						updatedMatch.player1Points = 0;
						updatedMatch.player2Points = 0;
						roundTimer[match.id].reset();
						breakTimer[match.id].start();
						updatedMatch.matchStatus = 'break';
						updatedMatch.round = updatedMatch.round + 1;
						log.verbose('Round Done - going sudden death: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
						
					} else {
						// End of match
						updatedMatch.matchStatus = 'complete';
						log.verbose('Match Done: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
						
					}
				}
				else {
					updatedMatch.matchStatus = 'complete';
					log.verbose('Match Done: ' + updatedMatch.id + '. Status old: ' + oldStatus + ' now: ' + updatedMatch.matchStatus);
					
					
				}
				//console.log('updating match:', updatedMatch);
				
				Match.update(updatedMatch.id, updatedMatch).exec(function(err, returnedMatch) {
					if(err) {throw new Error(err);}
					//console.log('RETURNED MATCH', returnedMatch);
				});
		
			
		});	
			

		breakTimer[match.id].on('done', function() {
			var updatedMatch = matchStore.get(match.id); // get updated match data from memory
			
			//if(match.round <= match.numberOfRounds) {
				// Pause round clock waiting for operator input
				pauseWatch[updatedMatch.id].start();
				updatedMatch.matchStatus = 'pausedround';
				Match.update(updatedMatch.id, updatedMatch);
				
			//} 
	
		});
	}

	
	
	module.exports = {
		matchStore: matchStore,
		roundTimer: roundTimer,
		breakTimer: breakTimer,
		pauseWatch: pauseWatch,

		createTimers: createTimers,

	};
