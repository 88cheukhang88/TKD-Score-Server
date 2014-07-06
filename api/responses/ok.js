module.exports = function ok(data) {
	var res = this; //we attatch this function to express.response. this = response;

	if(!data) {
		res.send(204); // Accepted/Processed but no entity to return
	} else {
		res.json(200, data);
	}
	
};