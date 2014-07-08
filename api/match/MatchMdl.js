

var mongoose = require('mongoose');
var mongules = require('mongules');
var timestamps = require('mongoose-timestamp');
var Stopwatch = require('timer-stopwatch');

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
	},
	
	player2Points: {
		type: Number,
	},

	player1Penalies: {
		type: Number,
	},

	player2Penalies: {
		type: Number,
	},

	numberOfRounds: {
		type: Number,
	},

	round: {
		type: Number,
	},

	roundLengthMS: {
		type: Number,
	},

	roundTimeMS: {
		type: Number,
	},

	breakLengthMS: {
		type: Number,
	},

	breakTimeMS: {
		type: Number,
	},

	pauseTime: {
		type: Number,
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

Schema.methods.roundTimer = new Stopwatch(120000);




// hmmmm perhaps not the best design - but allows the model to loaded using require at any time
try {
	var Model = mongoose.model(SchemaName); // Call to return the model from mongoose
} catch (e) {
	var Model = mongoose.model(SchemaName, Schema); // Call to CREATE the model in mongoose
}

module.exports = Model;