module.exports = {
	pauseResume: function(req, res, next) {
		var id = req.param('id');
		
		Match.pauseResumeMatch(id, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	points: function(req, res, next) {

		var id = req.param('id');
		var player = req.param('player');
		var points = req.param('points');
		Match.points(id, player, points, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	changeRound: function(req, res, next) {
		var id = req.param('id');
		var value = req.param('value');
		
		Match.changeRound(id, value, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	penalties: function(req, res, next) {
		var id = req.param('id');
		var player = req.param('player');
		var points = req.param('points');
		Match.penalties(id, player, points, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	resetTimer: function(req, res, next) {
		var id = req.param('id');
		Match.resetTimer(id, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	resetMatch: function(req, res, next) {
		var id = req.param('id');

		Match.resetMatch(id, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	soundHorn: function(req, res, next) {
		var id = req.param('id');
		Match.soundhorn(id);
	},

	registerScore: function(req, res, next) {
		var id = req.param('id');

		Match.registerScore(id, data, function(err, match) {
			if(err) {return log.error(err);}
		});
	},
};