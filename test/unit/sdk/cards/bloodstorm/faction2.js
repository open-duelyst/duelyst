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
  describe('faction2', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction2.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect whiplash to deal 2 damage to the enemy general whenever you activate your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const whiplash = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Whiplash }, 4, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(0, 1);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
    });

    it('expect ethereal blades to give a friendly minion and your general +2 attack this turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const whiplash = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Whiplash }, 4, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EtherealBlades }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 4, 3));

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);
      expect(whiplash.getATK()).to.equal(6);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
      expect(whiplash.getATK()).to.equal(4);
    });

    it('expect geomancer to turn your BBS into phoenix fire', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const signatureCardBefore = player1.getCurrentSignatureCard();
      expect(signatureCardBefore).to.exist;
      expect(signatureCardBefore.getBaseCardId()).to.not.equal(SDK.Cards.Spell.PhoenixFireBBS);

      const geomancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Geomancer }, 4, 3, gameSession.getPlayer1Id());

      const signatureCardAfter = player1.getCurrentSignatureCard();
      expect(signatureCardAfter).to.exist;
      expect(signatureCardAfter.getBaseCardId()).to.not.equal(signatureCardBefore.getBaseCardId());
      expect(signatureCardAfter.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFireBBS);
    });

    it('expect obscuring blow to give a friendly minion or general backstab(2)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const whiplash = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Whiplash }, 4, 3, gameSession.getPlayer1Id());
      const ironcliffe = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.IroncliffeGuardian }, 3, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Backstabbery }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 4, 3));

      whiplash.refreshExhaustion();
      const action = whiplash.actionAttack(ironcliffe);
      gameSession.executeAction(action);

      expect(ironcliffe.getDamage()).to.equal(6);
      expect(whiplash.getDamage()).to.equal(0);
    });

    it('expect cobra strike to deal 3 damage to an enemy minion and the enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const geomancer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Geomancer }, 4, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CobraStrike }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 4, 3));

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
      expect(geomancer.getDamage()).to.equal(3);
    });

    it('expect twilight fox to teleport a random enemy minion behind your general when you use your bbs', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const twilightfox = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.TwilightFox }, 4, 3, gameSession.getPlayer1Id());
      const squire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 6, 1, gameSession.getPlayer2Id());

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      var action = player1.actionPlaySignatureCard(3, 2);
      gameSession.executeAction(action);

      let unitBehindGeneral = false;

      if (squire.getPosition().x === 1 && squire.getPosition().y === 2) {
        unitBehindGeneral = true;
      }

      if (gameSession.getGeneralForPlayer2().getPosition().x === 1 && gameSession.getGeneralForPlayer2().getPosition().y === 2) {
        unitBehindGeneral = true;
      }

      expect(unitBehindGeneral).to.equal(true);
    });

    it('expect twilight fox to not teleport a random enemy when you use your bbs if there is no space', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const twilightfox = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.TwilightFox }, 4, 3, gameSession.getPlayer1Id());
      const squire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 6, 1, gameSession.getPlayer2Id());

      const action = player1.actionPlaySignatureCard(0, 1);
      gameSession.executeAction(action);

      expect(squire.getPosition().x).to.equal(6);
      expect(squire.getPosition().y).to.equal(1);
    });

    it('expect twilight fox to not teleport an enemy behind your general if blocked and for onyx jaguar to not activate', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const twilightfox = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.TwilightFox }, 4, 3, gameSession.getPlayer1Id());
      const jaguar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.OnyxJaguar }, 6, 1, gameSession.getPlayer2Id());

      var action = gameSession.getGeneralForPlayer1().actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);

      var action = player1.actionPlaySignatureCard(1, 2);
      gameSession.executeAction(action);

      let unitBehindGeneral = false;

      if (jaguar.getPosition().x === 1 && jaguar.getPosition().y === 2) {
        unitBehindGeneral = true;
      }

      if (gameSession.getGeneralForPlayer2().getPosition().x === 1 && gameSession.getGeneralForPlayer2().getPosition().y === 2) {
        unitBehindGeneral = true;
      }

      expect(unitBehindGeneral).to.equal(false);
      expect(jaguar.getHP()).to.equal(3);
      expect(jaguar.getATK()).to.equal(3);
    });
  });
});
