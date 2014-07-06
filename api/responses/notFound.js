module.exports = function notFound(message, err) {
	var res = this; //we attatch this function to express.response. this = response;

	res.json(404, {
		name : "Not Found",
		message : message,
		errors : err
	}); 
};