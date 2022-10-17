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

describe('unity', () => {
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

    it('expect warblade to give +1/+1 to other friendly minions if you have another golem', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;
      // make squire, then warblade (won't work)
      const silverguardSquire1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.Warblade }));
      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction1);
      expect(silverguardSquire1.getHP()).to.equal(4);
      expect(board.getUnitAtPosition({ x: 1, y: 2 }).getHP()).to.equal(4);
      expect(board.getUnitAtPosition({ x: 1, y: 2 }).getATK()).to.equal(1);

      // make second warblade, check everything
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.Warblade }));
      const playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction2);
      expect(silverguardSquire1.getHP()).to.equal(5);
      expect(board.getUnitAtPosition({ x: 1, y: 2 }).getHP()).to.equal(5);
      expect(board.getUnitAtPosition({ x: 1, y: 2 }).getATK()).to.equal(2);
      expect(board.getUnitAtPosition({ x: 2, y: 1 }).getHP()).to.equal(4);
      expect(board.getUnitAtPosition({ x: 2, y: 1 }).getATK()).to.equal(1);
    });

    it('expect tough as nails to double a minions health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;
      // make squires, tempest the first one, then double both their Health
      const silverguardSquire1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LifeCoil }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LifeCoil }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 2));
      // check if it worked
      expect(silverguardSquire1.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
      expect(silverguardSquire1.getHP()).to.equal(4);
      expect(silverguardSquire2.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
      expect(silverguardSquire2.getHP()).to.equal(8);
    });

    it('expect gold vitriol to deal 2 damage when a heal occurs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      // Tempest, give them a brightmoss golem
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      // now get the artifact and heal both players once each
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.GoldVitriol }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.EmeraldRejuvenator }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);
      // check the damage
      const totalDamage = brightmossGolem.getDamage() + gameSession.getGeneralForPlayer2().getDamage();
      expect(totalDamage).to.equal(4);
    });

    it('expect sol pontiff to give +2 attack to golems only if zeal is active', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;
      // check that buff works near general
      const warblade = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.Warblade }, 0, 0, gameSession.getPlayer1Id());
      const solPontiff = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SolPontiff }, 0, 1, gameSession.getPlayer1Id());
      expect(warblade.getATK()).to.equal(3);
      expect(solPontiff.getATK()).to.equal(3);
      // check that buff doesn't with zeal turned off
      solPontiff.refreshExhaustion();
      const action = solPontiff.actionMove({ x: 2, y: 1 });
      gameSession.executeAction(action);
      expect(warblade.getATK()).to.equal(1);
      expect(solPontiff.getATK()).to.equal(1);
    });
  });
});
