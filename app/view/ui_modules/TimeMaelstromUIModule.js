//pragma PKGS: game

var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var GameUIModule = require('./GameUIModule');
var BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');

var TimeMaelstromUIModule = GameUIModule.extend({

	_maelstromPlayerId:null,
	_particleSystems:null,

	start: function () {
		this._super();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer != null) {
			gameLayer.getEventBus().on(EVENTS.before_show_step, this.onBeforeShowStep, this);
			gameLayer.getEventBus().on(EVENTS.show_start_turn, this.onShowStartTurn, this);
		}
	},

	terminate: function () {
		this._super();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer != null) {
			gameLayer.getEventBus().off(EVENTS.before_show_step, this.onBeforeShowStep, this);
			gameLayer.getEventBus().off(EVENTS.show_start_turn, this.onShowStartTurn, this);
		}

		if (this._maelstromPlayerId != null) {
			this.deactivateMaelstromEffect();
		}
	},

	onBeforeShowStep: function (event) {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		var step = event.step;
		if (step.action instanceof SDK.PlayCardAction && step.action.getCard() != null && step.action.getCard().getBaseCardId() == SDK.Cards.Spell.Maelstrom) {
			var maelstromPlayerId = gameLayer.getCurrentPlayer().getPlayerId();
			if (this._maelstromPlayerId != maelstromPlayerId) {
				this._maelstromPlayerId = maelstromPlayerId;
				this.activateMaelstromEffect();
			}
		}
	},

	onShowStartTurn: function (event) {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		var maelstromPlayerId = gameLayer.getCurrentPlayer().getPlayerId();
		if (this._maelstromPlayerId != maelstromPlayerId) {
			this._maelstromPlayerId = null;
			this.deactivateMaelstromEffect();
		}
	},

	activateMaelstromEffect: function() {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();

		this.deactivateMaelstromEffect();
		this._particleSystems = [];

		var winSize = cc.director._winSizeInPoints;

		gameLayer.backgroundLayer.runAction(cc.fadeTo(0.2,230));
		gameLayer.getBattleMap().hideEnvironmentEffects();

		// add particles
		var particles = BaseParticleSystem.create({
			plistFile: RSX.ptcl_maelstrom_dust.plist,
			affectedByWind: false,
			fadeInAtLifePct: 0.1
		});
		particles.setStartSize(5);
		particles.setEndSize(5);
		particles.setSpeed(40);
		particles.setPosition(cc.p(winSize.width * 0.5,winSize.height * 0.5));
		particles.setPosVar(cc.p(winSize.width,winSize.height));
		this._particleSystems.push(particles);
		gameLayer.foregroundLayer.addChild(particles);
	},

	deactivateMaelstromEffect: function() {
		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();

		var fadeDuration = CONFIG.FADE_MEDIUM_DURATION;
		gameLayer.backgroundLayer.runAction(cc.fadeTo(fadeDuration, 255));
		gameLayer.getBattleMap().showEnvironmentEffects();

		_.each(this._particleSystems,function(system) {
			system.stopSystem();
			system.destroy(fadeDuration);
		});
		this._particleSystems = [];
	}

});

module.exports = TimeMaelstromUIModule;
