

describe('Responses', function() {
	it('should return a 200 ok', function(done) {

		var testfunc = function(req,res,next) {
			res.ok({message: true});
		};

		app.get('/test', testfunc);

		var checkResponse = function(res) {
			var data = res;
			if(!data.body.message) {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get('/test')
			.set('Accept', 'application/json')
			.expect(200)
			.expect(checkResponse)
			.end(done);
	});

	it('should return a 204 No Content', function(done) {

		var testfunc = function(req,res,next) {
			res.ok();
		};

		app.get('/test2', testfunc);

		request(app)
			.get('/test2')
			.set('Accept', 'application/json')
			.expect(204)
			.end(done);
	});

	it('should return a 400 badrequest error', function(done) {

		var testfunc = function(req,res,next) {
			res.badRequest('This is bad request message');
		};

		app.get('/badtest', testfunc);

		var checkResponse = function(res) {
			var data = res;
			if(data.body.name !== "Bad Request" || data.body.message !== 'This is bad request message') {

				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get('/badtest')
			.set('Accept', 'application/json')
			.expect(400)
			//.expect('Content-Type', /json/)
			.expect(checkResponse)
			.end(done);
	});

	it('should return a 401 notauthorised error', function(done) {

		var testfunc = function(req,res,next) {
			res.notAuthorised('This is a not authorised message');
		};

		app.get('/testNotAuth', testfunc);

		var checkResponse = function(res) {
			var data = res;
			if(data.body.name !== 'Not Authorised' || data.body.message !== 'This is a not authorised message') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get('/testNotAuth')
			.set('Accept', 'application/json')
			.expect(401)
			.expect(checkResponse)
			.end(done);
	});

	it('should return a 400 with a validation error', function(done) {

		var testfunc = function(req,res,next) {
			res.validationError(null, {
				errors : {field1 : 'field1 does meet validation x'},
			});
		};


		app.get('/testValidationError', testfunc);

		var checkResponse = function(res) {
			var data = res;
			if(data.body.errors.field1 !== 'field1 does meet validation x') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get('/testValidationError')
			.set('Accept', 'application/json')
			//.expect(400)
			.expect(checkResponse)
			.end(done);
	});

	it('should return a 500 with an internal error', function(done) {

		var testfunc = function(req,res,next) {
			res.internalError('Something went wrong!');
		};

		app.get('/testError', testfunc);

		var checkResponse = function(res) {
			var data = res;
			if(data.body.message !== 'Something went wrong!') {
				return 'Does not respond as expected: ' + JSON.stringify(data.body);
			}
		};

		request(app)
			.get('/testError')
			.set('Accept', 'application/json')
			.expect(500)
			.expect(checkResponse)
			.end(done);
	});



});