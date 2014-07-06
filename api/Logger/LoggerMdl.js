

var mongoose = require('mongoose');
var mongules = require('mongules');
var timestamps = require('mongoose-timestamp');


var Schema = new mongoose.Schema({

	message: {
		type: String,
		required : 'Message is required',
	},
 
	user: 
		{username: {
			//type:  mongoose.Schema.Types.ObjectId,
			type: String,
		}
	}
});
Schema.plugin(timestamps);
Schema.plugin(mongules.validate);


Schema.methods.toString = function() {
	return this.createdAt + ': ' + this.user[0].username + ' ' + this.description;
};

Schema.statics.toString = function() {
	return "[model LoggerModel]";
};


Schema.statics.add = function(sessionUser, message, done) {

	if(!sessionUser) {
		sessionUser = {username:'unknown'};
	}

	var logItem = new this();
	logItem.message = message;
	logItem.user = sessionUser;

	logItem.save(function(err) {
		if(done) {
			if(err) {return done(err);}
			return done(null, logItem);
		} else {
			if(err) {
				throw new Error(err);
			}
		}
		
	});
};



// hmmmm perhaps not the best design - but allows the model to loaded using require at any time
try {
	var Model = mongoose.model('Logger'); // Call to return the model from mongoose
} catch (e) {
	var Model = mongoose.model('Logger', Schema); // Call to CREATE the model in mongoose
}

module.exports = Model;