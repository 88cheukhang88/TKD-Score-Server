module.exports = function internalerror(message, err) {
	var res = this; //we attatch this function to express.response. this = response;

	if(!err) {
		err = {
			message: "",
			name: "InternalError",
		};
	}
	if(message) {
		err.message = message; // overwrite the error message
	}

	res.json(500, err);
};