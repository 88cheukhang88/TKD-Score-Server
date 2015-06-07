
// Code based on: https://gist.github.com/Mantish/6366642

//var bcrypt = require('bcrypt');
var log = sails.log;


var usernamePasswordError = {
	error: 'E_AUTH',
	summary: 'You must enter both a email and password',
};

var noAccountError = {
	error: 'E_AUTH',
	summary: 'Unknown email or password',
};

var logoutFlash = {
	summary: 'You have been logged out',
};

function randomIdent(length) {
    var text = "";
    
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
}



module.exports = { 
	

 
	// Routed from POST /login
	login: function(req, res, next)
	{
		if(!req.body.email || !req.body.password) {
			res.badRequest(usernamePasswordError);
			return;
		}

		User.findOne({email:req.body.email}).exec(function foundUser(err, user) {
			if(err) {return next(err);}

			if(!user) {
				res.badRequest(noAccountError);
				return;
			} else {
				
				// Check if password is a match - Authorise if it is 
				bcrypt.compare(req.body.password, user.password, function isValid(err, valid) {
					if(err) {return next(err);}
					if(!valid) {
						log.verbose('Logging in ' + user.mail + ' - password incorrect');
						res.badRequest(noAccountError);
						return;
					} else {
						// LOGIN USER
						log.verbose('Logging in ' + user.username + ' of '  + user.organisation);
						req.session.authority = user.getAuthority();
						req.session.authenticated = true;
						req.session.user = user;



						res.ok({session:req.session});
					}
				});
				
			}

		});

	},


	status: function(req,res,next)
	{
		/*
		if(req.session.authority) {
			log.silly(req.connection.remoteAddress + ' is requesting logged in status - Granted ' + req.session.user);
			return res.ok({
				session: req.session,
			});

		} else {
			log.silly(req.connection.remoteAddress + ' is requesting logged in status - DENIED');
			return res.ok({
				session: req.session,
			});
		}
		*/
		log.debug(req.connection.remoteAddress + ' is requesting logged in status - ANON GRANT');
		

        if(!req.session.ident) {
        	req.session.ident = randomIdent(12);
        }

		return res.ok({
			session: req.session,
		});
		
	},


	logout: function(req,res,next)
	{
		if(req.session.user) {
			log.silly('User ' + req.session.user.email + ' is logging out'); 
			req.session.destroy();
			res.json(204);
		} else {
			res.badRequest();
		}
	},
 
};
 