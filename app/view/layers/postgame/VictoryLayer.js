// pragma PKGS: victory
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const SDK = require('app/sdk');
const RewardLayer = require('app/view/layers/reward/RewardLayer');
const BaseSprite = require('app/view/nodes/BaseSprite');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const Shake = require('app/view/actions/Shake');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const FXFireLinearWaveSprite = require('app/view/nodes/fx/FXFireLinearWaveSprite');
const TweenTypes = require('app/view/actions/TweenTypes');

/** **************************************************************************
 VictoryLayer
 *************************************************************************** */

const VictoryLayer = RewardLayer.extend({

  getRequiredResources() {
    let resources = RewardLayer.prototype.getRequiredResources.call(this);

    // add victory package
    resources = resources.concat(PKGS.getPkgForIdentifier('victory'));

    // get results
    const myPlayer = this.getMyPlayer();
    const myPlayerWon = this.getMyPlayerWon();
    const result = myPlayerWon ? 'victory' : 'defeat';
    const friendOrEnemy = myPlayerWon ? 'friendly' : 'enemy';
    const playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(myPlayer.getPlayerId());
    const myOriginalGeneral = SDK.GameSession.getCardCaches().getCardById(playerSetupData.generalId);
    const myGeneral = SDK.GameSession.getInstance().getGeneralForPlayerId(myPlayer.getPlayerId()) || myOriginalGeneral;

    // add scene resources based on result
    resources.push(RSX[`scene_glow_${friendOrEnemy}`]);
    resources.push(RSX[`scene_diamonds_background_${result}`]);
    resources.push(RSX[`scene_diamonds_middleground_${result}`]);
    resources.push(RSX[`scene_diamonds_blurred_${friendOrEnemy}`]);

    // add general concept image
    const myGeneralConceptResource = myGeneral.getConceptResource() || myOriginalGeneral.getConceptResource();
    if (myGeneralConceptResource != null) {
      resources.push(myGeneralConceptResource);
    }

    return resources;
  },

  showContinueNode() {
    return this._super().then(() => {
      this.continueNode.setVisible(false);
    });
  },

  getMyPlayer() {
    let winningPlayer = SDK.GameSession.getInstance().getWinner();
    let myPlayer;
    if (SDK.GameSession.getInstance().isSandbox()) {
      if (winningPlayer == null) {
        winningPlayer = SDK.GameSession.getInstance().getCurrentPlayer();
      }
      myPlayer = winningPlayer;
    } else {
      myPlayer = SDK.GameSession.getInstance().getMyPlayer();
    }
    return myPlayer;
  },

  getMyPlayerWon() {
    const winningPlayer = SDK.GameSession.getInstance().getWinner();
    let myPlayerWon;
    if (SDK.GameSession.getInstance().isSandbox()) {
      myPlayerWon = true;
    } else {
      myPlayerWon = SDK.GameSession.getInstance().getMyPlayer() === winningPlayer;
    }
    return myPlayerWon;
  },

  onEnter() {
    this._super();

    // don't allow continue
    this.setIsContinueOnPressAnywhere(false);
    this.setIsInteractionEnabled(false);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      const myPlayer = this.getMyPlayer();
      const myPlayerWon = this.getMyPlayerWon();
      const result = myPlayerWon ? 'victory' : 'defeat';
      const friendOrEnemy = myPlayerWon ? 'friendly' : 'enemy';
      const playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(myPlayer.getPlayerId());
      const myOriginalGeneral = SDK.GameSession.getCardCaches().getCardById(playerSetupData.generalId);
      const myGeneral = SDK.GameSession.getInstance().getGeneralForPlayerId(myPlayer.getPlayerId()) || myOriginalGeneral;

      // background elements
      this.glowSprite = BaseSprite.create(RSX[`scene_glow_${friendOrEnemy}`].img);
      this.glowSprite.setPosition(0.0, UtilsEngine.getGSIWinHeight() * 0.5 - this.glowSprite.getContentSize().height * 0.4725 * this.glowSprite.getScale());
      this.addChild(this.glowSprite, this.bgZOrder - 1);

      this.diamondsBGSprite = BaseSprite.create(RSX[`scene_diamonds_background_${result}`].img);
      this.addChild(this.diamondsBGSprite, this.bgZOrder - 1);

      // petals
      const petalsOptions = {
        angled: true,
        liveForDistance: true,
        fadeInAtLifePct: 0.25,
      };
      const sourceScreenPosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.6);
      const targetScreenPosition = cc.p(0.0, UtilsEngine.getGSIWinHeight() * 0.6);

      petalsOptions.plistFile = RSX.ptcl_petals_001.plist;
      this.petalsSystem001 = BaseParticleSystem.create(petalsOptions);
      this.petalsSystem001.setSourceScreenPosition(sourceScreenPosition);
      this.petalsSystem001.setTargetScreenPosition(targetScreenPosition);
      this.addChild(this.petalsSystem001, this.bgZOrder - 1);

      petalsOptions.plistFile = RSX.ptcl_petals_002.plist;
      this.petalsSystem002 = BaseParticleSystem.create(petalsOptions);
      this.petalsSystem002.setSourceScreenPosition(sourceScreenPosition);
      this.petalsSystem002.setTargetScreenPosition(targetScreenPosition);
      this.addChild(this.petalsSystem002, this.bgZOrder - 1);

      petalsOptions.plistFile = RSX.ptcl_petals_003.plist;
      this.petalsSystem003 = BaseParticleSystem.create(petalsOptions);
      this.petalsSystem003.setSourceScreenPosition(sourceScreenPosition);
      this.petalsSystem003.setTargetScreenPosition(targetScreenPosition);
      this.addChild(this.petalsSystem003, this.bgZOrder - 1);

      // foreground elements
      const myGeneralConceptResource = myGeneral.getConceptResource() || myOriginalGeneral.getConceptResource();
      this.generalSprite = BaseSprite.create(myGeneralConceptResource.img);
      this.generalSprite.setScale(0.8);
      this.generalSprite.setPosition(0.0, -150);
      this.addChild(this.generalSprite, this.bgZOrder - 1);

      this.diamondsMGSprite = BaseSprite.create(RSX[`scene_diamonds_middleground_${result}`].img);
      this.diamondsMGSprite.setPosition(0.0, this.diamondsMGSprite.getContentSize().height * 0.25);
      this.addChild(this.diamondsMGSprite);

      this.diamondsFGSprite = BaseSprite.create(RSX[`scene_diamonds_blurred_${friendOrEnemy}`].img);
      this.diamondsFGSprite.setPosition(0.0, this.diamondsFGSprite.getContentSize().height * 0.2);
      this.addChild(this.diamondsFGSprite);

      // shake the screen
      const shakeTime = 0.5;
      const shakeAction = cc.sequence(
        cc.delayTime(CONFIG.VIEW_TRANSITION_DURATION),
        Shake.create(shakeTime, 30.0, UtilsEngine.getGSIWinCenterPosition()),
      );
      shakeAction.setTag(CONFIG.MOVE_TAG);
      this.runAction(shakeAction);

      // fade continue node
      this.continueNode.runAction(cc.sequence(
        cc.delayTime(CONFIG.VIEW_TRANSITION_DURATION + shakeTime),
        cc.spawn(
          cc.show(),
          cc.fadeIn(CONFIG.ANIMATE_FAST_DURATION),
        ),
        cc.callFunc(() => {
          this.setIsContinueOnPressAnywhere(true);
          this.setIsInteractionEnabled(true);
        }),
      ));
    });
  },

  onResize() {
    this._super();

    // stop shake
    this.stopActionByTag(CONFIG.MOVE_TAG);

    if (this.glowSprite != null) {
      this.glowSprite.setPosition(0.0, UtilsEngine.getGSIWinHeight() * 0.5 - this.glowSprite.getContentSize().height * 0.4725 * this.glowSprite.getScale());
    }

    // petals
    const sourceScreenPosition = cc.p(0.0, -UtilsEngine.getGSIWinHeight() * 0.6);
    const targetScreenPosition = cc.p(0.0, UtilsEngine.getGSIWinHeight() * 0.6);

    if (this.petalsSystem001 != null) {
      this.petalsSystem001.setSourceScreenPosition(sourceScreenPosition);
      this.petalsSystem001.setTargetScreenPosition(targetScreenPosition);
    }

    if (this.petalsSystem001 != null) {
      this.petalsSystem002.setSourceScreenPosition(sourceScreenPosition);
      this.petalsSystem002.setTargetScreenPosition(targetScreenPosition);
    }

    if (this.petalsSystem001 != null) {
      this.petalsSystem003.setSourceScreenPosition(sourceScreenPosition);
      this.petalsSystem003.setTargetScreenPosition(targetScreenPosition);
    }

    if (this.diamondsMGSprite != null) {
      this.diamondsMGSprite.setPosition(0.0, this.diamondsMGSprite.getContentSize().height * 0.25);
    }

    if (this.diamondsFGSprite != null) {
      this.diamondsFGSprite.setPosition(0.0, this.diamondsFGSprite.getContentSize().height * 0.2);
    }

    if (this.levelUpParticles != null) {
      this.levelUpParticles.setPosition(0.0, -UtilsEngine.getGSIWinHeight() * 0.5);
      this.levelUpParticles.setPosVar(cc.p(UtilsEngine.getGSIWinWidth() * 0.5, -20));
    }

    if (this.fireLinearWave != null) {
      this.fireLinearWave.setPosition(-UtilsEngine.getGSIWinWidth() * 0.5, -UtilsEngine.getGSIWinHeight() * 0.5);
      this.fireLinearWave.setTextureRect(UtilsEngine.getGSIWinRect());
    }
  },

  showLevelUpEffect() {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // level up particles
      if (this.levelUpParticles != null) {
        this.levelUpParticles.destroy();
      }
      this.levelUpParticles = new cc.ParticleSystem(RSX.ptcl_level_up_wave.plist);
      this.levelUpParticles.setAnchorPoint(0.5, 0.0);
      this.levelUpParticles.setTotalParticles(1200);
      this.levelUpParticles.setPosition(0.0, -UtilsEngine.getGSIWinHeight() * 0.5);
      this.levelUpParticles.setPosVar(cc.p(UtilsEngine.getGSIWinWidth() * 0.5, -20));
      this.addChild(this.levelUpParticles);

      if (this.fireLinearWave != null) {
        this.fireLinearWave.destroy();
      }
      this.fireLinearWave = FXFireLinearWaveSprite.create();
      this.fireLinearWave.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.fireLinearWave.setAnchorPoint(0.0, 0.0);
      this.fireLinearWave.setPosition(-UtilsEngine.getGSIWinWidth() * 0.5, -UtilsEngine.getGSIWinHeight() * 0.5);
      this.fireLinearWave.setFlippedY(true);
      this.fireLinearWave.setTextureRect(UtilsEngine.getGSIWinRect());
      this.fireLinearWave.runAction(cc.sequence(
        cc.actionTween(2.0, 'phase', 0.0, 1.0),
        cc.callFunc(() => {
          this.fireLinearWave.destroy();
        }),
      ));
      this.addChild(this.fireLinearWave);
    });
  },

  showGoldTipEffect(position) {
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      const explosionParticles = new cc.ParticleSystem(RSX.goldTipButtonParticles.plist);
      explosionParticles.setAutoRemoveOnFinish(true);
      explosionParticles.setPosition(position);
      this.addChild(explosionParticles);
    });
  },

});

VictoryLayer.create = function (layer) {
  return RewardLayer.create(layer || new VictoryLayer());
};

module.exports = VictoryLayer;
