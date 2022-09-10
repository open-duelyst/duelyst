// pragma PKGS: gift_loot_crate

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const CrateManager = require('app/ui/managers/crate_manager');
const LootCrateNode = require('./LootCrateNode');

/** **************************************************************************
 GiftCrateNode
 *************************************************************************** */

var GiftCrateNode = LootCrateNode.extend({

  /* region GETTERS / SETTERS */

  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('gift_loot_crate'));
  },

  _getLootCrateSphereSpriteIdentifier() {
    return RSX.gift_loot_crate_sphere.img;
  },
  _getLootCrateFrontLeftSpriteIdentifier() {
    return RSX.gift_loot_crate_front_left.img;
  },
  _getLootCrateFrontRightSpriteIdentifier() {
    return RSX.gift_loot_crate_front_right.img;
  },
  _getLootCrateTopSpriteIdentifier() {
    return RSX.gift_loot_crate_top.img;
  },
  _getLootCrateBottomSpriteIdentifier() {
    return RSX.gift_loot_crate_bottom.img;
  },
  _getLootCrateBackLeftSpriteIdentifier() {
    return RSX.gift_loot_crate_back_left.img;
  },
  _getLootCrateBackRightSpriteIdentifier() {
    return RSX.gift_loot_crate_back_right.img;
  },
  _getLootCrateGlowSpriteIdentifier() {
    return RSX.gift_loot_crate_glow_map.img;
  },

  getCrateType() {
    return GiftCrateNode.crateType;
  },

  getCrateCount() {
    return CrateManager.getInstance().getGiftCrateCount();
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

GiftCrateNode.crateType = 'gift';

GiftCrateNode.create = function (node) {
  return LootCrateNode.create(node || new GiftCrateNode());
};

module.exports = GiftCrateNode;
