const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');
const { expect } = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');

const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const BeginnerAbyssianChallenge2 = require('../../../../app/sdk/challenges/abyssian/BeginnerAbyssianChallenge2.coffee');
const BeginnerSonghaiChallenge1 = require('../../../../app/sdk/challenges/songhai/BeginnerSonghaiChallenge1.coffee');
const BeginnerMagmarChallenge2 = require('../../../../app/sdk/challenges/magmar/BeginnerMagmarChallenge2.coffee');
const MediumVetruvianChallenge2 = require('../../../../app/sdk/challenges/vetruvian/MediumVetruvianChallenge2.coffee');
const AdvancedLyonarChallenge2 = require('../../../../app/sdk/challenges/lyonar/AdvancedLyonarChallenge2.coffee');
const BeginnerVanarChallenge3 = require('../../../../app/sdk/challenges/vanar/BeginnerVanarChallenge3.coffee');
const BeginnerVetruvianChallenge2 = require('../../../../app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge2.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('gate 6', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect gate 6: challenge 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const shadowDancer = board.getUnitAtPosition({ x: 1, y: 2 });
      let action = shadowDancer.actionMove({ x: 0, y: 2 });
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);

      action = board.getUnitAtPosition({ x: 4, y: 2 }).actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 6, y: 2 }).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      action = board.getUnitAtPosition({ x: 3, y: 0 }).actionMove({ x: 5, y: 0 });
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 5, y: 0 }).actionAttack(board.getUnitAtPosition({ x: 5, y: 1 }));
      gameSession.executeAction(action);

      action = board.getUnitAtPosition({ x: 3, y: 4 }).actionMove({ x: 5, y: 4 });
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 5, y: 4 }).actionAttack(board.getUnitAtPosition({ x: 5, y: 3 }));
      gameSession.executeAction(action);

      action = board.getUnitAtPosition({ x: 3, y: 2 }).actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = board.getUnitAtPosition({ x: 5, y: 2 }).actionAttack(board.getUnitAtPosition({ x: 5, y: 1 }));
      gameSession.executeAction(action);

      action = board.getUnitAtPosition({ x: 1, y: 0 }).actionMove({ x: 1, y: 2 });
      gameSession.executeAction(action);

      action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 6: challenge 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      let followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      let followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 1);
      gameSession.executeAction(followupAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);

      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 6: challenge 3 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge3());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const crystal1 = board.getUnitAtPosition({ x: 8, y: 2 });
      action = crystal1.actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      const crystal2 = board.getUnitAtPosition({ x: 2, y: 0 });
      action = crystal2.actionMove({ x: 2, y: 1 });
      gameSession.executeAction(action);
      const crystal3 = board.getUnitAtPosition({ x: 2, y: 4 });
      action = crystal3.actionMove({ x: 2, y: 3 });
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 6, 2);
      gameSession.executeAction(followupAction);

      action = crystal1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = crystal2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = crystal3.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      /*
      action = gameSession.getGeneralForPlayer1().actionMove({ x: 1, y: 2});
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      */

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 6: challenge 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const windShrike = board.getUnitAtPosition({ x: 1, y: 3 });
      action = windShrike.actionMove({ x: 7, y: 4 });
      gameSession.executeAction(action);
      action = windShrike.actionAttack(board.getUnitAtPosition({ x: 8, y: 4 }));
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const mechanyst = board.getUnitAtPosition({ x: 6, y: 2 });
      action = mechanyst.actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      action = mechanyst.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 6: challenge 5 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new AdvancedLyonarChallenge2());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      const ironcliffeGuardian = board.getUnitAtPosition({ x: 1, y: 2 });
      let action = ironcliffeGuardian.actionAttack(board.getUnitAtPosition({ x: 2, y: 2 }));
      gameSession.executeAction(action);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      const brawler = board.getUnitAtPosition({ x: 1, y: 3 });
      action = brawler.actionMove({ x: 2, y: 3 });
      gameSession.executeAction(action);
      action = brawler.actionAttack(board.getUnitAtPosition({ x: 3, y: 3 }));
      gameSession.executeAction(action);
      action = brawler.actionAttack(board.getUnitAtPosition({ x: 3, y: 3 }));
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 3, y: 3 }));
      gameSession.executeAction(action);

      const windblade = board.getUnitAtPosition({ x: 3, y: 1 });
      action = windblade.actionAttack(board.getUnitAtPosition({ x: 4, y: 1 }));
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);

      const squire = board.getUnitAtPosition({ x: 4, y: 2 });
      action = squire.actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);
      action = squire.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const secondSun1 = board.getUnitAtPosition({ x: 6, y: 1 });
      const secondSun2 = board.getUnitAtPosition({ x: 6, y: 3 });

      action = myPlayer.actionPlaySignatureCard(6, 1);
      gameSession.executeAction(action);
      action = secondSun1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = secondSun2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
