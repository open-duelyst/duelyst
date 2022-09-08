// pragma PKGS: mystery_boss_crate_node

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const MysteryCrateNode = require('./MysteryCrateNode');

/** **************************************************************************
 MysteryBossCrateNode
 *************************************************************************** */

// TODO: Rewrite this

var MysteryBossCrateNode = MysteryCrateNode.extend({

  getCrateType() {
    return MysteryBossCrateNode.crateType;
  },

  getCrateCount() {
    return CrateManager.getInstance().getCosmeticChestCountForType(SDK.CosmeticsChestTypeLookup.Boss);
  },

  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('mystery_boss_crate_node'));
  },

  _getLootCrateSphereSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_sphere.img;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_front_left.img;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_front_right.img;
  },
  _getLootCrateTopSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_top.img;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_bottom.img;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_back_left.img;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_back_right.img;
  },
  _getLootCrateKeySpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_key.img;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return RSX.mystery_boss_loot_crate_glow_map.img;
  },

  showCrateMaxCountLabel() {
    MysteryCrateNode.prototype.showCrateMaxCountLabel.apply(this, arguments);
    this._crateMaxCountLabel.setString('x');
  },

});

MysteryBossCrateNode.crateType = SDK.CosmeticsChestTypeLookup.Boss;

MysteryBossCrateNode.create = function (node) {
  return MysteryCrateNode.create(node || new MysteryBossCrateNode());
};

module.exports = MysteryBossCrateNode;
