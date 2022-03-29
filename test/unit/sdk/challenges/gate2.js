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
var BeginnerAbyssianChallenge1 = require('app/sdk/challenges/abyssian/BeginnerAbyssianChallenge1');
var BeginnerSonghaiChallenge5 = require('app/sdk/challenges/songhai/BeginnerSonghaiChallenge5');
var BeginnerMagmarChallenge1 = require('app/sdk/challenges/magmar/BeginnerMagmarChallenge1');
var BeginnerVetruvianChallenge1 = require('app/sdk/challenges/vetruvian/BeginnerVetruvianChallenge1');
var BeginnerLyonarChallenge2 = require('app/sdk/challenges/lyonar/BeginnerLyonarChallenge2');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("challenges", function() {
  describe("gate 2", function() {
    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect gate 2: challenge 1 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerAbyssianChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 5, 2);
			gameSession.executeAction(playCardFromHandAction);
      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = myPlayer.actionPlayFollowup(followupCard, 5, 2);
			gameSession.executeAction(followupAction);

      var shadowWatcher = board.getUnitAtPosition({x:4, y:2});

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = shadowWatcher.actionMove({ x: 5, y: 1 });
      gameSession.executeAction(action);
      var action = shadowWatcher.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 2: challenge 2 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerSonghaiChallenge5());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 1, 2); //SaberspineSeal
      gameSession.executeAction(playCardFromHandAction);
      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:4, y:2})); //kill silverguard knight
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 4, 2); //summon tiger
      gameSession.executeAction(playCardFromHandAction);

      var tiger = board.getUnitAtPosition({x:4, y:2});

      var action = tiger.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = tiger.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 2: challenge 3 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerMagmarChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var warbeast = board.getUnitAtPosition({x:4, y:1});

      var action = warbeast.actionMove({ x: 6, y: 1 });
      gameSession.executeAction(action);
      var action = warbeast.actionAttack(board.getUnitAtPosition({x:5, y:2}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 2: challenge 4 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerVetruvianChallenge1());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var portalGuardian = board.getUnitAtPosition({x:3, y:2});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 5, 2);
      gameSession.executeAction(playCardFromHandAction);
      var action = gameSession.getGeneralForPlayer1().actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = board.getUnitAtPosition({x:5, y:1}).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:5, y:2}).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:5, y:3}).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);
      var action = board.getUnitAtPosition({x:7, y:2}).actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var action = portalGuardian.actionMove({ x: 5, y: 2 });
      gameSession.executeAction(action);
      var action = portalGuardian.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);


      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
    it('expect gate 2: challenge 5 to be completable', function() {
      UtilsSDK.setupSessionForChallenge(new BeginnerLyonarChallenge2());

      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var myPlayer = gameSession.getMyPlayer();

      var ironcliffeGuardian = board.getUnitAtPosition({x:4, y:3});
      var windbladeAdept = board.getUnitAtPosition({x:4, y:1});

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(1, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(2, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = gameSession.getGeneralForPlayer1().actionAttack(board.getUnitAtPosition({x:5, y:2}));
      gameSession.executeAction(action);
      var action = windbladeAdept.actionAttack(board.getUnitAtPosition({x:5, y:2}));
      gameSession.executeAction(action);

      var playCardFromHandAction = myPlayer.actionPlayCardFromHand(0, 4, 3);
      gameSession.executeAction(playCardFromHandAction);

      var action = ironcliffeGuardian.actionMove({ x: 5, y: 3 });
      gameSession.executeAction(action);
      var action = ironcliffeGuardian.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(0);
    });
  });
});
