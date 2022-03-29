//pragma PKGS: speech

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var UtilsEngine = require('app/common/utils/utils_engine');
var PKGS = require('app/data/packages');
var audio_engine = require('app/audio/audio_engine');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');
var BaseLabel = require('./../BaseLabel');

/****************************************************************************
SpeechNode
 - node used to show speech for an entity node
 ****************************************************************************/

var SpeechNode = cc.Node.extend({

	entityNode: null,
	_isPressedOnPressAnywhere: false,
	_isDismissable: true,
	_listeningToEvents: false,
	label: null,
	_showingText: false,
	_showTextAction: null,
	_stoppingShowText: false,
	_stopShowingAction: null,

	/* region INITIALIZE */

	ctor: function () {
		this._super();

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

			// text label
			this.label = new BaseLabel("", RSX.font_bold.name, 16, cc.size(CONFIG.GENERAL_SPEECH_WIDTH, 0.0));
			var colorsByFormattingTag = {};
			colorsByFormattingTag[CONFIG.FORMATTING_ENGINE.emphasisStart] = CONFIG.DIALOGUE_HIGHLIGHT_TEXT_COLOR;
			this.label.setColorsByFormattingTag(colorsByFormattingTag);
			this.label.setFontFillColor(CONFIG.DIALOGUE_TEXT_COLOR);
			this.label.setAnchorPoint(0, 1);
			this.addChild(this.label, 1);
		}.bind(this));

		return true;
	},

	onExit: function () {
		this._super();

		this._stopListeningToEvents();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		gameLayer && gameLayer.removeNode(this);
	},

	/* endregion INITIALIZE */

	/* region GETTERS / SETTERS */

	getRequiredResources: function () {
		var resources = cc.Node.prototype.getRequiredResources.call(this);

		// add this package
		resources = resources.concat(PKGS.getPkgForIdentifier("speech"));

		return resources;
	},

	getIsPressedOnPressAnywhere: function () {
		return this._isPressedOnPressAnywhere;
	},

	setIsPressedOnPressAnywhere: function (val) {
		this._isPressedOnPressAnywhere = val;
	},

	getIsDismissable: function () {
		return this._isDismissable;
	},

	setIsDismissable: function (val) {
		this._isDismissable = val;
	},

	/* endregion GETTERS / SETTERS */

	/* region EVENTS */

	_startListeningToEvents: function () {
		if (!this._listeningToEvents) {
			this._listeningToEvents = true;

			var scene = this.getScene();
			if (scene != null) {
				scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
			}
		}
	},

	_stopListeningToEvents: function () {
		if (this._listeningToEvents) {
			this._listeningToEvents = false;

			var scene = this.getScene();
			if (scene != null) {
				scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
			}
		}
	},

	onPointerUp: function (event) {
		if (event == null || event.isStopped) {
			return;
		}

		var location = event.getLocation();
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer && this.isVisible() && this.getDisplayedOpacity() > 0.0
			&& (this._isPressedOnPressAnywhere || UtilsEngine.getNodeUnderMouse(this.bgSprite, location.x, location.y))) {
			// play sound for click
			audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);

			if (this._isDismissable && !this._stoppingShowText) {
				// stop showing
				this.stopShowingIfAble(true);

				// emit event that this was pressed
				gameLayer.getEventBus().trigger(EVENTS.speech_node_pressed, {
					type: EVENTS.speech_node_pressed,
					tag: this.getText()
				});
			}
		}
	},

	/* endregion EVENTS */

	/* region TEXT */

	setText: function (value) {
		if (value + "" !== this.getText()) {
			this.whenRequiredResourcesReady().then(function (requestId) {
				if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

				this.label.setString(value, true);
				this._updateLayout();
			}.bind(this));
		}
	},

	getText: function () {
		return (this.label && this.label.getString()) || "";
	},

	_updateLayout: function () {
		// override in sub class
	},

	_stopAnimations: function () {
		this._showingText = false;
		if (this._showTextAction != null) {
			this.stopAction(this._showTextAction);
			this._showTextAction = null;
		}

		this._stoppingShowText = false;
		if (this._stopShowingAction != null) {
			this.stopAction(this._stopShowingAction);
			this._stopShowingAction = null;
		}
	},

	showTextWithSoundForDuration: function (text, sound, duration, removeFromParentOnComplete, isNotDismissable) {
		var showDuration = 0.0;

		// stop running animations
		this._stopAnimations();

		if (duration == null) {
			duration = CONFIG.SPEECH_DURATION;
		}

		// update show duration
		showDuration += duration + CONFIG.FADE_MEDIUM_DURATION * 2.0;

		// setup for show
		this._showingText = true;
		this.setOpacity(0.0);
		this.setIsDismissable(!isNotDismissable);
		this._removeFromParentOnComplete = removeFromParentOnComplete != null ? removeFromParentOnComplete : false;

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId) && !this._showingText) return; // resources have been invalidated

			this.setVisible(true);

			// start listening for pointer events
			this._startListeningToEvents();

			// update text
			this.setText(text);

			// play sound for enter
			audio_engine.current().play_effect(sound || RSX.sfx_ui_dialogue_enter.audio, false);

			// animate showing
			this._showTextAction = cc.sequence(
				cc.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0),
				cc.delayTime(duration),
				cc.callFunc(function () {
					this.stopShowing();
				}.bind(this))
			);
			this.runAction(this._showTextAction);
		}.bind(this));

		return showDuration;
	},

	stopShowing: function (fromPress) {
		var showDuration = 0.0;

		if (this.isVisible() && !this._stoppingShowText) {
			// stop listening for pointer events
			this._stopListeningToEvents();

			// stop animations
			this._stopAnimations();

			this._stoppingShowText = true;

			this.whenRequiredResourcesReady().then(function (requestId) {
				if (!this.getAreResourcesValid(requestId) && !this._stoppingShowText) return; // resources have been invalidated

				// play audio for exit
				audio_engine.current().play_effect(RSX.sfx_ui_dialogue_exit.audio, false);

				// animate out
				var sequence = [
					cc.callFunc(function () {
						this._stoppingShowText = false;
						this._stopShowingAction = null;

						// teardown
						this.setVisible(false);
						if (this._removeFromParentOnComplete) {
							this.destroy();
						}

						// emit event that we're done showing
						var scene = this.getScene();
						var gameLayer = scene && scene.getGameLayer();
						if (gameLayer != null) {
							gameLayer.getEventBus().trigger(EVENTS.speech_node_done_showing, {
								type: EVENTS.speech_node_done_showing,
								tag: this.getText()
							});
						}
					}.bind(this))
				];
				if (fromPress) {
					showDuration = CONFIG.FADE_FAST_DURATION;
					sequence.unshift(cc.spawn(
						cc.fadeTo(showDuration, 0),
						cc.scaleTo(showDuration, 1.05).easing(cc.easeCubicActionOut())
					));
				} else {
					showDuration = CONFIG.FADE_MEDIUM_DURATION;
					sequence.unshift(cc.spawn(
						cc.fadeTo(showDuration, 0),
						cc.scaleTo(showDuration, 0.8).easing(cc.easeCubicActionIn())
					));
				}
				this._stopShowingAction = cc.sequence(sequence);
				this.runAction(this._stopShowingAction);
			}.bind(this));
		}

		return showDuration;
	},

	stopShowingIfAble: function (fromPress) {
		var showDuration = 0.0;
		if (!this._stoppingShowText && !this._showingText) {
			showDuration = this.stopShowing(fromPress);
		}
		return showDuration;
	},

	destroyWhenDoneShowingText: function () {
		if (!this._showingText && !this._stoppingShowText) {
			// instant remove
			this.destroy();
		} else {
			// set flags for removal
			this._removeFromParentOnComplete = true;
		}
	}

	/* endregion TEXT */

});

SpeechNode.create = function(node) {
	return node || new SpeechNode();
};

module.exports = SpeechNode;
