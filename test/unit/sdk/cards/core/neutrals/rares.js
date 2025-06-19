const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('core set', () => {
  describe('rares', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect azure horn shaman to give +4 health to friendly minions on death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const azurehorn = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.AzureHornShaman }, 7, 2, gameSession.getPlayer1Id());
      azurehorn.setDamage(3);
      azurehorn.refreshExhaustion();
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 3, gameSession.getPlayer1Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 1, gameSession.getPlayer1Id());

      const action = azurehorn.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(brightmossGolem.getHP()).to.equal(13);
      expect(brightmossGolem2.getHP()).to.equal(13);
    });

    it('expect flameblood warlock to deal 3 damage to both generals on summon', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.FlamebloodWarlock }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(3);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
    });

    it('expect golem metallurgist to make the first golem played each turn cost 1 less mana', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GolemMetallurgist }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.BrightmossGolem }));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.BrightmossGolem);
      expect(cardDraw.getManaCost()).to.equal(4);

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.BrightmossGolem }));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.BrightmossGolem);
      expect(cardDraw.getManaCost()).to.equal(5);
    });

    it('expect manaforger to make your first spell each turn cost 1 less to cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const manaforger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Manaforger }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCostChange()).to.equal(-1);

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(2);
    });

    it('expect manaforger to swap effects when mind controlled', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const manaforger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Manaforger }, 7, 2, gameSession.getPlayer1Id());
      expect(manaforger.getOwnerId()).to.equal(player1.getPlayerId());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Enslave }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      player2.remainingMana = 9;

      const phoenixFire = player2.getDeck().getCardInHandAtIndex(1);
      expect(phoenixFire.getManaCostChange()).to.equal(0);

      const playCardFromHandAction = player2.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(phoenixFire.getManaCostChange()).to.equal(-1);
    });

    it('expect crimson oculus to gain +1/+1 whenever opponent summons a minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const crimsonOculus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.CrimsonOculus }, 7, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      expect(crimsonOculus.getHP()).to.equal(3);
      expect(crimsonOculus.getATK()).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.FlamebloodWarlock }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.FlamebloodWarlock }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(crimsonOculus.getHP()).to.equal(5);
      expect(crimsonOculus.getATK()).to.equal(4);
    });

    it('expect dancing blades to kill a crimson oculus', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const crimsonOculus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.CrimsonOculus }, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.DancingBlades }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(crimsonOculus.getIsRemoved()).to.equal(true);
    });

    it('expect crossbones to instantly kill a ranged unit (mechaz0r)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const mechaz0r = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Mechaz0r }, 2, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Crossbones }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(mechaz0r.getIsRemoved()).to.equal(true);
    });

    it('expect crossbones cannot be cast on blast or non-ranged minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const pyromancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.Pyromancer }, 2, 2, gameSession.getPlayer2Id());
      const mechaz0r = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Mechaz0r }, 2, 3, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Crossbones }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(pyromancer.getIsRemoved()).to.equal(false);
    });

    it('expect prismatic illusionist to summon 2/1 illusions whenever you cast a spell', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const prismatic = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PrismaticIllusionist }, 2, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const illusions = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.ArcaneIllusion);
      expect(illusions[0].getHP()).to.equal(1);

      expect(illusions.length).to.equal(2);
    });

    it('expect sojourner draw a card whenever it does damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const azurehorn = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.AzureHornShaman }, 7, 2, gameSession.getPlayer2Id());
      const shieldOracle = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Sojourner }, 6, 2, gameSession.getPlayer1Id());
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));

      shieldOracle.refreshExhaustion();
      const action = shieldOracle.actionAttack(azurehorn);
      gameSession.executeAction(action);

      const hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
    });

    it('expect silvertongue corsair takes no damage when a general attacks it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silvertongue = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SilvertongueCorsair }, 7, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      const action = gameSession.getGeneralForPlayer2().actionAttack(silvertongue);
      gameSession.executeAction(action);

      expect(silvertongue.getHP()).to.equal(3);
    });

    it('expect silvertongue corsair takes no damage when being counterattacked by a general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silvertongue = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SilvertongueCorsair }, 7, 2, gameSession.getPlayer1Id());
      silvertongue.refreshExhaustion();

      const action = silvertongue.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(silvertongue.getHP()).to.equal(3);
    });

    it('expect emerald rejuvenator to restore 4 health to both generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(5);
      gameSession.getGeneralForPlayer2().setDamage(5);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EmeraldRejuvenator }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(24);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
    });

    it('expect lightbender to dispel all tiles around it including mana tiles', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const azurehorn = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.AzureHornShaman }, 7, 2, gameSession.getPlayer1Id());
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Lightbender }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(azurehorn.getIsSilenced()).to.equal(true);
    });

    it('expect mindwarper to gain a copy of a random spell from opponents action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mindwarper }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect owlbeast sage to grant only arcanyst minions +2 health on every spell cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const owlbeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.OwlbeastSage }, 2, 2, gameSession.getPlayer1Id());
      const manaforger = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Manaforger }, 3, 2, gameSession.getPlayer1Id());
      const aethermaster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Aethermaster }, 4, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(owlbeast.getHP()).to.equal(8);
      expect(manaforger.getHP()).to.equal(7);
      expect(aethermaster.getHP()).to.equal(7);
      expect(brightmossGolem.getHP()).to.equal(9);
    });
  });
});
