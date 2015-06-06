

module.exports = {

	attributes: {

		mat: {
	    	model: 'Mat',
	    },

		number: {
			type: 'integer',
		},

		player1: {
			type: 'string',
			defaultsTo: 'Hong',
		},

		player2: {
			type: 'string',
			defaultsTo: 'Chong',
		},

		player1Points: {
			type: 'integer',
			defaultsTo: 0,
		},

		player2Points: {
			type: 'integer',
			defaultsTo: 0,
		},

		player1Penalties: {
			type: 'integer',
			defaultsTo: 0,
		},

		player2Penalties: {
			type: 'integer',
			defaultsTo: 0,
		},

		numberOfRounds: {
			type: 'integer',
			defaultsTo: 3,
		},

		round: {
			type: 'integer',
			defaultsTo: 1,
		},

		roundLengthMS: {
			type: 'integer',
			defaultsTo: 120000,
		},

		roundTimeMS: {
			type: 'integer',
			defaultsTo: 120000,
		},

		breakLengthMS: {
			type: 'integer',
			defaultsTo: 60000,
		},

		breakTimeMS: {
			type: 'integer',
			defaultsTo: 60000,
		},

		matchStatus: {
			type: 'string',
			defaultsTo: 'pending',
		},

		novice: {
			type: 'boolean',
			defaultsTo: false,
		},



		toString: function() {
			return '[Match] ' + this.player1 + ' vs. ' + this.player2;
		},

	},

	///////// Lifecycle Functions /////////

	beforeValidate: function(values, next) {
		next();
	},


	beforeCreate: function(values, next) {
		if(values.matchStatus === 'pending') {
			values.roundTimeMS = values.roundLengthMS;
			values.breakLengthMS = values.breakLengthMS;
		}

		if(!values.number) {
			// find the highest 'number' and make it the next highest by default
			Match.find({ 
				where: { /* need to find parent id when implemented */ },  
				limit: 1,
				sort: 'number DESC',
			}, function(err, found) {
				if(err) {return next(err);}
				if(found.length < 1) {
					values.number = 1;
				} else {
					values.number = parseInt(found[0].number + 1);
				}
				return next();
			});
		} else {
			
			return next();
		}

	},

	beforeUpdate: function(values, next) {

		next();
	},

	afterCreate: function(record, next) {

		next();
	},

	afterUpdate: function(record, next) {

		next();
	},





	//////// Collection Methods ///////////
	toString: function() {
		return "[model " + "Match" + "Model]";
	},
   

};
