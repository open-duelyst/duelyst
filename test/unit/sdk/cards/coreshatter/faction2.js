const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');
const ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');
const ModifierCelerity = require('app/sdk/modifiers/modifierTranscendance');
const Factions = require('app/sdk/cards/factionsLookup');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('coreshatter', () => {
  describe('faction2', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect panda puncher to give consecutively more +2 attack to a random nearby friendly minion until end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.PandaPuncher }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getATK()).to.equal(3);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(silverguardSquire.getATK()).to.equal(1);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.PandaPuncher }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getATK()).to.equal(5);
    });

    it('expect kindle to give consecutively more damage to an enemy each time its played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Kindle }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(ironcliffe.getDamage()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Kindle }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(ironcliffe.getDamage()).to.equal(3);
    });

    it('expect greater phoenix fire to deal 3 damage to an enemy general or minion and put a phoenix fire in your hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GreaterPhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(22);

      expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect shadow summoner to summon a 2 cost or less minion with backstab from your deck nearby whenever it backstabs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());
      const shadowSummoner = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.ShadowSummoner }, 3, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Heartseeker }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KaidoAssassin }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.GrandmasterZendo }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ScarletViper }));

      shadowSummoner.refreshExhaustion();
      const action = shadowSummoner.actionAttack(ironcliffe);
      gameSession.executeAction(action);

      const nearbyAllies = board.getFriendlyEntitiesAroundEntity(shadowSummoner);
      expect(nearbyAllies.length).to.equal(1);

      expect(nearbyAllies[0].getId()).to.equal(SDK.Cards.Faction2.KaidoAssassin);
    });

    it('expect deja vu to shuffle 5 copies of the last spell you played into your deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GreaterPhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DejaVu }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const deck = player1.getDeck().getCardsInDrawPile();

      expect(deck[0].getId()).to.equal(SDK.Cards.Spell.GreaterPhoenixFire);
      expect(deck[1].getId()).to.equal(SDK.Cards.Spell.GreaterPhoenixFire);
      expect(deck[2].getId()).to.equal(SDK.Cards.Spell.GreaterPhoenixFire);
      expect(deck[3].getId()).to.equal(SDK.Cards.Spell.GreaterPhoenixFire);
      expect(deck[4].getId()).to.equal(SDK.Cards.Spell.GreaterPhoenixFire);
      expect(deck.length).to.equal(5);
    });

    it('expect booty projection to put an exact copy of a friendly minion into your action bar with buffs but without damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 2, 2, gameSession.getPlayer1Id());
      ironcliffe.setDamage(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.KillingEdge }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(ironcliffe.getATK()).to.equal(7);
      expect(ironcliffe.getHP()).to.equal(8);
      expect(ironcliffe.getDamage()).to.equal(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BootyProjection }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const newIroncliffe = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(newIroncliffe.getATK()).to.equal(7);
      expect(newIroncliffe.getHP()).to.equal(12);
      expect(newIroncliffe.getDamage()).to.equal(0);
    });

    it('expect paper dropper to draw a card every time it moves for any reason', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const paper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.MoveMan }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.SpectralRevenant }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.SpectralRevenant }));

      paper.refreshExhaustion();
      const action = paper.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.GhostLynx }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(1, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Faction4.SpectralRevenant);
      expect(hand[2]).to.equal(undefined);
    });

    it('expect panda jail to surround the enemy general with panddos that vanish on your next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PandaJail }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      let nearbyPanddo = board.getEnemyEntitiesAroundEntity(gameSession.getGeneralForPlayer2());
      expect(nearbyPanddo.length).to.equal(5);
      expect(nearbyPanddo[0].getId()).to.equal(SDK.Cards.Faction2.OnyxBear);
      expect(nearbyPanddo[1].getId()).to.equal(SDK.Cards.Faction2.OnyxBear);
      expect(nearbyPanddo[2].getId()).to.equal(SDK.Cards.Faction2.OnyxBear);
      expect(nearbyPanddo[3].getId()).to.equal(SDK.Cards.Faction2.OnyxBear);
      expect(nearbyPanddo[4].getId()).to.equal(SDK.Cards.Faction2.OnyxBear);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      nearbyPanddo = board.getEnemyEntitiesAroundEntity(gameSession.getGeneralForPlayer2());
      expect(nearbyPanddo.length).to.equal(0);
    });

    it('expect gorehorn mask to give friendly backstab minions +1/+1 after they attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.BackstabGloves }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());
      const shadowSummoner = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.ShadowSummoner }, 3, 2, gameSession.getPlayer1Id());

      shadowSummoner.refreshExhaustion();
      const action = shadowSummoner.actionAttack(ironcliffe);
      gameSession.executeAction(action);

      expect(shadowSummoner.getHP()).to.equal(3);
      expect(shadowSummoner.getATK()).to.equal(3);
    });

    it('expect massacre artist to give all minions backstab after it backstabs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.BackstabGloves }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());
      const massacre = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Backbreaker }, 3, 2, gameSession.getPlayer1Id());
      const squire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());

      massacre.refreshExhaustion();
      squire.refreshExhaustion();
      var action = massacre.actionAttack(golem);
      gameSession.executeAction(action);

      var action = squire.actionAttack(golem);
      gameSession.executeAction(action);

      expect(squire.getDamage()).to.equal(0);
      expect(golem.getDamage()).to.equal(5);
    });

    it('expect flare slinger to give rush to your newly summoned ranged minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const flaresling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Flareslinger }, 3, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.Heartseeker }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KaidoAssassin }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());

      const heartseeker = board.getUnitAtPosition({ x: 0, y: 1 });
      const kaido = board.getUnitAtPosition({ x: 1, y: 1 });

      var action = heartseeker.actionAttack(golem);
      expect(action.getIsValid()).to.equal(true);
      gameSession.executeAction(action);

      var action = kaido.actionAttack(golem);
      gameSession.executeAction(action);

      expect(golem.getDamage()).to.equal(1);
    });

    it('expect hollow vortex to lower mana cost every time you cast a spell and then to summon a neutral minion that costs up to 2 more', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.HollowVortex }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(player1.getDeck().getCardInHandAtIndex(0).getManaCost()).to.equal(6);

      player1.remainingMana = 9;

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const nearbyAllies = board.getFriendlyEntitiesAroundEntity(gameSession.getGeneralForPlayer1());
      expect(nearbyAllies[0].getManaCost()).to.equal(4);
    });

    it('expect dark heart of the songhai to ping a random enemy for damage equal to your summoned minions mana cost after you summon 7 minions with different costs from your action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 4, gameSession.getPlayer2Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 4, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.DarkHeart }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardKnight }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.LysianBrawler }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.IroncliffeGuardian }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.ElyxStormblade }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(playCardFromHandAction);
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.GrandmasterZir }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;
      var playCardFromHandAction = player1.actionPlayCardFromHand(1, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.WindbladeAdept }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      let totalDamage = golem.getDamage() + golem2.getDamage() + gameSession.getGeneralForPlayer2().getDamage();

      expect(totalDamage).to.equal(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardKnight }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
      gameSession.executeAction(playCardFromHandAction);

      totalDamage = golem.getDamage() + golem2.getDamage() + gameSession.getGeneralForPlayer2().getDamage();
      expect(totalDamage).to.equal(5);
    });
  });
});
