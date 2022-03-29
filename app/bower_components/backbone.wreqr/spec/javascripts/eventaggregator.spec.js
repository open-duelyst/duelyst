describe("event aggregator", function(){
  
  describe("when triggering an event", function(){
    var vent, handlerCalled;
    
    beforeEach(function(){
      var vent = new Wreqr.EventAggregator();

      vent.on("foo", function(){
        handlerCalled = true;
      });

      vent.trigger("foo");
    });

    it("should fire handlers", function(){
      expect(handlerCalled).toBe(true);
    });
  });

  describe("when unbinding from an event and then triggering it", function(){
    var vent, handlerCalled;

    beforeEach(function(){
      var vent = new Wreqr.EventAggregator();

      var callback = function(){
        handlerCalled = true;
      };

      binding = vent.on("foo", callback);

      vent.off("foo", callback);

      vent.trigger("foo");
    });

    it("should not fire any handlers", function(){
      expect(handlerCalled).toBeUndefined();
    });
  });

});
