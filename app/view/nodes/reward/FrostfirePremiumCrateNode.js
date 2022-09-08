// pragma PKGS: frostfire_premium_loot_crate

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const CrateManager = require('app/ui/managers/crate_manager');
const GiftCrateLookup = require('app/sdk/giftCrates/giftCrateLookup');
const CosmeticsChestTypeLookup = require('app/sdk/cosmetics/cosmeticsChestTypeLookup');
const LootCrateNode = require('./LootCrateNode');

/** **************************************************************************
 FrostfirePremiumCrateNode
 *************************************************************************** */

var FrostfirePremiumCrateNode = LootCrateNode.extend({

  /* region GETTERS / SETTERS */

  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('frostfire_premium_loot_crate'));
  },

  _getLootCrateSphereSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_sphere.img;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_front_left.img;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_front_right.img;
  },
  _getLootCrateTopSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_top.img;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_bottom.img;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_back_left.img;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_back_right.img;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return RSX.frostfire_premium_loot_crate_glow_map.img;
  },

  getCrateType() {
    return FrostfirePremiumCrateNode.crateType;
  },

  getCrateCount() {
    return CrateManager.getInstance().getGiftCrateCount(GiftCrateLookup.FrostfirePremiumPurchasable2017);
  },

  /* endregion GETTERS / SETTERS */

  /* region LABELS */

  showCrateMaxCountLabel() {
    LootCrateNode.prototype.showCrateMaxCountLabel.apply(this, arguments);
    this._crateMaxCountLabel.setString('x');
  },

  showCrateDescriptionLabel(duration, fontName, fontSize, fontColor, contentSize) {
    if (contentSize == null) { contentSize = cc.size(275, 0); }
    LootCrateNode.prototype.showCrateDescriptionLabel.call(this, duration, fontName, fontSize, fontColor, contentSize);
  },

  /* endregion LABELS */

});

FrostfirePremiumCrateNode.crateType = CosmeticsChestTypeLookup.FrostfirePremium;

FrostfirePremiumCrateNode.create = function (node) {
  return LootCrateNode.create(node || new FrostfirePremiumCrateNode());
};

module.exports = FrostfirePremiumCrateNode;
