describe('Running `resetChannel`', function() {

  var
  ch,
  v1Stub, v2Stub, cStub, rStub,
  v, c, r,
  ret;

  beforeEach(function() {

    ch = new Wreqr.Channel( 'test' );
    v = ch.vent;
    c = ch.commands;
    r = ch.reqres;
    v1Stub = sinon.spy( v, "off");
    v2Stub = sinon.spy( v, "stopListening");
    cStub  = sinon.spy( c, "removeAllHandlers");
    rStub  = sinon.spy( r, "removeAllHandlers");

    ret = ch.reset();

  });

  afterEach(function() {

    v1Stub.restore();
    v2Stub.restore();
    cStub.restore();
    rStub.restore();

  });

  it( 'should call the reset functions for each messaging system', function() {
    expect( v1Stub ).toHaveBeenCalledOnce();
    expect( v2Stub ).toHaveBeenCalledOnce();
    expect( cStub ).toHaveBeenCalledOnce();
    expect( rStub ).toHaveBeenCalledOnce();
  });

  it( 'should return the Channel', function() {
      expect( ret ).toBe( ch );
  });

});
