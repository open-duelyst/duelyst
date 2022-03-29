describe("request/response", function(){

  describe("when requesting a response", function(){
    var reqres, result;

    beforeEach(function(){
      reqres = new Wreqr.RequestResponse();

      reqres.setHandler("do:it", function(){
        return "some value";
      });

      result = reqres.request("do:it");
    });

    it("should return a value", function(){
      expect(result).toBe("some value");
    });
  });

  describe("when requesting a response, with a parameter", function(){
    var reqres, result, param;

    beforeEach(function(){
      reqres = new Wreqr.RequestResponse();

      reqres.setHandler("do:it", function(p){
        param = p;
      });

      result = reqres.request("do:it", "foo");
    });

    it("should pass the param along", function(){
      expect(param).toBe("foo");
    });
  });

  describe("when requesting a response, with multiple parameters", function(){
    var reqres, result, param1, param2;

    beforeEach(function(){
      reqres = new Wreqr.RequestResponse();

      reqres.setHandler("do:it", function(p, p2){
        param1 = p;
        param2= p2;
      });

      result = reqres.request("do:it", "foo", "bar");
    });

    it("should pass the param along", function(){
      expect(param1).toBe("foo");
      expect(param2).toBe("bar");
    });
  });

});

