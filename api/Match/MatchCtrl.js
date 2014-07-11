

var log = require('../../lib/logger.js');


var Collection = this.Collection = require('./MatchMdl.js');
var self = this;



///////////////// DECLARE ROUTE PREFIX ////////////////////////
this.routePrefix = '/match';
///////////////////////////////////////////////////////////////

///////////////// LOAD BLUEPRINT FUNCTIONS ////////////////////
require(__dirname + '/../blueprints/rest_crud.js')(this);
///////////////////////////////////////////////////////////////



var roundTimer = [];
var breakTimer = [];
var pauseWatch = [];
// Should extract these with their functionality into a secondary collection.
// no wait - add these to the MatchCollection but outside of mongoose.
// Then use mongoose methods to load the timers if not already (as in code below)



this.pauseResumeMatch = function pauseResumeMatch(req, res, next) {
	//log.silly(req.ip + ' has requested user id ' + req.params.id);
	var search = {};
	var id = req.params.id;

	self._getMatchById(id, function(err, match) {
		if(err) {return next(err);}
		if(!match) {return res.notFound('Could not find match');} 
		console.log('pause resume match: ' + match._id);
		
		match.pauseResumeMatch(match);
		res.ok(match);
	});
};	




this._getMatchById = function _getMatchById(id, cb) {
	var search = {
		_id: id
	};

	Collection.findOne(search, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, false);}
		


		match.getRoundTimer().on('time', function(time) {
	    	io.in(match._id + "").emit('time', time);
	    });

		cb(null, match);
	});
};







// override blueprint
this.findId = function findId(req, res, next) {
	//log.silly(req.ip + ' has requested user id ' + req.params.id);
	var search = {};
	var id = req.params.id;
	self._getMatchById(id, function(err, match) { 
		if(err) {return next(err);}
		if(!match) {return res.notFound('Could not find item');}

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
];


module.exports = this;