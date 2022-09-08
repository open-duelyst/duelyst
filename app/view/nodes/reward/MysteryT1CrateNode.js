// pragma PKGS: mystery_t1_crate_node

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const MysteryCrateNode = require('./MysteryCrateNode');

/** **************************************************************************
 MysteryT1CrateNode
 *************************************************************************** */

var MysteryT1CrateNode = MysteryCrateNode.extend({

  getCrateType() {
    return MysteryT1CrateNode.crateType;
  },

  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('mystery_t1_crate_node'));
  },

  _getLootCrateSphereSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_sphere.img;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_front_left.img;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_front_right.img;
  },
  _getLootCrateTopSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_top.img;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_bottom.img;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_back_left.img;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_back_right.img;
  },
  _getLootCrateKeySpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_key.img;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return RSX.mystery_t1_loot_crate_glow_map.img;
  },

});

MysteryT1CrateNode.crateType = SDK.CosmeticsChestTypeLookup.Common;

MysteryT1CrateNode.create = function (node) {
  return MysteryCrateNode.create(node || new MysteryT1CrateNode());
};

module.exports = MysteryT1CrateNode;
