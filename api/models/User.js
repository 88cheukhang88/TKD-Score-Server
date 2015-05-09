/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */
var bcrypt = require('bcrypt');


module.exports = {


  attributes: {

    openID: {
      type: 'string',
      unique: true,
    },

    username: {
    	type: 'string',
    	//required: true,
    	unique:true
    },

    email: {
    	type: 'email',
    	unique: true,
    },
    
    password: {
      type: 'string',
      required: true,
    },

    roles: {
    	collection: 'Role',
    	via: 'users',
    },

    firstName: {
    	type: 'string',
    },

    lastName: {
    	type: 'string',
    },

    preferedName: {
    	type: 'string',
    },

    imageURL: {
    	type: 'string',
    },








	

/////////


///////////


    ////////// Status Flags
    online: {
      type:'boolean',
      defaultsTo: false,
    },


    ///////// Derived Attributes

    /**
 * This function provides the true or false values for all 'canDo' questions. This is added to the session object for easy reference
 * 
 * @param user - The logged in users model instance
 * @return Object containing the canDo's true or false 
*/
  	getAuthority: function() {
	    var user = this.toObject();
	    
		var roles = {
		    'SYSTEMADMIN': {
		    	Organisation: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Event: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	User: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Date: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Contact: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    },

		    'SYSTEMDEV': {
		    	Organisation: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Event: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	User: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Date: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Contact: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    },

		    'ADMIN': {
		    	Organisation: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Event: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	User: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Date: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Contact: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    },

		    'OPERATOR': {
		    	Organisation: {
		    		read: true,
		    		create: false,
		    		update: false,
		    		delete: false,
		    	},
		    	Event: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	User: {
		    		read: true,
		    		create: false,
		    		update: false,
		    		delete: false,
		    	},
		    	Date: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    	Contact: {
		    		read: true,
		    		create: true,
		    		update: true,
		    		delete: true,
		    	},
		    }
		};

    	var authority = roles[user.type];
      	return authority;
  	},


    ///////// Attribute Methods
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      //delete obj._csrf;
      return obj;
    },



  },

    

  ///////// Lifecycle Functions

  beforeValidate: function(values, next) {

    next();
  },


  beforeCreate: function(values, next) {
    //Encrypt password for storage
    bcrypt.hash(values.password, 10, function setEncryptedPassword(err, encryptedPassword){
      if(err) {return next(err);}
      values.password = encryptedPassword;
      next();
    });
  },

  beforeUpdate: function(values, next) {
  	if(values.password) {
	  	bcrypt.hash(values.password, 10, function setEncryptedPassword(err, encryptedPassword){
	      if(err) {return next(err);}
	      values.password = encryptedPassword;
	      next();
	    });
	} else {
	  	next();
	}
  },
};






