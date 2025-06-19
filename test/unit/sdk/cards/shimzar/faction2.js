const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('shimzar', () => {
  describe('faction2', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    /* Test disabled: slow
    it('expect xho to add 1 random songhai spell to your hand when killed', function() {
      for(var i = 0; i < 100; i++){
        var player1Deck = [
          {id: SDK.Cards.Faction2.General}
        ];

        var player2Deck = [
          {id: SDK.Cards.Faction3.General}
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        var gameSession = SDK.GameSession.getInstance();
        var board = gameSession.getBoard();
        var player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.Xho}));
        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);
        var playCardFromHandAction = player1.actionPlayCardFromHand(1, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        var hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction2);
        expect(hand[0].getType()).to.equal(SDK.CardType.Spell);

        SDK.GameSession.reset();
      }
    });
    */

    /* Test disabled: failing
    it('expect xho to add 1 random songhai spell to your hand when killed due to crimson coil activation', function() {
      for(var i = 0; i < 100; i++){
        var player1Deck = [
          {id: SDK.Cards.Faction2.General}
        ];

        var player2Deck = [
          {id: SDK.Cards.Faction3.General}
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        var gameSession = SDK.GameSession.getInstance();
        var board = gameSession.getBoard();
        var player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.Xho}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, gameSession.getPlayer2Id(), 2, 1, {id: SDK.Cards.Neutral.PlanarScout}));

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.CrimsonCoil}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        var hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction2);
        expect(hand[0].getType()).to.equal(SDK.CardType.Spell);

        SDK.GameSession.reset();
      }
    });
    */

    /* Test disabled: failing
    it('expect xho to add 1 random songhai spell to your hand when killed due to sol activation', function() {
      for(var i = 0; i < 100; i++){
        var player1Deck = [
          {id: SDK.Cards.Faction2.General}
        ];

        var player2Deck = [
          {id: SDK.Cards.Faction3.General}
        ];

        // setup test session
        UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

        var gameSession = SDK.GameSession.getInstance();
        var board = gameSession.getBoard();
        var player1 = gameSession.getPlayer1();
        player1.remainingMana = 9;

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction2.Xho}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
        gameSession.executeAction(playCardFromHandAction);

        var unit = board.getUnitAtPosition({x: 1, y: 1});
        unit.setDamage(1);

        UtilsSDK.executeActionWithoutValidation(new SDK.ApplyCardToBoardAction(gameSession, gameSession.getPlayer2Id(), 2, 1, {id: SDK.Cards.Neutral.PlanarScout}));

        UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Sol}));
        var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
        gameSession.executeAction(playCardFromHandAction);
        var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
        var followupAction = player1.actionPlayFollowup(followupCard, 1, 1);
        gameSession.executeAction(followupAction);

        var hand = player1.getDeck().getCardsInHand();
        expect(hand[0]).to.exist;
        expect(hand[0].getFactionId()).to.equal(SDK.Factions.Faction2);
        expect(hand[0].getType()).to.equal(SDK.CardType.Spell);

        SDK.GameSession.reset();
      }
    });
    */

    it('expect crimson coil to deal to damage to a minion and activate your battle pets', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const xho1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Xho }, 5, 4, gameSession.getPlayer1Id());
      const xho2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Xho }, 5, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 0, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CrimsonCoil }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(2);

      expect(xho1.getPosition().x !== 5 || xho1.getPosition().y !== 4).to.equal(true);
      expect(xho2.getPosition().x !== 5 || xho2.getPosition().y !== 1).to.equal(true);
    });

    it('expect shadow waltz to lower the cost of all minions with backstab in your action bar by 1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowWaltz }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Katara }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ScarletViper }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KaidoAssassin }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCost()).to.equal(0);
      expect(hand[2].getManaCost()).to.equal(4);
      expect(hand[3].getManaCost()).to.equal(1);
    });

    it('expect shadow waltz to give all minions with backstab in your action bar +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ShadowWaltz }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Katara }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ScarletViper }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KaidoAssassin }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getATK()).to.equal(2);
      expect(hand[1].getHP()).to.equal(4);
      expect(hand[2].getATK()).to.equal(3);
      expect(hand[2].getHP()).to.equal(6);
      expect(hand[3].getATK()).to.equal(3);
      expect(hand[3].getHP()).to.equal(4);
    });

    it('expect ki beholder to make a minion unable to move next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 3, gameSession.getPlayer2Id());
      const golemPositionX = brightmossGolem.getPosition().x;
      const golemPositionY = brightmossGolem.getPosition().y;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KiBeholder }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 4, 3);
      gameSession.executeAction(followupAction);

      gameSession.executeAction(gameSession.actionEndTurn());

      const action = brightmossGolem.actionMove({ x: 6, y: 3 });
      gameSession.executeAction(action);

      expect(action.getIsValid()).to.equal(false);
      expect(golemPositionX).to.equal(brightmossGolem.getPosition().x);
      expect(golemPositionY).to.equal(brightmossGolem.getPosition().y);
    });

    it('expect mirror meld to copy a friendly minion of cost 2 or lower', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const chakriAvatar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.ChakriAvatar }, 3, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(chakriAvatar.getHP()).to.equal(3);
      expect(chakriAvatar.getATK()).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MirrorMeld }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 3);
      gameSession.executeAction(playCardFromHandAction);

      const clone = board.getFriendlyEntitiesAroundEntity(chakriAvatar);

      expect(clone[0].getHP()).to.equal(4);
      expect(clone[0].getATK()).to.equal(3);
    });

    it('expect mirror melded clone on a buffed + damaged unit to not instantly die when summoned', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const chakriAvatar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.ChakriAvatar }, 3, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SaberspineSeal }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 3);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(chakriAvatar.getHP()).to.equal(1);
      expect(chakriAvatar.getATK()).to.equal(6);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MirrorMeld }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 3);
      gameSession.executeAction(playCardFromHandAction);

      const clone = board.getFriendlyEntitiesAroundEntity(chakriAvatar);

      expect(clone[0].getHP()).to.equal(2);
      expect(clone[0].getATK()).to.equal(7);
    });

    it('expect battle panddo to deal 1 damage to all enemy minions and generals upon taking damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const shiro = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Shiro }, 1, 2, gameSession.getPlayer2Id());
      const panddo = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.BattlePanddo }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(shiro.getDamage()).to.equal(1);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(1);
    });

    it('expect onyx jaguar to give friendly minions +1/+1 who move naturally', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const onyxJaguar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.OnyxJaguar }, 4, 4, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 3, gameSession.getPlayer1Id());
      brightmossGolem.refreshExhaustion();

      const action = brightmossGolem.actionMove({ x: 6, y: 3 });
      gameSession.executeAction(action);

      expect(brightmossGolem.getATK()).to.equal(5);
      expect(brightmossGolem.getHP()).to.equal(10);
    });

    it('expect onyx jaguar to give friendly minions +1/+1 who are moved through spells', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const onyxJaguar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.OnyxJaguar }, 4, 4, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MistDragonSeal }));
      const action = player1.actionPlayCardFromHand(0, 4, 3);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);

      expect(brightmossGolem.getATK()).to.equal(6);
      expect(brightmossGolem.getHP()).to.equal(11);
    });

    it('expect pandamonium to turn all minions into 0/2 Panddos until end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      var kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      var kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Pandamonium }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      var panddo = board.getUnitAtPosition({ x: 5, y: 1 });
      var panddo2 = board.getUnitAtPosition({ x: 3, y: 1 });

      expect(panddo.getATK()).to.equal(0);
      expect(panddo.getHP()).to.equal(2);
      expect(panddo2.getATK()).to.equal(0);
      expect(panddo2.getHP()).to.equal(2);

      gameSession.executeAction(gameSession.actionEndTurn());

      var panddo = board.getUnitAtPosition({ x: 5, y: 1 });
      var panddo2 = board.getUnitAtPosition({ x: 3, y: 1 });
      expect(panddo.getATK()).to.equal(2);
      expect(panddo.getHP()).to.equal(3);
      expect(panddo2.getATK()).to.equal(2);
      expect(panddo2.getHP()).to.equal(3);
    });

    it('expect crescent spear to grant +1 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.CrescentSpear }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
    });

    it('expect crescent spear to grant +1 spell damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.CrescentSpear }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });

    it('expect koan of horns to transform all minions in your action bar into 0 mana gorehorns', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.KoanOfHorns }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCost()).to.equal(0);
      expect(hand[2].getManaCost()).to.equal(0);
      expect(hand[0].getManaCost()).to.equal(0);
      expect(hand[1].getId()).to.equal(SDK.Cards.Faction2.GoreHorn);
      expect(hand[2].getId()).to.equal(SDK.Cards.Faction2.GoreHorn);
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction2.GoreHorn);
    });

    it('expect koan of horns to transform all minions in your deck into 0 mana gorehorns and to draw 3 cards', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.KoanOfHorns }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[1].getManaCost()).to.equal(0);
      expect(hand[2].getManaCost()).to.equal(0);
      expect(hand[0].getManaCost()).to.equal(0);
      expect(hand[1].getId()).to.equal(SDK.Cards.Faction2.GoreHorn);
      expect(hand[2].getId()).to.equal(SDK.Cards.Faction2.GoreHorn);
      expect(hand[0].getId()).to.equal(SDK.Cards.Faction2.GoreHorn);
    });

    it('expect grandmaster zendo to make enemy general act like a battle pet', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const zendo = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.GrandmasterZendo }, 5, 4, gameSession.getPlayer1Id());

      expect(gameSession.getGeneralForPlayer2().getPosition().x == 8 || gameSession.getGeneralForPlayer2().getPosition().y == 2).to.equal(true);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer2().getPosition().x !== 8 || gameSession.getGeneralForPlayer2().getPosition().y !== 2).to.equal(true);
    });
  });
});
