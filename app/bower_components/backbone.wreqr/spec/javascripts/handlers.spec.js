describe("handlers", function(){

  describe("when adding a handler", function(){
    var handlers, handler, setHandleredHandler, ctx;

    beforeEach(function(){
      handlers = new Wreqr.Handlers();
      spyOn(handlers, "trigger");

      ctx = {};
      setHandleredHandler = jasmine.createSpy("a setHandlered handler");

      handlers.setHandler("foo", setHandleredHandler, ctx);

      handler = handlers.getHandler("foo");
      handler();
    });

    it("should trigger a handler:add event", function(){
      expect(handlers.trigger).toHaveBeenCalledWith("handler:add", "foo", setHandleredHandler, ctx);
    });
  });

  describe("when requesting a handler by name", function(){

    describe("and a handler has been setHandlered with that name", function(){
      var handler, setHandleredHandler, ctx;

      beforeEach(function(){
        var handlers = new Wreqr.Handlers();

        ctx = {};
        setHandleredHandler = jasmine.createSpy("a setHandlered handler");
        handlers.setHandler("handler", setHandleredHandler, ctx);

        handler = handlers.getHandler("handler");
        handler();
      });

      it("should return the setHandlered handler callback", function(){
        expect(setHandleredHandler).toHaveBeenCalled();
      });

      it("should return the setHandlered handler context", function(){
        expect(setHandleredHandler.mostRecentCall.object).toBe(ctx);
      });

    });

    describe("and a handler has not been setHandlered with that name", function(){
      var handlers, handle;

      beforeEach(function(){
        handlers = new Wreqr.Handlers();
        handle = handlers.getHandler();
      });

      it("should thrown an error saying a handler was not found", function(){
        expect(handle).toBeUndefined;
      });

    });

  });

  describe("when removing a named handler", function(){
    var handlers, setHandleredHandler, ctx, handle;

    beforeEach(function(){
      handlers = new Wreqr.Handlers();

      ctx = {};
      setHandleredHandler = jasmine.createSpy("a setHandlered handler");
      handlers.setHandler("handler", setHandleredHandler, ctx);
      handlers.removeHandler("handler");
      handle = handlers.getHandler("handler");
    });

    it("should no longer return the requested hander", function(){
      expect(handle).toBeUndefined;
    });
  });

  describe("when removing all handlers", function(){
    var handlers, setHandleredHandler, ctx, handle1, handle2;

    beforeEach(function(){
      handlers = new Wreqr.Handlers();

      ctx = {};
      setHandleredHandler = jasmine.createSpy("a setHandlered handler");
      handlers.setHandler("handler1", setHandleredHandler, ctx);
      handlers.setHandler("handler2", setHandleredHandler, ctx);
      handlers.removeAllHandlers();
      handle1 = handlers.getHandler("handler1");
      handle2 = handlers.getHandler("handler2");
    });

    it("should no longer return the requested handler", function(){
      expect(handle1).toBeUndefined;
      expect(handle2).toBeUndefined;
    });
  });

});
