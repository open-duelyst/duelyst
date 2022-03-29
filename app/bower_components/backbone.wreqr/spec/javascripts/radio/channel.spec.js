describe('radio.channel', function () {

  var channel, channelName;

  describe('with no arguments', function() {

    it( 'should throw an exception', function() {
      expect( function() { Wreqr.radio.channel()} ).toThrow();
    });

  });

  describe('for a nonexistent channel', function() {

    beforeEach(function() {
      channel = Wreqr.radio.channel('lala');
    });

    it( 'should return an instance of the default channel', function() {
      expect( channel.channelName ).toEqual( 'lala' );
    });

  });

  describe('twice with the same name', function() {

    var chOne, chTwo;

    beforeEach(function() {

      chOne = Wreqr.radio.channel( 'lala' );
      chTwo = Wreqr.radio.channel( 'lala' );

    });

    it( 'should return the same channel', function() {
      expect( chOne ).toBe( chTwo );
    });

  });

});
