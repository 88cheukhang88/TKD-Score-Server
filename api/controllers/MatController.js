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

 
module.exports = {
	pauseResume: function(req, res, next) {
		var id = req.param('id');
		
		Mat.pauseResumeMatch(id, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	points: function(req, res, next) {

		var id = req.param('id');
		var player = req.param('player');
		var points = req.param('points');
		Mat.points(id, player, points, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	changeRound: function(req, res, next) {
		var id = req.param('id');
		var value = req.param('value');
		
		Mat.changeRound(id, value, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	penalties: function(req, res, next) {
		var id = req.param('id');
		var player = req.param('player');
		var points = req.param('points');
		Mat.penalties(id, player, points, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	resetTimer: function(req, res, next) {
		var id = req.param('id');
		Mat.resetTimer(id, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	resetMat: function(req, res, next) {
		var id = req.param('id');

		Mat.resetMatch(id, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	soundHorn: function(req, res, next) {
		var id = req.param('id');
		Mat.soundhorn(id);
	},

	registerScore: function(req, res, next) {
		var id = req.param('id');

		var source = req.session.ident;
		var data = {
			source: source,
			player: req.param('player'),
			target: req.param('target'),
			turning: req.param('turning'),
		};

		Mat.registerScore(id, data, function(err, newData) {
			if(err) {return log.error(err);}


			// For judge pressed indicators
			var judges = newData.mat.getJudgeArray();

			var judge = false;
			_.forEach(judges, function(judgeSource, key) {
				if(judgeSource === source) {
					judge = key + 1;
					return;
				}
			});
			Mat.sendmessage(newData.mat.id, 'judge', {source: newData.source, points: newData.points, target: newData.target, turning: data.turning, player:newData.player, judge: judge});
		});
	},

	registerTurn: function(req, res, next) {
		var id = req.param('id');

		var data = {
			player: req.param('player'),
		};

		Mat.registerTurn(id, data, function(err, newData) {
			if(err) {return log.error(err);}
		});
	},

	registerJudge: function (req, res, next) {

		var identifier = req.session.ident;
		//console.log(identifier);
		
		var id = req.param('id');
		Mat.registerJudge(id, identifier, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	removeJudge: function(req, res, next) {
		var num = req.param('judge');
		var id = req.param('id');
		Mat.removeJudge(id, num, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},

	declareWinner: function(req, res, next) {
		var winner = req.param('winner');
		var id = req.param('id');
		Mat.declareWinner(id, winner, function(err, mat) {
			if(err) {return log.error(err);}
		});
	},
};