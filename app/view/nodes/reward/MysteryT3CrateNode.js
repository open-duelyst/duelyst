//pragma PKGS: mystery_t3_crate_node

var SDK = require("app/sdk");
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var MysteryCrateNode = require('./MysteryCrateNode');

/****************************************************************************
 MysteryT3CrateNode
 ****************************************************************************/

var MysteryT3CrateNode = MysteryCrateNode.extend({

	getCrateType: function () {
		return MysteryT3CrateNode.crateType;
	},

	getRequiredResources: function () {
		return this._super().concat(PKGS.getPkgForIdentifier("mystery_t3_crate_node"));
	},

	_getLootCrateSphereSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_sphere.img;
	},
	_getLootCrateFrontLeftSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_front_left.img;
	},
	_getLootCrateFrontRightSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_front_right.img;
	},
	_getLootCrateTopSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_top.img;
	},
	_getLootCrateBottomSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_bottom.img;
	},
	_getLootCrateBackLeftSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_back_left.img;
	},
	_getLootCrateBackRightSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_back_right.img;
	},
	_getLootCrateKeySpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_key.img;
	},
	_getLootCrateGlowSpriteIdentifier: function () {
		return RSX.mystery_t3_loot_crate_glow_map.img;
	}

});

MysteryT3CrateNode.crateType = SDK.CosmeticsChestTypeLookup.Epic;

MysteryT3CrateNode.create = function(node) {
	return MysteryCrateNode.create(node || new MysteryT3CrateNode());
};

module.exports = MysteryT3CrateNode;
