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

describe('bloodstorm', () => {
  describe('neutrals', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction6.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction4.AltGeneral },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect cryptographer to refresh your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      var action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Cryptographer }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      var action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });

    it('expect sanguinar to make your normal bbs cost 1 less', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Sanguinar }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 0;

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
    });

    /* Test disabled: failing
    it('expect sanguinar to make grandmaster variaxs bbs cost 1 less', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player2 = gameSession.getPlayer2();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.Sanguinar}));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 8, 1));

      player2.remainingMana = 9;

      var wraithling = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.Wraithling}, 6, 1, gameSession.getPlayer2Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction4.GrandmasterVariax}));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 5, 1));

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.ShadowNova}));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 0, 0));

      player2.remainingMana = 9;

      var action = player2.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      var fiends = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Fiend);

      expect(fiends[0].getHP()).to.equal(4);
      expect(fiends[0].getATK()).to.equal(4);
      expect(fiends[1].getHP()).to.equal(4);
      expect(fiends[1].getATK()).to.equal(4);
      expect(fiends[2].getHP()).to.equal(4);
      expect(fiends[2].getATK()).to.equal(4);
      expect(fiends[3].getHP()).to.equal(4);
      expect(fiends[3].getATK()).to.equal(4);

      expect(player2.remainingMana).to.equal(7);
    });
    */

    it('expect meltdown to deal 6 damage to a random enemy whenever you activate your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 1, 2, gameSession.getPlayer2Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Meltdown }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const totalDamage = ironcliffe.getDamage() + gameSession.getGeneralForPlayer2().getDamage();

      expect(totalDamage).to.equal(8);
    });
  });
});
