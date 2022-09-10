// pragma PKGS: mystery_t2_crate_node

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const MysteryCrateNode = require('./MysteryCrateNode');

/** **************************************************************************
 MysteryT2CrateNode
 *************************************************************************** */

var MysteryT2CrateNode = MysteryCrateNode.extend({

  getCrateType() {
    return MysteryT2CrateNode.crateType;
  },

  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('mystery_t2_crate_node'));
  },

  _getLootCrateSphereSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_sphere.img;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_front_left.img;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_front_right.img;
  },
  _getLootCrateTopSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_top.img;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_bottom.img;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_back_left.img;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_back_right.img;
  },
  _getLootCrateKeySpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_key.img;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return RSX.mystery_t2_loot_crate_glow_map.img;
  },

});

MysteryT2CrateNode.crateType = SDK.CosmeticsChestTypeLookup.Rare;

MysteryT2CrateNode.create = function (node) {
  return MysteryCrateNode.create(node || new MysteryT2CrateNode());
};

module.exports = MysteryT2CrateNode;
