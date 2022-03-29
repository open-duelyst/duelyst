//pragma PKGS: rift
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var RSX = require("app/data/resources");
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsEngine = require('app/common/utils/utils_engine');
var BaseLayer = require("./../BaseLayer");
var BaseParticleSystem = require("./../../nodes/BaseParticleSystem");
var BaseSprite = require('./../../nodes/BaseSprite');
var GlowSprite = require('./../../nodes/GlowSprite');
var CardNode = require('./../../nodes/cards/CardNode');
var ZodiacNode = require('./../../nodes/draw/Zodiac');
var TweenTypes = require('./../../actions/TweenTypes');
var ToneCurve = require('./../../actions/ToneCurve');
var Shake = require('./../../actions/Shake');
var audio_engine = require("./../../../audio/audio_engine");
var Promise = require("bluebird");

/****************************************************************************
 UpgradeInstructionsLayer
 ****************************************************************************/

var UpgradeInstructionsLayer = BaseLayer.extend({

	delegate:null,

	// ui elements
	runDetailsLabel:null,

	/* region INITIALIZE */
	ctor:function (riftData,wonLastGauntletGame) {

		// do super ctor
		this._super();

		var hasStoredUpgrades = (riftData.stored_upgrades != null) && (riftData.stored_upgrades.length != 0);

		// instructional arrow
		var winSize = UtilsEngine.getGSIWinSize()
		var instructionalArrowSprite = BaseSprite.create(RSX.instructional_arrow.img);
		instructionalArrowSprite.setPosition(cc.p(0.0, 0.0));
		instructionalArrowSprite.setOpacity(0.0);
		instructionalArrowSprite.setRotation(-90);
		instructionalArrowSprite.runAction(cc.sequence(
			cc.delayTime(0.2),
			cc.fadeIn(CONFIG.FADE_MEDIUM_DURATION),
			cc.moveBy(CONFIG.MOVE_SLOW_DURATION, cc.p(winSize.width/2-400, 0)).easing(cc.easeExponentialOut()),
			cc.delayTime(1.0),
			cc.callFunc(function () {
				// instructionalArrowSprite.destroy(CONFIG.FADE_MEDIUM_DURATION);
			})
		));
		this.addChild(instructionalArrowSprite);

		// label
			this.runDetailsLabel = new cc.LabelTTF(i18next.t("rift.choose_card_upgrade_instruction_message"), RSX.font_bold.name, 32, cc.size(500,50), cc.TEXT_ALIGNMENT_CENTER);
		this.runDetailsLabel.setPosition(0,60);
		this.runDetailsLabel.setFontFillColor(cc.color(255, 255, 255));

		// add label
		this.addChild(this.runDetailsLabel);

		var upgradeDetailText = "";
		if (hasStoredUpgrades) {
			var storedPacksRemaining = 0;
			if (riftData != null && riftData.stored_upgrades != null) {
				storedPacksRemaining = riftData.stored_upgrades.length;
			}
			upgradeDetailText = i18next.t("rift.upgrade_details_with_stored_packs_message",{storedPacks:storedPacksRemaining});
		} else {
			upgradeDetailText = i18next.t("rift.upgrade_details_message");
			var storedUpgradeCount = ProfileManager.getInstance().profile.get("rift_stored_upgrade_count") || 0;
			if (storedUpgradeCount >= 10) {
				upgradeDetailText += i18next.t("rift.upgrade_added_details_max_saved_message");
			} else {
				upgradeDetailText += i18next.t("rift.upgrade_added_details_current_saved_message",{storedUpgradeCount:storedUpgradeCount});
			}
		}

		this.runProgressLabel = new cc.LabelTTF(upgradeDetailText, RSX.font_regular.name, 20, cc.size(800,80), cc.TEXT_ALIGNMENT_CENTER);
		this.runProgressLabel.setPosition(0,-60);
		this.runProgressLabel.setFontFillColor(cc.color(255, 255, 255));

		// add label
		this.addChild(this.runProgressLabel);

		// progress label
		this.runProgressAmountLabel = new cc.LabelTTF("", RSX.font_regular.name, 14, cc.size(500,32), cc.TEXT_ALIGNMENT_CENTER);
		this.runProgressAmountLabel.setPosition(0,-80);
		this.runProgressAmountLabel.setFontFillColor(cc.color(255, 255, 255));

		// add label
		this.addChild(this.runProgressAmountLabel);
	},

	/* region TRANSITION */

	transitionIn: function() {
		return new Promise(function(resolve,reject){
			this.setOpacity(0.0);
			this.runAction(cc.sequence(
				cc.fadeIn(CONFIG.FADE_FAST_DURATION),
				cc.callFunc(function(){
					resolve();
				})
			));
		}.bind(this));
	},

	transitionOut: function() {
		return new Promise(function(resolve,reject){
			this.runAction(cc.sequence(
				cc.fadeOut(CONFIG.FADE_FAST_DURATION),
				cc.callFunc(function(){
					resolve();
				})
			));
		}.bind(this));
	}

	/* endregion TRANSITION */

});

UpgradeInstructionsLayer.create = function(layer) {
	return BaseLayer.create(layer || new UpgradeInstructionsLayer());
};

module.exports = UpgradeInstructionsLayer;
