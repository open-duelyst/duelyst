var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("core set", function() {
  describe("commons", function() {
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

    it('expect maw to deal 2 damage to a nearby enemy minion', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(brightmossGolem.getDamage()).to.equal(2);
    });
    it('expect blaze hound to draw a card for both players', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.Maw}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PhaseHound}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand1 = player1.getDeck().getCardsInHand();
			var hand2 = player2.getDeck().getCardsInHand();
			expect(hand1[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
      expect(hand2[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
    });
    it('expect mechaz0r to be created when 5 mech peices are down', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 1);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 6, 3);
      gameSession.executeAction(followupAction);

      var mechaz0r = board.getUnitAtPosition({x:6,y:3});

      expect(mechaz0r.getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });
    it('expect bluetip scorpion to deal double damage to only minions', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var bluetip = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 1, 2, gameSession.getPlayer1Id());
      var bluetip2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 7, 2, gameSession.getPlayer1Id());
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 2, gameSession.getPlayer2Id());

      bluetip.refreshExhaustion();
      var action = bluetip.actionAttack(brightmossGolem);
			gameSession.executeAction(action);
      bluetip2.refreshExhaustion();
      var action = bluetip2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(6);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
    });
    it('expect primus fist to give a friendly minion +2 attack', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var bluetip = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.PrimusFist}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      expect(bluetip.getATK()).to.equal(5);

	  gameSession.executeAction(gameSession.actionEndTurn());

	  expect(bluetip.getATK()).to.equal(3);
    });
    it('expect rust crawler to break a random artifact on the enemy general', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));
			UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));

			var modifiers = gameSession.getGeneralForPlayer2().getArtifactModifiers();
			expect(modifiers[0]).to.not.equal(undefined);

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.CoiledCrawler}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var modifiers = gameSession.getGeneralForPlayer2().getArtifactModifiers();
			expect(modifiers[0]).to.equal(undefined);
    });
    it('expect songweaver to give a nearby friendly minion +1/+1', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      var bluetip = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Songweaver}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(bluetip.getATK()).to.equal(4);
      expect(bluetip.getHP()).to.equal(2);
    });
    it('expect sun seer to restore 2 health to your general when it deals damage', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var sunseer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SunSeer}, 7, 2, gameSession.getPlayer1Id());

      gameSession.getGeneralForPlayer1().setDamage(5);

      sunseer.refreshExhaustion();
      var action = sunseer.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
    });
    it('expect void hunter to draw a card when dying', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var voidhunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.VoidHunter}, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      voidhunter.refreshExhaustion();
      var action = voidhunter.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var hand = player1.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });
    it('expect wind stopper to force ranged minions to attack it first', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var windstopper = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WindStopper}, 7, 2, gameSession.getPlayer2Id());
      var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 3, 2, gameSession.getPlayer1Id());

      valeHunter.refreshExhaustion();
      var action = valeHunter.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });
    it('expect frostbone naga to deal 2 damage to ALL minions and generals around it', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FrostboneNaga}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);
    });
    it('expect sand burrower to take no damage from ranged minions', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      var sandburrower = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BlackSandBurrower}, 7, 2, gameSession.getPlayer2Id());
      var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 3, 2, gameSession.getPlayer1Id());

      valeHunter.refreshExhaustion();
      var action = valeHunter.actionAttack(sandburrower);
      gameSession.executeAction(action);

      var hand = player2.getDeck().getCardsInHand();
			var cardDraw = hand[0];
			expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.BlackSandBurrower);
    });
    it('expect silhouette tracer to teleport general 3 spaces', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SilhoutteTracer}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 3, 2);
      gameSession.executeAction(followupAction);

      expect(gameSession.getGeneralForPlayer1().getPosition().x).to.equal(3);
      expect(gameSession.getGeneralForPlayer1().getPosition().y).to.equal(2);
    });
    it('expect ash mephyt to spawn 2 copies of itself on random spaces', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AshMephyt}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      var ash = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.AshMephyt);

      expect(ash[0].getId()).to.equal(SDK.Cards.Neutral.AshMephyt);
      expect(ash[1].getId()).to.equal(SDK.Cards.Neutral.AshMephyt);
      expect(ash[2].getId()).to.equal(SDK.Cards.Neutral.AshMephyt);
    });
    it('expect dancing blades to deal 3 damage to any minion in front of it', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 2, 1, gameSession.getPlayer2Id());
      var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.DancingBlades}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(3);
      expect(brightmossGolem2.getDamage()).to.equal(0);
    });
    it('expect the high hand to gain +1/+1 for each card in opponents action bar', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.TheHighHand}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.TheHighHand}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.TheHighHand}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.TheHighHand}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.TheHighHand}));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.TheHighHand}));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.TheHighHand}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      var highhand = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.TheHighHand);

      expect(highhand.getATK()).to.equal(8);
      expect(highhand.getHP()).to.equal(9);
    });
    it('expect deathblighter to deal 3 damage to all nearby enemy minions', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      var player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 1, 2, gameSession.getPlayer2Id());
      var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.DeathBlighter}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(3);
      expect(brightmossGolem2.getDamage()).to.equal(0);
    });
    it('expect first sword of akrane to give all other friendly minions +1 attack', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var bluetip = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BluetipScorpion}, 6, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FirstSwordofAkrane}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      expect(bluetip.getATK()).to.equal(4);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
    });
  });
});
