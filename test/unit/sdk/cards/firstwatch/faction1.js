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

// disable the logger for cleaner test output
Logger.enabled = false;

describe('firstwatch', () => {
  describe('faction1', () => {
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

    it('expect sunrise cleric to make Hallowed Ground', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SunriseCleric }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      const hallowedGround1 = board.getTileAtPosition({ x: 0, y: 0 }, true);

      expect(hallowedGround1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround1.getId()).to.equal(SDK.Cards.Tile.Hallowed);
    });

    it('expect Hallowed Ground to heal friendly minions and generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(5);

      // check for General
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SunriseCleric }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 0, 2);
      gameSession.executeAction(followupAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(21);

      // check for minion
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 2, gameSession.getPlayer1Id());

      expect(silverguardSquire.getHP()).to.equal(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SunriseCleric }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      var followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(silverguardSquire.getHP()).to.equal(2);
    });

    it('expect pureblade enforcer gets +1/+1 when a spell is played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const purebladeEnforcer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.PurebladeEnforcer }, 7, 2, gameSession.getPlayer1Id());

      expect(purebladeEnforcer.getHP()).to.equal(3);
      expect(purebladeEnforcer.getATK()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      gameSession.executeAction(gameSession.actionEndTurn());

      const playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(purebladeEnforcer.getHP()).to.equal(4);
      expect(purebladeEnforcer.getATK()).to.equal(2);
    });

    it('expect sanctify to give +1/+1 and make Hallowed Ground', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      expect(silverguardSquire.getHP()).to.equal(4);
      expect(silverguardSquire.getATK()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Sanctify }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(5);
      expect(silverguardSquire.getATK()).to.equal(2);

      const hallowedGround1 = board.getTileAtPosition({ x: 1, y: 1 }, true);

      expect(hallowedGround1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround1.getId()).to.equal(SDK.Cards.Tile.Hallowed);
    });

    it('expect channeled breath to heal the General 2 per friendly minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(20);

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const silverguardSquire3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 3, gameSession.getPlayer1Id());
      const evilSilverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 7, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ChanneledBreath }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(11);
    });

    it('expect solpiercer to be ranged only when zeal is active', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const solpiercer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Solpiercer }, 2, 2, gameSession.getPlayer1Id());
      expect(solpiercer.isRanged()).to.equal(false);

      solpiercer.refreshExhaustion();
      const action = solpiercer.actionMove({ x: 1, y: 1 });
      gameSession.executeAction(action);
      expect(solpiercer.isRanged()).to.equal(true);
    });

    it('expect war judicator to protect nearby friendly minions from being targetted by spells', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const warJudicator = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.WarJudicator }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(playCardFromHandAction.getIsValid()).to.equal(false);
      expect(silverguardSquire.getHP()).to.equal(4);

      gameSession.executeAction(gameSession.actionEndTurn());
      silverguardSquire.refreshExhaustion();
      const action = silverguardSquire.actionMove({ x: 3, y: 1 });
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(1);
    });

    it('expect fortified assault to create a tile and damage enemy minions based on number of tiles', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const golem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 2, gameSession.getPlayer2Id());
      const golem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 5, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FortifiedAssault }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(golem.getDamage()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FortifiedAssault }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 3);
      gameSession.executeAction(playCardFromHandAction);

      expect(golem2.getDamage()).to.equal(2);

      const hallowedGround1 = board.getTileAtPosition({ x: 5, y: 2 }, true);
      const hallowedGround2 = board.getTileAtPosition({ x: 5, y: 3 }, true);

      expect(hallowedGround1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround1.getId()).to.equal(SDK.Cards.Tile.Hallowed);
      expect(hallowedGround2.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround2.getId()).to.equal(SDK.Cards.Tile.Hallowed);
    });

    it('expect empyreal congregation to give minions +2/+2 in a 2x2 area', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      // make four squires, 3 in the 2x2 and 1 outside of it.
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const silverguardSquire3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 2, gameSession.getPlayer1Id());
      const silverguardSquire4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 3, gameSession.getPlayer1Id());

      expect(silverguardSquire.getHP()).to.equal(4);
      expect(silverguardSquire.getATK()).to.equal(1);
      expect(silverguardSquire2.getHP()).to.equal(4);
      expect(silverguardSquire2.getATK()).to.equal(1);
      expect(silverguardSquire3.getHP()).to.equal(4);
      expect(silverguardSquire3.getATK()).to.equal(1);
      expect(silverguardSquire4.getHP()).to.equal(4);
      expect(silverguardSquire4.getATK()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Congregation }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(silverguardSquire.getHP()).to.equal(6);
      expect(silverguardSquire.getATK()).to.equal(3);
      expect(silverguardSquire2.getHP()).to.equal(6);
      expect(silverguardSquire2.getATK()).to.equal(3);
      expect(silverguardSquire3.getHP()).to.equal(6);
      expect(silverguardSquire3.getATK()).to.equal(3);
      expect(silverguardSquire4.getHP()).to.equal(4);
      expect(silverguardSquire4.getATK()).to.equal(1);
    });

    it('expect auroara to only gain attack when a minion with 2 or less attack is played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const auroara = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Auroara }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HailstoneGolem }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(auroara.getATK()).to.equal(3);
    });

    it('expect vale ascension to bring back a minion on a HallowedGround tile', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SunriseCleric }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 0);
      gameSession.executeAction(followupAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ValeAscension }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      const newVH = board.getUnitAtPosition({ x: 0, y: 0 });

      expect(newVH.getId()).to.equal(SDK.Cards.Faction1.SunriseCleric);
    });

    it('expect halo bulwark to give forcefield to nearby minions only', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.HaloBulwark }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      expect(silverguardSquire.hasActiveModifierClass(ModifierForcefield)).to.equal(true);

      silverguardSquire.refreshExhaustion();
      const action = silverguardSquire.actionMove({ x: 3, y: 1 });
      gameSession.executeAction(action);
      expect(silverguardSquire.hasActiveModifierClass(ModifierForcefield)).to.equal(false);
    });

    it('expect aperions claim to destroy allies and enemies in the area, and create Hallowed Ground if it does', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      const evilSilverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 2, gameSession.getPlayer2Id());
      const silverguardSquire4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 3, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AperionsClaim }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(silverguardSquire.getIsRemoved()).to.equal(true);
      expect(silverguardSquire2.getIsRemoved()).to.equal(true);
      expect(evilSilverguardSquire.getIsRemoved()).to.equal(true);
      expect(silverguardSquire4.getIsRemoved()).to.equal(false);

      const hallowedGround1 = board.getTileAtPosition({ x: 1, y: 1 }, true);
      const hallowedGround2 = board.getTileAtPosition({ x: 1, y: 2 }, true);
      const hallowedGround3 = board.getTileAtPosition({ x: 2, y: 2 }, true);
      const hallowedGround4 = board.getTileAtPosition({ x: 2, y: 3 }, false);

      expect(hallowedGround1.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround1.getId()).to.equal(SDK.Cards.Tile.Hallowed);
      expect(hallowedGround2.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround2.getId()).to.equal(SDK.Cards.Tile.Hallowed);
      expect(hallowedGround3.getOwnerId()).to.equal(player1.getPlayerId());
      expect(hallowedGround3.getId()).to.equal(SDK.Cards.Tile.Hallowed);
    });

    it('expect alabaster titan to do nothing if you have a spell in your deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.AlabasterTitan }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(modifiers[0]).to.equal(undefined);
    });

    it('expect alabaster titan to award artifacts if your deck has no spells', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.AlabasterTitan }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(gameSession.getGeneralForPlayer1().getArtifactModifiersGroupedByArtifactCard().length).to.equal(3);
    });
  });
});
