// do not add this file to a package
// it is specifically parsed by the package generation script

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Promise = require("bluebird");
var RSX = require('app/data/resources');
var UtilsEngine = require('app/common/utils/utils_engine');
var UtilsPosition = require('app/common/utils/utils_position');
var AmbientLightColorTo = require('app/view/actions/AmbientLightColorTo');
var BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
var BaseSprite = require('app/view/nodes/BaseSprite');
var EnvironmentSprite = require('app/view/nodes/map/EnvironmentSprite');
var GroundSprite = require('app/view/nodes/map/GroundSprite');
var TileMapGridSprite = require('app/view/nodes/map/TileMapGridSprite');
var Light = require('app/view/nodes/fx/Light');
var FXSprite = require('app/view/nodes/fx/FXSprite');
var audio_engine = require('app/audio/audio_engine');

/****************************************************************************
 BattleMap
 ****************************************************************************/

var BattleMap = cc.Class.extend({

	_isDisplayingParticles: false,
	_isDisplayingTiles: false,
	_isDisplayingLights: false,
	_status: null,
	_statusPromises: null,
	_waitingForStatus: null,
	_targetLayer: null,

	// template for blue dust
	blueDustTemplate: {
		plistFile: RSX.ptcl_blue_dust_floating.plist,
		fadeInAtLifePct: 0.15,
		fadeOutAtLifePct: 0.85,
		needsDepthTest: true,
		scale: 1.25
	},

	// template for rain particles
	rainTemplate: {
		plistFile: RSX.ptcl_rain.plist,
		type: "Particles",
		directionAligned: true,
		needsDepthTest: true,
		posVar: {x: CONFIG.TILESIZE * 6, y: CONFIG.TILESIZE * 3},
		posVarAOE: 1.0,
		fadeInAtLifePct: 0.1,
		angle: -110,
		emitFX: {
			plistFile: RSX.ptcl_ripple.plist,
			type: "Particles",
			maxParticlesPerImpact: 1
		}
	},

	// template for snow particles
	snowTemplate: {
		plistFile: RSX.ptcl_snow.plist,
		type: "Particles",
		needsDepthTest: true,
		posVar: {x: CONFIG.TILESIZE * 6, y: CONFIG.TILESIZE * 3},
		posVarAOE: 1.0,
		fadeInAtLifePct: 0.1,
		angle: -135,
		emitFX: {
			plistFile: RSX.ptcl_snowground.plist,
			type: "Particles",
			maxParticlesPerImpact: 1
		}
	},

	// number of sun rays to show between 0 and infinity when no weather
	sunRayCount: 50,
	// opacity of sun rays when fully faded in
	sunRayOpacity: 200,
	// how long sun rays last for, in seconds between 0 and infinity
	sunRayDuration: 1.0,
	// how often sun rays fade in and out, in seconds between 0 and infinity
	sunRayFrequencyMin: 5.0,
	sunRayFrequencyMax: 20.0,
	// how long sun rays take to fade in and out, in seconds between 0 and infinity
	sunRayFadeDurationMin: 1.0,
	sunRayFadeDurationMax: 3.0,
	// sun rays template
	sunRayTemplate: {
		spriteIdentifier: [
			RSX.ray_001.frame,
			RSX.ray_002.frame,
			RSX.ray_003.frame,
			RSX.ray_004.frame,
			RSX.ray_005.frame,
			RSX.ray_006.frame
		],
		rotation: 50
	},

	/* region INITIALIZE */

	ctor: function (targetLayer) {
		this._targetLayer = targetLayer;
		this._waitingForStatus = {};
		this._ambientLightColorChangingSprites = [];
	},

	terminate: function () {
		this.setStatus(BattleMap.STATUS.DISABLED);
		this._stopListeningToEvents();
	},

	/* endregion INITIALIZE */

	/* region EVENTS */

	_startListeningToEvents: function () {
		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.resize, this.onResize, this);
		}
	},

	_stopListeningToEvents: function () {
		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.resize, this.onResize, this);
		}
	},

	/* endregion EVENTS  */

	/* region GETTERS / SETTERS */

	getIsShowingEnvironmentEffects: function () {
		return this._isShowingEnvironmentEffects;
	},

	getIsShowingTiles: function () {
		return this._isShowingTiles;
	},

	getIsShowingLights: function () {
		return this._isShowingLights;
	},

	setSunRayCount: function (sunRayCount) {
		this.sunRayCount = sunRayCount;
	},

	setBlueDustTemplate: function (blueDustTemplate) {
		this.blueDustTemplate = blueDustTemplate;
	},

	setSnowTemplate: function (snowTemplate) {
		this.snowTemplate = snowTemplate;
	},

	setRainTemplate: function (rainTemplate) {
		this.rainTemplate = rainTemplate;
	},

	/* endregion GETTERS / SETTERS */

	/* region STATUS */

	/**
	 * Sets status, but only if the new status is an advancement over the last.
	 * @param {Int} status
	 * @see BattleMap.STATUS
	 */
	setStatus: function (status) {
		var lastStatus = this._status;
		if (status > lastStatus) {
			this._status = status;
			var waitingForStatus = this._waitingForStatus[status];
			if (waitingForStatus != null && waitingForStatus.length > 0) {
				this._waitingForStatus[status] = null;
				for (var i = 0, il = waitingForStatus.length; i < il; i++) {
					waitingForStatus[i]();
				}
			}
		}
	},

	getStatus: function() {
		return this._status;
	},

	whenStatus: function (targetStatus, callback) {
		if (this._statusPromises == null) {
			this._statusPromises = {};
		}
		var statusPromise = this._statusPromises[targetStatus];
		if (statusPromise == null) {
			statusPromise = this._statusPromises[targetStatus] = new Promise(function(resolve,reject){
				if (this.getStatus() === targetStatus) {
					resolve();
				} else {
					if (this._waitingForStatus[targetStatus] == null) {
						this._waitingForStatus[targetStatus] = [];
					}
					this._waitingForStatus[targetStatus].push(resolve);
				}
			}.bind(this));
		}

		statusPromise.nodeify(callback);

		return statusPromise;
	},

	getIsSetup: function () {
		return this._status === BattleMap.STATUS.SETUP;
	},

	getIsActive: function () {
		return this._status === BattleMap.STATUS.ACTIVE;
	},

	getIsDisabled: function () {
		return this._status == null || this._status === BattleMap.STATUS.DISABLED;
	},

	/* endregion STATUS */

	/* region LAYOUT */

	onResize: function (event) {
		// position and resize all elements
		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
		var winRect = UtilsEngine.getGSIWinRect();
		var scaleDiff = Math.max(winRect.width / CONFIG.REF_WINDOW_SIZE.width, winRect.height / CONFIG.REF_WINDOW_SIZE.height);

		// ground sprites
		var groundSprites = this._groundSprites;
		for (var i = 0, il = groundSprites.length; i < il; i++) {
			var groundSprite = groundSprites[i];
			var groundScale;
			var scaleModifier = (groundSprite._scaleModifier != null ? groundSprite._scaleModifier * scaleDiff : 1.0);
			var scaleRelativeToSprite = groundSprite._scaleRelativeToSprite;
			if (scaleRelativeToSprite) {
				groundScale = UtilsEngine.getWindowAtLeastCoverNodeScale(scaleRelativeToSprite);
			} else if (groundSprite._scaleRelativeToWidth) {
				groundScale = UtilsEngine.getWindowWidthRelativeNodeScale(groundSprite);
			} else if (groundSprite._scaleRelativeToHeight) {
				groundScale = UtilsEngine.getWindowHeightRelativeNodeScale(groundSprite);
			} else {
				groundScale = UtilsEngine.getWindowAtLeastCoverNodeScale(groundSprite);
			}
			groundSprite.setScale(groundScale * scaleModifier);
			var screenRelativePosition = groundSprite._screenRelativePositionPct;
			if (screenRelativePosition) {
				groundSprite.setPosition(Math.round(winRect.x + winRect.width * screenRelativePosition.x), Math.round(winRect.y + winRect.height * screenRelativePosition.y));
			}
		}

		// floor tiles
		var floorTileMap = this._floorTileMap;
		if (floorTileMap != null && floorTileMap.length > 0) {
			for ( var i = 0, il = floorTileMap.length; i < il; i++ ) {
				var tileSprite = floorTileMap[i];
				var boardPosition = tileSprite.boardPosition;
				tileSprite.setPosition(UtilsEngine.transformBoardToScreen(cc.p(boardPosition.x, boardPosition.y)));
			}
		}

		// lights
		var lights = this._lights;
		for (var i = 0, il = lights.length; i < il; i++) {
			var light = lights[i];
			// lights always position from center
			var position = cc.p(winCenterPosition.x, winCenterPosition.y);
			var battlemapOffset = light._battlemapOffset;
			if (battlemapOffset) {
				position.x += battlemapOffset.x;
				position.y += battlemapOffset.y;
			}
			light.setPosition(position);
		}

		// particle systems
		var particleSystems = this._particleSystems;
		for (var i = 0, il = particleSystems.length; i < il; i++) {
			var particleSystem = particleSystems[i];
			var screenRelativePosition = particleSystem._screenRelativePositionPct;
			if (screenRelativePosition) {
				particleSystem.setPosition(winRect.x + winRect.width * screenRelativePosition.x, winRect.y + winRect.height * screenRelativePosition.y);
			}
			var battlemapOffset = particleSystem._battlemapOffset;
			if (battlemapOffset) {
				var position = particleSystem.getPosition();
				position.x += battlemapOffset.x;
				position.y += battlemapOffset.y;
				particleSystem.setPosition(position);
			}
			var screenRelativeSourcePositionPct = particleSystem._screenRelativeSourcePositionPct;
			var screenRelativeTargetPositionPct = particleSystem._screenRelativeTargetPositionPct;
			if (screenRelativeSourcePositionPct && screenRelativeTargetPositionPct) {
				particleSystem.setSourceScreenPosition(cc.p(winRect.x + winRect.width * screenRelativeSourcePositionPct.x, winRect.y + winRect.height * screenRelativeSourcePositionPct.y));
				particleSystem.setTargetScreenPosition(cc.p(winRect.x + winRect.width * screenRelativeTargetPositionPct.x, winRect.y + winRect.height * screenRelativeTargetPositionPct.y));
			}
		}

		// rays
		if (this._rayBatchNode != null) {
			this._rayBatchNode.setPosition(winCenterPosition);
		}
	},

	/* endregion LAYOUT */

	/* region SETUP */

	setup: function () {
		Logger.module("ENGINE").log("BattleMap::setup");

		// do setup in preparation for displaying all battle map elements
		// creates all elements but only shows basic battle map elements
		this._playBattleMapMusic();
		this._setupGround();
		this._setupTiles();
		this._setupLights();
		this._setupEnvironmentEffects();

		// listen for resize
		this.onResize();
		this._startListeningToEvents();

		this.setStatus(BattleMap.STATUS.SETUP);
	},

	_playBattleMapMusic: function() {
		var battleMapTemplate = SDK.GameSession.getInstance().getBattleMapTemplate();

		//Play the correct music based on which map is being played
		if (SDK.GameSession.getInstance().isChallenge()) {
			var challenge = SDK.GameSession.getInstance().getChallenge();
			if (challenge && challenge._musicOverride) {
				audio_engine.current().play_music(challenge._musicOverride);
			} else {
				audio_engine.current().play_music(RSX.music_battle_tutorial.audio);
			}
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP0) {		//LYONAR
			audio_engine.current().play_music( RSX.music_battlemap_firesofvictory.audio );
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP1) {		//SONGHAI GREEN MOTHBALLS
		  audio_engine.current().play_music( RSX.music_battlemap_morinkhur.audio );
		}	else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP2) {		//DESERT ORANGE VETRUV
		  audio_engine.current().play_music( RSX.music_battlemap01.audio );
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP3) {		//ICE BRIDGE VANAR
		  audio_engine.current().play_music( RSX.music_battlemap02.audio );
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP4) {		//ICE CAVERN BLUE YELLOW
		  audio_engine.current().play_music( RSX.music_battlemap_vanar.audio );
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP5) {		//SONGHAI SKY ARENA
		  audio_engine.current().play_music( RSX.music_battlemap_risensun2.audio );
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP6) {		//BLUE MONOLITH UNDERGROUND
		  audio_engine.current().play_music( RSX.music_battlemap_bluemonolith.audio );
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP7) {		//VETRUVIAN PALACE
		  audio_engine.current().play_music( RSX.music_battlemap_duskfall.audio );
	  	} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_ABYSSIAN) {
		  audio_engine.current().play_music( RSX.music_battlemap_bluemonolith.audio );
	  } else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_REDROCK) {
		  audio_engine.current().play_music( RSX.music_battlemap_duskfall.audio );
	  } else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_SHIMZAR) {
		  audio_engine.current().play_music( RSX.music_battlemap_bluemonolith.audio );
	  } else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_VANAR) {
		  audio_engine.current().play_music( RSX.music_battlemap02.audio );
	  	}
	},

	_setupGround: function() {
		// do not set position or scale here, use onResize instead
		var battleMapTemplate = SDK.GameSession.getInstance().getBattleMapTemplate();

		// the ground is now broken down into foreground, middleground, and background
		// all maps default to middleground, with optional extra structures for foreground and background
		var backgroundLayer = this._targetLayer.backgroundLayer;
		var foregroundLayer = this._targetLayer.foregroundLayer;

		this._groundSprites = [];

		// show basic ground elements
		if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP0) {
			/*
			BATTLEMAP0
			*/
			this._targetLayer.getFX().setWindDirection(cc.p(0, 1));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap0_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// this middleground needs a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.middlegroundSprite._finalAmbientLightColor = {r: 30, g: 30, b: 30};
			this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap0_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// foreground
			this.foregroundSprite1 = GroundSprite.create(RSX.battlemap0_foreground_001.img);
			this.foregroundSprite1._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite1._scaleModifier = 0.4;
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.0, y: 0.0};
			this.foregroundSprite1.setAnchorPoint(0.0, 0.0);
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "foregroundLayer"});

			this.foregroundSprite2 = GroundSprite.create(RSX.battlemap0_foreground_002.img);
			this.foregroundSprite2._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite2._scaleModifier = 0.375;
			this.foregroundSprite2._screenRelativePositionPct = {x: 1.0, y: 0.0};
			this.foregroundSprite2.setAnchorPoint(1.0, 0.0);
			this._groundSprites.push(this.foregroundSprite2);
			this._targetLayer.addNode(this.foregroundSprite2, {layerName: "foregroundLayer"});

		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP1) {
			/*
			BATTLEMAP1
			*/

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap1_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// this middleground needs a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.middlegroundSprite.setAmbientLightColor({r: -15, g: -15, b: -15});
			this.middlegroundSprite._finalAmbientLightColor = {r: -15, g: -15, b: -15};
			this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create( RSX.battlemap1_background.img );
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// this background may need a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.backgroundSprite.setAmbientLightColor({r: -45, g: -45, b: -45});
			this.backgroundSprite._finalAmbientLightColor = {r: -45, g: -45, b: -45};
			this._ambientLightColorChangingSprites.push(this.backgroundSprite);

		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP2) {
			/*
			BATTLEMAP2
			*/
			this._targetLayer.getFX().setWindDirection(cc.p(-1, 0));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap2_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// this middleground needs a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.middlegroundSprite.setAmbientLightColor({r: -60, g: -60, b: -60});
			this.middlegroundSprite._finalAmbientLightColor = {r: -60, g: -60, b: -60};
			this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap2_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// this background may need a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.backgroundSprite.setAmbientLightColor({r: -50, g: -50, b: -50});
			this.backgroundSprite._scaleRelativeToWidth = true;
			this.backgroundSprite._finalAmbientLightColor = {r: -50, g: -50, b: -50};
			this._ambientLightColorChangingSprites.push(this.backgroundSprite);

			// foreground
			this.foregroundSprite1 = GroundSprite.create(RSX.battlemap2_foreground_001.img);
			this.foregroundSprite1._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite1._scaleModifier = 0.7;
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.0, y: 0.0};
			this.foregroundSprite1.setAnchorPoint(cc.p( 0.0, 0.0 ));
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "foregroundLayer"});

			this.foregroundSprite2 = GroundSprite.create(RSX.battlemap2_foreground_002.img);
			this.foregroundSprite2._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite2._scaleModifier = 0.7;
			this.foregroundSprite2._screenRelativePositionPct = {x: 1.0, y: 0.0};
			this.foregroundSprite2.setAnchorPoint(cc.p( 1.0, 0.0 ));
			this._groundSprites.push(this.foregroundSprite2);
			this._targetLayer.addNode(this.foregroundSprite2, {layerName: "foregroundLayer"});
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP3) {
			/*
			BATTLEMAP3
			*/
			this._targetLayer.getFX().setWindDirection(cc.p(-1, 0));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap3_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// this middleground needs a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.middlegroundSprite.setAmbientLightColor({r: -60, g: -60, b: -60});
			this.middlegroundSprite._finalAmbientLightColor = {r: -60, g: -60, b: -60};
			this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap3_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// this background may need a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.backgroundSprite.setAmbientLightColor({r: -30, g: -30, b: -30});
			this.backgroundSprite._finalAmbientLightColor = {r: -30, g: -30, b: -30};
			this._ambientLightColorChangingSprites.push(this.backgroundSprite);

			// foreground
			this.foregroundSprite = EnvironmentSprite.create(RSX.battlemap3_foreground.img);
			this.foregroundSprite._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite._screenRelativePositionPct = {x: 1.0, y: 1.0};
			this.foregroundSprite.setAnchorPoint(cc.p( 1.0, 1.0 ));
			this._groundSprites.push(this.foregroundSprite);
			this._targetLayer.addNode(this.foregroundSprite, {layerName: "foregroundLayer"});
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP4) {
			/*
			BATTLEMAP4
			*/
			this._targetLayer.getFX().setWindDirection(cc.p(0, 1));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap4_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// this middleground needs a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.middlegroundSprite.setAmbientLightColor({r: -55, g: -55, b: -55});
			this.middlegroundSprite._finalAmbientLightColor = {r: -55, g: -55, b: -55};
			this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap4_background.img);
			this.backgroundSprite._scaleRelativeToSprite = this.middlegroundSprite;
			this.backgroundSprite._screenRelativePositionPct = {x: 0.0, y: 1.0};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.0, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// this background may need a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.backgroundSprite.setAmbientLightColor({r: -60, g: -60, b: -60});
			this.backgroundSprite._finalAmbientLightColor = {r: -60, g: -60, b: -60};
			this._ambientLightColorChangingSprites.push(this.backgroundSprite);

			// foreground
			this.foregroundSprite1 = EnvironmentSprite.create(RSX.battlemap4_foreground_001.img);
			this.foregroundSprite1._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.65, y: 1.03};
			this.foregroundSprite1.setAnchorPoint(cc.p( 0.0, 1.0 ));
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "foregroundLayer"});

			// foreground top rock formation
			this.foregroundSprite2 = EnvironmentSprite.create(RSX.battlemap4_foreground_002.img);
			this.foregroundSprite2._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite2._screenRelativePositionPct = {x: 0.2, y: 1.03};
			this.foregroundSprite2.setAnchorPoint(cc.p( 0.0, 1.0 ));
			this._groundSprites.push(this.foregroundSprite2);
			this._targetLayer.addNode(this.foregroundSprite2, {layerName: "foregroundLayer"});

		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP5) {
			this._targetLayer.getFX().setWindDirection(cc.p(0, 1));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap5_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// this middleground needs a higher ambient light level than normal
			// so we'll set the final and add it to a list of sprites to be set when the lights fade in
			this.middlegroundSprite._finalAmbientLightColor = {r: 5, g: 5, b: 5};
			this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap5_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this.backgroundSprite.setAmbientLightColor({r: -5, g: -95, b: -95});
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// foreground
			this.foregroundSprite1 = GroundSprite.create(RSX.battlemap5_foreground_001.img);
			this.foregroundSprite1._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite1._scaleModifier = 0.4;
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.0, y: 0.0};
			this.foregroundSprite1.setAnchorPoint(0.0, 0.0);
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "foregroundLayer"});

			this.foregroundSprite2 = GroundSprite.create(RSX.battlemap5_foreground_002.img);
			this.foregroundSprite2._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite2._scaleModifier = 0.6;
			this.foregroundSprite2._screenRelativePositionPct = {x: 1.0, y: 0.0};
			this.foregroundSprite2.setAnchorPoint(1.0, 0.0);
			this._groundSprites.push(this.foregroundSprite2);
			this._targetLayer.addNode(this.foregroundSprite2, {layerName: "foregroundLayer"});

		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP6) {

			/*
			BATTLEMAP6
			*/
			this._targetLayer.getFX().setWindDirection(cc.p(0, 1));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap6_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP7) {

			/*
			BATTLEMAP7
			*/
			this._targetLayer.getFX().setWindDirection(cc.p(0, 1));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap7_middleground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// // this middleground needs a higher ambient light level than normal
			// // so we'll set the final and add it to a list of sprites to be set when the lights fade in
			// this.middlegroundSprite.setAmbientLightColor({r: -30, g: -30, b: -30});
			// this.middlegroundSprite._finalAmbientLightColor = {r: -30, g: -30, b: -30};
			// this._ambientLightColorChangingSprites.push(this.middlegroundSprite);

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap7_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// // this background may need a higher ambient light level than normal
			// // so we'll set the final and add it to a list of sprites to be set when the lights fade in
			// this.backgroundSprite.setAmbientLightColor({r: -20, g: -20, b: -20});
			// this.backgroundSprite._finalAmbientLightColor = {r: -20, g: -20, b: -20};
			// this._ambientLightColorChangingSprites.push(this.backgroundSprite);

			// foreground
			this.foregroundSprite = GroundSprite.create(RSX.battlemap7_foreground.img);
			this.foregroundSprite._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite._scaleModifier = 1.0;
			this.foregroundSprite._screenRelativePositionPct = {x: 1.0, y: 0.0};
			this.foregroundSprite.setAnchorPoint(1.0, 0.0);
			this._groundSprites.push(this.foregroundSprite);
			this._targetLayer.addNode(this.foregroundSprite, {layerName: "foregroundLayer"});
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_SHIMZAR) {

			this._targetLayer.getFX().setWindDirection(cc.p(0.0, 1.0));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap_shimzar_midground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.52, y: 0.45};
			this.middlegroundSprite.setAmbientLightColor({r: -50, g: -50, b: -50});
			this.middlegroundSprite._finalAmbientLightColor = {r: -50, g: -50, b: -50};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap_shimzar_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAmbientLightColor({r: -50, g: -50, b: -50});
			this.backgroundSprite._finalAmbientLightColor = {r: -50, g: -50, b: -50};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// foreground
			this.foregroundSprite1 = GroundSprite.create(RSX.battlemap_shimzar_foreground.img);
			this.foregroundSprite1._scaleRelativeToSprite = this.middlegroundSprite;
			this.foregroundSprite1._scaleModifier = 0.4;
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.0, y: 0.0};
			this.foregroundSprite1.setAnchorPoint(0.0, 0.0);
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "foregroundLayer"});
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_ABYSSIAN) {

			this._targetLayer.getFX().setWindDirection(cc.p(0.0, 1.0));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap_abyssian_midground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this.middlegroundSprite.setAmbientLightColor({r: -20, g: -20, b: -20});
			this.middlegroundSprite._finalAmbientLightColor = {r: -20, g: -20, b: -20};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap_abyssian_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAmbientLightColor({r: -50, g: -50, b: -50});
			this.backgroundSprite._finalAmbientLightColor = {r: -50, g: -50, b: -50};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// foreground
			this.foregroundSprite1 = GroundSprite.create(RSX.battlemap_abyssian_cracks.img);
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "backgroundLayer", zOrder: 2});

			this.foregroundSprite1.runAction(cc.sequence(
				cc.fadeTo(3.0, 170).easing(cc.easeQuadraticActionInOut()),
				cc.delayTime(1.0),
				cc.fadeTo(1.0, 255).easing(cc.easeQuadraticActionInOut())
			).repeatForever());

			// foreground
			this.foregroundSprite2 = GroundSprite.create(RSX.battlemap_abyssian_river.img);
			this.foregroundSprite2._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this._groundSprites.push(this.foregroundSprite2);
			this._targetLayer.addNode(this.foregroundSprite2, {layerName: "backgroundLayer", zOrder: 2});
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_REDROCK) {

			this._targetLayer.getFX().setWindDirection(cc.p(0.0, 1.0));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap_redrock_midground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this.middlegroundSprite.setAmbientLightColor({r: -30, g: -30, b: -30});
			this.middlegroundSprite._finalAmbientLightColor = {r: -30, g: -30, b: -30};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap_redrock_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAmbientLightColor({r: -50, g: -50, b: -50});
			this.backgroundSprite._finalAmbientLightColor = {r: -50, g: -50, b: -50};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});

			// foreground
			this.foregroundSprite1 = GroundSprite.create(RSX.battlemap_redrock_midground_glow.img);
			this.foregroundSprite1._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this.foregroundSprite1.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
			this._groundSprites.push(this.foregroundSprite1);
			this._targetLayer.addNode(this.foregroundSprite1, {layerName: "backgroundLayer", zOrder: 2});

			this.foregroundSprite1.setOpacity(127);
			this.foregroundSprite1.runAction(cc.sequence(
				cc.fadeTo(3.0, 50).easing(cc.easeQuadraticActionInOut()),
				cc.delayTime(1.0),
				cc.fadeTo(3.0, 127).easing(cc.easeQuadraticActionInOut())
			).repeatForever());

			// foreground
			this.foregroundSprite2 = GroundSprite.create(RSX.battlemap_redrock_foreground.img);
			this.foregroundSprite2._scaleRelativeToHeight = true;
			this.foregroundSprite2._screenRelativePositionPct = {x: 0.0, y: 0.5};
			this.foregroundSprite2.setAnchorPoint(0.2, 0.5);
			this._groundSprites.push(this.foregroundSprite2);
			this._targetLayer.addNode(this.foregroundSprite2, {layerName: "foregroundLayer"});
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_VANAR) {

			this._targetLayer.getFX().setWindDirection(cc.p(0, 1));

			// middleground
			this.middlegroundSprite = GroundSprite.create( RSX.battlemap_vanar_midground.img );
			this.middlegroundSprite._screenRelativePositionPct = {x: 0.5, y: 0.5};
			this.middlegroundSprite.setAmbientLightColor({r: -20, g: -20, b: -20});
			this.middlegroundSprite._finalAmbientLightColor = {r: -20, g: -20, b: -20};
			this._groundSprites.push(this.middlegroundSprite);
			this._targetLayer.addNode(this.middlegroundSprite, {layerName: "backgroundLayer", zOrder: 1});

			// background
			this.backgroundSprite = GroundSprite.create(RSX.battlemap_vanar_background.img);
			this.backgroundSprite._screenRelativePositionPct = {x: 0.5, y: 1.0};
			this.backgroundSprite.setAmbientLightColor({r: -50, g: -50, b: -50});
			this.backgroundSprite._finalAmbientLightColor = {r: -50, g: -50, b: -50};
			this.backgroundSprite.setAnchorPoint(cc.p( 0.5, 1.0 ));
			this._groundSprites.push(this.backgroundSprite);
			this._targetLayer.addNode(this.backgroundSprite, {layerName: "backgroundLayer", zOrder: -9999});
		}
	},
	_setupTiles: function () {
		// generate floor tiles
		var board = SDK.GameSession.getInstance().getBoard();
		var rowCount = board.getRowCount();
		var columnCount = board.getColumnCount();
		this._floorTileMap = [];
		for ( var row = 0; row < rowCount; row++ ) {
			for ( var col = 0; col < columnCount; col++ ) {
				var tileSprite = TileMapGridSprite.create();
				tileSprite.setColor(CONFIG.FLOOR_TILE_COLOR);
				tileSprite.boardPosition = cc.p(col, row);
				var mapIndex = UtilsPosition.getMapIndexFromPosition(columnCount, col, row);
				tileSprite.mapIndex = mapIndex;
				this._floorTileMap[mapIndex] = tileSprite;
				this._targetLayer.getTileLayer().addBoardBatchedTile(tileSprite, 0, 0);
			}
		}
	},
	_setupLights: function() {
		var battleMapTemplate = SDK.GameSession.getInstance().getBattleMapTemplate();
		var fx = this._targetLayer.getFX();
		var light;

		this._lights = [];

		if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP0) {
			/*
			BATTLEMAP0
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.76);
			fx.setAmbientLightColor({r: 95, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.0);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP1) {
			/*
			BATTLEMAP1
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.76);
			fx.setAmbientLightColor({r: 89, g: 89, b: 89});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.0);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP2) {
			/*
			BATTLEMAP2
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.55);
			fx.setAmbientLightColor({r: 90, g: 90, b: 90});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.1);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP3) {
			/*
			BATTLEMAP3
			*/
			fx.setBloomThreshold(0.52);
			fx.setBloomIntensity(2.74);
			fx.setAmbientLightColor({r: 89, g: 89, b: 89});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.0);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP4) {
			/*
			BATTLEMAP4
			*/
			fx.setBloomThreshold(0.52);
			fx.setBloomIntensity(2.74);
			fx.setAmbientLightColor({r: 89, g: 89, b: 89});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.0);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP5) {
			/*
			BATTLEMAP5
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.76);
			fx.setAmbientLightColor({r: 95, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(0.85);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP6) {
			/*
			BATTLEMAP6
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.76);
			fx.setAmbientLightColor({r: 95, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.05);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP7) {
			/*
			BATTLEMAP7
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.5);
			fx.setAmbientLightColor({r: 89, g: 89, b: 89});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(0.75);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_SHIMZAR) {
			/*
			BATTLEMAP_SHIMZAR
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.76);
			fx.setAmbientLightColor({r: 95, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.0);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_ABYSSIAN) {
			/*
			BATTLEMAP_ABYSSIAN
			*/
			fx.setBloomThreshold(0.50);
			fx.setBloomIntensity(2.76);
			fx.setAmbientLightColor({r: 95, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(1.0);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_REDROCK) {
			/*
			BATTLEMAP_REDROCK
			*/
			fx.setBloomThreshold(0.5);
			fx.setBloomIntensity(2.6);
			fx.setAmbientLightColor({r: 110, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(0.8);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_VANAR) {
			/*
			BATTLEMAP_VANAR
			*/
			fx.setBloomThreshold(0.5);
			fx.setBloomIntensity(2.6);
			fx.setAmbientLightColor({r: 110, g: 95, b: 95});
			fx.setFalloffModifier(2.0);
			fx.setIntensityModifier(2.0);
			fx.setShadowIntensity(0.8);
		}

		/*
		 // create a light
		 light = Light.create({
		 radius: CONFIG.TILESIZE * 10,
		 castsShadows: true,
		 opacity: 255,
		 // these are unnecessary unless doing a colored light
		 color: new cc.color(255, 255, 255, 255),
		 });
		 // lights are always positioned from center of screen
		 // offset relative to center of screen
		 light._battlemapOffset = { x: 0.0, y: 0.0};
		 // final opacity of light after fading in
		 light._battlemapOpacity = 255.0;
		 this._lights.push(light);
		 this._targetLayer.addNode(light);
		 */
		var refWindowSize = UtilsEngine.getRefWindowSize();

		if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP0) {
			/*
			BATTLEMAP0
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.width * 3.25, y: -refWindowSize.height * 3.15};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 100.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP1) {
			/*
			BATTLEMAP1
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.height * 3.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP2) {
			/*
			BATTLEMAP2
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.height * 3.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP3) {
			/*
			BATTLEMAP3
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: -refWindowSize.height * 3.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP4) {
			/*
			BATTLEMAP4
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.height * 1.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP5) {
			/*
			BATTLEMAP5
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: -refWindowSize.height * 3.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP6) {
			/*
			BATTLEMAP6
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.height * 3.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP7) {
			/*
			BATTLEMAP7
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: -refWindowSize.height * 3.25, y: refWindowSize.height * 3.75};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);
		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_SHIMZAR) {
			/*
			BATTLEMAP_SHIMZAR
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: -refWindowSize.width * 1.25, y: refWindowSize.height * 3.15};
			light._battlemapOpacity = 200.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_ABYSSIAN) {
			/*
			BATTLEMAP_ABYSSIAN
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: -refWindowSize.width * 3.25, y: refWindowSize.height * 1.5};
			light._battlemapOpacity = 200.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 30,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 0.65};
			light._battlemapOpacity = 255.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_REDROCK) {
			/*
			BATTLEMAP_REDROCK
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.width * 2.95, y: refWindowSize.height * 3.15};
			light._battlemapOpacity = 200.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 500,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 3.15};
			light._battlemapOpacity = 200.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

		} else if (battleMapTemplate.getMap() === CONFIG.BATTLEMAP_VANAR) {
			/*
			BATTLEMAP_VANAR
			*/
			light = Light.create({
				radius: CONFIG.TILESIZE * 1000,
				castsShadows: true
			});
			light._battlemapOffset = { x: refWindowSize.width * 2.95, y: refWindowSize.height * 3.15};
			light._battlemapOpacity = 200.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

			light = Light.create({
				radius: CONFIG.TILESIZE * 500,
				castsShadows: false
			});
			light._battlemapOffset = { x: 0.0, y: -refWindowSize.height * 3.15};
			light._battlemapOpacity = 200.0;
			this._targetLayer.addNode(light);
			this._lights.push(light);

		}

		// hide all lights to start
		for (var i = 0, il = this._lights.length; i < il; i++) {
			this._lights[i].setOpacity(0.0);
		}
	},
	_setupEnvironmentEffects: function () {
		this._particleSystems = [];

		this._setupParticles();
		this._setupWeather();
	},
	_setupParticles: function() {
		var battleMapTemplate = SDK.GameSession.getInstance().getBattleMapTemplate();
		var cloudOptions = {
			angled: true,
			liveForDistance: true
		};

		if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP0) {
			/*
			BATTLEMAP0
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP1) {
			/*
			BATTLEMAP1
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP2) {
			/*
			BATTLEMAP2
			*/
			// show immediately
			var particleSystem = BaseParticleSystem.create({
				plistFile: RSX.ptcl_yellow_dust_sideways.plist,
				scale: 1.25,
				fadeInAtLifePct: 0.1,
				fadeOutAtLifePct: 0.95,
				affectedByWind: true,
				needsDepthTest: true
			});
			particleSystem._screenRelativePositionPct = {x: 1.05, y: 0.5};
			this._targetLayer.addNode(particleSystem);
			this._particleSystems.push(particleSystem);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP3) {
			/*
			BATTLEMAP3
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP4) {
			/*
			BATTLEMAP4
			*/

			// show deferred
			// position system in center of the grid
			// have it emit in an AOE of just slightly larger than grid
			// angle it to appear as if the snow is coming in from outside
			var particleSystem = BaseParticleSystem.create({
				plistFile: RSX.ptcl_snow.plist,
				type: "Particles",
				needsDepthTest: true,
				posVar: {x: CONFIG.TILESIZE * 3.5, y: CONFIG.TILESIZE * 3.5},
				posVarAOE: 2.0,
				fadeInAtLifePct: 0.1,
				angle: -70,
				maxParticles: 100,
				emitFX: {
					plistFile: RSX.ptcl_snowground.plist,
					type: "Particles",
					maxParticlesPerImpact: 1
				}
			});
			particleSystem._screenRelativePositionPct = {x: 0.25, y: 0.5};
			this._targetLayer.addNode(particleSystem);
			this._particleSystems.push(particleSystem);
			particleSystem.stopSystem();

			// show deferred
			// outside snow
			var particleSystem = BaseParticleSystem.create({
				plistFile: RSX.ptcl_snow.plist,
				fadeInAtLifePct: 0.1,
				angle: -110,
				maxParticles: 60
			});
			particleSystem._screenRelativePositionPct = {x: 0.24, y: 0.8};
			this._targetLayer.addNode(particleSystem, {layerName: "backgroundLayer"});
			this._particleSystems.push(particleSystem);
			particleSystem.stopSystem();
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP5) {
			/*
			BATTLEMAP5
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP6) {
			/*
			BATTLEMAP6
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP7) {
			/*
			BATTLEMAP7
			*/

			// show immediately
			var particleSystem = BaseParticleSystem.create({
				plistFile: RSX.ptcl_ash.plist,
				scale: 1.0,
				affectedByWind: false,
				needsDepthTest: true
			});
			particleSystem._screenRelativePositionPct = {x: 0.5, y: 0.0};
			this._targetLayer.addNode(particleSystem);
			this._particleSystems.push(particleSystem);
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_SHIMZAR) {
			/*
			BATTLEMAP_SHIMZAR
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_ABYSSIAN) {
			/*
			BATTLEMAP_ABYSSIAN
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_REDROCK) {
			/*
			BATTLEMAP_REDROCK
			*/
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP_VANAR) {
			/*
			BATTLEMAP_VANAR
			*/
		}

		// setup cloud systems
		var clouds = battleMapTemplate.getClouds();
		if (clouds != null && clouds.length > 0) {
			for (var i = 0; i < clouds.length; i++) {
				var cloudsData = clouds[i];
				var cloudIndex = cloudsData.index != null && cloudsData.index >= 1 && cloudsData.index <= 7 ? cloudsData.index : _.random(1, 7);
				cloudOptions.plistFile = RSX["ptcl_cloud_00" + cloudIndex].plist;
				var cloudSystem = BaseParticleSystem.create(cloudOptions);
				cloudSystem._screenRelativeSourcePositionPct = cloudsData.sourcePosition;
				cloudSystem._screenRelativeTargetPositionPct = cloudsData.targetPosition;
				if (cloudsData.sourceColor != null) {
					cloudSystem.setStartColor(cloudsData.sourceColor);
				}
				if (cloudsData.targetColor != null) {
					cloudSystem.setEndColor(cloudsData.targetColor);
				}
				if (cloudsData.background) {
					this._targetLayer.addNode(cloudSystem, {layerName: "backgroundLayer"});
				} else {
					this._targetLayer.addNode(cloudSystem, {layerName: "foregroundLayer", zOrder: -1});
				}
				this._particleSystems.push(cloudSystem);
				cloudSystem.stopSystem();
			}
		}
	},

	_setupWeather: function () {
		var winRect = UtilsEngine.getGSIWinRect();
		var battleMapTemplate = SDK.GameSession.getInstance().getBattleMapTemplate();
		var particleSystem;

		this._raySprites = [];

		// modify weather templates
		if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP0) {
			/*
			BATTLEMAP0
			*/
			this.sunRayTemplate.rotation = -40;
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP1) {
			/*
			BATTLEMAP1
			*/
			// nothing
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP2) {
			/*
			BATTLEMAP2
			*/
			this.sunRayTemplate.rotation = -140;
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP3) {
			/*
			BATTLEMAP3
			*/
			// nothing
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP4) {
			/*
			BATTLEMAP4
			*/
			this.sunRayTemplate.rotation = -55;
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP5) {
			/*
			BATTLEMAP5
			*/
			this.sunRayTemplate.rotation = -40;
			this.snowTemplate.angle = -65;
			this.rainTemplate.angle = -65;
			// make rain and snow fall only on platform
			this.snowTemplate.posVar.x = CONFIG.TILESIZE * 4.7;
			this.rainTemplate.posVar.x = CONFIG.TILESIZE * 4.7;
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP6) {
			/*
			BATTLEMAP6
			*/
			this.sunRayTemplate.rotation = -170;
		} else if(battleMapTemplate.getMap() === CONFIG.BATTLEMAP7) {
			/*
			BATTLEMAP7
			*/
			this.sunRayTemplate.rotation = -130;
		}

		// weather forecast: pwn
		if (battleMapTemplate.getHasWeather()) {
			if (battleMapTemplate.getHasSnow()) {
				// frosty the snowman
				particleSystem = BaseParticleSystem.create(this.snowTemplate);
				particleSystem._screenRelativePositionPct = {x: 0.5, y: 0.5};
				this._targetLayer.addNode(particleSystem);
				this._particleSystems.push(particleSystem);
				particleSystem.stopSystem();
			} else if (battleMapTemplate.getHasRain()) {
				// make it rain
				particleSystem = BaseParticleSystem.create(this.rainTemplate);
				particleSystem._screenRelativePositionPct = {x: 0.5, y: 0.5};
				this._targetLayer.addNode(particleSystem);
				this._particleSystems.push(particleSystem);
				particleSystem.stopSystem();
			}
		} else {
			// no weather
			// blue dust
			if (battleMapTemplate.getHasBlueDust()) {
				particleSystem = BaseParticleSystem.create(this.blueDustTemplate);
				var blueDustColor = battleMapTemplate.getMapTemplate().blueDustColor;
				if (blueDustColor != null) {
					particleSystem.setStartColor(blueDustColor);
					particleSystem.setEndColor(blueDustColor);
				}
				particleSystem._screenRelativePositionPct = {x: 0.5, y: 0.25};
				this._targetLayer.addNode(particleSystem);
				this._particleSystems.push(particleSystem);
				particleSystem.stopSystem();

				particleSystem = BaseParticleSystem.create(this.blueDustTemplate);
				if (blueDustColor != null) {
					particleSystem.setStartColor(blueDustColor);
					particleSystem.setEndColor(blueDustColor);
				}
				particleSystem._screenRelativePositionPct = {x: 0.5, y: 0.5};
				this._targetLayer.addNode(particleSystem);
				this._particleSystems.push(particleSystem);
				particleSystem.stopSystem();

				particleSystem = BaseParticleSystem.create(this.blueDustTemplate);
				if (blueDustColor != null) {
					particleSystem.setStartColor(blueDustColor);
					particleSystem.setEndColor(blueDustColor);
				}
				particleSystem._screenRelativePositionPct = {x: 0.5, y: 0.75};
				this._targetLayer.addNode(particleSystem);
				this._particleSystems.push(particleSystem);
				particleSystem.stopSystem();
			}

			// batch draw sun rays
			if (battleMapTemplate.getHasSunRays()) {
				this._rayBatchNode = cc.SpriteBatchNode.create(RSX.rays.img);
				this._targetLayer.addNode(this._rayBatchNode, {layerName: "foregroundLayer"});
				var raySprite;
				var refWinSize = UtilsEngine.getRefWindowSize();
				var rayCenterX = -refWinSize.width * 0.15;
				var rayMinX = -refWinSize.width * 0.5;
				var rayMaxX = refWinSize.width * 0.5;
				var rayRangeX = rayMaxX - rayMinX;
				var rayRangeY = refWinSize.height * 1.5;
				var rayWeightLeft = 1.0;
				var rayWeightRight = 0.75;
				for (var i = 0; i < this.sunRayCount; i++) {
					var rayTemplate = _.extend({}, this.sunRayTemplate);

					// create sprite
					raySprite = BaseSprite.create(this.sunRayTemplate);

					// shift rotation
					raySprite.setRotation(raySprite.getRotation() + (Math.random() * 10.0 - 5.0));

					// randomly position
					var xr = Math.random() * rayRangeX;
					var x = rayCenterX + rayMinX + xr;
					var xp = xr / rayRangeX;
					var xpn = (xp - 0.5) * 2.0;
					var xm = Math.pow(Math.max(0.25, Math.abs(xpn < 0.0 ? xpn * rayWeightLeft : xpn * rayWeightRight)), 3.0);
					var y = winRect.y + winRect.height * 0.75 + (xm * Math.random() * -rayRangeY) * 2.0;
					raySprite.setPosition(x, y);

					// setup for show
					raySprite.setOpacity(0.0);
					this._raySprites.push(raySprite);

					// add to batch
					this._rayBatchNode.addChild(raySprite);
				}
			}
		}
	},

	/* endregion SETUP */

	/* region ACTIVATE */

	activate: function () {
		Logger.module("ENGINE").log("BattleMap::activate");
		// activates and shows all battle map elements
		this.showEnvironmentEffects().then(function () {
			return this.showTiles(SDK.GameSession.getInstance().getIsDeveloperMode() ? 0.0 : CONFIG.FADE_SLOW_DURATION);
		}.bind(this)).then(function () {
			return this.showLights(SDK.GameSession.getInstance().getIsDeveloperMode() ? 0.0 : CONFIG.FADE_SLOW_DURATION);
		}.bind(this)).then(function () {
			// when all resolve set as active
			this.setStatus(BattleMap.STATUS.ACTIVE);
		}.bind(this));
	},

	showTiles: function(duration) {
		if (!this._isShowingTiles) {
			this._isShowingTiles = true;
			this._showTilesPromise = new Promise(function (resolve, reject) {
				var board = SDK.GameSession.getInstance().getBoard();
				var showDelay = 0.0;
				var floorTileMap = this._floorTileMap;

				if (floorTileMap != null) {
					if (duration == null) { duration = 0.0; }

					// animate showing of tiles
					var floorTilesShown = [];
					var startTile;
					var forPlayer2;
					if (SDK.GameSession.getInstance().getMyPlayer() === SDK.GameSession.getInstance().getPlayer2()) {
						// player 2 starts showing tiles from bottom right
						startTile = floorTileMap[UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), board.getColumnCount() - 1, 0)];
						forPlayer2 = true;
					} else {
						// player 1 starts showing tiles from bottom left
						startTile = floorTileMap[UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), 0, 0)];
						forPlayer2 = false;
					}
					var floorTilesShowing = [startTile];
					var floorTilesToShowNext = [];
					while (floorTilesShowing.length > 0) {
						var tileSprite = floorTilesShowing.shift();
						var boardPosition = tileSprite.boardPosition;
						var col = boardPosition.x;
						var row = boardPosition.y;
						var mapIndex = tileSprite.mapIndex;

						// mark this tile as shown
						if (floorTilesShown[mapIndex] == null) {
							floorTilesShown[mapIndex] = tileSprite;

							// fade in staggered
							tileSprite.setOpacity(0.0);
							tileSprite.runAction(cc.sequence(
								cc.delayTime(showDelay),
								cc.EaseExponentialIn.create(cc.fadeTo(duration * 0.3, CONFIG.FLOOR_TILE_OPACITY))
							));

							// scale in staggered
							var scale = tileSprite.getScale();
							tileSprite.setScale(0.0);
							tileSprite.runAction(cc.sequence(
								cc.delayTime(showDelay),
								cc.EaseBackOut.create(cc.scaleTo(duration, scale))
							));

							// get tiles around and add to end of show queue
							var mapIndexUp = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), col, row + 1);
							var tileSpriteUp = floorTileMap[mapIndexUp];
							if (tileSpriteUp != null) {
								floorTilesToShowNext.push(tileSpriteUp);
							}
							if (forPlayer2) {
								var mapIndexLeft = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), col - 1, row);
								var tileSpriteLeft = floorTileMap[mapIndexLeft];
								if (tileSpriteLeft != null) {
									floorTilesToShowNext.push(tileSpriteLeft);
								}
							} else {
								var mapIndexRight = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), col + 1, row);
								var tileSpriteRight = floorTileMap[mapIndexRight];
								if (tileSpriteRight != null) {
									floorTilesToShowNext.push(tileSpriteRight);
								}
							}
						}

						if (floorTilesShowing.length === 0) {
							// increase delay
							showDelay += duration * 0.1;

							// push tiles to show next
							floorTilesShowing = floorTilesToShowNext;
							floorTilesToShowNext = [];
						}
					}
				}

				// delay then set as displayed
				this._targetLayer.runAction(cc.sequence(
					cc.delayTime(showDelay),
					cc.callFunc(function () {
						resolve();
					}.bind(this))
				));
			}.bind(this));
		}

		return this._showTilesPromise;
	},
	hideTiles: function (duration) {
		if (this._isShowingTiles) {
			this._isShowingTiles = false;

			this._hideTilesPromise = new Promise(function (resolve, reject) {
				var showDelay = 0.0;
				var floorTileMap = this._floorTileMap;

				if (floorTileMap != null) {
					if (duration == null) { duration = 0.0; }
					showDelay += duration;
					for (var i = 0, il = floorTileMap.length; i < il; i++) {
						var tileSprite = floorTileMap[i];
						if (tileSprite != null) {
							tileSprite.fadeTo(duration, 0.0);
						}
					}
				}

				// delay then resolve
				this._targetLayer.runAction(cc.sequence(
					cc.delayTime(showDelay),
					cc.callFunc(function () {
						resolve();
					}.bind(this))
				));
			}.bind(this));
		}

		return this._hideTilesPromise;
	},
	showLights: function(duration) {
		if (!this._isShowingLights) {
			this._isShowingLights = true;

			this._showLightsPromise = new Promise(function (resolve, reject) {
				var showDelay = 0.0;
				var lights = this._lights;
				var ambientLightColorChangingSprites = this._ambientLightColorChangingSprites;

				if (lights != null) {
					if (duration == null) { duration = 0.0; }

					// show lights all at once
					showDelay += duration * 0.75;
					for (var i = 0, il = lights.length; i < il; i++) {
						var light = lights[i];
						light.fadeTo(duration, light._battlemapOpacity || 255.0);
					}
					// animate ambient light color to final values
					for (var i = 0, il = ambientLightColorChangingSprites.length; i < il; i++) {
						var sprite = ambientLightColorChangingSprites[i];
						if (sprite._finalAmbientLightColor) {
							var ambientLightColorAction = new AmbientLightColorTo(duration, sprite._finalAmbientLightColor.r, sprite._finalAmbientLightColor.g, sprite._finalAmbientLightColor.b);
							sprite.runAction(ambientLightColorAction);
						}
					}
				}

				// delay then set as displayed
				this._targetLayer.runAction(cc.sequence(
					cc.delayTime(showDelay),
					cc.callFunc(function () {
						resolve();
					}.bind(this))
				));
			}.bind(this));
		}

		return this._showLightsPromise;
	},
	hideLights: function (duration) {
		if (this._isShowingLights) {
			this._isShowingLights = false;

			this._hideLightsPromise = new Promise(function (resolve, reject) {
				var showDelay = 0.0;
				var lights = this._lights;
				var ambientLightColorChangingSprites = this._ambientLightColorChangingSprites;

				if (lights != null) {
					if (duration == null) { duration = 0.0; }
					// hide lights all at once
					showDelay += duration * 0.75;
					for (var i = 0, il = lights.length; i < il; i++) {
						var light = lights[i];
						light.fadeTo(duration, 0.0);
					}
				}

				if (ambientLightColorChangingSprites != null) {
					// animate ambient light color to zero
					for (var i = 0, il = ambientLightColorChangingSprites.length; i < il; i++) {
						var sprite = ambientLightColorChangingSprites[i];
						if (sprite._finalAmbientLightColor) {
							var ambientLightColorAction = new AmbientLightColorTo(duration, 0, 0, 0);
							sprite.runAction(ambientLightColorAction);
						}
					}
				}

				// delay then resolve
				this._targetLayer.runAction(cc.sequence(
					cc.delayTime(showDelay),
					cc.callFunc(function () {
						resolve();
					}.bind(this))
				));
			}.bind(this));
		}

		return this._hideLightsPromise;
	},
	showEnvironmentEffects: function () {
		if (!this._isShowingEnvironmentEffects) {
			this._isShowingEnvironmentEffects = true;

			this._showEnvironmentEffectsPromise = new Promise(function (resolve, reject) {
				var particleSystems = this._particleSystems;
				if (particleSystems != null) {
					for (var i = 0, il = particleSystems.length; i < il; i++) {
						var particleSystem = particleSystems[i];
						particleSystem.resumeSystem();
						particleSystem.runAction(cc.fadeIn(CONFIG.FADE_MEDIUM_DURATION));
					}
				}

				// animate rays in and out
				var raySprites = this._raySprites;
				if (raySprites != null) {
					for (var i = 0, il = raySprites.length; i < il; i++) {
						var raySprite = raySprites[i];
						var frequency = this.sunRayFrequencyMin + Math.random() * (this.sunRayFrequencyMax - this.sunRayFrequencyMin);
						raySprite.runAction(cc.sequence(
							cc.delayTime(frequency * 0.5),
							cc.fadeTo(this.sunRayFadeDurationMin + Math.random() * (this.sunRayFadeDurationMax - this.sunRayFadeDurationMin), this.sunRayOpacity),
							cc.delayTime(Math.random() * this.sunRayDuration),
							cc.fadeOut(this.sunRayFadeDurationMin + Math.random() * (this.sunRayFadeDurationMax - this.sunRayFadeDurationMin)),
							cc.delayTime(frequency * 0.5)
						).repeatForever());
					}
				}

				resolve();
			}.bind(this));
		}

		return this._showEnvironmentEffectsPromise;
	},
	hideEnvironmentEffects: function () {
		if (this._isShowingEnvironmentEffects) {
			this._isShowingEnvironmentEffects = false;
			this._hideEnvironmentEffectsPromise = new Promise(function (resolve, reject) {

				var particleSystems = this._particleSystems;
				if (particleSystems != null) {
					for (var i = 0, il = particleSystems.length; i < il; i++) {
						var particleSystem = particleSystems[i];
						particleSystem.stopSystem();
						particleSystem.runAction(cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION));
					}
				}

				// hide rays
				var raySprites = this._raySprites;
				if (raySprites != null) {
					for (var i = 0, il = raySprites.length; i < il; i++) {
						var raySprite = raySprites[i];
						raySprite.stopAllActions();
						raySprite.runAction(cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION));
					}
				}

				resolve();

			}.bind(this));
		}

		return this._hideEnvironmentEffectsPromise;
	}

	/* endregion ACTIVATE */

});

BattleMap.STATUS = {
	SETUP: 1,
	ACTIVE: 2,
	DISABLED: 3
};

BattleMap.create = function (targetLayer) {
	return new BattleMap(targetLayer);
};

module.exports = BattleMap;
