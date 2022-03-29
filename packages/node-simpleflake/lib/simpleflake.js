var assert = require('assert');
var bignum = require('bignum');
var crypto = require('crypto');

try {
  var base58 = require('base58-native');
} catch (e) {
  base58 = null
}

var opt = {
  epoch: Date.UTC(2000, 0, 1),
  timebits: 41,
};

var mask = bignum(2).pow(64).sub(1);

function simpleflake(ts, seq) {
  var timebits = opt.timebits;
  var seqbits = 64 - timebits;

  ts = bignum((ts || Date.now()) - opt.epoch);
  assert(ts >= 0, 'ts must be >= ' + opt.epoch);
  assert(ts.bitLength() <= timebits, 'ts must be <= ' + timebits + ' bits');
  if (seq != undefined) {
    seq = bignum(seq);
    assert(seq.bitLength() <= seqbits, 'seq must be <= ' + seqbits + ' bits');
  } else {
    seq = bignum.fromBuffer(crypto.randomBytes(Math.ceil(seqbits / 8)));
  }

  var buf = bignum.or(
      ts.shiftLeft(seqbits),
      seq.and(mask.shiftRight(timebits))
  ).toBuffer();

  // Augment returned buffer with additional encoding option.
  buf.toString = toString;
  return buf;
}

function toString(enc) {
  if (enc == 'base58' && base58) {
    return base58.encode(this);
  } else if (enc == 'base10') {
    return bignum.fromBuffer(this).toString(10);
  } else {
    return Buffer.prototype.toString.apply(this, arguments);
  }
}

function parse(buf, enc) {
  if (!Buffer.isBuffer(buf)) {
    if (enc == 'base58' && base58) {
      buf = base58.decode(buf);
    } else if (enc == 'base10') {
      buf = bignum(buf).toBuffer()
    } else {
      buf = new Buffer(buf, enc);
    }
  }
  var timebits = opt.timebits;
  var seqbits = 64 - timebits;
  var input = bignum.fromBuffer(buf);
  return [
    input.shiftRight(seqbits).toNumber() + opt.epoch,
    input.and(mask.shiftRight(timebits)).toNumber()
  ];
}

module.exports = simpleflake;
module.exports.parse = parse;
module.exports.options = opt;
