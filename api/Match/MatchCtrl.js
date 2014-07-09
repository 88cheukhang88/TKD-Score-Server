

var log = require('../../lib/logger.js');
var Stopwatch = require('timer-stopwatch');

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


this.pauseResumeMatch = function pauseResumeMatch(req, res, next) {
	//log.silly(req.ip + ' has requested user id ' + req.params.id);
	var search = {};
	var id = req.params.id;

	self._getMatchById(id, function(err, match) {
		if(err) {return next(err);}
		if(!match) {return res.notFound('Could not find match');} 
		console.log('pause resume match: ' + match._id);
		
		self._pauseResumeMatch(match);
		res.ok(match);
	});
};	

this._pauseResumeMatch = function _pauseResumeMatch(match) {
	if(!roundTimer[match._id]) {
		_createTimers(match);
	}

	switch(match.matchStatus) {
		case 'round':
			roundTimer[match._id].stop();
			pauseWatch[match._id].start();
			match.matchStatus = 'pausedround';
			break;
		case 'break':
			roundTimer[match._id].stop();
			pauseWatch[match._id].start();
			match.matchStatus = 'pausedbreak';
			break;
		case 'pausedround':
		case 'pending':
			pauseWatch[match._id].stop();
			roundTimer[match._id].start();
			match.matchStatus = 'round';
			break;
		case 'pausedbreak':
			pauseWatch[match._id].stop();
			breakTimer[match._id].start();
			match.matchStatus = 'break';
			break;
	}
	match.save();
	return match.matchStatus;
};	


this._getMatchById = function _getMatchById(id, cb) {
	var search = {
		_id: id
	};

	Collection.findOne(search, function(err, match) {
		if(err) {return cb(err);}
		if(!match) {return cb(null, false);}
		

		if(!roundTimer[id]) {
			_createTimers(match);
		}

		roundTimer[id].on('time', function(time) {
	    	io.emit('time', time);
	    });

		cb(null, match);
	});
};

this._getRoundTimerMS = function _getRoundTimerMS(match) {
	if(!roundTimer[match._id]) {_createTimers(match);}
	return roundTimer[match._id].ms;
};

this._getBreakTimerMS = function _getBreakTimerMS(match) {
	if(!roundTimer[match._id]) {_createTimers(match);}
	return breakTimer[match._id].ms;
};

this._getPauseWatchMS = function _getPauseWatchMS(match) {
	if(!roundTimer[match._id]) {_createTimers(match);}
	return pauseWatch[match._id].ms;
};

var _createTimers = function _createTimers(match) {
	var id = match._id;
	roundTimer[id] = new Stopwatch(match.roundTimeMS);
	breakTimer[id] = new Stopwatch(match.breakTimeMS);
	pauseWatch[id] = new Stopwatch();
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