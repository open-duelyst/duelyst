// pragma PKGS: mystery_t3_crate_node

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const MysteryCrateNode = require('./MysteryCrateNode');

/** **************************************************************************
 MysteryT3CrateNode
 *************************************************************************** */

var MysteryT3CrateNode = MysteryCrateNode.extend({

  getCrateType() {
    return MysteryT3CrateNode.crateType;
  },

  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('mystery_t3_crate_node'));
  },

  _getLootCrateSphereSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_sphere.img;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_front_left.img;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_front_right.img;
  },
  _getLootCrateTopSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_top.img;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_bottom.img;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_back_left.img;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_back_right.img;
  },
  _getLootCrateKeySpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_key.img;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return RSX.mystery_t3_loot_crate_glow_map.img;
  },

});

MysteryT3CrateNode.crateType = SDK.CosmeticsChestTypeLookup.Epic;

MysteryT3CrateNode.create = function (node) {
  return MysteryCrateNode.create(node || new MysteryT3CrateNode());
};

module.exports = MysteryT3CrateNode;
