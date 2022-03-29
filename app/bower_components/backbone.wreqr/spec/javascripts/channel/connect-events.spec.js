describe('Executing `connectEvents` with a hash as the first argument', function() {

  var
  ch,
  label1 = 'one',
  label2 = 'two',
  cbOne,
  cbTwo,
  p,
  ret,
  eventsHash;

  beforeEach(function() {

    cbOne = function() {};
    cbTwo = function() {};
    ch = Wreqr.radio.channel('test');

    eventsHash = {};
    eventsHash[label2] = cbOne;
    eventsHash[label1] = cbTwo;

    ret = ch.connectEvents( eventsHash );

    p = ch.vent._events || {};

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
