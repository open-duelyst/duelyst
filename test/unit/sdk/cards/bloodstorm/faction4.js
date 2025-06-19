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
  describe('faction4', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction4.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction4.AltGeneral },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect furosa to give friendly wraithlings +1/+1 whenever you use your BBS', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 1, gameSession.getPlayer1Id());
      const furosa = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Furosa }, 4, 3, gameSession.getPlayer1Id());

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

      expect(wraithlings[0].getHP()).to.equal(2);
      expect(wraithlings[0].getATK()).to.equal(2);
      expect(wraithlings[1].getHP()).to.equal(2);
      expect(wraithlings[1].getATK()).to.equal(2);
      expect(wraithlings[2].getHP()).to.equal(2);
      expect(wraithlings[2].getATK()).to.equal(2);
    });

    it('expect aphotic drain to destroy a friendly minion and restore 5 health to your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      gameSession.getGeneralForPlayer1().setDamage(10);

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AphoticDrain }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

      expect(wraithling.getIsRemoved()).to.equal(true);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(5);
    });

    it('expect horror burster to turn a random friendly minion into a 6/6 upon death', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const burster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.HorrorBurster }, 6, 1, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AphoticDrain }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

      const horror = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(horror).to.exist;
      expect(horror.getBaseCardId()).to.equal(SDK.Cards.Faction4.Horror);
    });

    it('expect horror burster to not turn a random friendly minion into a horror if everything dies to tempest', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const burster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.HorrorBurster }, 6, 1, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

      const horror = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(horror).to.not.exist;
    });

    it('expect horror burster to not turn a random friendly minion into a horror if everything dies to twin strike', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      const burster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.HorrorBurster }, 6, 1, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.TwinStrike }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 6, 1));

      const horror = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(horror).to.not.exist;
    });

    it('expect horror burster to create a horror out of a naga if the naga clears the board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const burster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.HorrorBurster }, 6, 1, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.FrostboneNaga }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 2));

      const horror = board.getUnitAtPosition({ x: 5, y: 2 });

      expect(horror).to.exist;
      expect(horror.getBaseCardId()).to.equal(SDK.Cards.Faction4.Horror);
    });

    it('expect horror burster to not turn a random friendly minion into a horror if everything dies to decimate', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const burster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.HorrorBurster }, 6, 1, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Decimate }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 6, 1));

      const horror = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(horror).to.not.exist;
    });

    it('expect punish to destroy a damaged minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const juggernaut = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalJuggernaut }, 5, 1, gameSession.getPlayer2Id());

      juggernaut.setDamage(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Punish }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 1));

      expect(juggernaut.getIsRemoved()).to.equal(true);
    });

    it('expect necrotic sphere to turn all friendly and enemy minions nearby general into wraithlings', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const juggernaut = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalJuggernaut }, 1, 1, gameSession.getPlayer2Id());
      const juggernaut2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.AbyssalJuggernaut }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.NecroticSphere }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 1));

      const wraithling1 = board.getUnitAtPosition({ x: 1, y: 1 });
      const wraithling2 = board.getUnitAtPosition({ x: 1, y: 2 });

      expect(wraithling1.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
      expect(wraithling2.getId()).to.equal(SDK.Cards.Faction4.Wraithling);
    });

    it('expect grandmaster variax to give all lilithes wraithlings +4/+4 for every 3 mana BBS use', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 1, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GrandmasterVariax }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      // var variax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GrandmasterVariax}, 4, 3, gameSession.getPlayer1Id());

      // console.log(board.getUnitAtPosition({x:1,y:1}));

      player1.remainingMana = 9;

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

      expect(wraithlings[0].getHP()).to.equal(5);
      expect(wraithlings[0].getATK()).to.equal(5);
      expect(wraithlings[1].getHP()).to.equal(5);
      expect(wraithlings[1].getATK()).to.equal(5);
      expect(wraithlings[2].getHP()).to.equal(5);
      expect(wraithlings[2].getATK()).to.equal(5);

      expect(player1.remainingMana).to.equal(6);
    });

    it('expect grandmaster variax to make cassyvas shadow creep tiles spawn 4/4 minions for every 3 mana BBS use', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player2 = gameSession.getPlayer2();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 1, gameSession.getPlayer2Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Faction4.GrandmasterVariax }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 5, 1));

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.ShadowNova }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 0, 0));

      player2.remainingMana = 9;

      const action = player2.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const fiends = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Fiend);

      expect(fiends[0].getHP()).to.equal(4);
      expect(fiends[0].getATK()).to.equal(4);
      expect(fiends[1].getHP()).to.equal(4);
      expect(fiends[1].getATK()).to.equal(4);
      expect(fiends[2].getHP()).to.equal(4);
      expect(fiends[2].getATK()).to.equal(4);
      expect(fiends[3].getHP()).to.equal(4);
      expect(fiends[3].getATK()).to.equal(4);

      expect(player2.remainingMana).to.equal(6);
    });

    it('expect grandmaster variax and furosa to give all lilithes wraithlings +5/+5 for every 3 mana BBS use', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      const furosa = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Furosa }, 6, 2, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 1, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GrandmasterVariax }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      // var variax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GrandmasterVariax}, 4, 3, gameSession.getPlayer1Id());

      // console.log(board.getUnitAtPosition({x:1,y:1}));

      player1.remainingMana = 9;

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

      expect(wraithlings[0].getHP()).to.equal(6);
      expect(wraithlings[0].getATK()).to.equal(6);
      expect(wraithlings[1].getHP()).to.equal(6);
      expect(wraithlings[1].getATK()).to.equal(6);
      expect(wraithlings[2].getHP()).to.equal(6);
      expect(wraithlings[2].getATK()).to.equal(6);

      expect(player1.remainingMana).to.equal(6);
    });

    it('expect grandmaster variax to turn grandmaster zirs bbs into the upgraded one', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // cycle turns until you can use bloodborn spell
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      const furosa = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Furosa }, 6, 2, gameSession.getPlayer1Id());
      const wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 6, 1, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction4.GrandmasterVariax }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      // var variax = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.GrandmasterVariax}, 4, 3, gameSession.getPlayer1Id());

      const grandmasterZir = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.GrandmasterZir }, 5, 1, gameSession.getPlayer1Id());

      const damageAction = new SDK.DamageAction(gameSession);
      damageAction.setTarget(gameSession.getGeneralForPlayer1());
      damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
      UtilsSDK.executeActionWithoutValidation(damageAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

      // console.log(board.getUnitAtPosition({x:1,y:1}));

      player1.remainingMana = 9;

      const action = player1.actionPlaySignatureCard(1, 1);
      gameSession.executeAction(action);

      const wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);

      expect(wraithlings[0].getHP()).to.equal(6);
      expect(wraithlings[0].getATK()).to.equal(6);
      expect(wraithlings[1].getHP()).to.equal(6);
      expect(wraithlings[1].getATK()).to.equal(6);
      expect(wraithlings[2].getHP()).to.equal(6);
      expect(wraithlings[2].getATK()).to.equal(6);

      expect(player1.remainingMana).to.equal(6);
    });
  });
});
