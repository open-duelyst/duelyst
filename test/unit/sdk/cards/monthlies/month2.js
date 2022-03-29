var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var MODCELERITY = require('app/sdk/modifiers/modifierTranscendance')
var MODFORCEFIELD = require('app/sdk/modifiers/modifierForcefield')

// disable the logger for cleaner test output
Logger.enabled = false;

describe("monthlies", function() {
  describe("month 2", function() {
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

    it('expect grailmaster to gain a random faction keyword when summoning a minion', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      var grailmaster = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Grailmaster}, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 6, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));
      var action = player1.actionPlayCardFromHand(0, 7, 1);
      gameSession.executeAction(action);

      expect(grailmaster.isRanged()).to.equal(true);
      expect(grailmaster.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(grailmaster.hasModifierClass(SDK.ModifierFrenzy)).to.equal(true);
      expect(grailmaster.hasModifierClass(MODCELERITY)).to.equal(true);
      expect(grailmaster.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
//      expect(grailmaster.hasModifierClass(MODFORCEFIELD)).to.equal(true);
    });
    it('expect firestarter to summon 1/1 spellspark on spell cast', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var firestarter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Firestarter}, 2, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      var spellsparks = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.Spellspark);
      expect(spellsparks[0].getHP()).to.equal(1);

      expect(spellsparks.length).to.equal(2);
    });
    it('expect khymera to summon a token minion when taking damage', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var khymera = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Khymera}, 0, 0, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 0);
      gameSession.executeAction(playCardFromHandAction);

      var token1 = board.getUnitAtPosition({x:1, y: 0});
      var token2 = board.getUnitAtPosition({x:1, y: 1});
      var token3 = board.getUnitAtPosition({x:0, y: 1});

      var token1check = false;
      var token2check = false;
      var token3check = false;
      if(token1.getId() === SDK.Cards.Faction5.MiniMagmar || token1.getId() === SDK.Cards.Neutral.MiniJax || token1.getId() === SDK.Cards.Faction6.Treant || token1.getId() === SDK.Cards.Faction6.GhostWolf ||
      token1.getId() === SDK.Cards.Faction6.AzureDrake || token1.getId() === SDK.Cards.Neutral.ArcaneIllusion || token1.getId() === SDK.Cards.Faction6.WaterBear || token1.getId() === SDK.Cards.Faction4.Wraithling ||
      token1.getId() === SDK.Cards.Faction2.OnyxBear || token1.getId() === SDK.Cards.Neutral.Mechaz0r || token1.getId() === SDK.Cards.Faction6.SeismicElemental ||
      token1.getId() === SDK.Cards.Faction6.IceDrake || token1.getId() === SDK.Cards.Neutral.Spellspark){
        token1check = true;
      }
      if(token2.getId() === SDK.Cards.Faction5.MiniMagmar || token2.getId() === SDK.Cards.Neutral.MiniJax || token2.getId() === SDK.Cards.Faction6.Treant || token2.getId() === SDK.Cards.Faction6.GhostWolf ||
      token2.getId() === SDK.Cards.Faction6.AzureDrake || token2.getId() === SDK.Cards.Neutral.ArcaneIllusion || token2.getId() === SDK.Cards.Faction6.WaterBear || token2.getId() === SDK.Cards.Faction4.Wraithling ||
      token2.getId() === SDK.Cards.Faction2.OnyxBear || token2.getId() === SDK.Cards.Neutral.Mechaz0r || token2.getId() === SDK.Cards.Faction6.SeismicElemental ||
      token2.getId() === SDK.Cards.Faction6.IceDrake || token2.getId() === SDK.Cards.Neutral.Spellspark){
        token2check = true;
      }
      if(token3.getId() === SDK.Cards.Faction5.MiniMagmar || token3.getId() === SDK.Cards.Neutral.MiniJax || token3.getId() === SDK.Cards.Faction6.Treant || token3.getId() === SDK.Cards.Faction6.GhostWolf ||
      token3.getId() === SDK.Cards.Faction6.AzureDrake || token3.getId() === SDK.Cards.Neutral.ArcaneIllusion || token3.getId() === SDK.Cards.Faction6.WaterBear || token3.getId() === SDK.Cards.Faction4.Wraithling ||
      token3.getId() === SDK.Cards.Faction2.OnyxBear || token3.getId() === SDK.Cards.Neutral.Mechaz0r || token3.getId() === SDK.Cards.Faction6.SeismicElemental ||
      token3.getId() === SDK.Cards.Faction6.IceDrake || token3.getId() === SDK.Cards.Neutral.Spellspark){
        token3check = true;
      }
      expect(token1check).to.equal(true);
      expect(token2check).to.equal(true);
      expect(token3check).to.equal(true);
    });
    it('expect jaxi to leave behind a 1/1 mini-jax in a corner upon death', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var jaxi = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Jaxi}, 2, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      var minijax = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.MiniJax);

      expect(minijax.getATK()).to.equal(1);
      expect(minijax.getHP()).to.equal(1);
      expect(minijax.isRanged()).to.equal(true);
    });
  });
});
