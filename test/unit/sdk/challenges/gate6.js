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
var BeginnerAbyssianChallenge2 = require('app/sdk/challenges/abyssian/BeginnerAbyssianChallenge2');
var BeginnerSonghaiChallenge1 = require('app/sdk/challenges/songhai/BeginnerSonghaiChallenge1');
var BeginnerMagmarChallenge2 = require('app/sdk/challenges/magmar/BeginnerMagmarChallenge2');
var MediumVetruvianChallenge2 = require('app/sdk/challenges/vetruvian/MediumVetruvianChallenge2');
var AdvancedLyonarChallenge2 = require('app/sdk/challenges/lyonar/AdvancedLyonarChallenge2');
var BeginnerVanarChallenge3 = require('app/sdk/challenges/vanar/BeginnerVanarChallenge3');
var BeginnerVetruvianChallenge2 = require('app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge2');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
  describe("gate 6", function() {
    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect gate 6: challenge 1 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var shadowDancer = board.getUnitAtPosition({x: 1, y:2});
      var action = shadowDancer.actionMove({x:0, y:2});
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = board.getUnitAtPosition({x:4, y:2}).actionMove({ x: 6, y: 2});
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:6, y:2}).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var action = board.getUnitAtPosition({x:3, y:0}).actionMove({ x: 5, y: 0});
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:5, y:0}).actionAttack(board.getUnitAtPosition({x:5, y:1}));
      gameSession.executeAction(action);

      var action = board.getUnitAtPosition({x:3, y:4}).actionMove({ x: 5, y: 4});
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:5, y:4}).actionAttack(board.getUnitAtPosition({x:5, y:3}));
      gameSession.executeAction(action);

      var action = board.getUnitAtPosition({x:3, y:2}).actionMove({ x: 5, y: 2});
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:5, y:2}).actionAttack(board.getUnitAtPosition({x:5, y:1}));
      gameSession.executeAction(action);

      var action = board.getUnitAtPosition({x:1, y:0}).actionMove({ x: 1, y: 2});
      gameSession.executeAction(action);

      var action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

	  // Don't think we need this code anymore
      /*var action = board.getUnitAtPosition({x:2, y:0}).actionMove({ x: 4, y: 0});
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:4, y:0}).actionAttack(board.getUnitAtPosition({x:5, y:1}));
      gameSession.executeAction(action);*/

	  expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 6: challenge 2 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(3, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 1);
      gameSession.executeAction(followupAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 4, 2);
      gameSession.executeAction(followupAction);

      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 6: challenge 3 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVanarChallenge3());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      var crystal1 = board.getUnitAtPosition({x:8, y:2});
      var action = crystal1.actionMove({ x: 6, y: 2});
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      var crystal2 = board.getUnitAtPosition({x:2, y:0});
      var action = crystal2.actionMove({ x: 2, y: 1});
      gameSession.executeAction(action);
      var crystal3 = board.getUnitAtPosition({x:2, y:4});
      var action = crystal3.actionMove({ x: 2, y: 3});
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 6, 2);
      gameSession.executeAction(followupAction);

      var action = crystal1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = crystal2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = crystal3.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

/*
      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 1, y: 2});
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);
      */

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 6: challenge 4 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var action = myPlayer.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      var windShrike = board.getUnitAtPosition({x:1, y:3});
      var action = windShrike.actionMove({ x: 7, y: 4 });
      gameSession.executeAction(action);
      var action = windShrike.actionAttack(board.getUnitAtPosition({x:8,y:4}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var mechanyst = board.getUnitAtPosition({x:6, y:2});
      var action = mechanyst.actionMove({ x: 7, y: 2 });
      gameSession.executeAction(action);
      var action = mechanyst.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 6: challenge 5 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new AdvancedLyonarChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 3, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      var ironcliffeGuardian = board.getUnitAtPosition({x:1, y:2});
      var action = ironcliffeGuardian.actionAttack(board.getUnitAtPosition({x:2,y:2}));
      gameSession.executeAction(action);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2});
      gameSession.executeAction(action);

      var brawler = board.getUnitAtPosition({x:1,y:3});
      var action = brawler.actionMove({ x: 2, y: 3});
      gameSession.executeAction(action);
      var action = brawler.actionAttack(board.getUnitAtPosition({x:3,y:3}));
      gameSession.executeAction(action);
      var action = brawler.actionAttack(board.getUnitAtPosition({x:3,y:3}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:3,y:3}));
      gameSession.executeAction(action);

      var windblade = board.getUnitAtPosition({x:3,y:1});
      var action = windblade.actionAttack(board.getUnitAtPosition({x:4,y:1}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
      gameSession.executeAction(followupAction);

      var squire = board.getUnitAtPosition({x:4, y:2});
      var action = squire.actionMove({ x: 6, y: 2});
      gameSession.executeAction(action);
      var action = squire.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var secondSun1 = board.getUnitAtPosition({x:6, y:1});
      var secondSun2 = board.getUnitAtPosition({x:6, y:3});

      var action = myPlayer.actionPlaySignatureCard(6, 1);
      gameSession.executeAction(action);
      var action = secondSun1.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = secondSun2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
