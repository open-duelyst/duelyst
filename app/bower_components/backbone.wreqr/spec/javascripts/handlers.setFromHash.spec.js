describe("handler - set from hash", function(){

  describe("when adding multiple handlers via an object literal / hash", function(){
    var handlers, hndlrs;

    beforeEach(function(){
      hndlrs = {
        "foo": jasmine.createSpy("foo handler"),
        "bar": jasmine.createSpy("bar handler")
      };

      handlers = new Wreqr.Handlers();
      handlers.setHandlers(hndlrs);
    });

    it("should add all named handlers", function(){
      expect(handlers.hasHandler("foo")).toBe(true);
      expect(handlers.hasHandler("bar")).toBe(true);
    });

    it("should execute the handler", function(){
      handlers.getHandler("foo")();
      handlers.getHandler("bar")();

      expect(hndlrs.foo).toHaveBeenCalled();
      expect(hndlrs.bar).toHaveBeenCalled();
    });
  });

  describe("when the object literal values are objects with a callback and context attribute", function(){
    var handlers, hndlrs, ctx;

    beforeEach(function(){
      ctx = {};
      
      hndlrs = {
        "foo": {
          callback: jasmine.createSpy("foo handler"),
          context: ctx
        }
      };

      handlers = new Wreqr.Handlers();
      handlers.setHandlers(hndlrs);

      handlers.getHandler("foo")();
    });

    it("should execute the handler callback with the specified context", function(){
      expect(hndlrs.foo.callback).toHaveBeenCalled();
      expect(hndlrs.foo.callback.mostRecentCall.object).toBe(ctx);
    });
  });

});
