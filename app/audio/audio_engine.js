// See: https://coderwall.com/p/myzvmg for why this is created this way

var _audio_engine = {};
var _audio_engine_instance = null;
_audio_engine.instance = function () {
	if (_audio_engine_instance == null) {
		_audio_engine_instance = new audio_engine();
	}
	return _audio_engine_instance;
};
_audio_engine.current = _audio_engine.instance;

module.exports = _audio_engine;

var Promise = require("bluebird");
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var UtilsAudio = require('app/common/utils/utils_audio');
var audio_object = require('./audio_object');
var music_object = require('./music_object');
var sound_effect_object = require('./sound_effect_object');

/**
 *  audio_engine - Engine for playing music and sfx.
 */
var audio_engine = function () {
	this._pool = {};
	this._sfx = [];
	this._music_stopping = [];
	this._voice_stopping = [];
	this._update_waiting_effect_for_interaction_bound = this._update_waiting_effect_for_interaction.bind(this);

  // ensure volumes are updated (Needed for cocos in case no profile will sync yet to trigger updating volumes)
	this._update_volume();
};

audio_engine.prototype = {

	constructor: audio_engine,

	// master volume
	_volume: UtilsAudio.getValidVolume(CONFIG.DEFAULT_MASTER_VOLUME),
	// list of audio objects that can be reused, mapped by src
	_pool: null,

	// currently playing music
	_music: null,
	// currently stopping music, used in case of cross fade
	_music_stopping: null,
	// current music volume
	_music_volume: UtilsAudio.getValidVolume(CONFIG.DEFAULT_MUSIC_VOLUME),

	// currently playing voice
	_voice: null,
	// currently stopping voice, used in case of cross fade
	_voice_stopping: null,
	// current voice volume
	_voice_volume: UtilsAudio.getValidVolume(CONFIG.DEFAULT_VOICE_VOLUME),

	// list of currently playing sfx
	_sfx: null,
	// current sfx volume
	_sfx_volume: UtilsAudio.getValidVolume(CONFIG.DEFAULT_SFX_VOLUME),
	_sfx_volume_modifier: 1.0,

	// currently playing interaction sound effect
	_interaction_sfx: null,
	_interaction_sfx_priority: CONFIG.DEFAULT_SFX_PRIORITY,
	_interaction_sfx_started_at: 0.0,
	_interaction_sfx_raf: null,
	_interaction_sfx_waiting_priority: null,
	_interaction_sfx_waiting_src: null,
	_interaction_sfx_waiting_started_at: 0.0,

	/* region GETTERS / SETTERS */

	/**
	 * Returns whether any music is currently playing.
	 * @returns {boolean}
	 */
	is_music_playing: function () {
		return this._music != null && !this._music.is_playing();
	},

	/**
	 * Returns current music object.
	 * @returns {music_object}
	 */
	get_music: function () {
		return this._music;
	},

	/**
	 * Returns current voice object.
	 * @returns {audio_object}
	 */
	get_voice: function () {
		return this._voice;
	},

	/**
	 * Sets the master volume and updates volume of all active audio objects.
	 * @param {Number} val
	 */
	set_master_volume: function (val) {
		this._volume = UtilsAudio.getValidVolume(val);
		this._update_volume();
	},
	/**
	 * Returns the current master volume.
	 * @returns {Number}
	 */
	get_master_volume: function () {
		return this._volume;
	},

	/**
	 * Sets the music volume and updates volume of all active music objects.
	 * @param {Number} val
	 */
	set_music_volume: function (val) {
		this._music_volume = UtilsAudio.getValidVolume(val);
		this._update_music_volume();
	},
	/**
	 * Returns the current music volume.
	 * @returns {Number}
	 */
	get_music_volume: function () {
		return this._music_volume * this.get_master_volume();
	},

	/**
	 * Sets the voice volume and updates volume of all active voice objects.
	 * @param {Number} val
	 */
	set_voice_volume: function (val) {
		this._voice_volume = UtilsAudio.getValidVolume(val);
		this._update_voice_volume();
	},
	/**
	 * Returns the current voice volume.
	 * @returns {Number}
	 */
	get_voice_volume: function () {
		return this._voice_volume * this.get_master_volume();
	},

	/**
	 * Sets the sfx volume and updates volume of all active sfx objects.
	 * @param {Number} val
	 */
	set_sfx_volume: function (val) {
		this._sfx_volume = UtilsAudio.getValidVolume(val);
		this._update_sfx_volume();
	},
	/**
	 * Returns the current sfx volume.
	 * @returns {Number}
	 */
	get_sfx_volume: function () {
		return this._sfx_volume * this.get_master_volume() * this._sfx_volume_modifier;
	},

	/* endregion GETTERS / SETTERS */

	/* region POOLING */

	/**
	 * Adds an audio object to the pool.
	 * @param {audio_object} audio
	 */
	add_to_pool: function (audio) {
		// get pool of audio objects for src
		var src = audio != null && audio.get_src();
		if (src != null) {
			var pool = this.get_pool_by_src(src);
			pool.push(audio);
		}
	},

	/**
	 * Attempts to return the next available pooled audio object for a src.
	 * @param {String} src
	 * @returns {audio_object}
	 */
	take_from_pool: function (src) {
		var pool = this.get_pool_by_src(src);
		if (pool.length > 0) {
			return pool.pop();
		}
	},

	/**
	 * Gets a pool of audio objects for src, creating a new pool as needed.
	 * @param {String} src
	 * @returns {Array}
	 */
	get_pool_by_src: function (src) {
		var pool = this._pool[src];
		if(pool == null){
			pool = this._pool[src] = [];
		}
		return pool;
	},

	/**
	 * Release a pool of audio objects for src.
	 * @param {String} src
	 */
	release_pool_by_src: function (src) {
		var pool = this._pool[src];
		if(pool != null){
			delete this._pool[src];
		}
	},

	/**
	 * Release all audio objects matching src.
	 * @param {String} src
	 */
	release_audio_by_src: function (src) {
		var stop_promises = [];

		// music
		if (this._music && this._music.get_src() === src) {
			stop_promises.push(this.stop_music(0.0));
		}

		// voice
		if (this._voice && this._voice.get_src() === src) {
			stop_promises.push(this.stop_voice(0.0));
		}

		// sfx
		if (window.isDesktop) {
			// on desktop, use streaming sfx
			if (this._sfx.length > 0) {
				for (var i = this._sfx.length - 1; i >= 0; i--) {
					var effect = this._sfx[i];
					if (effect.get_src() === src) {
						stop_promises.push(this.stop_effect(effect));
					}
				}
			}
		} else {
			// on web, use cocos sfx
			cc.audioEngine.unloadEffect(src);
		}

		// wait for all to stop and release from pools
		return Promise.all(stop_promises).then(function () {
			this.release_pool_by_src(src);
		}.bind(this));
	},

	/* endregion POOLING */

	/* region HELPERS */

	_update_volume: function () {
		this._update_music_volume();
		this._update_voice_volume();
		this._update_sfx_volume();
	},
	_update_music_volume: function () {
		var musicVolume = this.get_music_volume();
		for (var i = 0, il = this._music_stopping; i < il; i++) {
			this._music_stopping[i].set_volume(musicVolume);
		}
		if (this._music != null) {
			this._music.set_volume(musicVolume);
		}
	},
	_update_voice_volume: function () {
		var voiceVolume = this.get_voice_volume();
		for (var i = 0, il = this._voice_stopping; i < il; i++) {
			this._voice_stopping[i].set_volume(voiceVolume);
		}
		if (this._voice != null) {
			this._voice.set_volume(voiceVolume);
		}
	},
	_update_sfx_volume: function () {
		if (window.isDesktop) {
			// on desktop, use streaming audio
			// modify sfx volume based on number of sfx currently playing
			var numEffectsPlaying = 0;
			for(var j = 0, jl = this._sfx.length; j < jl; j++) {
				var existingEffect = this._sfx[j];
				if(existingEffect.get_is_playing() && existingEffect.get_elapsed() < CONFIG.SFX_MULTIPLIER_DURATION_THRESHOLD){
					numEffectsPlaying++;
				}
			}
			this._sfx_volume_modifier = Math.pow(1.0 / Math.max(1, numEffectsPlaying), CONFIG.SFX_MULTIPLIER_POWER);

			// apply sfx volume
			var sfxVolume = this.get_sfx_volume();
			for (var i = 0, il = this._sfx; i < il; i++) {
				this._sfx[i].set_volume(sfxVolume);
			}
		} else {
			// on web, use cocos audio
			// modify sfx volume based on number of sfx currently playing
			var audioPool = cc.audioEngine._audioPool;
			var audioKeys = Object.keys(audioPool);
			var numEffectsPlaying = 0;
			for (var i = 0, il = audioKeys.length; i < il; i++) {
				var audioKey = audioKeys[i];
				var effectList = audioPool[audioKey];
				for(var j = 0, jl = effectList.length; j < jl; j++) {
					var existingEffect = effectList[j];
					if(existingEffect.getPlaying() && existingEffect.getElapsed() < CONFIG.SFX_MULTIPLIER_DURATION_THRESHOLD){
						numEffectsPlaying++;
					}
				}
			}
			this._sfx_volume_modifier = Math.pow(1.0 / Math.max(1, numEffectsPlaying), CONFIG.SFX_MULTIPLIER_POWER);

			// apply sfx volume
			var sfxVolume = this.get_sfx_volume();
			cc.audioEngine.setEffectsVolume(sfxVolume);
		}
	},

	/* endregion HELPERS */

	/* region PLAY */

	/**
	 * Plays an audio file and returns a promise that resolves when the audio is faded in/out.
	 * NOTE: do not call this method directly, use play_music or play_effect instead.
	 * @private
	 * @param audio
	 * @param [fadeDuration=0]
	 * @param [volume=master volume]
	 * @returns {Promise}
	 */
	_play: function(audio, fadeDuration, volume) {
		if (audio instanceof audio_object) {
			if (volume == null) { volume = this.get_master_volume(); }

			// play audio
			var play_promise = audio.play(fadeDuration, volume);

			// wait for audio to end and return to pool
			audio.when_ended().then(function () {
				this.add_to_pool(audio);
			}.bind(this));

			return play_promise;
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Stops an audio file and returns a promise that resolves when the audio is faded in/out.
	 * NOTE: do not call this method directly, use stop_music or stop_effect instead.
	 * @private
	 * @param audio
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	_stop: function(audio, fadeDuration) {
		if (audio instanceof audio_object) {
			return audio.stop(fadeDuration);
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Pauses an audio file and returns a promise that resolves when the audio is faded in/out.
	 * NOTE: do not call this method directly, use pause_music or pause_effect instead.
	 * @private
	 * @param audio
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	_pause: function(audio, fadeDuration) {
		if (audio instanceof audio_object) {
			return audio.pause(fadeDuration);
		} else {
			return Promise.resolve();
		}
	},

	/* endregion PLAY */

	/* region MUSIC */

	/**
	 * Creates and plays a music file and returns a promise that resolves when the music is faded in/out.
	 * @param options
	 * @param [fadeDuration=CONFIG.AUDIO_CROSSFADE_DURATION]
	 * @returns {Promise}
	 */
	play_music: function (options, fadeDuration) {
		var src = _.isString(options) ? options : options.src;
		if (this._music == null || this._music.get_src() !== src) {
			if (fadeDuration == null) { fadeDuration = CONFIG.MUSIC_CROSSFADE_DURATION; }

			// stop currently playing music
			this.stop_music(fadeDuration);

			// start new music
			// get music or create new for src
			this._music = this.take_from_pool(src);
			if (this._music == null) {
				this._music = new music_object(options);
			}

			return this._play(this._music, fadeDuration, this.get_music_volume());
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Stops the currently playing music and returns a promise that resolves when the music is faded in/out.
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	stop_music: function (fadeDuration) {
		if (this._music != null) {
			if (fadeDuration == null) { fadeDuration = CONFIG.MUSIC_CROSSFADE_DURATION; }
			var audio = this._music;
			this._music_stopping.push(audio);
			this._music = null;
			return this._stop(audio, fadeDuration).then(function () { this._music_stopping = _.without(this._music_stopping, audio); }.bind(this));
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Pauses the currently playing music and returns a promise that resolves when the music is faded in/out.
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	pause_music: function (fadeDuration) {
		if (this._music != null) {
			return this._pause(this._music, fadeDuration);
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Resumes the currently playing music and returns a promise that resolves when the music is faded in/out.
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	resume_music: function (fadeDuration) {
		if (this._music != null) {
			return this._play(this._music, fadeDuration, this.get_music_volume());
		} else {
			return Promise.resolve();
		}
	},

	/* endregion MUSIC */

	/* region VOICE */

	/**
	 * Creates and plays a voice file and returns a promise that resolves when the voice is faded in/out.
	 * @param options
	 * @param [fadeDuration=CONFIG.AUDIO_CROSSFADE_DURATION]
	 * @returns {Promise}
	 */
	play_voice: function (options, fadeDuration) {
		var src = _.isString(options) ? options : options.src;
		if (this._voice == null || this._voice.get_src() !== src) {
			if (fadeDuration == null) { fadeDuration = CONFIG.VOICE_CROSSFADE_DURATION; }

			// stop currently playing voice
			this.stop_voice(fadeDuration);

			// start new voice
			// get voice or create new for src
			this._voice = this.take_from_pool(src);
			if (this._voice == null) {
				this._voice = new audio_object(options);
			}

			return this._play(this._voice, fadeDuration, this.get_voice_volume());
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Stops the currently playing voice and returns a promise that resolves when the voice is faded in/out.
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	stop_voice: function (fadeDuration) {
		if (this._voice != null) {
			if (fadeDuration == null) { fadeDuration = CONFIG.VOICE_CROSSFADE_DURATION; }
			var audio = this._voice;
			this._voice_stopping.push(audio);
			this._voice = null;
			return this._stop(audio, fadeDuration).then(function () { this._voice_stopping = _.without(this._voice_stopping, audio); }.bind(this));
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Pauses the currently playing voice and returns a promise that resolves when the voice is faded in/out.
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	pause_voice: function (fadeDuration) {
		if (this._voice != null) {
			return this._pause(this._voice, fadeDuration);
		} else {
			return Promise.resolve();
		}
	},

	/**
	 * Resumes the currently playing voice and returns a promise that resolves when the voice is faded in/out.
	 * @param [fadeDuration=0]
	 * @returns {Promise}
	 */
	resume_voice: function (fadeDuration) {
		if (this._voice != null) {
			return this._play(this._voice, fadeDuration, this.get_voice_volume());
		} else {
			return Promise.resolve();
		}
	},

	/* endregion VOICE */

	/* region SFX */

	/**
	 * Plays a sound effect and returns the sound effect object.
	 * @param {String} src
	 * @param {Boolean} [loop=false]
	 * @returns {audio_object}
	 */
	play_effect: function (src, loop) {
		if (window.isDesktop) {
			// on desktop, use streaming sfx
			// get effect or create new for src
			var effect = this.take_from_pool(src);
			if (effect == null) {
				effect = new sound_effect_object(src);
			}
			effect.set_loop(loop);

			// add to list of active effects
			this._sfx.push(effect);

			// play effect
			this._play(effect, 0.0, this.get_sfx_volume());

			// when effect ends
			effect.when_ended().then(function () {
				// remove from sfx list
				this._sfx = _.without(this._sfx, effect);
			}.bind(this));
		} else {
			// on web, use cocos sfx
			effect = cc.audioEngine.playEffect(src, loop);
		}

		// update sfx volume as it is based on number of sfx playing
		this._update_sfx_volume();

		return effect;
	},

	/**
	 * Plays a non-looping interaction sound effect. Only a single interaction sound effect may play at once.
	 * NOTE: do not use this for hover effects, use play_effect instead.
	 * @param {String} src
	 * @param {Number} [priority=0] higher priority takes precedence
	 * @returns {audio_object|null} audio sfx object if playing, otherwise null
	 */
	play_effect_for_interaction: function (src, priority) {
		if (priority == null) {priority = CONFIG.DEFAULT_SFX_PRIORITY;}

		var isPlayingEffect = this._interaction_sfx != null && (window.isDesktop || this._interaction_sfx.getPlaying()) && (Date.now() - this._interaction_sfx_started_at < CONFIG.INTERACTION_SFX_BLOCKING_DURATION_THRESHOLD * 1000.0);
		if (isPlayingEffect) {
			this._interaction_sfx_waiting_src = src;
			this._interaction_sfx_waiting_priority = priority;
			this._play_waiting_effect_for_interaction();
		} else if (this._interaction_sfx_raf == null) {
			// no interaction sfx waiting to be played, delay briefly
			this._interaction_sfx_waiting_src = src;
			this._interaction_sfx_waiting_priority = priority;
			this._interaction_sfx_waiting_started_at = Date.now();
			this._update_waiting_effect_for_interaction();
		} else {
			// there is another interaction sfx waiting to be played
			if (priority > this._interaction_sfx_waiting_priority) {
				// play this sfx instead of previous
				this._interaction_sfx_waiting_src = src;
				this._interaction_sfx_waiting_priority = priority;
			}
		}
	},

	_update_waiting_effect_for_interaction: function (dt) {
		if (Date.now() - this._interaction_sfx_waiting_started_at >= CONFIG.SFX_INTERACTION_DELAY * 1000.0) {
			this._play_waiting_effect_for_interaction();
		} else if (this._interaction_sfx_waiting_src != null) {
			this._interaction_sfx_raf = requestAnimationFrame(this._update_waiting_effect_for_interaction_bound);
		}
	},

	_play_waiting_effect_for_interaction: function () {
		var src = this._interaction_sfx_waiting_src;
		var priority = this._interaction_sfx_waiting_priority;
		this._reset_waiting_interaction_sfx();
		if (src != null && priority != null) {
			var isPlayingEffect = this._interaction_sfx != null && (window.isDesktop || this._interaction_sfx.getPlaying()) && (Date.now() - this._interaction_sfx_started_at < CONFIG.INTERACTION_SFX_BLOCKING_DURATION_THRESHOLD * 1000.0);
			if (!isPlayingEffect || priority > this._interaction_sfx_priority) {
				// stop previous
				if (isPlayingEffect) {
					this.stop_effect(this._interaction_sfx);
				}

				// play new
				var interaction_sfx = this.play_effect(src);

				if (window.isDesktop) {
					interaction_sfx.when_ended().then(function () {
						if (this._interaction_sfx === interaction_sfx) {
							this._reset_interaction_sfx();
						}
					}.bind(this));
				}

				this._interaction_sfx = interaction_sfx;
				this._interaction_sfx_started_at = Date.now();
				this._interaction_sfx_priority = priority;

				return this._interaction_sfx;
			}
		}
	},

	_reset_interaction_sfx: function () {
		this._interaction_sfx = null;
		this._interaction_sfx_priority = 0;
		this._interaction_sfx_started_at = 0.0;
		this._reset_waiting_interaction_sfx();
	},

	_reset_waiting_interaction_sfx: function () {
		if (this._interaction_sfx_raf != null) {
			cancelAnimationFrame(this._interaction_sfx_raf);
			this._interaction_sfx_raf = null;
		}
		this._interaction_sfx_waiting_src = null;
		this._interaction_sfx_waiting_priority = null;
		this._interaction_sfx_waiting_started_at = 0.0;
	},

	/**
	 * Stops playing a sound effect.
	 * @param {audio_object} effect
	 */
	stop_effect: function (effect) {
		if (this._interaction_sfx === effect) {
			this._reset_interaction_sfx();
		}

		if (window.isDesktop) {
			// on desktop, use streaming sfx
			// remove effect from list of active effects
			this._sfx = _.without(this._sfx, effect);

			// stop effect
			this._stop(effect);
		} else {
			// on web, use cocos sfx
			cc.audioEngine.stopEffect(effect);
		}
	},

	/**
	 * Stop all playing sound effects.
	 */
	stop_all_effects: function () {
		this._reset_interaction_sfx();

		if (window.isDesktop) {
			// on desktop, use streaming sfx
			if (this._sfx.length > 0) {
				var sfx = this._sfx;
				this._sfx = [];
				for (var i = 0, il = sfx.length; i < il; i++) {
					this._stop(sfx[i]);
				}
			}
		} else {
			// on web, use cocos sfx
			cc.audioEngine.stopAllEffects();
		}
	}

	/* endregion SFX */

};
