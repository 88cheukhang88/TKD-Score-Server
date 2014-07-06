

describe('Hello Routing', function() {
	it('GET /hello should respond with {hello:world}', function(done) {
		var checkResponse = function(res) {
			var data = res;
			if(data.body.hello !== 'world') {return 'Does not respond as expected';}
		};


		request(app).get(app.get('API_ROUTE_PREFIX') + '/hello')
			.expect(200)
			.expect('Content-Type', /json/)
			.expect(checkResponse)
			.end(done);
	});

	it('GET /hello/version should respond with version', function(done) {
		var checkResponse = function(res) {
			var data = res;
			if(!data.body.version) {return 'Does not respond as expected';}
		};

		request(app).get(app.get('API_ROUTE_PREFIX') + '/hello/version')
			.expect(200)
			.expect('Content-Type', /json/)
			.expect(checkResponse)
			.end(done);
	});
});