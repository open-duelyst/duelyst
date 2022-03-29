describe("commands - storage", function(){

  describe("when a command execution occurs and there are no handlers", function(){
    var commands, cmd;

    beforeEach(function(){
      commands = new Wreqr.Commands();
      commands.execute("foo");

      cmd = commands.storage.getCommands("foo");
    });

    it("should store the command for later execution", function(){
      expect(cmd.command).toBe("foo");
      expect(cmd.instances.length).toBe(1);
    });

  });

  describe("given no handler for a command, and that command has been called, when adding the handler", function(){
    var commands, cmd, handler;

    beforeEach(function(){
      handler = jasmine.createSpy("foo handler");

      commands = new Wreqr.Commands();
      commands.execute("foo", 1, 2);

      commands.setHandler("foo", handler);
    });

    it("should execute the command with that handler with any supplied args", function(){
      expect(handler).toHaveBeenCalledWith(1, 2);
    });

    it("should clear the existing stored command instances for that command name", function(){
      expect(commands.storage.getCommands("foo").instances.length).toBe(0);
    });
  });

});
