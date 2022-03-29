var Promise = require('bluebird');
var _ = require('underscore');
var audio_engine = require('./audio_engine');
var audio_object = require('./audio_object');

/**
 *  SoundEffectSequence - sfx sequence object.
 */
var SoundEffectSequence = cc.Class.extend({
	_sfxDataByIdentifier: null,
	_sfxPlaylist: null,
	_playlistIndex: 0,
	_onComplete: null,
	ctor: function () {
		this._sfxDataByIdentifier = {};
		this._sfxPlaylist = [];
		this._playlistIndex = 0;
	},
	/**
	 * Adds a sound effect to the sequence. A sound effect may be added to a playing sequence.
	 * @param {String} sfxIdentifier path to sfx
	 * @param {Boolean} [looping=false] whether to loop infinitely (only works on last sfx in sequence)
	 * @param {Number} [duration] forced duration in seconds before moving to next in sequence
	 */
	addSoundEffect: function (sfxIdentifier, looping, duration) {
		if (sfxIdentifier != null) {
			var sfxData = this._sfxDataByIdentifier[sfxIdentifier];
			if (sfxData == null) {
				sfxData = new SoundEffectData(sfxIdentifier, looping, duration);
				this._sfxDataByIdentifier[sfxIdentifier] = sfxData;
				this._sfxPlaylist.push(sfxData);
			}
		}
	},
	/**
	 * Adds multiple sound effects.
	 * @see addSoundEffect
	 */
	addSoundEffects: function (sfxIdentifiers, loopings, durations) {
		for (var i = 0, il = sfxIdentifiers.length; i < il; i++) {
			this.addSoundEffect(sfxIdentifiers[i], loopings && loopings[i], durations && durations[i]);
		}
	},
	/**
	 * Plays the sequence.
	 */
	play: function (onComplete) {
		this.stop();
		this._onComplete = onComplete;
		this.playNext();
	},
	/**
	 * Plays the next sfx in the sequence. Usually you do not need to call this method directly.
	 */
	playNext: function () {
		if (this._playlistIndex >= this._sfxPlaylist.length) {
			// complete
			if (_.isFunction(this._onComplete)) {
				this._onComplete();
			}
			this.stop();
		} else {
			// play next
			var sfxData = this._sfxPlaylist[this._playlistIndex];
			if (sfxData != null) {
				var onComplete = this.playNext.bind(this);
				this._currentSfxData = sfxData;
				sfxData.play(onComplete);

				// increment playlist index if there is another sfx after this or we're not looping this sfx
				if (this._playlistIndex < this._sfxPlaylist.length - 1 || !sfxData.getLooping()) {
					this._playlistIndex++;
				}
			}
		}
	},
	/**
	 * Stops the sequence.
	 */
	stop: function () {
		if (this._currentSfxData != null) {
			this._currentSfxData.stop();
			this._currentSfxData = null;
		}
		this._onComplete = null;
		this._playlistIndex = 0;
	}
});

/**
 *
 *  SoundEffectData - sfx data object for sequencing.
 *
 */
var SoundEffectData = cc.Class.extend({
	_sfxIdentifier: null,
	_duration: null,
	_looping: null,
	_audio: null,
	_playAction: null,
	ctor: function (sfxIdentifier, looping, duration) {
		this._sfxIdentifier = sfxIdentifier;
		this._looping = looping;
		this._duration = duration;
	},
	getSfxIdentifier: function () {
		return this._sfxIdentifier;
	},
	setLooping: function (looping) {
		this._looping = looping;
	},
	getLooping: function () {
		return this._looping;
	},
	getAudio: function () {
		return this._audio;
	},
	getDuration: function () {
		if (this._duration == null && this._audio != null) {
			if (this._audio instanceof audio_object) {
				this._duration = this._audio.get_duration();
			} else if (this._audio instanceof cc.Audio) {
				this._duration = this._audio.getDuration();
			}
		}
		return this._duration || 0;
	},
	play: function (onComplete) {
		// stop previous
		this.stop();

		// play effect
		this._audio = audio_engine.current().play_effect(this._sfxIdentifier);

		// create action for play if there is a completion callback
		if (_.isFunction(onComplete)) {
			this._playAction = cc.sequence([
				cc.delayTime(this.getDuration()),
				cc.callFunc(function () {
					onComplete();
				}.bind(this))
			]);

			cc.director.getActionManager().addAction(this._playAction, this);
		}
	},
	stop: function () {
		if (this._audio != null) {
			audio_engine.current().stop_effect(this._audio);
		}
		if (this._playAction != null) {
			cc.director.getActionManager().removeAction(this._playAction);
			this._playAction = null;
		}
	}
});

module.exports = SoundEffectSequence;
