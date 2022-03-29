//pragma PKGS: reward
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var generatePushID = require('app/common/generate_push_id');
var UtilsEngine = require("app/common/utils/utils_engine");
var audio_engine = require("app/audio/audio_engine");
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var BaseLayer = require('app/view/layers/BaseLayer');
var BaseSprite = require('app/view/nodes/BaseSprite');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Promise = require("bluebird");
var i18next = require("i18next");

/****************************************************************************
 RewardLayer
 ****************************************************************************/

var RewardLayer = BaseLayer.extend({

	_backCallback: null, // function to call when back triggered
	_backContext: null, // context to call when back triggered
	backNodeOffsetFromTopLeft: cc.p(0, 0),
	_backParameters: null, // parameters to use when back triggered
	backNode: null,
	backZOrder: 9999,
	bg: null,
	bgColor: CONFIG.CONTINUE_BG_COLOR,
	bgZOrder: -1,
	continueNode: null,
	continueButtonText: "CONTINUE", // text for continue button (when used)
	continueButtonFont: RSX.font_bold.name, // font family for continue button (when used)
	continueButtonTextColor: CONFIG.CONTINUE_BUTTON_TEXT_COLOR,
	continueTextColor: CONFIG.CONTINUE_TEXT_COLOR,
	continueFontSize: 18, // font size for continue text
	continueNodeOffsetFromBottom: cc.p(0, 50),
	continueZOrder: 9998,
	_continueHitboxes: null, // list of rectangles that can be clicked to continue when not continuing on press anywhere
	_continueCallback: null, // function to call when continue triggered
	_continueContext: null, // context to call when continue triggered
	_continueParameters: null, // parameters to use when continue triggered
	_interactiveNodes: null,
	isInteractionEnabled: true,
	isContinueOnPressAnywhere: true,
	_mouseOverInteractiveElement: null,
	_requestId: null,
	_titleLabel: null,
	_titlesAction: null,
	_subtitleLabel: null,
	_whenResourcesReady: null,
	_whenResourcesReadyResolve: null,

	ctor:function () {
		// initialize properties that may be required in init
		this._continueHitboxes = [];
		this._interactiveNodes = [];

		// generate unique id for requests
		this._requestId = generatePushID();

		// do super ctor
		this._super();

		// scene elements
		this.showBackground();
		this.showContinueNode();
	},

	/* region RESOURCES */

	getRequiredResources: function () {
		return BaseLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("reward"));
	},

	/* endregion RESOURCES */

	/* region SCENE */

	onEnter:function () {
		this._super();
		this.getFX().requestBlurSurface(this._requestId);
	},

	onExit:function () {
		// unlock user triggered nav
		NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._requestId);

		// unblur
		this.getFX().requestUnblurSurface(this._requestId);

		this._super();
	},

	/* endregion SCENE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

		// set self to middle of screen
		this.setPosition(winCenterPosition);

		// elements
		this.resizeBackground();
		this.resizeContinueNodes();
		this.resizeBackNodes();
	},

	/* endregion LAYOUT */

	/* region BACKGROUND */

	/**
	 * Shows background, defaulting to vignette. Override to show different background.
	 */
	showBackground: function () {
		return this.showVignetteBackground();
	},

	/**
	 * Shows vignette background and returns a promise.
	 * NOTE: this method should only be called after the layer is constructed and added to the scene.
	 * @param {Number} [duration=0.0] time in seconds
	 * @param {Number} [zOrder=this.bgZOrder]
	 * @returns {Promise}
	 */
	showVignetteBackground: function (duration, zOrder) {
		if (duration == null) { duration = 0.0; }
		if (zOrder == null) { zOrder = this.bgZOrder; }

		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// remove previous bg
			this.removeBackground(duration);

			// store properties
			this.bgZOrder = zOrder;

			this.bg = BaseSprite.create(RSX.vignette.img);
			this.bg.setAnchorPoint(0.5, 0.5);
			this.bg.setPosition(0.0, 0.0);
			this.addChild(this.bg, this.bgZOrder);

			if (this.isRunning()) {
				// resize and draw when this is already running (in scene)
				// otherwise, resize will occur automatically on first init
				this.resizeBackground();
			}

			if (duration != null && duration > 0.0) {
				this.bg.setOpacity(0.0);
				this.bg.fadeTo(duration, 255.0);
			}
		}.bind(this));
	},

	/**
	 * Shows a flat color background and returns a promise.
	 * NOTE: this method should only be called after the layer is constructed and added to the scene.
	 * @param {Number} [duration=0.0] time in seconds
	 * @param {cc.Color} [color=this.bgColor]
	 * @param {Number} [zOrder=this.bgZOrder]
	 * @returns {Promise}
	 */
	showFlatBackground: function (duration, color, zOrder) {
		if (duration == null) { duration = 0.0; }
		if (color == null) { color = this.bgColor; }
		if (zOrder == null) { zOrder = this.bgZOrder; }

		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// remove previous bg
			this.removeBackground(duration);

			// store properties
			this.bgColor = color;
			this.bgZOrder = zOrder;

			// create bg
			this.bg = new cc.DrawNode();
			this.bg.setAnchorPoint(0.5, 0.5);
			this.bg.setPosition(0.0, 0.0);
			this.addChild(this.bg, this.bgZOrder);

			if (this.isRunning()) {
				// resize and draw when this is already running (in scene)
				// otherwise, resize will occur automatically on first init
				this.resizeBackground();
			}

			if (duration != null && duration > 0.0) {
				this.bg.setOpacity(0.0);
				this.bg.fadeTo(duration, 255.0);
			}
		}.bind(this));
	},

	/**
	 * Removes current background.
	 * @param {Number} [duration=0.0] time in seconds
	 */
	removeBackground: function (duration) {
		if (this.bg != null) {
			if (duration == null) { duration = 0.0; }
			this.bg.destroy(duration);
			this.bg = null;
		}
	},

	resizeBackground: function () {
		if (this.bg != null) {
			// redraw bg
			if (this.bg instanceof cc.DrawNode) {
				var winSize = UtilsEngine.getGSIWinSize();
				this.bg.clear();
				this.bg.drawRect(cc.p(-Math.round(winSize.width * 0.5) - 1.0, -Math.round(winSize.height * 0.5) - 1.0), cc.p(Math.round(winSize.width * 0.5) + 1.0, Math.round(winSize.height * 0.5) + 1.0), this.bgColor);
			} else {
				// scale bg
				this.bg.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.bg));
			}
		}
	},

	/* endregion BACKGROUND */

	/* region INTERACTION */

	addInteractiveElement: function (node) {
		if (!_.contains(this._interactiveNodes, node)) {
			this._interactiveNodes.push(node);
		}
	},

	removeInteractiveElement: function (node) {
		var index = _.indexOf(this._interactiveNodes, node);
		if (index !== -1) {
			this._interactiveNodes.splice(index, 1);
		}
	},

	/**
	 * Sets whether interaction is enabled, locking or unlocking user triggered navigation as necessary.
	 * @param {Boolean} val
	 * @param {Number} [duration=0.0]
	 */
	setIsInteractionEnabled: function (val, duration) {
		if (this.isInteractionEnabled != val) {
			this.isInteractionEnabled = val;

			// update user triggered navigation
			var scene = this.getScene();
			if (scene != null) {
				if (this.isInteractionEnabled) {
					NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._requestId)
				} else {
					NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._requestId)
				}
			}
		}
	},

	getIsInteractionEnabled: function () {
		return this.isInteractionEnabled;
	},

	/* endregion INTERACTION */

	/* region CONTINUE */

	/**
	 * Shows continue node, defaulting to press anywhere label. Override to show different continue node.
	 * @returns {Promise}
	 */
	showContinueNode: function () {
		return this.showPressAnywhereToContinueNode();
	},

	/**
	 * Shows press anywhere to continue label and returns a promise.
	 * @param {Number} [duration=0.0] time in seconds
	 * @param {Number} [fontSize=this.continueFontSize]
	 * @param {cc.Color} [textColor=this.textColor]
	 * @returns {Promise}
	 */
	showPressAnywhereToContinueNode: function (duration, fontSize, textColor) {
		if (duration == null) { duration = 0.0; }
		if (fontSize == null) { fontSize = this.continueFontSize; }
		if (textColor == null) { textColor = this.continueTextColor; }

		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			this.removeContinueNodes(duration);

			this.continueFontSize = fontSize;
			this.continueTextColor = textColor;

			this.continueNode = new cc.LabelTTF(i18next.t("common.press_anywhere_to_continue_label").toUpperCase(), RSX.font_light.name, this.continueFontSize, null, cc.TEXT_ALIGNMENT_CENTER);
			this.continueNode.setFontFillColor(this.continueTextColor);
			this.addChild(this.continueNode, this.continueZOrder);

			if (this.isRunning()) {
				// resize when this is already running (in scene)
				// otherwise, resize will occur automatically on first init
				this.resizeContinueNodes();
			}

			if (duration != null && duration > 0.0) {
				this.continueNode.setOpacity(0.0);
				this.continueNode.fadeTo(duration, 255.0);
			}
		}.bind(this));
	},

	/**
	 * Shows press to continue button and returns a promise.
	 * @param {Number} [duration=0.0] time in seconds
	 * @param {String} [buttonText=this.continueButtonText]
	 * @param {String} [font=this.continueButtonFont]
	 * @param {Number} [fontSize=this.continueFontSize]
	 * @param {cc.Color} [textColor=this.textColor]
	 * @returns {Promise}
	 */
	showPressToContinueNode: function (duration, buttonText, font, fontSize, textColor) {
		if (duration == null) { duration = 0.0; }
		if (buttonText == null) { buttonText = this.continueButtonText; }
		if (font == null) { font = this.continueButtonFont; }
		if (fontSize == null) { fontSize = this.continueFontSize; }
		if (textColor == null) { textColor = this.continueButtonTextColor; }

		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			this.removeContinueNodes(duration);

			this.continueButtonText = buttonText;
			this.continueFontSize = fontSize;
			this.continueButtonFont = font;
			this.continueButtonTextColor = textColor;

			var continueButtonSprite = new ccui.Scale9Sprite(RSX.button_secondary.img);
			var continueButtonGlowSprite = new ccui.Scale9Sprite(RSX.button_secondary_glow.img);
			var continueButtonSize = continueButtonSprite.getContentSize();
			var continueButtonLabel = new cc.LabelTTF(this.continueButtonText, this.continueButtonFont, this.continueFontSize, null, cc.TEXT_ALIGNMENT_CENTER);
			continueButtonLabel.setFontFillColor(this.continueButtonTextColor);

			this.continueNode = new cc.ControlButton(continueButtonLabel, continueButtonSprite);
			this.continueNode.setPreferredSize(continueButtonSize);
			this.continueNode.setAdjustBackgroundImage(false);
			this.continueNode.setZoomOnTouchDown(false);
			this.continueNode.setBackgroundSpriteForState(continueButtonSprite,cc.CONTROL_STATE_NORMAL);
			this.continueNode.setBackgroundSpriteForState(continueButtonGlowSprite,cc.CONTROL_STATE_HIGHLIGHTED);
			this.addChild(this.continueNode, this.continueZOrder);

			// add as interactive
			this.addInteractiveElement(this.continueNode);

			if (this.isRunning()) {
				// resize when this is already running (in scene)
				// otherwise, resize will occur automatically on first init
				this.resizeContinueNodes();
			}

			if (duration != null && duration > 0.0) {
				this.continueNode.setOpacity(0.0);
				this.continueNode.fadeTo(duration, 255.0);
			}
		}.bind(this));
	},

	/**
	 * Removes current continue node(s).
	 * @param {Number} [duration=0.0] time in seconds
	 */
	removeContinueNodes: function (duration) {
		if (this.continueNode != null) {
			if (duration == null) { duration = 0.0; }
			this.removeInteractiveElement(this.continueNode);
			this.continueNode.destroy(duration);
			this.continueNode = null;
		}
	},

	resizeContinueNodes: function () {
		if (this.continueNode != null) {
			this.continueNode.setPosition(
				this.continueNodeOffsetFromBottom.x,
				-UtilsEngine.getGSIWinHeight() * 0.5 + this.continueNodeOffsetFromBottom.y
			);
		}
	},

	/**
	 * Sets whether continue occurs on press anywhere.
	 * @param {Boolean} val
	 */
	setIsContinueOnPressAnywhere: function (val) {
		this.isContinueOnPressAnywhere = val;
	},

	getIsContinueOnPressAnywhere: function () {
		return this.isContinueOnPressAnywhere;
	},

	/**
	 * Sets a callback to fire when continue occurs.
	 * @param {Function} callback
	 * @param {*} [context=this]
	 * @param {Array} [parameters=null]
	 */
	setContinueCallback: function (callback, context, parameters) {
		if (callback == null) {
			this.resetContinueCallback();
		} else {
			this._continueCallback = callback;
			this._continueContext = context;
			this._continueParameters = parameters;
		}
	},

	/**
	 * Resets the callback to fire when continue occurs.
	 */
	resetContinueCallback: function () {
		this._continueCallback = this._continueContext = this._continueParameters = null;
	},

	/**
	 * Adds a hitbox / rect to a list of hitboxes that may be pressed to continue.
	 * @param {cc.Rect} rect
	 */
	addContinueHitbox: function (rect) {
		if (this.indexOfContinueHitbox(rect) === -1) {
			this._continueHitboxes.push(rect);
		}
	},

	/**
	 * Removes a hitbox / rect from a list of hitboxes that may be pressed to continue.
	 * @param {cc.Rect} rect
	 */
	removeContinueHitbox: function (rect) {
		var index = this.indexOfContinueHitbox(rect);
		if (index !== -1) {
			this._continueHitboxes.splice(index, 1);
		}
	},

	/**
	 * Resets all hitboxes that may be pressed to continue.
	 */
	resetContinueHitboxes: function () {
		if (this._continueHitboxes.length > 0) {
			this._continueHitboxes = [];
		}
	},

	indexOfContinueHitbox: function (rect) {
		for (var i = this._continueHitboxes.length - 1; i >= 0; i--) {
			var existingRect = this._continueHitboxes[i];
			if (cc.rectEqualToRect(existingRect, rect)) {
				return i;
			}
		}

		return -1;
	},

	/**
	 * Helper method to disable continue, hide continue label/button, reset continue hitboxes, and reset continue callback.
	 */
	disablePressToContinueAndHitboxesAndCallback: function () {
		this.setIsInteractionEnabled(false);
		this.setIsContinueOnPressAnywhere(false);

		// disable continue button
		if (this.continueNode instanceof cc.ControlButton) {
			this.continueNode.setEnabled(false);
		}

		// reset continue elements
		this.resetContinueHitboxes();
		this.resetContinueCallback();
		this.resetMouseOverInteractiveElement();
	},

	/* endregion CONTINUE */

	/* region BACK */

	/**
	 * Shows a back corner button.
	 * @param {Number} [duration=0.0]
	 * @returns {Promise}
	 */
	showBackCornerButton: function (duration) {
		if (duration == null) { duration = 0.0; }

		return this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			this.removeBackNodes(duration);

			this.backNode = new BaseSprite(RSX.button_back_corner.img);
			this.backNode.setAnchorPoint(0.0, 1.0);
			this.addChild(this.backNode, this.backZOrder);

			// add as interactive
			this.addInteractiveElement(this.backNode);

			if (this.isRunning()) {
				// resize when this is already running (in scene)
				// otherwise, resize will occur automatically on first init
				this.resizeBackNodes();
			}

			if (duration != null && duration > 0.0) {
				this.backNode.setOpacity(0.0);
				this.backNode.fadeTo(duration, 255.0);
			}
		}.bind(this));
	},

	/**
	 * Removes current back node(s).
	 * @param {Number} [duration=0.0] time in seconds
	 */
	removeBackNodes: function (duration) {
		if (this.backNode != null) {
			if (duration == null) { duration = 0.0; }
			this.removeInteractiveElement(this.backNode);
			this.backNode.destroy(duration);
			this.backNode = null;
		}
	},

	resizeBackNodes: function () {
		if (this.backNode != null) {
			this.backNode.setPosition(
				-UtilsEngine.getGSIWinWidth() * 0.5 + this.backNodeOffsetFromTopLeft.x,
				UtilsEngine.getGSIWinHeight() * 0.5 - this.backNodeOffsetFromTopLeft.y
			);
		}
	},

	/**
	 * Sets a callback to fire when back occurs.
	 * @param {Function} callback
	 * @param {*} [context=this]
	 * @param {Array} [parameters=null]
	 */
	setBackCallback: function (callback, context, parameters) {
		if (callback == null) {
			this.resetBackCallback();
		} else {
			this._backCallback = callback;
			this._backContext = context;
			this._backParameters = parameters;
		}
	},

	/**
	 * Resets the callback to fire when back occurs.
	 */
	resetBackCallback: function () {
		this._backCallback = this._backContext = this._backParameters = null;
	},

	/* endregion BACK */

	/* region TITLES */

	/**
	 * Shows titles, optionally animating if duration is provided.
	 * @param {Number} [duration=0.0]
	 * @param {String} [title=null]
	 * @param {String} [subtitle=null]
	 * @param {Vec2} [titlePosition=auto]
	 * @param {Vec2} [subtitlePosition=auto]
	 * @returns {Promise}
	 */
	showTitles: function(duration, title, subtitle, titlePosition, subtitlePosition) {
		return new Promise(function (resolve) {
			if (duration == null) { duration = 0.0; }

			if (this._titlesAction != null) {
				this.stopAction(this._titlesAction);
				this._titlesAction = null;
			}

			// title label
			if (title != null && title.length > 0) {
				var titleLabel = this.getOrCreateTitleLabel();
				titleLabel.setString(title.toUpperCase());
			} else {
				// remove title
				if (this._titleLabel != null) {
					this._titleLabel.destroy(duration);
					this._titleLabel = null;
				}
			}

			// subtitle label
			var subtitleLabel;
			if (subtitle != null && subtitle.length > 0) {
				// dual positions
				if (titlePosition == null) { titlePosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.5 + 180); }
				if (subtitlePosition == null) { subtitlePosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.5 + 120); }

				subtitleLabel = this.getOrCreateSubtitleLabel();
				subtitleLabel.setString(subtitle);
			} else {
				// single position
				if (titlePosition == null) { titlePosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.5 + 140); }

				// remove subtitle
				if (this._subtitleLabel != null) {
					this._subtitleLabel.destroy(duration);
					this._subtitleLabel = null;
				}
			}

			// setup sequence
			var sequence = [];

			// show title
			if (titleLabel != null) {
				titleLabel.setScale(1.0);
				if (duration > 0.0) {
					titleLabel.setPosition(titlePosition.x, titlePosition.y - 20.0);
					titleLabel.fadeTo(0.0, 0.0);
					var titleAction = cc.spawn(
						cc.show(),
						cc.fadeIn(duration),
						cc.moveBy(duration, cc.p(0, 20)).easing(cc.easeCubicActionOut())
					);
					titleAction.setTag(CONFIG.FADE_TAG);
					sequence.push(cc.targetedAction(titleLabel, titleAction));
				} else {
					titleLabel.setPosition(titlePosition);
					titleLabel.fadeTo(0.0, 255.0);
				}
			}

			// show subtitle
			if (subtitleLabel != null) {
				subtitleLabel.setScale(1.0);
				if (duration > 0.0) {
					subtitleLabel.setPosition(subtitlePosition.x, subtitlePosition.y - 10.0);
					subtitleLabel.fadeTo(0.0, 0.0);
					var subtitleSequence = [];
					if (titleLabel != null) {
						subtitleSequence.push(cc.delayTime(0.1));
					}
					subtitleSequence.push(cc.spawn(
						cc.show(),
						cc.fadeIn(duration),
						cc.moveBy(duration, cc.p(0, 10)).easing(cc.easeCubicActionOut())
					));
					var subtitleAction;
					if (subtitleSequence.length > 1) {
						subtitleAction = cc.sequence(subtitleSequence);
					} else {
						subtitleAction = subtitleSequence[0];
					}
					subtitleAction.setTag(CONFIG.FADE_TAG);
					sequence.push(cc.targetedAction(subtitleLabel, subtitleAction));
				} else {
					subtitleLabel.setPosition(subtitlePosition);
					subtitleLabel.fadeTo(0.0, 255);
				}
			}

			if (sequence.length > 0) {
				this._titlesAction = cc.sequence(
					cc.spawn(sequence),
					cc.callFunc(function () {
						this._titlesAction = null;
						resolve();
					}.bind(this))
				);
				this.runAction(this._titlesAction);
			} else {
				resolve();
			}
		}.bind(this))
		.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
	},

	/**
	 * Hides any currently showing titles.
	 * @param {Number} [duration=0.0]
	 * @returns {Promise}
	 */
	stopShowingTitles: function (duration) {
		return new Promise(function (resolve) {
			if (duration == null) { duration = 0.0; }
			var isAnimating = duration > 0.0;

			if (this._titlesAction != null) {
				this.stopAction(this._titlesAction);
				this._titlesAction = null;
			}

			// title
			if (this._titleLabel != null) {
				this._titleLabel.fadeToInvisible(duration);
			}

			// subtitle
			if (this._subtitleLabel != null) {
				this._subtitleLabel.fadeToInvisible(duration);
			}

			if (isAnimating) {
				this._titlesAction = cc.sequence(
					cc.delayTime(duration),
					cc.callFunc(function () {
						this._titlesAction = null;
						resolve();
					}.bind(this))
				);
				this.runAction(this._titlesAction);
			} else {
				// immediate resolve when not animating
				resolve();
			}
		}.bind(this))
		.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
	},

	getTitleLabel: function () {
		return this._titleLabel;
	},

	getOrCreateTitleLabel: function () {
		if (this._titleLabel == null) {
			this._titleLabel = new cc.LabelTTF("", RSX.font_light.name, 32, cc.size(1200, 36), cc.TEXT_ALIGNMENT_CENTER);
			this._titleLabel.setFontFillColor({r: 255, g: 255, b: 255});
			this._titleLabel.setVisible(false);
			this.addChild(this._titleLabel);
		}
		return this._titleLabel;
	},

	getSubtitleLabel: function () {
		return this._subtitleLabel;
	},

	getOrCreateSubtitleLabel: function () {
		if (this._subtitleLabel == null) {
			this._subtitleLabel = new cc.LabelTTF("", RSX.font_light.name, 20, cc.size(1200, 60), cc.TEXT_ALIGNMENT_CENTER);
			this._subtitleLabel.setFontFillColor({r: 255, g: 255, b: 255});
			this._subtitleLabel.setVisible(false);
			this.addChild(this._subtitleLabel);
		}
		return this._subtitleLabel;
	},

	/* endregion TITLES */

	/* region EVENTS */

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
		}
	},

	resetMouseOverInteractiveElement: function () {
		if (this._mouseOverInteractiveElement != null) {
			if (this._mouseOverInteractiveElement instanceof cc.ControlButton) {
				this._mouseOverInteractiveElement.setHighlighted(false);
			}
			this._mouseOverInteractiveElement = null;
		}
	},

	onPointerMove: function(event) {
		if (event && event.isStopped) {
			return;
		}

		var mouseOverInteractiveElement;
		if (this.getIsInteractionEnabled()) {
			var location = event && event.getLocation();
			if (location) {
				// try interactive nodes
				if (this._interactiveNodes.length > 0) {
					for (var i = this._interactiveNodes.length - 1; i >= 0; i--) {
						var interactiveNode = this._interactiveNodes[i];
						if (interactiveNode.isVisible() && UtilsEngine.getNodeUnderMouse(interactiveNode, location.x, location.y)) {
							mouseOverInteractiveElement = interactiveNode;
							event.stopPropagation();
							break;
						}
					}
				}

				// try hitboxes
				if (!event.isStopped && this._continueHitboxes.length > 0) {
					for (var i = this._continueHitboxes.length - 1; i >= 0; i--) {
						var hitbox = this._continueHitboxes[i];
						if (cc.rectContainsPoint(hitbox, location)) {
							mouseOverInteractiveElement = hitbox;
							break;
						}
					}
				}
			}
		}

		if (this._mouseOverInteractiveElement != mouseOverInteractiveElement) {
			this.resetMouseOverInteractiveElement();

			this._mouseOverInteractiveElement = mouseOverInteractiveElement;

			if (this._mouseOverInteractiveElement != null) {
				this.onHoverInteractiveElement();
			}
		}
	},

	onPointerUp: function(event) {
		if (event && event.isStopped) {
			return;
		}

		var location = event && event.getLocation();
		if (location && this.getIsInteractionEnabled()) {
			// try back
			if (this.backNode != null
				&& this.backNode.isVisible()
				&& UtilsEngine.getNodeUnderMouse(this.backNode, location.x, location.y)) {
				event.stopPropagation();
				this.onBack();
			}

			// try continue
			if (!event.isStopped) {
				if (this.getIsContinueOnPressAnywhere()
					|| (this.continueNode instanceof cc.ControlButton
					&& this.continueNode.isVisible()
					&& UtilsEngine.getNodeUnderMouse(this.continueNode, location.x, location.y))) {
					event.stopPropagation();
					this.onContinue();
				} else if (this._continueHitboxes.length > 0) {
					for (var i = this._continueHitboxes.length - 1; i >= 0; i--) {
						if (cc.rectContainsPoint(this._continueHitboxes[i], location)) {
							event.stopPropagation();
							this.onContinue();
							break;
						}
					}
				}
			}
		}
	},

	onHoverInteractiveElement: function () {
		if (this._mouseOverInteractiveElement != null) {
			if (this._mouseOverInteractiveElement instanceof cc.ControlButton) {
				this._mouseOverInteractiveElement.setHighlighted(true);
			}
			audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
		}
	},

	onContinue: function () {
		audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

		if (this._continueCallback != null) {
			var context = this._continueContext || this;
			if (this._continueParameters != null) {
				this._continueCallback.apply(context, this._continueParameters);
			} else {
				this._continueCallback.call(context);
			}
		} else {
			NavigationManager.getInstance().requestUserTriggeredCancel();
		}
	},

	onBack: function () {
		audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);

		if (this._backCallback != null) {
			var context = this._backContext || this;
			if (this._backParameters != null) {
				this._backCallback.apply(context, this._backParameters);
			} else {
				this._backCallback.call(context);
			}
		} else {
			NavigationManager.getInstance().requestUserTriggeredCancel();
		}
	}

	/* endregion EVENTS */

});

RewardLayer.create = function(layer) {
	return BaseLayer.create(layer || new RewardLayer());
};

module.exports = RewardLayer;
