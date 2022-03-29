describe('radio.reqres', function() {

  describe('.request`', function() {

    var ch, chName, reqName, stub;

    beforeEach(function() {

      chName = 'test';
      reqName = 'some:request';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.reqres, 'request' );
      Wreqr.radio.reqres.request( chName, reqName );

    });

    afterEach(function() {
      stub.restore();
    });

    it( 'should forward the call to the Channel\'s reqres request function', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to reqres.request', function() {
      expect( stub ).toHaveBeenCalledWith( reqName );
    });

  });

  describe('.setHandler` ', function() {

    var ch, chName, fn, commandName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      commandName = 'some:command';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.reqres, 'setHandler' );
      Wreqr.radio.reqres.setHandler( chName, commandName, fn );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel\'s reqres object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to reqres.setHandler', function() {
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

      stub = sinon.stub( ch.reqres, 'setHandlers' );
      Wreqr.radio.reqres.setHandlers( chName, commandName, obj );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel\'s reqres object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to reqres.setHandlers', function() {
      expect( stub ).toHaveBeenCalledWith( commandName, obj );
    });

  });

  describe('.removeHandler', function() {

    var ch, chName, commandName, stub;

    beforeEach(function() {

      chName = 'test';
      commandName = 'some:command';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.reqres, 'removeHandler' );
      Wreqr.radio.reqres.removeHandler( chName, commandName );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel\'s reqres object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to reqres.removeHandler', function() {
      expect( stub ).toHaveBeenCalledWith( commandName );
    });

  });

  describe('.removeAllHandlers', function() {

    var ch, chName, stub;

    beforeEach(function() {

      chName = 'test';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.reqres, 'removeAllHandlers' );
      Wreqr.radio.reqres.removeAllHandlers( chName );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel\'s reqres object', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

  });

  describe('passing data between the handler and the request', function() {

    var ch, chName, fn, returnObject;

    beforeEach(function() {
      chName = 'test';
      reqName = 'some:request';
      fn = function(p1, p2){
        return p1 + p2;
      };

      Wreqr.radio.reqres.setHandler( chName, reqName, fn );
      returnObject = Wreqr.radio.reqres.request( chName, reqName , 1, 2);
    });

    it( 'should pass parameters to handler from request', function() {
      expect( returnObject ).toEqual(3);
    });

  });

})
