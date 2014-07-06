module.exports = function notauthorized(message, err) {
	var res = this; //we attatch this function to express.response. this = response;

	res.json(401, {
		name : "Not Authorised",
		message : message,
		errors : err
	}); 
};