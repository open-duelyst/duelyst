describe('Executing `connectCommands` with a hash as the first argument', function() {

  var
  ch,
  label1 = 'one',
  label2 = 'two',
  cbOne,
  cbTwo,
  p,
  ret,
  commandsHash;

  beforeEach(function() {

    cbOne = function() {};
    cbTwo = function() {};
    ch = Wreqr.radio.channel('foo');

    commandsHash = {};
    commandsHash[label2] = cbOne;
    commandsHash[label1] = cbTwo;

    ret = ch.connectCommands( commandsHash );

    p = ch.commands._wreqrHandlers || {};

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
