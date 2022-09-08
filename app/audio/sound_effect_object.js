const audio_object = require('./audio_object');

/**
 *  sound_effect_object - wrapper/controller object for handling a sound effect file.
 *  @param {String|Object} options audio src as string or a options object
 */
const sound_effect_object = function (options) {
  audio_object.apply(this, arguments);
};

sound_effect_object.prototype = Object.create(audio_object.prototype);
sound_effect_object.prototype.constructor = sound_effect_object;

sound_effect_object.create = function (options, audio) {
  return audio_object.create(options, audio || new sound_effect_object(options));
};

module.exports = sound_effect_object;
