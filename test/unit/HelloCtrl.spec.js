var expect = require('expect.js');
var Ctrl = require('../../api/Hello/HelloCtrl.js');
describe('Hello Controller', function() {
	it('should exist', function(done) {
		expect(Ctrl).to.be.ok();
		done();
	});
});