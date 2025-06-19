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

describe('faction3', () => {
  describe('spells', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction3.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      // setup test session
      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

      /* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
      var deck = player1.getDeck();
      Logger.module("UNITTEST").log(deck.getCardsInHand(1));
      */
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect siphon energy to dispel an enemy minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SiphonEnergy }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getIsSilenced()).to.equal(true);
      expect(valeHunter.isRanged()).to.equal(false);
    });

    it('expect auroras tears to give +2 attack for each artifact equipped', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AnkhFireNova }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.AnkhFireNova }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AurorasTears }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(10);
    });

    it('expect blind scorch to reduce a minions attack to 0 until your next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Blindscorch }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getATK()).to.equal(0);
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(valeHunter.getATK()).to.equal(0);
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(valeHunter.getATK()).to.equal(1);
    });

    it('expect scions first wish to give a minion +1/+1 and draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SiphonEnergy }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsFirstWish }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getATK()).to.equal(2);
      expect(valeHunter.getHP()).to.equal(3);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.SiphonEnergy);
    });

    it('expect boneswarm to deal to 2 damage to an enemy general and every minion around it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 8, 3, gameSession.getPlayer2Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 8, 1, gameSession.getPlayer2Id());
      const hailstoneGolem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 1, gameSession.getPlayer2Id());
      const hailstoneGolem4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer2Id());
      const hailstoneGolem5 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 3, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BoneSwarm }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(hailstoneGolem.getHP()).to.equal(4);
      expect(hailstoneGolem2.getHP()).to.equal(4);
      expect(hailstoneGolem3.getHP()).to.equal(4);
      expect(hailstoneGolem4.getHP()).to.equal(4);
      expect(hailstoneGolem5.getHP()).to.equal(4);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
    });

    it('expect cosmic flesh to give a minion +1/+3 and provoke', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CosmicFlesh }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getATK()).to.equal(2);
      expect(valeHunter.getHP()).to.equal(5);
      expect(valeHunter.hasModifierClass(SDK.ModifierProvoke)).to.equal(true);
    });

    it('expect fountain of youth to restore the health of all friendly minions to full', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 1, 1, gameSession.getPlayer1Id());
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 2, 1, gameSession.getPlayer1Id());

      brightmossGolem.setDamage(8);
      hailstoneGolem.setDamage(5);
      expect(brightmossGolem.getHP()).to.equal(1);
      expect(hailstoneGolem.getHP()).to.equal(1);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.FountainOfYouth }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getHP()).to.equal(9);
      expect(hailstoneGolem.getHP()).to.equal(6);
    });

    it('expect rashas curse to break a random artifact', () => {
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

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RashasCurse }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 8, 3);
      gameSession.executeAction(followupAction);

      var modifiers = gameSession.getGeneralForPlayer2().getArtifactModifiers();
      expect(modifiers[0]).to.equal(undefined);
    });

    it('expect rashas curse to summon a 2/2 dervish with rush next to an enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.StaffOfYKir }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.RashasCurse }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 8, 3);
      gameSession.executeAction(followupAction);

      const dervish = board.getUnitAtPosition({ x: 8, y: 3 });
      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(2);
      expect(dervish.getIsExhausted()).to.equal(false);
    });

    it('expect sand trap to stop an enemy minion from being able to move', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DrainMorale }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getSpeed()).to.equal(0);
    });

    it('expect scions second wish to give a minion +2/+2', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsSecondWish }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(brightmossGolem.getATK()).to.equal(6);
      expect(brightmossGolem.getHP()).to.equal(11);
    });

    it('expect scions second wish to give a minion invulnerability to generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsSecondWish }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      brightmossGolem.refreshExhaustion();
      const action = brightmossGolem.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      expect(brightmossGolem.getATK()).to.equal(6);
      expect(brightmossGolem.getHP()).to.equal(11);
    });

    it('expect astral phasing to give a friendly minion +5 health and flying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AstralPhasing }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getHP()).to.equal(7);
      expect(valeHunter.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
    });

    it('expect inner oasis to give all friendly minions +3 health and to draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer1Id());
      const valeHunter2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer1Id());
      const valeHunter3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 3, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerOasis }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getHP()).to.equal(5);
      expect(valeHunter2.getHP()).to.equal(5);
      expect(valeHunter3.getHP()).to.equal(5);
    });

    it('expect scions third wish to only be castable on dervishes', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 1, gameSession.getPlayer1Id());
      const valeHunter2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer1Id());
      const valeHunter3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 3, gameSession.getPlayer1Id());
      const sandHowler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandHowler }, 1, 4, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsThirdWish }));

      const hand = player1.getDeck().getCardsInHand();
      const s3w = hand[0];
      const validTargetPositions = s3w.getValidTargetPositions();

      expect(validTargetPositions[0]).to.exist;
      expect(validTargetPositions[0].x === 1 && validTargetPositions[0].y === 4).to.equal(true);
      expect(validTargetPositions[1]).to.not.exist;
    });

    it('expect scions third wish to give a dervish +3/+3 and flying', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const sandHowler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction3.SandHowler }, 1, 4, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ScionsThirdWish }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 4);
      gameSession.executeAction(playCardFromHandAction);

      expect(sandHowler.getHP()).to.equal(6);
      expect(sandHowler.getATK()).to.equal(6);
      expect(sandHowler.getHP()).to.equal(6);
      expect(sandHowler.hasModifierClass(SDK.ModifierFlying)).to.equal(true);
    });

    it('expect entropic decay to destroy a minion nearby general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EntropicDecay }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getIsRemoved()).to.equal(true);
    });

    it('expect entropic decay to not be able to target minions far away from general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 4, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EntropicDecay }));
      const hand = player1.getDeck().getCardsInHand();
      const entropicdecay = hand[0];
      const validTargetPositions = entropicdecay.getValidTargetPositions();

      expect(validTargetPositions[0]).to.not.exist;

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.getIsRemoved()).to.equal(false);
    });

    it('expect stars fury to summon 2/2 dervish in front of every enemy', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 4, 2, gameSession.getPlayer2Id());
      const valeHunter2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 4, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.StarsFury }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction);

      var dervish = board.getUnitAtPosition({ x: 7, y: 2 });
      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(2);
      expect(dervish.getIsExhausted()).to.equal(false);
      var dervish = board.getUnitAtPosition({ x: 3, y: 2 });
      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(2);
      expect(dervish.getIsExhausted()).to.equal(false);
      var dervish = board.getUnitAtPosition({ x: 3, y: 1 });
      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(2);
      expect(dervish.getIsExhausted()).to.equal(false);
    });

    it('expect stars fury to not summon a 2/2 dervish if front space is blocked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 4, 2, gameSession.getPlayer2Id());
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 3, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.StarsFury }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction);

      var dervish = board.getUnitAtPosition({ x: 7, y: 2 });
      expect(dervish.getBaseCardId()).to.equal(SDK.Cards.Faction3.Dervish);
      var dervish = board.getUnitAtPosition({ x: 2, y: 2 });
      expect(dervish.getBaseCardId()).to.equal(SDK.Cards.Faction3.Dervish);
      const valeHunter = board.getUnitAtPosition({ x: 3, y: 2 });
      expect(valeHunter.getBaseCardId()).to.equal(SDK.Cards.Neutral.ValeHunter);
    });

    it('expect dominate will to make any enemy minion join your side', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());

      expect(valeHunter.ownerId).to.equal('player2_id');

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enslave }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(valeHunter.ownerId).to.equal('player1_id');
    });

    it('expect dominate will when provoked to not provoke the enemy general if they are out of range of the newly controlled provoke minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const primusShieldmaster = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.PrimusShieldmaster }, 1, 2, gameSession.getPlayer2Id());

      expect(primusShieldmaster.ownerId).to.equal('player2_id');

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Enslave }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(primusShieldmaster.ownerId).to.equal('player1_id');
      expect(gameSession.getGeneralForPlayer2().hasActiveModifierClass(SDK.ModifierProvoked)).to.equal(false);
    });

    it('expect dominate will on a self buffed enemy should not transfer buffs from the unit to any general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      player1.remainingMana = 9;

      const blackSolus = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction4.BlackSolus }, 8, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WraithlingSwarm }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);
      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
      gameSession.executeAction(followupAction);
      const followupCard2 = followupAction.getCard().getCurrentFollowupCard();
      const followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 3);
      gameSession.executeAction(followupAction2);

      expect(blackSolus.getHP()).to.equal(7);
      expect(blackSolus.getATK()).to.equal(10);

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Enslave }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 8, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(2);
      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
    });

    it('expect time maelstrom to refresh your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();
      const general1 = gameSession.getGeneralForPlayer1();
      player1.remainingMana = 9;

      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 3, 3, gameSession.getPlayer2Id());

      var action = general1.actionMove({ x: 2, y: 2 });
      gameSession.executeAction(action);
      var action = general1.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Maelstrom }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      var action = general1.actionMove({ x: 4, y: 2 });
      gameSession.executeAction(action);
      var action = general1.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getDamage()).to.equal(4);

      const general = board.getUnitAtPosition({ x: 4, y: 2 });
      expect(general.getId()).to.equal(SDK.Cards.Faction3.General);

      /* expect(player1.isCurrentPlayer).to.equal(true);
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(player1.isCurrentPlayer).to.equal(true);
      expect(gameSession.getCurrentPlayerId()).to.equal(player1.getPlayerId());
      expect(player2.isCurrentPlayer).to.equal(false);
      gameSession.executeAction(gameSession.actionEndTurn());
      expect(player1.isCurrentPlayer).to.equal(false);
      expect(player2.isCurrentPlayer).to.equal(true); */
    });
  }); // end Spells describe
});
