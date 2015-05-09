
var testData = require('./_testData.js');



//// TODO /////
// - Test follow cue jumping 
//
///////////////



describe('POST /api/role/controls/[set,next,prev]', function (){

  testData.before();
  testData.after();


  it('should set and respond with the current cue', function (done){
    sails.request({
      method: 'post',
      url: '/api/role/controls/set',
      params: {
        role: 1,
        cue: 2,
      }
    }, function (err, clientRes, body) {
      if (err) {return done(err);}
      expect(clientRes.statusCode).to.equal(200);
      expect(body.currentcue).to.equal(2);
      done();
    });
  });

  it('should set and respond with the next cue', function (done){
    sails.request({
      method: 'post',
      url: '/api/role/controls/next',
      params: {
        role: 1,
      }
    }, function (err, clientRes, body) {
      if (err) {return done(err);}
      expect(clientRes.statusCode).to.equal(200);
      expect(body.currentcue).to.equal(3);
      done();
    });
  });

  it('should set and respond with the previous cue', function (done){
    sails.request({
      method: 'post',
      url: '/api/role/controls/prev',
      params: {
        role: 1,
      }
    }, function (err, clientRes, body) {
      if (err) {return done(err);}
      expect(clientRes.statusCode).to.equal(200);
      expect(body.currentcue).to.equal(2);
      done();
    });
  });

  it('should set and respond with the current cue in prep for follow test', function (done){
    sails.request({
      method: 'post',
      url: '/api/role/controls/set',
      params: {
        role: 1,
        cue: 3,
      }
    }, function (err, clientRes, body) {
      if (err) {return done(err);}
      expect(clientRes.statusCode).to.equal(200);
      expect(body.currentcue).to.equal(3);
      done();
    });
  });

  it('should set and respond with the next cue after the follows', function (done){
    sails.request({
      method: 'post',
      url: '/api/role/controls/next',
      params: {
        role: 1,
      }
    }, function (err, clientRes, body) {
      if (err) {return done(err);}
      expect(clientRes.statusCode).to.equal(200);
      expect(body.currentcue).to.equal(5);
      done();
    });
  });

  it('should set and respond with previous cue that doesnt follow on', function (done){
    sails.request({
      method: 'post',
      url: '/api/role/controls/prev',
      params: {
        role: 1,
      }
    }, function (err, clientRes, body) {
      if (err) {return done(err);}
      expect(clientRes.statusCode).to.equal(200);
      expect(body.currentcue).to.equal(3);
      done();
    });
  });



});
