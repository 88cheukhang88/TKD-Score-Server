

var log = require('../../lib/logger.js');


var Collection = this.Collection = require('./MatchMdl.js');
var self = this;



///////////////// DECLARE ROUTE PREFIX ////////////////////////
this.routePrefix = '/match';
///////////////////////////////////////////////////////////////

///////////////// LOAD BLUEPRINT FUNCTIONS ////////////////////
require(__dirname + '/../blueprints/rest_crud.js')(this);
///////////////////////////////////////////////////////////////


this.pauseResumeMatch = function (req, res, next) {
	var id = req.params.id;
	Collection.pauseResumeMatch(id, function(err, match) {	
		if(err) {return next(err);}
		if(!match) {return res.notFound('Could not find match');} 		
		res.ok(match);
	});
};

this.socketPauseResumeMatch = function(data) {
	var id = data.id;
	Collection.pauseResumeMatch(id, function(err, match) {
		if(err) {return log.error(err);}
	});
};








// override blueprint
this.findId = function findId(req, res, next) {


	Collection.findById(req.params.id, function(err, match) {
		if(err) {return next(err);}
		if(!match) {return res.notFound('Could not find item');}

		match.getRoundTimer().on('time', function sendTime(time) {
	    	io.in(match._id + "").emit('roundtime', time);
	    });
	    match.getRoundTimer().on('done', function sendTime(time) {
	    	io.in(match._id + "").emit('done');
	    });

	    match.getBreakTimer().on('time', function sendTime() {
	    	io.in(match._id + "").emit('breaktime', time);
	    });
	    match.getBreakTimer().on('almostdone', function sendTime() {
	    	io.in(match._id + "").emit('almostdone');
	    });

	    match.getPauseWatch().on('time', function sendTime(time) {
	    	io.in(match._id + "").emit('pausetime', time);
	    });
		res.ok(match);
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
		method: 'get',
		url: this.routePrefix + '/:id/pauseresume',
		action: this.pauseResumeMatch,
	},
	{
		method: 'socket',
		event: 'pauseresume',
		action: this.socketPauseResumeMatch,
	},
];


module.exports = this;