//pragma PKGS: gift_loot_crate

var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var LootCrateNode = require('./LootCrateNode');
var CrateManager = require("app/ui/managers/crate_manager");

/****************************************************************************
 GiftCrateNode
 ****************************************************************************/

var GiftCrateNode = LootCrateNode.extend({

	/* region GETTERS / SETTERS */

	getRequiredResources: function () {
		return this._super().concat(PKGS.getPkgForIdentifier("gift_loot_crate"));
	},

	_getLootCrateSphereSpriteIdentifier: function () {
		return RSX.gift_loot_crate_sphere.img;
	},
	_getLootCrateFrontLeftSpriteIdentifier: function () {
		return RSX.gift_loot_crate_front_left.img;
	},
	_getLootCrateFrontRightSpriteIdentifier: function () {
		return RSX.gift_loot_crate_front_right.img;
	},
	_getLootCrateTopSpriteIdentifier: function () {
		return RSX.gift_loot_crate_top.img;
	},
	_getLootCrateBottomSpriteIdentifier: function () {
		return RSX.gift_loot_crate_bottom.img;
	},
	_getLootCrateBackLeftSpriteIdentifier: function () {
		return RSX.gift_loot_crate_back_left.img;
	},
	_getLootCrateBackRightSpriteIdentifier: function () {
		return RSX.gift_loot_crate_back_right.img;
	},
	_getLootCrateGlowSpriteIdentifier: function () {
		return RSX.gift_loot_crate_glow_map.img;
	},

	getCrateType: function () {
		return GiftCrateNode.crateType;
	},

	getCrateCount: function () {
		return CrateManager.getInstance().getGiftCrateCount();
	},

	/* endregion GETTERS / SETTERS */

	/* region LABELS */

	showCrateMaxCountLabel: function () {
		LootCrateNode.prototype.showCrateMaxCountLabel.apply(this, arguments);
		this._crateMaxCountLabel.setString("x");
	},

	showCrateDescriptionLabel: function (duration, fontName, fontSize, fontColor, contentSize) {
		if (contentSize == null) { contentSize = cc.size(275, 0); }
		LootCrateNode.prototype.showCrateDescriptionLabel.call(this, duration, fontName, fontSize, fontColor, contentSize);
	}

	/* endregion LABELS */

});

GiftCrateNode.crateType = "gift";

GiftCrateNode.create = function(node) {
	return LootCrateNode.create(node || new GiftCrateNode());
};

module.exports = GiftCrateNode;
