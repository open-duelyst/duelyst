describe('Creating a Channel', function() {

  var
  ch,
  chName,
  name = 'test',
  v, c, r;

  beforeEach(function() {
    ch = new Wreqr.Channel( name );
  });

  it( 'should set the name', function() {
    expect( ch.channelName ).toEqual( name );
  });

  it( 'should instantiate a new instance of each messaging system', function() {
    expect( ch.vent instanceof Backbone.Wreqr.EventAggregator ).toBeTruthy();
    expect( ch.commands instanceof Backbone.Wreqr.Commands ).toBeTruthy();
    expect( ch.reqres instanceof Backbone.Wreqr.RequestResponse ).toBeTruthy();
  });

});
