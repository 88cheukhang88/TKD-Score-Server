var _ = require('lodash');


module.exports = function validationError(message, validationErrors) {
	var res = this; //we attatch this function to express.response. this = response;
	if(message) { validationErrors.message = message;}
	res.json(400, validationErrors);
};