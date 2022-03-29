describe('radio.commands', function() {

  describe('.execute', function() {

    var ch, chName, commandName, stub;

    beforeEach(function() {

      chName = 'test';
      commandName = 'some:command';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.commands, 'execute' );
      Wreqr.radio.commands.execute( chName, commandName );

    });

    afterEach(function() {
      stub.restore();
    });

    it( 'should forward the call to the Channel\'s commands execute function', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to commands.execute', function() {
      expect( stub ).toHaveBeenCalledWith( commandName );
    });

  });

  describe('.setHandler', function() {

    var ch, chName, fn, commandName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      commandName = 'some:command';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.commands, 'setHandler' );
      Wreqr.radio.commands.setHandler( chName, commandName, fn );

    });

    afterEach(function() {
      stub.restore();
    });

    it( 'should forward the call to the Channel\'s commands object', function() {
      expect( stub ).toHaveBeenCalledOnce;
    });

    it( 'should pass the correct arguments to commands.setHandler', function() {
      expect( stub ).toHaveBeenCalledWith( commandName, fn );
    });

  });

  describe('.setHandlers', function() {

    var ch, chName, obj, commandName, stub;

    beforeEach(function() {

      chName = 'test';
      obj = {
        some1: function() {},
        some2: function() {}
      };
      commandName = 'some:command';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.commands, 'setHandlers' );
      Wreqr.radio.commands.setHandlers( chName, commandName, obj );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel\'s commands object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to commands.setHandlers', function() {
      expect( stub ).toHaveBeenCalledWith( commandName, obj );
    });

  });

  describe('.removeHandlers', function() {

    var ch, chName, commandName, stub;

    beforeEach(function() {

      chName = 'test';
      commandName = 'some:command';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.commands, 'removeHandler' );
      Wreqr.radio.commands.removeHandler( chName, commandName );

    });

    afterEach(function() {
      stub.restore();
    });

    it( 'should forward the call to the Channel\'s commands object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to commands.removeHandler', function() {
      expect( stub ).toHaveBeenCalledWith( commandName );
    });

  });

  describe('.removeAllHandlers', function() {

    var ch, chName, stub;

    beforeEach(function() {

      chName = 'test';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.commands, 'removeAllHandlers' );
      Wreqr.radio.commands.removeAllHandlers( chName );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel\'s commands object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

  });
});
