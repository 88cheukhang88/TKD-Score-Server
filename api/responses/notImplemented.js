module.exports = function notImplemented(message, err) {
	var res = this; //we attatch this function to express.response. this = response;

	res.json(501, {
		name : "Not Implemented",
		message : message || "Function Not Implemented Yet",
		errors : err
	}); 
};