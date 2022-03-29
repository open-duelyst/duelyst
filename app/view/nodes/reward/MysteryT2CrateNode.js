//pragma PKGS: mystery_t2_crate_node

var SDK = require("app/sdk");
var RSX = require("app/data/resources");
var PKGS = require("app/data/packages");
var MysteryCrateNode = require('./MysteryCrateNode');

/****************************************************************************
 MysteryT2CrateNode
 ****************************************************************************/

var MysteryT2CrateNode = MysteryCrateNode.extend({

	getCrateType: function () {
		return MysteryT2CrateNode.crateType;
	},

	getRequiredResources: function () {
		return this._super().concat(PKGS.getPkgForIdentifier("mystery_t2_crate_node"));
	},

	_getLootCrateSphereSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_sphere.img;
	},
	_getLootCrateFrontLeftSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_front_left.img;
	},
	_getLootCrateFrontRightSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_front_right.img;
	},
	_getLootCrateTopSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_top.img;
	},
	_getLootCrateBottomSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_bottom.img;
	},
	_getLootCrateBackLeftSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_back_left.img;
	},
	_getLootCrateBackRightSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_back_right.img;
	},
	_getLootCrateKeySpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_key.img;
	},
	_getLootCrateGlowSpriteIdentifier: function () {
		return RSX.mystery_t2_loot_crate_glow_map.img;
	}

});

MysteryT2CrateNode.crateType = SDK.CosmeticsChestTypeLookup.Rare;

MysteryT2CrateNode.create = function(node) {
	return MysteryCrateNode.create(node || new MysteryT2CrateNode());
};

module.exports = MysteryT2CrateNode;
