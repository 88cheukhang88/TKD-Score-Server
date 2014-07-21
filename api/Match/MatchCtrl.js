

var log = require('../../lib/logger.js');


var Collection = this.Collection = require('./MatchMdl.js');
var self = this;



///////////////// DECLARE ROUTE PREFIX ////////////////////////
this.routePrefix = '/match';
///////////////////////////////////////////////////////////////

///////////////// LOAD BLUEPRINT FUNCTIONS ////////////////////
require(__dirname + '/../blueprints/rest_crud.js')(this);
///////////////////////////////////////////////////////////////



this.pauseResumeMatch = function(data, socket) {
	var id = data.id;
	console.log(socket.viewType);
	Collection.pauseResumeMatch(id, function(err, match) {
		if(err) {return log.error(err);}
	});
};

this.points = function(data) {
	var id = data.id;
	var player = data.player;
	var points = data.points;
	Collection.points(id, player, points, function(err, match) {
		if(err) {return log.error(err);}
	});
};

this.changeRound = function(data) {
	var id = data.id;
	var value = data.value;
	var points = data.points;
	Collection.changeRound(id, value, function(err, match) {
		if(err) {return log.error(err);}
	});
};

this.penalties = function(data) {
	var id = data.id;
	var player = data.player;
	var points = data.points;
	Collection.penalties(id, player, points, function(err, match) {
		if(err) {return log.error(err);}
	});
};

this.resetTimer = function(data) {
	var id = data.id;
	Collection.resetTimer(id, function(err, match) {
		if(err) {return log.error(err);}
	});
};

this.resetMatch = function(data) {
	var id = data.id;
	Collection.resetMatch(id, function(err, match) {
		if(err) {return log.error(err);}
	});
};

this.soundHorn = function(data) {
	if(io) {
		io.in(data.id).emit('soundhorn');
	}
};

this.registerScore = function(data) {
	var id = data.id;

	Collection.registerScore(id, data, function(err, match) {
		if(err) {return log.error(err);}
	});
};


/*********************
this.routes = [
	{
		method: 'get',
		url: '/user',
		action: this.find,
	},
OR
	{
		method: 'get',
		url: '/user',
		action: [someMiddleFunction, this.find]
	},
]

These routes can be loaded by the util function - Utils.loadController(app, require('aController.js')
/********************/

this.routes = [
	{
		method: 'get',
		url: this.routePrefix,
		action: this.find,
	},

	{
		method: 'get',
		url: this.routePrefix + '/:id',
		action: this.findId,
	},

	{
		method: 'post',
		url: this.routePrefix,
		action: this.create,
	},

	{
		method: 'put',
		url: this.routePrefix + '/:id',
		action: this.update,
	},

	{
		method: 'delete',
		url: this.routePrefix + '/:id',
		action: this.destroy,
	},

	
	/// match commands
	
	{
		method: 'socket',
		event: 'pauseresume',
		action: this.pauseResumeMatch,
	},
	{
		method: 'socket',
		event: 'points',
		action: this.points,
	},
	{
		method: 'socket',
		event: 'penalties',
		action: this.penalties,
	},
	{
		method: 'socket',
		event: 'changeRound',
		action: this.changeRound,
	},
	{
		method: 'socket',
		event: 'resetTimer',
		action: this.resetTimer,
	},
	{
		method: 'socket',
		event: 'resetMatch',
		action: this.resetMatch,
	},
	{
		method: 'socket',
		event: 'soundhorn',
		action: this.soundHorn,
	},
	{
		method: 'socket',
		event: 'registerscore',
		action: this.registerScore,
	},

];


module.exports = this;




