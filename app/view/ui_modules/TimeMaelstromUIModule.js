// pragma PKGS: game

const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const GameUIModule = require('./GameUIModule');

const TimeMaelstromUIModule = GameUIModule.extend({

  _maelstromPlayerId: null,
  _particleSystems: null,

  start() {
    this._super();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      gameLayer.getEventBus().on(EVENTS.before_show_step, this.onBeforeShowStep, this);
      gameLayer.getEventBus().on(EVENTS.show_start_turn, this.onShowStartTurn, this);
    }
  },

  terminate() {
    this._super();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      gameLayer.getEventBus().off(EVENTS.before_show_step, this.onBeforeShowStep, this);
      gameLayer.getEventBus().off(EVENTS.show_start_turn, this.onShowStartTurn, this);
    }

    if (this._maelstromPlayerId != null) {
      this.deactivateMaelstromEffect();
    }
  },

  onBeforeShowStep(event) {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    const { step } = event;
    if (step.action instanceof SDK.PlayCardAction && step.action.getCard() != null && step.action.getCard().getBaseCardId() == SDK.Cards.Spell.Maelstrom) {
      const maelstromPlayerId = gameLayer.getCurrentPlayer().getPlayerId();
      if (this._maelstromPlayerId != maelstromPlayerId) {
        this._maelstromPlayerId = maelstromPlayerId;
        this.activateMaelstromEffect();
      }
    }
  },

  onShowStartTurn(event) {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    const maelstromPlayerId = gameLayer.getCurrentPlayer().getPlayerId();
    if (this._maelstromPlayerId != maelstromPlayerId) {
      this._maelstromPlayerId = null;
      this.deactivateMaelstromEffect();
    }
  },

  activateMaelstromEffect() {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();

    this.deactivateMaelstromEffect();
    this._particleSystems = [];

    const winSize = cc.director._winSizeInPoints;

    gameLayer.backgroundLayer.runAction(cc.fadeTo(0.2, 230));
    gameLayer.getBattleMap().hideEnvironmentEffects();

    // add particles
    const particles = BaseParticleSystem.create({
      plistFile: RSX.ptcl_maelstrom_dust.plist,
      affectedByWind: false,
      fadeInAtLifePct: 0.1,
    });
    particles.setStartSize(5);
    particles.setEndSize(5);
    particles.setSpeed(40);
    particles.setPosition(cc.p(winSize.width * 0.5, winSize.height * 0.5));
    particles.setPosVar(cc.p(winSize.width, winSize.height));
    this._particleSystems.push(particles);
    gameLayer.foregroundLayer.addChild(particles);
  },

  deactivateMaelstromEffect() {
    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();

    const fadeDuration = CONFIG.FADE_MEDIUM_DURATION;
    gameLayer.backgroundLayer.runAction(cc.fadeTo(fadeDuration, 255));
    gameLayer.getBattleMap().showEnvironmentEffects();

    _.each(this._particleSystems, (system) => {
      system.stopSystem();
      system.destroy(fadeDuration);
    });
    this._particleSystems = [];
  },

});

module.exports = TimeMaelstromUIModule;
