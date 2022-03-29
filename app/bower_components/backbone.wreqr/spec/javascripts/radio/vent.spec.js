describe('radio.vent', function() {

  describe('.off', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';
      obj = { test: true, testTwo: false };

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'on' );
      Wreqr.radio.vent.on( chName, eventName, fn, obj );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the corresponding Channel vent method', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to vent.on', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn, obj );
    });

  });

  describe('.off with no additional arguments', function() {

    var ch, chName, stub;

    beforeEach(function() {

      chName = 'test';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'off' );
      Wreqr.radio.vent.off( chName );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel vent `off` method', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

  });

  describe('Passing additional arguments to the `off` function', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'off' );
      Wreqr.radio.vent.off( chName, eventName, fn );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should pass them along to vent.off', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn );
    });

  });

  describe('.once', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';
      obj = { test: true, testTwo: false };

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'once' );
      Wreqr.radio.vent.once( chName, eventName, fn, obj );

    });

    afterEach(function() {
      stub.restore();
    });

    it( 'should forward the call to the Channel vent `once`', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to vent.once', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn, obj );
    });

  });

  describe('.trigger', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';
      obj = { test: true, testTwo: false };

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'trigger' );
      Wreqr.radio.vent.trigger( chName, eventName, fn, obj, true, '2' );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel vent `trigger`', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to vent.trigger', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn, obj, true, '2' );
    });

  });

  describe('.stopListening with no extra arguments', function() {

    var ch, chName, stub;

    beforeEach(function() {

      chName = 'test';

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'stopListening' );
      Wreqr.radio.vent.stopListening( chName );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel vent `stopListening`', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

  });

  describe('.stopListening with additional arguments', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';
      obj = { test: true, testTwo: false };

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'stopListening' );
      Wreqr.radio.vent.stopListening( chName, eventName, fn, obj );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should pass the correct arguments to vent.trigger', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn, obj );
    });

  });

  describe('.listenTo', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';
      obj = { test: true, testTwo: false };

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'listenTo' );
      Wreqr.radio.vent.listenTo( chName, eventName, fn, obj, true, '2' );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel vent `trigger`', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to vent.trigger', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn, obj, true, '2' );
    });

  });

  describe('.listenToOnce', function() {

    var ch, chName, obj, fn, eventName, stub;

    beforeEach(function() {

      chName = 'test';
      fn = function() {};
      eventName = 'some:event';
      obj = { test: true, testTwo: false };

      ch = Wreqr.radio.channel( chName );

      stub = sinon.stub( ch.vent, 'listenToOnce' );
      Wreqr.radio.vent.listenToOnce( chName, eventName, fn, obj, true, '2' );

    });

    afterEach(function() {

      stub.restore();

    });

    it( 'should forward the call to the Channel vent `listenToOnce`', function() {
      expect( stub ).toHaveBeenCalledOnce();
    });

    it( 'should pass the correct arguments to vent.listenToOnce', function() {
      expect( stub ).toHaveBeenCalledWith( eventName, fn, obj, true, '2' );
    });

  });
})
