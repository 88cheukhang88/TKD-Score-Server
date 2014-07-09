

var mongoose = require('mongoose');
var mongules = require('mongules');
var timestamps = require('mongoose-timestamp');

var SchemaName = "Match";
var Schema = new mongoose.Schema({

	player1: {
		type: String,
	},
 
	player2: {
		type: String,
	},

	player1Points: {
		type: Number,
		default: 0,
	},
	
	player2Points: {
		type: Number,
		default: 0,
	},

	player1Penalies: {
		type: Number,
		default: 0,
	},

	player2Penalies: {
		type: Number,
		default: 0,
	},

	numberOfRounds: {
		type: Number,
		default: 3,
	},

	round: {
		type: Number,
		default: 1,
	},

	roundLengthMS: {
		type: Number,
		default: 120000,
	},

	roundTimeMS: {
		type: Number,
		default: 120000,
	},

	breakLengthMS: {
		type: Number,
		default: 60000,
	},

	breakTimeMS: {
		type: Number,
		default: 60000,
	},

	pauseTime: {
		type: Number,
		default: 0,
	},

	matchStatus: {
		type: String, // round, break, pending, complete, pausedround, pausedbreak 
		default: 'pending',
	},






});
Schema.plugin(timestamps);
Schema.plugin(mongules.validate);








Schema.methods.toString = function() {
	return '[match] ' + this.player1 + ' vs. ' + this.player2;
};

Schema.statics.toString = function() {
	return "[model " + SchemaName + "Model]";
};



// hmmmm perhaps not the best design - but allows the model to loaded using require at any time
try {
	var Model = mongoose.model(SchemaName); // Call to return the model from mongoose
} catch (e) {
	var Model = mongoose.model(SchemaName, Schema); // Call to CREATE the model in mongoose
}

module.exports = Model;