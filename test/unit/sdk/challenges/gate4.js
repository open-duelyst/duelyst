var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('./../../../utils/utils_sdk');
var _ = require('underscore');
var Promise = require('bluebird');
var BeginnerAbyssianChallenge5 = require('app/sdk/challenges/abyssian/BeginnerAbyssianChallenge5');
var BeginnerSonghaiChallenge2 = require('app/sdk/challenges/songhai/BeginnerSonghaiChallenge2');
var BeginnerMagmarChallenge4 = require('app/sdk/challenges/magmar/BeginnerMagmarChallenge4');
var BeginnerVetruvianChallenge4 = require('app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge4');
var BeginnerLyonarChallenge1 = require('app/sdk/challenges/lyonar/BeginnerLyonarChallenge1');
var BeginnerVanarChallenge4 = require('app/sdk/challenges/vanar/BeginnerVanarChallenge4');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
  describe("gate 4", function() {
    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect gate 4: challenge 1 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerLyonarChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 2);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:4,y:2}));
      gameSession.executeAction(action);

      var squire = board.getUnitAtPosition({x:3,y:1});
      var action = squire.actionAttack(board.getUnitAtPosition({x:4,y:2}));
      gameSession.executeAction(action);

      var lion = board.getUnitAtPosition({x:3, y:3});
      var action = lion.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = lion.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = lion.actionAttack(board.getUnitAtPosition({x:6,y:2}));
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 4: challenge 2 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge5());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var vh1 = board.getUnitAtPosition({x: 2, y: 1});
      var vh2 = board.getUnitAtPosition({x: 2, y: 3});

      var action = vh1.actionMove({ x: 3, y: 1 });
      gameSession.executeAction(action);
      var action = vh1.actionAttack(board.getUnitAtPosition({x:4,y:2}));
      gameSession.executeAction(action);
      var action = vh2.actionMove({ x: 3, y: 3 });
      gameSession.executeAction(action);
      var action = vh2.actionAttack(board.getUnitAtPosition({x:4,y:2}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 1);
      gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var tiger = board.getUnitAtPosition({x:4,y:1});
      var action = tiger.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      var action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 4: challenge 3 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge4());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var phalanxar = board.getUnitAtPosition({x: 2, y: 3});
      var elucidator = board.getUnitAtPosition({x: 2, y: 1});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = phalanxar.actionMove({ x: 4, y: 3 });
      gameSession.executeAction(action);
      var action = phalanxar.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = elucidator.actionMove({ x: 4, y: 1 });
      gameSession.executeAction(action);
      var action = elucidator.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 4: challenge 4 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge4());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var scorpion = board.getUnitAtPosition({x: 1, y: 2});
      var orb1 = board.getUnitAtPosition({x: 5, y: 1});
      var orb2 = board.getUnitAtPosition({x: 5, y: 3});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = scorpion.actionMove({ x: 6, y: 1 });
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = scorpion.actionAttack(board.getUnitAtPosition({x: 6, y:2}));
      gameSession.executeAction(action);

      var action = orb1.actionMove({ x: 7, y: 1 });
      gameSession.executeAction(action);
      var action = orb1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = orb2.actionMove({ x: 7, y: 3 });
      gameSession.executeAction(action);
      var action = orb2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 4: challenge 5 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge4());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 1, y: 1 });
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);
      var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      var followupAction2 = myPlayer.actionPlayFollowup(followupCard2, 5, 2);
      gameSession.executeAction(followupAction2);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      var tiger = board.getUnitAtPosition({x: 6, y: 3});

      var action = tiger.actionMove({ x: 7, y: 3 });
      gameSession.executeAction(action);
      var action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
