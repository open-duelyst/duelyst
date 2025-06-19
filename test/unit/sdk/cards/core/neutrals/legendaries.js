const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');
const DEATHWATCH = require('app/sdk/modifiers/modifierDeathWatch');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('core set', () => {
  describe('legendaries', () => {
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

    it('expect golem vanquisher to give only friendly golems provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const golemVanquisher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GolemVanquisher }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 2, gameSession.getPlayer1Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 3, 2, gameSession.getPlayer2Id());

      expect(brightmossGolem.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(brightmossGolem2.hasModifierClass(SDK.ModifierProvoke)).to.equal(false);
    });

    it('expect golem vanquisher to not give golems provoke when he dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const golemVanquisher = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GolemVanquisher }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 4, 2, gameSession.getPlayer1Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 3, 2, gameSession.getPlayer2Id());

      golemVanquisher.setDamage(3);
      golemVanquisher.refreshExhaustion();
      const action = golemVanquisher.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(brightmossGolem.hasModifierClass(SDK.ModifierProvoke)).to.equal(false);
      expect(brightmossGolem2.hasModifierClass(SDK.ModifierProvoke)).to.equal(false);
    });

    it('expect lady locke to give minions you summon on same turn +1/+1 and provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.LadyLocke }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);

      const maw1 = board.getUnitAtPosition({ x: 2, y: 1 });
      const maw2 = board.getUnitAtPosition({ x: 3, y: 1 });

      expect(maw1.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(maw1.getHP()).to.equal(3);
      expect(maw1.getATK()).to.equal(3);
      expect(maw2.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
      expect(maw2.getHP()).to.equal(3);
      expect(maw2.getATK()).to.equal(3);
    });

    it('expect mirkblood devourer to give nearby summoned minions +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.MirkbloodDevourer }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      const maw1 = board.getUnitAtPosition({ x: 2, y: 1 });
      const maw2 = board.getUnitAtPosition({ x: 2, y: 2 });

      expect(maw1.getHP()).to.equal(3);
      expect(maw1.getATK()).to.equal(3);
      expect(maw2.getHP()).to.equal(3);
      expect(maw2.getATK()).to.equal(3);
    });

    it('expect sarlac the eternal to respawn on a random tile when killed', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      var sarlac = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SarlacTheEternal }, 7, 2, gameSession.getPlayer1Id());

      sarlac.refreshExhaustion();
      const action = sarlac.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      var sarlac = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.SarlacTheEternal);
      const updatedSarlac = board.getUnitAtPosition({ x: 7, y: 2 });

      expect(updatedSarlac).to.equal(undefined);
      expect(sarlac.getHP()).to.equal(1);
    });

    it('expect spelljammer to allow both players to draw 2 cards at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const spelljammer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Spelljammer }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      gameSession.executeAction(gameSession.actionEndTurn());
      const hand2 = player2.getDeck().getCardsInHand();
      expect(hand2[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand2[1].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect a spelljammer you used dominate will on to allow you to draw 2 cards at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const spelljammer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Spelljammer }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enslave }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[2]).to.equal(undefined);
      gameSession.executeAction(gameSession.actionEndTurn());
      const hand2 = player2.getDeck().getCardsInHand();
      expect(hand2[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand2[1].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand2[2]).to.equal(undefined);
    });

    it('expect zenrui to be able to take control of any minion with 2 attack or less', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const sarlac = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SarlacTheEternal }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ZenRui }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(sarlac.ownerId).to.equal('player1_id');
    });

    it('expect archon spellbinder to make your opponents spells cost 1 more to cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const archon = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArchonSpellbinder }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(3);
    });

    it('expect eclipse to return damage taken to the enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const eclipse = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Eclipse }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 6, 2, gameSession.getPlayer2Id());

      eclipse.refreshExhaustion();
      const action = eclipse.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
    });

    it('expect jax to summon 1/1 mini jaxes in every corner', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.JaxTruesight }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const minijax1 = board.getUnitAtPosition({ x: 0, y: 0 });
      const minijax2 = board.getUnitAtPosition({ x: 0, y: 4 });
      const minijax3 = board.getUnitAtPosition({ x: 8, y: 0 });
      const minijax4 = board.getUnitAtPosition({ x: 8, y: 4 });

      expect(minijax1.getId()).to.equal(SDK.Cards.Neutral.MiniJax);
      expect(minijax2.getId()).to.equal(SDK.Cards.Neutral.MiniJax);
      expect(minijax3.getId()).to.equal(SDK.Cards.Neutral.MiniJax);
      expect(minijax4.getId()).to.equal(SDK.Cards.Neutral.MiniJax);
    });

    it('expect dark nemesis to deal 4 damage to the enemy general and gain +4 attack at the start of every turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const darkNemesis = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.DarkNemesis }, 6, 2, gameSession.getPlayer2Id());
      expect(darkNemesis.getATK()).to.equal(4);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(darkNemesis.getATK()).to.equal(8);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(4);
    });

    it('expect paddo to push all nearby minions and generals to random spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const general1 = gameSession.getGeneralForPlayer1();
      const general2 = gameSession.getGeneralForPlayer2();

      general1.refreshExhaustion();
      var action = general1.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      general1.refreshExhaustion();
      var action = general1.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      general1.refreshExhaustion();
      var action = general1.actionMove({ x: 6, y: 2 });
      gameSession.executeAction(action);

      player1.remainingMana = 9;

      var brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 1, gameSession.getPlayer1Id());
      var valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 7, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Paddo }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      var brightmossGolem = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.BrightmossGolem);
      var valeHunter = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.ValeHunter);

      expect(brightmossGolem.getPosition().x !== 7 || brightmossGolem.getPosition().y !== 1).to.equal(true);
      expect(valeHunter.getPosition().x !== 7 || valeHunter.getPosition().y !== 3).to.equal(true);
      expect(general1.getPosition().x !== 6 || general1.getPosition().y !== 2).to.equal(true);
      expect(general2.getPosition().x !== 8 || general2.getPosition().y !== 2).to.equal(true);
    });

    it('expect pandora to summon a random 3/3 wolf in a nearby random space at the end of every turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const pandora = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Pandora }, 6, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      const wolf1 = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.PandoraMinion1);
      const wolf2 = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.PandoraMinion2);
      const wolf3 = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.PandoraMinion3);
      const wolf4 = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.PandoraMinion4);
      const wolf5 = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.PandoraMinion5);

      let wolves = 0;

      if (wolf1 != undefined) { wolves += 1; }
      if (wolf2 != undefined) { wolves += 1; }
      if (wolf3 != undefined) { wolves += 1; }
      if (wolf4 != undefined) { wolves += 1; }
      if (wolf5 != undefined) { wolves += 1; }

      expect(wolves).to.equal(1);
    });

    it('expect red synja to deal 7 damage to a random nearby enemy minion when your general takes damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const general1 = gameSession.getGeneralForPlayer1();

      player1.remainingMana = 9;

      const redSynja = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RedSynja }, 1, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer2Id());

      const action = general1.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getIsRemoved()).to.equal(true);
    });

    it('expect rook to have 6 faction abilites after 6 turns ', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rook = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Rook }, 1, 2, gameSession.getPlayer1Id());

      for (let i = 0; i < 12; i++) {
        gameSession.executeAction(gameSession.actionEndTurn());
      }

      expect(rook.hasModifierClass(SDK.ModifierBlastAttack)).to.equal(true);
      expect(rook.hasModifierClass(SDK.ModifierBackstab)).to.equal(true);
      expect(rook.getModifierByClass(SDK.ModifierBackstab).backstabBonus).to.equal(5);
      expect(rook.hasModifierClass(SDK.ModifierInfiltrate)).to.equal(true);
      expect(rook.hasModifierClass(SDK.ModifierGrow)).to.equal(true);
      expect(rook.hasModifierClass(SDK.ModifierBanding)).to.equal(true);
      expect(rook.hasModifierClass(DEATHWATCH)).to.equal(true);
    });

    it('expect rook to only gain 1 faction ability each turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rook = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Rook }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      let modifiers = 0;
      if (rook.hasModifierClass(SDK.ModifierBlastAttack) == true) {
        modifiers++;
      }
      if (rook.hasModifierClass(SDK.ModifierBackstab) == true) {
        modifiers++;
      }
      if (rook.hasModifierClass(SDK.ModifierInfiltrate) == true) {
        modifiers++;
      }
      if (rook.hasModifierClass(SDK.ModifierGrow) == true) {
        modifiers++;
      }
      if (rook.hasModifierClass(SDK.ModifierBanding) == true) {
        modifiers++;
      }
      if (rook.hasModifierClass(DEATHWATCH) == true) {
        modifiers++;
      }

      expect(modifiers).to.equal(1);
    });

    it('expect rooks zeal to give him and general 5 health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const rook = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Rook }, 2, 2, gameSession.getPlayer1Id());

      for (let i = 0; i < 12; i++) {
        gameSession.executeAction(gameSession.actionEndTurn());
      }

      gameSession.getGeneralForPlayer1().setDamage(5);
      rook.setDamage(3);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(20);
      expect(rook.getDamage()).to.equal(3);

      const action = rook.actionMove({ x: 1, y: 2 });
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
      expect(rook.getDamage()).to.equal(0);
    });

    it('expect zurael the lifegiver to revive all friendly minions that were destroyed during opponents last turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var rustCrawler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 0, 1, gameSession.getPlayer1Id());
      var repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ZuraelTheLifegiver }));
      var action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      let rustCrawlerx = 0;
      let rustCrawlery = 0;
      let repulsorBeastx = 0;
      let repulsorBeasty = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const unit = board.getUnitAtPosition({ x: xx, y: yy });
          if (unit != null && unit.getId() === SDK.Cards.Neutral.BluetipScorpion) {
            rustCrawlerx = xx;
            rustCrawlery = yy;
          }
          if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
            repulsorBeastx = xx;
            repulsorBeasty = yy;
          }
        }
      }

      var rustCrawler = board.getUnitAtPosition({ x: rustCrawlerx, y: rustCrawlery });
      var repulsorBeast = board.getUnitAtPosition({ x: repulsorBeastx, y: repulsorBeasty });

      expect(rustCrawler.getOwnerId()).to.equal(gameSession.getPlayer1Id());
      expect(repulsorBeast.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });

    it('expect zurael the lifegiver to not revive tokens', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      var wraithling = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.Wraithling }, 0, 1, gameSession.getPlayer1Id());
      var repulsorBeast = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.RepulsionBeast }, 1, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.GhostLightning }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      gameSession.executeAction(gameSession.actionEndTurn());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.ZuraelTheLifegiver }));
      var action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      let rustCrawlerx = 10;
      let rustCrawlery = 10;
      let repulsorBeastx = 0;
      let repulsorBeasty = 0;

      for (let xx = 0; xx < 10; xx++) {
        for (let yy = 0; yy < 5; yy++) {
          const unit = board.getUnitAtPosition({ x: xx, y: yy });
          if (unit != null && unit.getId() === SDK.Cards.Faction4.Wraithling) {
            rustCrawlerx = xx;
            rustCrawlery = yy;
          }
          if (unit != null && unit.getId() === SDK.Cards.Neutral.RepulsionBeast) {
            repulsorBeastx = xx;
            repulsorBeasty = yy;
          }
        }
      }

      var wraithling = board.getUnitAtPosition({ x: rustCrawlerx, y: rustCrawlery });
      var repulsorBeast = board.getUnitAtPosition({ x: repulsorBeastx, y: repulsorBeasty });

      expect(rustCrawlerx).to.equal(10);
      expect(rustCrawlery).to.equal(10);
      expect(repulsorBeast.getOwnerId()).to.equal(gameSession.getPlayer1Id());
    });
  });
});
