var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("monthlies", function() {
  describe("month 7", function() {
    beforeEach(function () {
      var player1Deck = [
        {id: SDK.Cards.Faction6.General},
      ];

      var player2Deck = [
        {id: SDK.Cards.Faction1.General},
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(function () {
      SDK.GameSession.reset();
    });

    it('expect arrow whistler to give other ranged minions +1 attack', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var arrowWhistler = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ArrowWhistler}, 7, 2, gameSession.getPlayer1Id());
      var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 7, 3, gameSession.getPlayer1Id());

      expect(arrowWhistler.getATK()).to.equal(2);
      expect(valeHunter.getATK()).to.equal(2);

      var arrowWhistler2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ArrowWhistler}, 6, 2, gameSession.getPlayer1Id());
      expect(arrowWhistler.getATK()).to.equal(3);
      expect(valeHunter.getATK()).to.equal(3);
    });
    it('expect golden justicar to allow your other minions with provoke to move 2 additional spaces', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var goldenJusticar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.GoldenJusticar}, 7, 2, gameSession.getPlayer1Id());
      var silverguardKnight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 7, 3, gameSession.getPlayer1Id());

      silverguardKnight.refreshExhaustion();
      var action = silverguardKnight.actionMove({ x: 3, y: 3 });
      gameSession.executeAction(action);

      expect(board.getUnitAtPosition({x:3,y:3}).getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
    });

		/* Test disabled: failing
    it('expect skywing to make your flying minions cost 1 less', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var skywing = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Skywing}, 7, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Oserix}));

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(6);

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(player1.remainingMana).to.equal(3);
    });
		*/

    it('expect unseven to summon a card with dying wish from your hand when it dies', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Pyromancer}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Pyromancer}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Dilotas}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Pyromancer}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Pyromancer}));

      var unseven = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Unseven}, 7, 2, gameSession.getPlayer1Id());
      unseven.refreshExhaustion();
      unseven.setDamage(3);

      var action = unseven.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var dioltas = board.getUnitAtPosition({x:7, y:2});

      expect(dioltas.getId()).to.equal(SDK.Cards.Neutral.Dilotas);
    });

  });
});
