//pragma PKGS: mystery_crate_node

var CONFIG = require("app/common/config");
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var BaseSprite = require('app/view/nodes/BaseSprite');
var GlowSprite = require('app/view/nodes/GlowSprite');
var LootCrateNode = require('./LootCrateNode');
var CrateManager = require("app/ui/managers/crate_manager");
var Promise = require("bluebird");

/****************************************************************************
 MysteryCrateNode
 - abstract base class for mystery loot crates (do not use this class directly)
 ****************************************************************************/

var MysteryCrateNode = LootCrateNode.extend({

	_lootCrateKeySprite: null,
	_showKeyPromise: null,
	_stopShowingKeyPromise: null,

	/* region GETTERS / SETTERS */

	_getLootCrateKeySpriteIdentifier: function () {
		return null;
	},

	getCrateCount: function () {
		return CrateManager.getInstance().getCosmeticChestCountForType(this.getCrateType());
	},

	getCrateKeyCount: function () {
		return CrateManager.getInstance().getCosmeticChestKeyCountForType(this.getCrateType());
	},

	getCrateCountLabelBasePosition: function () {
		var position = this.getCrateTypeLabelBasePosition();
		position.x += -15.0;
		position.y += -40.0;
		return position;
	},

	getCrateMaxCountLabelBasePosition: function () {
		var position = this.getCrateCountLabelBasePosition();
		position.x += 31.0;
		return position;
	},

	getUsesKeys: function () {
		return false;
	},

	/* endregion GETTERS / SETTERS */

	/* region LABELS */

	showCrateMaxCountLabel: function () {
		LootCrateNode.prototype.showCrateMaxCountLabel.apply(this, arguments);
		this._crateMaxCountLabel.setString("/ 5");
	},

	/* endregion LABELS */

	/* region REWARDS */

	/**
	 * Shows key for crate.
	 * @param {Number} [duration=0.0]
	 * @returns {Promise}
	 */
	showKey: function (duration) {
		if (this._showKeyPromise == null) {
			// cancel hiding key
			if (this._stopShowingKeyPromise != null) {
				this._stopShowingKeyPromise.cancel();
				this._stopShowingKeyPromise = null;
			}

			// create/show key
			this._showKeyPromise = this.whenRequiredResourcesReady().then(function (requestId) {
				if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

				return new Promise(function (resolve) {
					this._showKeyPromise = null;

					// key sprite
					if (this._lootCrateKeySprite == null) {
						this._lootCrateKeySprite = BaseSprite.create(this._getLootCrateKeySpriteIdentifier());
						this._lootCrateKeySprite.setVisible(false);
						this._lootCrateKeySprite.setRotation(90.0);
						this.addChild(this._lootCrateKeySprite, this._zOrderBehindCrate);
					}

					// animate key in
					var contentSize = this.getContentSize();
					var centerPosition = this.getCenterPosition();
					this._lootCrateKeySprite.setPosition(centerPosition.x, centerPosition.y - contentSize.height * 0.5 - this._lootCrateKeySprite.getContentSize().width * 0.5 - 30.0);
					this._lootCrateKeySprite.fadeTo(duration, 255.0, function () {
						resolve();
					});
				}.bind(this))
				.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
			}.bind(this))
			.cancellable()
			.catch(Promise.CancellationError, function () {
				Logger.module("APPLICATION").log("MysteryCrateNode -> key show promise chain cancelled");
			});
		}
		return this._showKeyPromise;
	},

	/**
	 * Stops showing key.
	 * @param {Number} [duration=0.0]
	 * @returns {Promise}
	 */
	stopShowingKey: function (duration) {
		// cancel showing key
		if (this._showKeyPromise != null) {
			this._showKeyPromise.cancel();
			this._showKeyPromise = null;
		}

		// hide key
		if (this._lootCrateKeySprite != null) {
			if (duration == null) { duration = 0.0; }
			this._stopShowingKeyPromise = this.whenRequiredResourcesReady().then(function (requestId) {
				if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

				return new Promise(function (resolve) {
					this._stopShowingKeyPromise = null;
					this._lootCrateKeySprite.fadeToInvisible(duration, function () { resolve(); });
				}.bind(this))
				.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
			}.bind(this))
			.cancellable()
			.catch(Promise.CancellationError, function () {
				Logger.module("APPLICATION").log("MysteryCrateNode -> key hide promise chain cancelled");
			});
		}

		return this._stopShowingKeyPromise;
	},

	showOpeningAndRewards: function () {
		return this.showKey(CONFIG.ANIMATE_MEDIUM_DURATION).then(function () {
			// show unlock
			return new Promise(function (resolve) {
				// show crate as static but preserve fx
				this.showStaticState(CONFIG.ANIMATE_FAST_DURATION, true);

				// animate key into box
				var contentSize = this.getContentSize();
				var centerPosition = this.getCenterPosition();
				this._lootCrateKeySprite.runAction(cc.sequence(
					cc.spawn(
						cc.rotateTo(CONFIG.ANIMATE_SLOW_DURATION, 0.0).easing(cc.easeCubicActionInOut()),
						cc.moveBy(CONFIG.ANIMATE_SLOW_DURATION, 0.0, -60.0).easing(cc.easeCubicActionInOut())
					),
					cc.moveTo(CONFIG.ANIMATE_MEDIUM_DURATION, centerPosition.x, centerPosition.y - contentSize.height * 0.5).easing(cc.easeBackIn()),
					cc.spawn(
						cc.sequence(
							cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
							cc.hide()
						),
						cc.callFunc(function () {
							resolve();
						}.bind(this))
					)
				));
			}.bind(this))
			.catch(function (error) { EventBus.getInstance().trigger(EVENTS.error, error); });
		}.bind(this)).then(function () {
			// show actual opening
			return LootCrateNode.prototype.showOpeningAndRewards.call(this);
		}.bind(this));
	},

	/* endregion REWARDS */

});

MysteryCrateNode.create = function(node) {
	return LootCrateNode.create(node || new MysteryCrateNode());
};

module.exports = MysteryCrateNode;
