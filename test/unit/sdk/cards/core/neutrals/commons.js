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
  describe('commons', () => {
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

    it('expect maw to deal 2 damage to a nearby enemy minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(brightmossGolem.getDamage()).to.equal(2);
    });

    it('expect blaze hound to draw a card for both players', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Maw }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.Maw }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PhaseHound }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand1 = player1.getDeck().getCardsInHand();
      const hand2 = player2.getDeck().getCardsInHand();
      expect(hand1[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
      expect(hand2[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
    });

    it('expect mechaz0r to be created when 5 mech peices are down', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 1);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Mechaz0rHelm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(playCardFromHandAction);
      expect(playCardFromHandAction.getIsValid()).to.equal(true);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 6, 3);
      gameSession.executeAction(followupAction);

      const mechaz0r = board.getUnitAtPosition({ x: 6, y: 3 });

      expect(mechaz0r.getId()).to.equal(SDK.Cards.Neutral.Mechaz0r);
    });

    it('expect bluetip scorpion to deal double damage to only minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const bluetip = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 1, 2, gameSession.getPlayer1Id());
      const bluetip2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 7, 2, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 2, gameSession.getPlayer2Id());

      bluetip.refreshExhaustion();
      var action = bluetip.actionAttack(brightmossGolem);
      gameSession.executeAction(action);
      bluetip2.refreshExhaustion();
      var action = bluetip2.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(6);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(3);
    });

    it('expect primus fist to give a friendly minion +2 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const bluetip = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.PrimusFist }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);

      expect(bluetip.getATK()).to.equal(5);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(bluetip.getATK()).to.equal(3);
    });

    it('expect rust crawler to break a random artifact on the enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));

      var modifiers = gameSession.getGeneralForPlayer2().getArtifactModifiers();
      expect(modifiers[0]).to.not.equal(undefined);

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.CoiledCrawler }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      var modifiers = gameSession.getGeneralForPlayer2().getArtifactModifiers();
      expect(modifiers[0]).to.equal(undefined);
    });

    it('expect songweaver to give a nearby friendly minion +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const bluetip = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 2, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Songweaver }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 2, 2);
      gameSession.executeAction(followupAction);

      expect(bluetip.getATK()).to.equal(4);
      expect(bluetip.getHP()).to.equal(2);
    });

    it('expect sun seer to restore 2 health to your general when it deals damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const sunseer = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.SunSeer }, 7, 2, gameSession.getPlayer1Id());

      gameSession.getGeneralForPlayer1().setDamage(5);

      sunseer.refreshExhaustion();
      const action = sunseer.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
    });

    it('expect void hunter to draw a card when dying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const voidhunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.VoidHunter }, 7, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      voidhunter.refreshExhaustion();
      const action = voidhunter.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect wind stopper to force ranged minions to attack it first', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const windstopper = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.WindStopper }, 7, 2, gameSession.getPlayer2Id());
      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 3, 2, gameSession.getPlayer1Id());

      valeHunter.refreshExhaustion();
      const action = valeHunter.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });

    it('expect frostbone naga to deal 2 damage to ALL minions and generals around it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.FrostboneNaga }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(2);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);
    });

    it('expect sand burrower to take no damage from ranged minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      const sandburrower = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BlackSandBurrower }, 7, 2, gameSession.getPlayer2Id());
      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 3, 2, gameSession.getPlayer1Id());

      valeHunter.refreshExhaustion();
      const action = valeHunter.actionAttack(sandburrower);
      gameSession.executeAction(action);

      const hand = player2.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Neutral.BlackSandBurrower);
    });

    it('expect silhouette tracer to teleport general 3 spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.SilhoutteTracer }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 3, 2);
      gameSession.executeAction(followupAction);

      expect(gameSession.getGeneralForPlayer1().getPosition().x).to.equal(3);
      expect(gameSession.getGeneralForPlayer1().getPosition().y).to.equal(2);
    });

    it('expect ash mephyt to spawn 2 copies of itself on random spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.AshMephyt }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const ash = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.AshMephyt);

      expect(ash[0].getId()).to.equal(SDK.Cards.Neutral.AshMephyt);
      expect(ash[1].getId()).to.equal(SDK.Cards.Neutral.AshMephyt);
      expect(ash[2].getId()).to.equal(SDK.Cards.Neutral.AshMephyt);
    });

    it('expect dancing blades to deal 3 damage to any minion in front of it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 2, 1, gameSession.getPlayer2Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.DancingBlades }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(3);
      expect(brightmossGolem2.getDamage()).to.equal(0);
    });

    it('expect the high hand to gain +1/+1 for each card in opponents action bar', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.TheHighHand }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.TheHighHand }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.TheHighHand }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.TheHighHand }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.TheHighHand }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Neutral.TheHighHand }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.TheHighHand }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const highhand = UtilsSDK.getEntityOnBoardById(SDK.Cards.Neutral.TheHighHand);

      expect(highhand.getATK()).to.equal(8);
      expect(highhand.getHP()).to.equal(9);
    });

    it('expect deathblighter to deal 3 damage to all nearby enemy minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 2, gameSession.getPlayer2Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.DeathBlighter }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getDamage()).to.equal(3);
      expect(brightmossGolem2.getDamage()).to.equal(0);
    });

    it('expect first sword of akrane to give all other friendly minions +1 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const bluetip = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BluetipScorpion }, 6, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.FirstSwordofAkrane }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(bluetip.getATK()).to.equal(4);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
    });
  });
});
