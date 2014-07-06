

module.exports = function badrequest(message, err) {
	var res = this; //we attatch this function to express.response. this = response;

	res.json(400, {
		name : "Bad Request",
		message : message,
		errors : err,
	});
};