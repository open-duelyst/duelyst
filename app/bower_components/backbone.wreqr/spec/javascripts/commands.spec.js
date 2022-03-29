describe("commands", function(){

  describe("when executing a command", function(){
    var commands, result;

    beforeEach(function(){
      commands = new Wreqr.Commands();

      commands.setHandler("do:it", function(){
        return "some value";
      });

      result = commands.execute("do:it");
    });

    it("should not return any value", function(){
      expect(result).toBeUndefined();
    });
  });

  describe("when executing a command with a parameter", function(){
    var commands, result, param;

    beforeEach(function(){
      commands = new Wreqr.Commands();

      commands.setHandler("do:it", function(p){
        param = p;
      });

      result = commands.execute("do:it", "foo");
    });

    it("should pass the param along", function(){
      expect(param).toBe("foo");
    });
  });

  describe("when executing with multiple parameters", function(){
    var commands, result, param1, param2;

    beforeEach(function(){
      commands = new Wreqr.Commands();

      commands.setHandler("do:it", function(p, p2){
        param1 = p;
        param2= p2;
      });

      commands.execute("do:it", "foo", "bar");
    });

    it("should pass the param along", function(){
      expect(param1).toBe("foo");
      expect(param2).toBe("bar");
    });
  });

});
