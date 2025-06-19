const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../'));
require('coffeescript/register');

const { expect } = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');

const CONFIG = require('../../../../app/common/config');
const Logger = require('../../../../app/common/logger.coffee');
const SDK = require('../../../../app/sdk.coffee');
const BeginnerAbyssianChallenge5 = require('../../../../app/sdk/challenges/abyssian/BeginnerAbyssianChallenge5.coffee');
const BeginnerSonghaiChallenge2 = require('../../../../app/sdk/challenges/songhai/BeginnerSonghaiChallenge2.coffee');
const BeginnerMagmarChallenge4 = require('../../../../app/sdk/challenges/magmar/BeginnerMagmarChallenge4.coffee');
const BeginnerVetruvianChallenge4 = require('../../../../app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge4.coffee');
const BeginnerLyonarChallenge1 = require('../../../../app/sdk/challenges/lyonar/BeginnerLyonarChallenge1.coffee');
const BeginnerVanarChallenge4 = require('../../../../app/sdk/challenges/vanar/BeginnerVanarChallenge4.coffee');
const UtilsSDK = require('../../../utils/utils_sdk');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('challenges', () => {
  describe('gate 4', () => {
    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect gate 4: challenge 1 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerLyonarChallenge1());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);

      const squire = board.getUnitAtPosition({ x: 3, y: 1 });
      action = squire.actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);

      const lion = board.getUnitAtPosition({ x: 3, y: 3 });
      action = lion.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = lion.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = lion.actionAttack(board.getUnitAtPosition({ x: 6, y: 2 }));
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 4: challenge 2 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge5());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const vh1 = board.getUnitAtPosition({ x: 2, y: 1 });
      const vh2 = board.getUnitAtPosition({ x: 2, y: 3 });

      let action = vh1.actionMove({ x: 3, y: 1 });
      gameSession.executeAction(action);
      action = vh1.actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);
      action = vh2.actionMove({ x: 3, y: 3 });
      gameSession.executeAction(action);
      action = vh2.actionAttack(board.getUnitAtPosition({ x: 4, y: 2 }));
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 1);
      gameSession.executeAction(playCardFromHandAction);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const tiger = board.getUnitAtPosition({ x: 4, y: 1 });
      action = tiger.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 4: challenge 3 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge4());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const phalanxar = board.getUnitAtPosition({ x: 2, y: 3 });
      const elucidator = board.getUnitAtPosition({ x: 2, y: 1 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      let action = phalanxar.actionMove({ x: 4, y: 3 });
      gameSession.executeAction(action);
      action = phalanxar.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = elucidator.actionMove({ x: 4, y: 1 });
      gameSession.executeAction(action);
      action = elucidator.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 4: challenge 4 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge4());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      const scorpion = board.getUnitAtPosition({ x: 1, y: 2 });
      const orb1 = board.getUnitAtPosition({ x: 5, y: 1 });
      const orb2 = board.getUnitAtPosition({ x: 5, y: 3 });

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      let action = scorpion.actionMove({ x: 6, y: 1 });
      gameSession.executeAction(action);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      action = scorpion.actionAttack(board.getUnitAtPosition({ x: 6, y: 2 }));
      gameSession.executeAction(action);

      action = orb1.actionMove({ x: 7, y: 1 });
      gameSession.executeAction(action);
      action = orb1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      action = orb2.actionMove({ x: 7, y: 3 });
      gameSession.executeAction(action);
      action = orb2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });

    it('expect gate 4: challenge 5 to be completable', () => {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge4());

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const myPlayer = gameSession.getMyPlayer();

      let action = gameSession.getGeneralForPlayer1().actionMove({ x: 1, y: 1 });
      gameSession.executeAction(action);

      let playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = myPlayer.actionPlayFollowup(followupCard2, 5, 2);
      gameSession.executeAction(followupAction2);

      playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      const tiger = board.getUnitAtPosition({ x: 6, y: 3 });

      action = tiger.actionMove({ x: 7, y: 3 });
      gameSession.executeAction(action);
      action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
