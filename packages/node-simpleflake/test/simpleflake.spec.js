var flake = require('..');

expect.addAssertion('toBeginWith', function(head) {
    var message = this.generateMessage(this.value, this.expr, 'to begin with', head);

    for (var i = 0; i < head.length; i++) {
      if (this.value[i] !== head[i]) {
        return this.assertions.fail(message);
      }
    }
    this.assertions.pass(message);
});

expect.addAssertion('toEndWith', function(tail) {
    var message = this.generateMessage(this.value, this.expr, 'to end with', tail);

    for (var i = 0; i < tail.length; i++) {
      if (this.value[this.value.length - i - 1] !== tail[tail.length - i - 1]) {
        return this.assertions.fail(message);
      }
    }
    this.assertions.pass(message);
});

expect.addAssertion('toEqualElementwise', function(other) {
    var message = this.generateMessage(this.value, this.expr, 'to equal elementwise', other);

    if (this.value.length != other.length) {
        return this.assertions.fail(message);
    }
    for (var i = 0; i < other.length; i++) {
      if (this.value[i] !== other[i]) {
        return this.assertions.fail(message);
      }
    }
    this.assertions.pass(message);
});

describe('Simpleflake', function() {

  var expected = [0x33, 0x70, 0x24, 0xec, 0x00, 0x00, 0x00, 0x2a];

  before(function() {
    // Prime the randomness generator to avoid slow warnings for the first test.
    require('crypto').randomBytes(1);
  });

  describe('generator', function() {

    it('can generate an id', function() {
      var id = flake();
      expect(id).toBeDefined();
    });

    it('can generate an id with deterministic time', function() {
      var id = flake(Date.UTC(2014, 0, 1));
      expect(id).toBeginWith(expected.slice(0, 5));
    });

    it('can generate an id with deterministic sequence', function() {
      var id = flake(undefined, 42);
      expect(id).toEndWith(expected.slice(-2));
    });

    it('can generate an id with deterministic sequence and time', function() {
      var id = flake(Date.UTC(2014, 0, 1), 42);
      expect(id).toEqualElementwise(expected);
    });

    it('can generate an id with zero sequence', function() {
      var id = flake(undefined, 0);
      expect(id).toEndWith([0x00, 0x00]);
    });

    it('can generate a hex encoding', function() {
      var id = flake(Date.UTC(2014, 0, 1), 42);
      expect(id.toString('hex')).toBe('337024ec0000002a');
    });

    it('can generate a base58 encoding', function() {
      var id = flake(Date.UTC(2014, 0, 1), 42);
      expect(id.toString('base58')).toBe('9c1nv33vFWy');
    });

    it('can generate a base10 encoding', function() {
      var id = flake(Date.UTC(2014, 0, 1), 42);
      expect(id.toString('base10')).toBe('3706503089356800042');
    });

    it('produces distinct ids on subsequent calls', function() {
      var id1 = flake();
      var id2 = flake();
      expect(id1).not.toBe(id2);
      expect(id1).not.toEqualElementwise(id2);
    });

    it('produces identical ids from identical inputs', function() {
      var id1 = flake(Date.UTC(2014, 0, 1), 42);
      var id2 = flake(Date.UTC(2014, 0, 1), 42);
      expect(id1).not.toBe(id2);
      expect(id1).toEqualElementwise(id2);
    });

    it('handles time underflow', function() {
      expect(flake.bind(null, 1, 1)).toThrow();
    });

    it('handles time overflow', function() {
      expect(flake.bind(null, Date.UTC(3000, 1, 1), 1)).toThrow();
    });

    it('handles sequence overflow', function() {
      expect(flake.bind(null, undefined, 0xffffff)).toThrow();
    });
  });

  describe('parser', function() {

    it('can parse a buffer', function() {
      expect(flake.parse(new Buffer(expected))).toEqual([1388534400000, 42]);
    });

    it('can parse a hex string', function() {
      expect(flake.parse('337024ec0000002a', 'hex')).toEqual([1388534400000, 42]);
    });

    it('can parse a base58 string', function() {
      expect(flake.parse('9c1nv33vFWy', 'base58')).toEqual([1388534400000, 42]);
    });

    it('can parse a base10 string', function() {
      expect(flake.parse('3706503089356800042', 'base10')).toEqual([1388534400000, 42]);
    });

    it('can round-trip', function() {
      expect(flake.parse(flake(1388534400000, 42))).toEqual([1388534400000, 42]);
      expect(flake.apply(null, flake.parse(expected))).toEqualElementwise(expected);
    });
  });

  describe('options', function() {

    var defaults;

    before(function() {
      defaults = {};
      for (var i in flake.options) {
        defaults[i] = flake.options[i];
      }
    });
    beforeEach(function() {
      for (var i in defaults) {
        flake.options[i] = defaults[i];
      }
    });

    it('can customise epoch', function() {
      flake.options.epoch = Date.UTC(2012, 0, 1);

      var id = flake(Date.UTC(2014, 0, 1));
      expect(id).toBeginWith([0x07, 0x5a, 0x44, 0x5a, 0x00]);
      expect(flake.parse(id)).toBeginWith([1388534400000]);
    });

    it('can customise number of time bits', function() {
      flake.options.timebits = 40;
      var id1 = flake(Date.UTC(2014, 0, 1), 1);
      var parsed1 = flake.parse(id1);

      flake.options.timebits = 48;
      var id2 = flake(Date.UTC(2014, 0, 1), 1);
      var parsed2 = flake.parse(id2);

      expect(id1).not.toEqualElementwise(id2);
      expect(parsed1).toEqual(parsed2);
    });
  });

});
