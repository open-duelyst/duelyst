// pragma PKGS: game

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const EntitySupportNode = require('./EntitySupportNode');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
StatsNode
 - node used to show current stat values for an entity node
 *************************************************************************** */

const StatsNode = EntitySupportNode.extend({

  _active: false,
  atkLabel: null,
  atkBGSprite: null,
  _atkBGSpriteColor: null,
  _atkBGSpriteBW: null,
  hpLabel: null,
  hpBGSprite: null,
  _hpBGSpriteColor: null,
  _hpBGSpriteBW: null,
  _showing: true,
  _showingATKForActionIndex: -1,
  _showingATKForActionEventType: null,
  _showingHPForActionIndex: -1,
  _showingHPForActionEventType: null,

  /* region INITIALIZE */

  ctor(entityNode) {
    this._super(entityNode);

    this._atkBGSpriteColor = BaseSprite.create(RSX.icon_atk.img);
    this._atkBGSpriteColor.setOpacity(CONFIG.OVERLAY_STATS_BG_ALPHA);
    this._atkBGSpriteColor.setScale(0.65);
    this._atkBGSpriteColor.setVisible(false);
    this.addChild(this._atkBGSpriteColor);

    this._atkBGSpriteBW = BaseSprite.create(RSX.icon_atk_bw.img);
    this._atkBGSpriteBW.setOpacity(CONFIG.OVERLAY_STATS_BG_ALPHA);
    this._atkBGSpriteBW.setScale(0.65);
    this.addChild(this._atkBGSpriteBW);

    this._hpBGSpriteColor = BaseSprite.create(RSX.icon_hp.img);
    this._hpBGSpriteColor.setOpacity(CONFIG.OVERLAY_STATS_BG_ALPHA);
    this._hpBGSpriteColor.setScale(0.65);
    this._hpBGSpriteColor.setVisible(false);
    this.addChild(this._hpBGSpriteColor);

    this._hpBGSpriteBW = BaseSprite.create(RSX.icon_hp_bw.img);
    this._hpBGSpriteBW.setOpacity(CONFIG.OVERLAY_STATS_BG_ALPHA);
    this._hpBGSpriteBW.setScale(0.65);
    this.addChild(this._hpBGSpriteBW);

    this.atkLabel = new cc.LabelTTF('', RSX.font_regular.name, CONFIG.OVERLAY_STATS_TEXT_SIZE);
    this.atkLabel.setFontFillColor(cc.color.WHITE);
    this.atkLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    this.atkLabel.setAnchorPoint(cc.p(0.5, 0.65));
    this.addChild(this.atkLabel);

    this.hpLabel = new cc.LabelTTF('', RSX.font_regular.name, CONFIG.OVERLAY_STATS_TEXT_SIZE);
    this.hpLabel.setFontFillColor(cc.color.WHITE);
    this.hpLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    this.hpLabel.setAnchorPoint(cc.p(0.5, 0.65));
    this.addChild(this.hpLabel);

    // position stats
    const atkPosition = cc.p(-CONFIG.OVERLAY_STATS_SPACING * 0.5, 0.0);
    this.atkLabel.setPosition(atkPosition);
    this._atkBGSpriteBW.setPosition(atkPosition.x + 0.5, atkPosition.y - 1.0);
    this._atkBGSpriteColor.setPosition(atkPosition.x + 0.5, atkPosition.y - 1.0);

    const hpPosition = cc.p(CONFIG.OVERLAY_STATS_SPACING * 0.5, 0.0);
    this.hpLabel.setPosition(hpPosition);
    this._hpBGSpriteBW.setPosition(hpPosition.x + 0.5, hpPosition.y - 1.0);
    this._hpBGSpriteColor.setPosition(hpPosition.x + 0.5, hpPosition.y - 1.0);

    return true;
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  /**
   * Sets the stat node active state, updating its display.
   * @param {Boolean} val
   */
  setActive(val) {
    if (this._active != val) {
      this._active = val;
      if (this._active) {
        this._showActiveState();
      } else {
        this._stopShowingActiveState();
      }
    }
  },

  _showActiveState() {
    if (this.atkBGSprite !== this._atkBGSpriteColor) {
      this._atkBGSpriteBW.setVisible(false);
      this._atkBGSpriteColor.setVisible(true);
      this.atkBGSprite = this._atkBGSpriteColor;
    }
    if (this.hpBGSprite !== this._hpBGSpriteColor) {
      this._hpBGSpriteBW.setVisible(false);
      this._hpBGSpriteColor.setVisible(true);
      this.hpBGSprite = this._hpBGSpriteColor;
    }
  },

  _stopShowingActiveState() {
    if (this.atkBGSprite !== this._atkBGSpriteBW) {
      this._atkBGSpriteBW.setVisible(true);
      this._atkBGSpriteColor.setVisible(false);
      this.atkBGSprite = this._atkBGSpriteBW;
    }
    if (this.hpBGSprite !== this._hpBGSpriteBW) {
      this._hpBGSpriteBW.setVisible(true);
      this._hpBGSpriteColor.setVisible(false);
      this.hpBGSprite = this._hpBGSpriteBW;
    }
  },

  /* endregion GETTERS / SETTERS */

  /* region HP */

  /**
   * Show hp stat value at action index, or current values if no action provided.
   * @param {SDK.Action} [action=null]
   * @param {String} [actionEventType=EVENTS.update_cache_action] action event type to show
   */
  showHP(action, actionEventType) {
    if (actionEventType == null) { actionEventType = EVENTS.update_cache_action; }
    if (action == null
      || action.getIndex() > this._showingHPForActionIndex
      || (this._showingHPForActionEventType !== EVENTS.update_cache_step && actionEventType === EVENTS.update_cache_step)) {
      const entityNode = this.getEntityNode();
      const sdkCard = entityNode && entityNode.getSdkCard();
      let state;
      if (action != null) {
        this._showingHPForActionIndex = action.getIndex();
        this._showingHPForActionEventType = actionEventType;
        state = sdkCard.getActionStateRecord().getStateAtActionForEventType(action, actionEventType);
      } else {
        this._showingHPForActionIndex = -1;
        this._showingHPForActionEventType = null;
        state = sdkCard.getActionStateRecord().getCurrentState();
      }

      const { hp } = state;
      let color = cc.color.WHITE;
      // color rules:
      // below base stat = nerf color
      // above base stat = buff color
      // at base stat = normal color
      const { maxHP } = state;
      const { baseMaxHP } = state;
      const { damage } = state;
      if (damage !== 0) {
        color = CONFIG.NERF_COLOR;
      } else if (maxHP > baseMaxHP) {
        color = CONFIG.BUFF_COLOR;
      }

      this.hpLabel.setFontFillColor(color);

      if (`${hp}` !== this.hpLabel.getString()) {
        this.hpLabel.setString(hp, true);
      }
    }
  },

  /* endregion HP */

  /* region ATK */

  /**
   * Show atk stat value at action index, or current values if no action provided.
   * @param {SDK.Action} [action=null]
   * @param {String} [actionEventType=EVENTS.update_cache_action] action event type to show
   */
  showATK(action, actionEventType) {
    if (actionEventType == null) { actionEventType = EVENTS.update_cache_action; }
    if (action == null
      || action.getIndex() > this._showingATKForActionIndex
      || (this._showingATKForActionEventType !== EVENTS.update_cache_step && actionEventType === EVENTS.update_cache_step)) {
      const entityNode = this.getEntityNode();
      const sdkCard = entityNode && entityNode.getSdkCard();
      let state;
      if (action != null) {
        this._showingATKForActionIndex = action.getIndex();
        this._showingATKForActionEventType = actionEventType;
        state = sdkCard.getActionStateRecord().getStateAtActionForEventType(action, actionEventType);
      } else {
        this._showingATKForActionIndex = -1;
        this._showingATKForActionEventType = null;
        state = sdkCard.getActionStateRecord().getCurrentState();
      }

      const { atk } = state;
      let color = cc.color.WHITE;
      // color rules:
      // below base stat = nerf color
      // above base stat = buff color
      // at base stat = normal color
      const { baseATK } = state;
      if (atk < baseATK) {
        color = CONFIG.NERF_COLOR;
      } else if (atk > baseATK) {
        color = CONFIG.BUFF_COLOR;
      }

      this.atkLabel.setFontFillColor(color);

      if (`${atk}` !== this.atkLabel.getString()) {
        this.atkLabel.setString(atk, true);
      }
    }
  },

  /* endregion ATK */

  /* region SHOW / HIDE */

  /**
   * Shows stats at action index, or current values if no action provided.
   * @param {SDK.Action} [action=null]
   * @param {String} [actionEventType=EVENTS.update_cache_action] action event type to show
   */
  showStatsAsOfAction(action, actionEventType) {
    this.showATK(action, actionEventType);
    this.showHP(action, actionEventType);

    if (!this._showing) {
      this._showing = true;
      if (CONFIG.alwaysShowStats) {
        this.fadeTo(CONFIG.FADE_FAST_DURATION, 255);
      } else {
        this.setVisible(true);
      }
    }
  },

  /**
   * Stops showing stats.
   */
  stopShowing() {
    if (this._showing) {
      this._showing = false;
      if (CONFIG.alwaysShowStats) {
        this.fadeToInvisible();
      } else {
        this.setVisible(false);
      }
    }
  },

  /* endregion SHOW / HIDE */

});

StatsNode.create = function (entityNode, node) {
  return EntitySupportNode.create(entityNode, node || new StatsNode(entityNode));
};

module.exports = StatsNode;
