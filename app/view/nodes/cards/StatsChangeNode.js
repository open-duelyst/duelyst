// pragma PKGS: game

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const UtilsEngine = require('app/common/utils/utils_engine');
const RSX = require('app/data/resources');
const EntitySupportNode = require('./EntitySupportNode');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
StatsChangeNode
 - node used to show stat changes for an entity node
 *************************************************************************** */

var StatsChangeNode = EntitySupportNode.extend({

  atkBGSprite: null,
  atkLabel: null,
  _atkNode: null,
  damageBGSprite: null,
  healBGSprite: null,
  hpBGSprite: null,
  hpLabel: null,
  _hpNode: null,

  /* region INITIALIZE */

  ctor(entityNode) {
    this._super(entityNode);

    // container nodes
    this._atkNode = new cc.Node();
    this._atkNode.setVisible(false);
    this.addChild(this._atkNode);

    this._hpNode = new cc.Node();
    this._hpNode.setVisible(false);
    this.addChild(this._hpNode);

    this._updateLayout();

    return true;
  },

  getOrCreateATKBGSprite() {
    if (this.atkBGSprite == null) {
      this.atkBGSprite = BaseSprite.create(RSX.card_stats_atk_simple_bg.img);
      this.atkBGSprite.setAnchorPoint(0.5, 0.5);
      this.atkBGSprite.setVisible(false);
      this._atkNode.addChild(this.atkBGSprite, 0);
    }
    return this.atkBGSprite;
  },

  getOrCreateHPBGSprite() {
    if (this.hpBGSprite == null) {
      this.hpBGSprite = BaseSprite.create(RSX.card_stats_hp_simple_bg.img);
      this.hpBGSprite.setAnchorPoint(0.5, 0.5);
      this.hpBGSprite.setVisible(false);
      this._hpNode.addChild(this.hpBGSprite, 0);
    }
    return this.hpBGSprite;
  },

  getOrCreateHealBGSprite() {
    if (this.healBGSprite == null) {
      this.healBGSprite = BaseSprite.create(RSX.icon_heal.img);
      this.healBGSprite.setAnchorPoint(0.5, 0.5);
      this.healBGSprite.setVisible(false);
      this._hpNode.addChild(this.healBGSprite, 0);
    }
    return this.healBGSprite;
  },

  getOrCreateDamageBGSprite() {
    if (this.damageBGSprite == null) {
      // this.damageBGSprite = BaseSprite.create(RSX.fxDamageDecal.name);
      this.damageBGSprite = BaseSprite.create(RSX.card_stats_hp_simple_bg.img);
      this.damageBGSprite.setAnchorPoint(0.5, 0.5);
      this.damageBGSprite.setVisible(false);
      this._hpNode.addChild(this.damageBGSprite, 0);
    }
    return this.damageBGSprite;
  },

  getOrCreateATKLabel() {
    if (this.atkLabel == null) {
      this.atkLabel = new cc.LabelTTF('', RSX.font_bold.name, CONFIG.ENTITY_STATS_CHANGE_ATK_FONT_SIZE);
      this.atkLabel.setFontFillColor(CONFIG.ATK_COLOR);
      this.atkLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
      this.atkLabel.setAnchorPoint(0.5, 0.5);
      this._atkNode.addChild(this.atkLabel, 1);
    }
    return this.atkLabel;
  },

  getOrCreateHPLabel() {
    if (this.hpLabel == null) {
      this.hpLabel = new cc.LabelTTF('', RSX.font_bold.name, CONFIG.ENTITY_STATS_CHANGE_HP_FONT_SIZE);
      this.hpLabel.setFontFillColor(CONFIG.HP_COLOR);
      this.hpLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
      this.hpLabel.setAnchorPoint(0.5, 0.5);
      this._hpNode.addChild(this.hpLabel, 1);
    }
    return this.hpLabel;
  },

  getCurrentATKBGSprite() {
    if (this._atkNode.isVisible()) {
      if (this.atkBGSprite != null && this.atkBGSprite.isVisible()) {
        return this.atkBGSprite;
      }
    }
  },

  getCurrentHPBGSprite() {
    if (this._hpNode.isVisible()) {
      if (this.damageBGSprite != null && this.damageBGSprite.isVisible()) {
        return this.damageBGSprite;
      } if (this.hpBGSprite != null && this.hpBGSprite.isVisible()) {
        return this.hpBGSprite;
      } if (this.healBGSprite != null && this.healBGSprite.isVisible()) {
        return this.healBGSprite;
      }
    }
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  _updateLayout() {
    const atkBGSprite = this.getCurrentATKBGSprite();
    const hpBGSprite = this.getCurrentHPBGSprite();

    if (atkBGSprite == null || hpBGSprite == null) {
      this._atkNode.setPosition(0.0, 0.0);
      this._hpNode.setPosition(0.0, 0.0);
    } else {
      const atkBGContentSize = atkBGSprite.getContentSize();
      this._atkNode.setPosition(-atkBGContentSize.width * 0.35, 0.0);
      const hpBGContentSize = hpBGSprite.getContentSize();
      this._hpNode.setPosition(hpBGContentSize.width * 0.35, 0.0);
    }
  },

  /* endregion LAYOUT */

  /* region CHANGES */

  showChanges(atkValue, hpValue, hpChangeType) {
    let showDuration = 0.0;

    // reset animation
    if (this._changeATKAction != null) {
      this._atkNode.stopAction(this._changeATKAction);
      this._changeATKAction = null;
    }
    if (this._changeHPAction != null) {
      this._hpNode.stopAction(this._changeHPAction);
      this._changeHPAction = null;
    }

    // set values
    if (atkValue == null) {
      this._atkNode.setVisible(false);
    } else {
      this._atkNode.setVisible(true);
      this.getOrCreateATKBGSprite().setVisible(true);
      const atkLabel = this.getOrCreateATKLabel();
      if (`${atkValue}` !== atkLabel.getString()) {
        atkLabel.setString(atkValue, true);
      }
      atkLabel.setFontSize(CONFIG.ENTITY_STATS_CHANGE_ATK_FONT_SIZE);
    }

    if (hpValue == null) {
      this._hpNode.setVisible(false);
    } else {
      this._hpNode.setVisible(true);
      var hpLabel = this.getOrCreateHPLabel();
      if (`${hpValue}` !== hpLabel.getString()) {
        hpLabel.setString(hpValue, true);
      }
      if (hpChangeType === StatsChangeNode.HP_CHANGE_TYPE_HEAL) {
        this.getOrCreateHealBGSprite().setVisible(true);
        this.damageBGSprite && this.damageBGSprite.setVisible(false);
        this.hpBGSprite && this.hpBGSprite.setVisible(false);
        hpLabel.setFontSize(CONFIG.ENTITY_STATS_CHANGE_HEAL_FONT_SIZE);
      } else if (hpChangeType === StatsChangeNode.HP_CHANGE_TYPE_DAMAGE) {
        this.healBGSprite && this.healBGSprite.setVisible(false);
        this.getOrCreateDamageBGSprite().setVisible(true);
        this.hpBGSprite && this.hpBGSprite.setVisible(false);
        hpLabel.setFontSize(CONFIG.ENTITY_STATS_CHANGE_DAMAGE_FONT_SIZE);
      } else {
        this.healBGSprite && this.healBGSprite.setVisible(false);
        this.damageBGSprite && this.damageBGSprite.setVisible(false);
        this.getOrCreateHPBGSprite().setVisible(true);
        hpLabel.setFontSize(CONFIG.ENTITY_STATS_CHANGE_HP_FONT_SIZE);
      }
    }

    // update layout after setting values but before animation
    this._updateLayout();

    if (atkValue != null) {
      // add to show duration
      showDuration = Math.max(showDuration, CONFIG.ENTITY_STATS_CHANGE_DELAY);

      // reset scales
      this._atkNode.setScale(0.0);

      // animate atk change
      this._changeATKAction = cc.sequence(
        cc.scaleTo(showDuration * 0.3, 1.0).easing(cc.easeBackOut()),
        cc.delayTime(showDuration * 0.5),
        cc.scaleTo(showDuration * 0.2, 0.0).easing(cc.easeBackIn()),
        cc.hide(),
      );
      this._atkNode.runAction(this._changeATKAction);
    }

    if (hpValue != null) {
      var hpLabel = this.getOrCreateHPLabel();
      /*
      if (hpChangeType === StatsChangeNode.HP_CHANGE_TYPE_DAMAGE) {
        var damageBGSprite = this.getOrCreateDamageBGSprite();
        var animationAction = UtilsEngine.getAnimationAction(RSX.fxDamageDecal.name);
        var duration = animationAction.getDuration();

        // add to show duration
        showDuration = Math.max(showDuration, duration);

        // reset scales
        hpLabel.setScale(0.0);
        this._hpNode.setScale(1.0);

        this._changeHPAction = cc.sequence(
          cc.spawn(
            cc.targetedAction(damageBGSprite, animationAction),
            cc.sequence(
              cc.targetedAction(hpLabel, cc.scaleTo(showDuration * 0.3, 1.0).easing(cc.easeBackOut())),
              cc.delayTime(showDuration * 0.5)
            )
          ),
          cc.scaleTo(showDuration * 0.2, 0.0).easing(cc.easeBackIn()),
          cc.hide()
        );
      } else { */
      // add to show duration
      showDuration = Math.max(showDuration, CONFIG.ENTITY_STATS_CHANGE_DELAY);

      // reset scales
      hpLabel.setScale(1.0);
      this._hpNode.setScale(0.0);

      if (atkValue != null) {
        // stagger timing slightly when also showing attack
        this._changeHPAction = cc.sequence(
          cc.delayTime(showDuration * 0.1),
          cc.scaleTo(showDuration * 0.3, 1.0).easing(cc.easeBackOut()),
          cc.delayTime(showDuration * 0.4),
          cc.scaleTo(showDuration * 0.2, 0.0).easing(cc.easeBackIn()),
          cc.hide(),
        );
      } else {
        this._changeHPAction = cc.sequence(
          cc.scaleTo(showDuration * 0.3, 1.0).easing(cc.easeBackOut()),
          cc.delayTime(showDuration * 0.5),
          cc.scaleTo(showDuration * 0.2, 0.0).easing(cc.easeBackIn()),
          cc.hide(),
        );
      }
      // }

      // animate hp change
      this._hpNode.runAction(this._changeHPAction);
    }

    return showDuration;
  },

  /* endregion CHANGES */

});

StatsChangeNode.create = function (entityNode, node) {
  return EntitySupportNode.create(entityNode, node || new StatsChangeNode(entityNode));
};

StatsChangeNode.HP_CHANGE_TYPE_MODIFIER = 'modifier';
StatsChangeNode.HP_CHANGE_TYPE_DAMAGE = 'damage';
StatsChangeNode.HP_CHANGE_TYPE_HEAL = 'heal';

module.exports = StatsChangeNode;
