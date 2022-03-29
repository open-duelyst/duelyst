describe('Executing `connectRequests` with a hash as the first argument', function() {

  var
  ch,
  label1 = 'one',
  label2 = 'two',
  cbOne,
  cbTwo,
  p,
  ret,
  requestsHash;

  beforeEach(function() {

    cbOne = function() {};
    cbTwo = function() {};
    ch = Wreqr.radio.channel('test');

    requestsHash = {};
    requestsHash[label2] = cbOne;
    requestsHash[label1] = cbTwo;

    ret = ch.connectRequests( requestsHash );

    p = ch.reqres._wreqrHandlers || {};

  });

  afterEach(function() {
    ch.reset();
  });

  it( 'should attach the listeners to the Channel', function() {
      expect(_.keys(p)).toEqual( [label2, label1] );
  });

  it( 'should return the Channel', function() {
      expect( ret ).toBe( ch );
  });

});
