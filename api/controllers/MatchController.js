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

		var source = req.session.id;
		var data = {
			source: source,
			player: req.param('player'),
			target: req.param('target'),
			turning: req.param('turning'),
		};

		Match.registerScore(id, data, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	registerJudge: function (req, res, next) {
		var identifier = req.session.id;
		console.log(identifier);
		var id = req.param('id');
		Match.registerJudge(id, identifier, function(err, match) {
			if(err) {return log.error(err);}
		});
	},

	removeJudge: function(req, res, next) {
		var num = req.param('judge');
		var id = req.param('id');
		Match.removeJudge(id, num, function(err, match) {
			if(err) {return log.error(err);}
		});
	},
};