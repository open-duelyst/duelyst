const audio_object = require('./audio_object');

/**
 *  music_object - wrapper/controller object for handling a music file.
 *  @param {String|Object} options audio src as string or a options object
 */
const music_object = function (options) {
  audio_object.apply(this, arguments);
};

music_object.prototype = Object.create(audio_object.prototype);
music_object.prototype.constructor = music_object;
music_object.prototype.loop = true;

music_object.create = function (options, audio) {
  return audio_object.create(options, audio || new music_object(options));
};

module.exports = music_object;
