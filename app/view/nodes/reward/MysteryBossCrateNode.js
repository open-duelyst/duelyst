//pragma PKGS: mystery_boss_crate_node

var SDK = require("app/sdk");
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var MysteryCrateNode = require('./MysteryCrateNode');

/****************************************************************************
 MysteryBossCrateNode
 ****************************************************************************/

// TODO: Rewrite this

var MysteryBossCrateNode = MysteryCrateNode.extend({

	getCrateType: function () {
		return MysteryBossCrateNode.crateType;
	},

	getCrateCount: function () {
		return CrateManager.getInstance().getCosmeticChestCountForType(SDK.CosmeticsChestTypeLookup.Boss);
	},

	getRequiredResources: function () {
		return this._super().concat(PKGS.getPkgForIdentifier("mystery_boss_crate_node"));
	},

	_getLootCrateSphereSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_sphere.img;
	},
	_getLootCrateFrontLeftSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_front_left.img;
	},
	_getLootCrateFrontRightSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_front_right.img;
	},
	_getLootCrateTopSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_top.img;
	},
	_getLootCrateBottomSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_bottom.img;
	},
	_getLootCrateBackLeftSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_back_left.img;
	},
	_getLootCrateBackRightSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_back_right.img;
	},
	_getLootCrateKeySpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_key.img;
	},
	_getLootCrateGlowSpriteIdentifier: function () {
		return RSX.mystery_boss_loot_crate_glow_map.img;
	},

	showCrateMaxCountLabel: function () {
		MysteryCrateNode.prototype.showCrateMaxCountLabel.apply(this, arguments);
		this._crateMaxCountLabel.setString("x");
	}

});

MysteryBossCrateNode.crateType = SDK.CosmeticsChestTypeLookup.Boss;

MysteryBossCrateNode.create = function(node) {
	return MysteryCrateNode.create(node || new MysteryBossCrateNode());
};

module.exports = MysteryBossCrateNode;
