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
  describe("rares", function() {
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

    it('expect azure horn shaman to give +4 health to friendly minions on death', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var azurehorn = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.AzureHornShaman}, 7, 2, gameSession.getPlayer1Id());
      azurehorn.setDamage(3);
      azurehorn.refreshExhaustion();
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 3, gameSession.getPlayer1Id());
      var brightmossGolem2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 7, 1, gameSession.getPlayer1Id());

      var action = azurehorn.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(brightmossGolem.getHP()).to.equal(13);
      expect(brightmossGolem2.getHP()).to.equal(13);
    });
    it('expect flameblood warlock to deal 3 damage to both generals on summon', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FlamebloodWarlock}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
    });
    it('expect golem metallurgist to make the first golem played each turn cost 1 less mana', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var golem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.GolemMetallurgist}, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BrightmossGolem}));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.BrightmossGolem);
      expect(cardDraw.getManaCost()).to.equal(4);

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.BrightmossGolem}));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.BrightmossGolem);
      expect(cardDraw.getManaCost()).to.equal(5);
    });
    it('expect manaforger to make your first spell each turn cost 1 less to cast', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      var manaforger = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Manaforger}, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCostChange()).to.equal(-1);

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(2);
    });
		it('expect manaforger to swap effects when mind controlled', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();

			player1.remainingMana = 9;

			var manaforger = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Manaforger}, 7, 2, gameSession.getPlayer1Id());
			expect(manaforger.getOwnerId()).to.equal(player1.getPlayerId());

			gameSession.executeAction(gameSession.actionEndTurn());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.Enslave}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			player2.remainingMana = 9;

			var phoenixFire = player2.getDeck().getCardInHandAtIndex(1);
			expect(phoenixFire.getManaCostChange()).to.equal(0);

			var playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(phoenixFire.getManaCostChange()).to.equal(-1);
		});
    it('expect crimson oculus to gain +1/+1 whenever opponent summons a minion', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var crimsonOculus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.CrimsonOculus}, 7, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      expect(crimsonOculus.getHP()).to.equal(3);
      expect(crimsonOculus.getATK()).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FlamebloodWarlock}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.FlamebloodWarlock}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
			gameSession.executeAction(playCardFromHandAction);

      expect(crimsonOculus.getHP()).to.equal(5);
      expect(crimsonOculus.getATK()).to.equal(4);
    });
    it('expect dancing blades to kill a crimson oculus', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var crimsonOculus = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.CrimsonOculus}, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.DancingBlades}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

      expect(crimsonOculus.getIsRemoved()).to.equal(true);
    });
    it('expect crossbones to instantly kill a ranged unit (mechaz0r)', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var mechaz0r = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mechaz0r}, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Crossbones}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(mechaz0r.getIsRemoved()).to.equal(true);
    });
    it('expect crossbones cannot be cast on blast or non-ranged minions', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var pyromancer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.Pyromancer}, 2, 2, gameSession.getPlayer2Id());
      var mechaz0r = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mechaz0r}, 2, 3, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Crossbones}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(pyromancer.getIsRemoved()).to.equal(false);
    });
    it('expect prismatic illusionist to summon 2/1 illusions whenever you cast a spell', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var prismatic = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrismaticIllusionist}, 2, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

      var illusions = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.ArcaneIllusion);
      expect(illusions[0].getHP()).to.equal(1);

      expect(illusions.length).to.equal(2);
    });
    it('expect sojourner draw a card whenever it does damage', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var azurehorn = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.AzureHornShaman}, 7, 2, gameSession.getPlayer2Id());
      var shieldOracle = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Sojourner}, 6, 2, gameSession.getPlayer1Id());
      player1.remainingMana= 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));

      shieldOracle.refreshExhaustion();
      var action = shieldOracle.actionAttack(azurehorn);
      gameSession.executeAction(action);

      var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
    });
    it('expect silvertongue corsair takes no damage when a general attacks it', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var silvertongue = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SilvertongueCorsair}, 7, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      var action = gameSession.getGeneralForPlayer2().actionAttack(silvertongue);
      gameSession.executeAction(action);

      expect(silvertongue.getHP()).to.equal(3);
    });
    it('expect silvertongue corsair takes no damage when being counterattacked by a general', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var silvertongue = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SilvertongueCorsair}, 7, 2, gameSession.getPlayer1Id());
      silvertongue.refreshExhaustion();

      var action = silvertongue.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(silvertongue.getHP()).to.equal(3);
    });
    it('expect emerald rejuvenator to restore 4 health to both generals', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana= 9;
      gameSession.getGeneralForPlayer1().setDamage(5);
      gameSession.getGeneralForPlayer2().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.EmeraldRejuvenator}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(24);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
    });
    it('expect lightbender to dispel all tiles around it including mana tiles', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var azurehorn = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.AzureHornShaman}, 7, 2, gameSession.getPlayer1Id());
      player1.remainingMana= 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Lightbender}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(azurehorn.getIsSilenced()).to.equal(true);
    });
    it('expect mindwarper to gain a copy of a random spell from opponents action bar', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      player1.remainingMana= 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mindwarper}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });
    it('expect owlbeast sage to grant only arcanyst minions +2 health on every spell cast', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var owlbeast = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.OwlbeastSage}, 2, 2, gameSession.getPlayer1Id());
      var manaforger = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Manaforger}, 3, 2, gameSession.getPlayer1Id());
      var aethermaster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Aethermaster}, 4, 2, gameSession.getPlayer1Id());
      var brightmossGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.BrightmossGolem}, 5, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);

      expect(owlbeast.getHP()).to.equal(8);
      expect(manaforger.getHP()).to.equal(7);
      expect(aethermaster.getHP()).to.equal(7);
      expect(brightmossGolem.getHP()).to.equal(9);
    });
  });
});
