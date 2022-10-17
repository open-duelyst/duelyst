// pragma PKGS: codex

'use strict';

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilsUI = require('app/common/utils/utils_ui');
var audio_engine = require('app/audio/audio_engine');
var audio_object = require('app/audio/audio_object');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var ProfileManager = require('app/ui/managers/profile_manager');
var CodexChapterTmpl = require('./templates/codex_chapter.hbs');

var CodexChapterItemView = Backbone.Marionette.ItemView.extend({

  className: 'codex-chapter',

  template: CodexChapterTmpl,

  events: {
    'click .audio-play': 'onClickAudioPlay',
    'click .audio-pause': 'onClickAudioPause',
    'click .audio-stop': 'onClickAudioStop',
    'change .audio-volume-range': 'onChangeAudioVolume',
    'change .audio-seek-range': 'onChangeAudioSeek',
  },

  ui: {
    $chapterText: '.chapter-text',
    $audio: '.audio',
    $audioElapsed: '.audio-elapsed',
    $audioVolumeRange: '.audio-volume-range',
    $audioSeekRange: '.audio-seek-range',
  },

  _audioState: false,
  _elapsedIntervalId: null,

  /* region INITIALIZE */

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    data.description = model.get('description').replace(/\n|\r/g, '<br/>');
    data.text = model.get('text').replace(/\n|\r/g, '<br/>');
    return data;
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onShow: function () {
    // set starting volume
    this.ui.$audioVolumeRange.val(parseFloat(ProfileManager.getInstance().get('voiceVolume')));

    // set starting seek
    this._updateAudioSeek();

    // start audio
    this.onClickAudioPlay();

    // listen to events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();
  },

  onDestroy: function () {
    this.stopAudio();
  },

  onResize: function () {
    UtilsUI.overlayScrollbars(this.$el, this.ui.$chapterText);
  },

  onClickAudioPlay: function () {
    this.playAudio();
  },

  onClickAudioPause: function () {
    this.pauseAudio();
  },

  onClickAudioStop: function () {
    this.stopAudio();
  },

  onChangeAudioVolume: function () {
    this.changeAudioVolume(this.ui.$audioVolumeRange.val());
  },

  onChangeAudioSeek: function () {
    this.seekAudio(this.ui.$audioSeekRange.val());
  },

  /* endregion EVENTS */

  /* region SHOW / HIDE */

  show: function (playAudio) {
    Animations.fadeIn.call(this);

    if (playAudio) {
      this.playAudio();
    }
  },

  hide: function (stopAudio) {
    Animations.fadeOut.call(this);

    if (stopAudio) {
      this.stopAudio();
    }
  },

  /* endregion SHOW / HIDE */

  /* region AUDIO */

  playAudio: function () {
    var audio = this.model.get('audio');
    var audioState = this._audioState;
    if (audio != null && audioState !== audio_object.STATE_PLAYING) {
      // fade music out
      audio_engine.current().stop_music();

      // set state
      this._audioState = audio_object.STATE_PLAYING;

      // play or resume
      this.ui.$audio.addClass('playing');
      if (audioState === audio_object.STATE_PAUSED) {
        this.ui.$audio.removeClass('paused');
        audio_engine.current().resume_voice(audio);
      } else {
        audio_engine.current().play_voice(audio);
      }
      var voice = audio_engine.current().get_voice();
      voice.when_ended().then(function () {
        this.stopAudio();
      }.bind(this));

      // update seek
      this._elapsedIntervalId = setInterval(this._updateAudioSeek.bind(this), 1000);
    }
  },

  stopAudio: function () {
    var audio = this.model.get('audio');
    var audioState = this._audioState;
    if (audio != null && audioState !== audio_object.STATE_STOPPED) {
      // set state
      this._audioState = audio_object.STATE_STOPPED;

      if (audioState === audio_object.STATE_PAUSED) {
        this.ui.$audio.removeClass('paused');
      }
      this.ui.$audio.removeClass('playing');
      if (this._elapsedIntervalId != null) {
        clearInterval(this._elapsedIntervalId);
        this._elapsedIntervalId = null;
      }
      audio_engine.current().stop_voice(audio);

      // restart music
      audio_engine.current().play_music(RSX.music_codex.audio);

      this._updateAudioSeek();
    }
  },

  pauseAudio: function () {
    var audio = this.model.get('audio');
    var audioState = this._audioState;
    if (audio != null && audioState === audio_object.STATE_PLAYING) {
      // set state
      this._audioState = audio_object.STATE_PAUSED;
      this.ui.$audio.removeClass('playing');
      this.ui.$audio.addClass('paused');
      if (this._elapsedIntervalId != null) {
        clearInterval(this._elapsedIntervalId);
        this._elapsedIntervalId = null;
      }
      audio_engine.current().pause_voice(audio);

      // restart music
      audio_engine.current().play_music(RSX.music_codex.audio);
    }
  },

  changeAudioVolume: function (val) {
    ProfileManager.getInstance().set('voiceVolume', val);
  },

  seekAudio: function (val) {
    var voice = audio_engine.current().get_voice();
    if (voice == null || !voice.get_is_playing()) {
      this.playAudio();
      voice = audio_engine.current().get_voice();
      voice.when_playing().then(function () {
        this.seekAudio(val);
      }.bind(this));
    } else {
      var duration = voice.get_duration();
      voice.set_elapsed(duration * val);
      this._updateAudioSeek();
    }
  },

  _updateAudioSeek: function () {
    var voice = audio_engine.current().get_voice();
    if (voice != null && voice.get_src() === this.model.get('audio')) {
      var elapsed = voice.get_elapsed();
      var duration = voice.get_duration();
      var seekPct = duration > 0.0 ? elapsed / duration : 0.0;
      var minutes = Math.floor(elapsed / 60);
      var seconds = Math.round(elapsed % 60);
      this.ui.$audioElapsed.text((minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds));
      this.ui.$audioSeekRange.val(seekPct);
    } else {
      this.ui.$audioElapsed.text('00:00');
      this.ui.$audioSeekRange.val(0.0);
    }
  },

  /* endregion AUDIO */

});

// Expose the class either via CommonJS or the global object
module.exports = CodexChapterItemView;
