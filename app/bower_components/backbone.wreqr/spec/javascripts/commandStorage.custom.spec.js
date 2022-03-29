describe("command storage - custom storage", function(){

  describe("when providing a custom storage type as a constructor function to a Commands type", function(){
    var commands, StorageType;

    beforeEach(function(){
      StorageType = function(){};
      _.extend(StorageType, {
        addCommand: jasmine.createSpy("add command"),
        getCommands: jasmine.createSpy("get commands"),
        clearCommands: jasmine.createSpy("clear commands")
      });

      var Commands = Wreqr.Commands.extend({
        storageType: StorageType
      });

      commands = new Commands();
    });

    it("should instantiate and use that storage type", function(){
      expect(commands.storage instanceof StorageType).toBe(true);
    });

  });

  describe("when providing a custom storage type as an object literal to a Commands type", function(){
    var commands, StorageType;

    beforeEach(function(){
      StorageType = {
        addCommand: jasmine.createSpy("add command"),
        getCommands: jasmine.createSpy("get commands"),
        clearCommands: jasmine.createSpy("clear commands")
      };

      var Commands = Wreqr.Commands.extend({
        storageType: StorageType
      });

      commands = new Commands();
    });

    it("should instantiate and use that storage type", function(){
      expect(commands.storage).toBe(StorageType);
    });

  });

  describe("when providing a custom storage type as a constructor function to a Commands instance", function(){
    var commands, StorageType;

    beforeEach(function(){
      StorageType = function(){};
      _.extend(StorageType, {
        addCommand: jasmine.createSpy("add command"),
        getCommands: jasmine.createSpy("get commands"),
        clearCommands: jasmine.createSpy("clear commands")
      });

      commands = new Wreqr.Commands({
        storageType: StorageType
      });
    });

    it("should instantiate and use that storage type", function(){
      expect(commands.storage instanceof StorageType).toBe(true);
    });

  });

  describe("when providing a custom storage type as an object literal to a Commands instance", function(){
    var commands, StorageType;

    beforeEach(function(){
      StorageType = {
        addCommand: jasmine.createSpy("add command"),
        getCommands: jasmine.createSpy("get commands"),
        clearCommands: jasmine.createSpy("clear commands")
      };

      commands = new Wreqr.Commands({
        storageType: StorageType
      });
    });

    it("should instantiate and use that storage type", function(){
      expect(commands.storage).toBe(StorageType);
    });

  });

});
