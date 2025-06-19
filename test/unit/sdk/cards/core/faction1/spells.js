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

describe('faction1', () => {
  describe('spells', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction1.General },
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

    it('expect tempest to deal 2 damage to both players minions and generals', () => {
      // These will not exist in the beforeeach sections
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // begin placing things on board
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      // gameSession.executeAction(player.actionPlayCardFromHand(0, 1, 1))     //ALTERNATELY CAN USE THIS TO PLAY FROM HAND
      const heartseeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 7, 1, gameSession.getPlayer2Id());

      // put Tempest in hand and then play it
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      // check to see if Silverguard Squire is at 2 health
      expect(silverguardSquire.getHP()).to.equal(2);

      // check to see if heartseeker is dead
      expect(heartseeker.getIsRemoved()).to.equal(true);

      // check to see if both generals took 2 damage
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
      expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2); // another way of writing it
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
    });

    it('expect auryn nexus to give a friendly minion +3 hp', () => {
      // define test decks.  Spells do not work.  Only add minions and generals this way

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // begin placing things on board
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      // define SilverguardSquire and expect it to be where it was placed at 4 health
      var silverguardSquire = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(silverguardSquire.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
      expect(silverguardSquire.getHP()).to.equal(4);

      // put Auryn Nexus in hand and then play it
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AurynNexus }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      // check to see if Silverguard Squire is at 7 health
      var silverguardSquire = board.getUnitAtPosition({ x: 1, y: 1 });
      expect(silverguardSquire.getHP()).to.equal(7);
    });

    it('expect true strike to deal 2 damage to an enemy minion and cannot target a general', () => {
      // define test decks.  Spells do not work.  Only add minions and generals this way

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // begin placing things on board
      UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 7, 1, gameSession.getPlayer2Id());

      // put True Strike in hand and then play it
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 7, 1));

      // check to see if Silverguard Squire is at 2 health
      const jadeOgre = board.getUnitAtPosition({ x: 7, y: 1 });
      expect(jadeOgre.getHP()).to.equal(1);

      //* *** CREATE NEW TEST CASE FOR THIS *****

      // put another True Strike in hand to see if you can target enemy generals
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TrueStrike }));

      // end turn to cycle back to your turn for fresh mana
      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      // define the valid positions of true strike
      const hand = player1.getDeck().getCardsInHand();
      const trueStrike = hand[0];
      const validTargetPositions = trueStrike.getValidTargetPositions();
      const trueStrike2 = player1.getDeck().getCardInHandAtIndex(0); // an easier way of calling it

      // make sure that there's only 1 valid target position and that it equals the still living Jade Monk
      // other way is to loop through valid target positions and make sure neither generals are in the list
      expect(validTargetPositions[0]).to.exist;
      expect(validTargetPositions[0].x === 7 && validTargetPositions[0].y === 1).to.equal(true);
      expect(validTargetPositions[1]).to.not.exist;

      // attempt to play True Strike on the enemy general anyway
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      // the action should not be allowed
      expect(playCardFromHandAction.getIsValid()).to.equal(false);
    });

    it('expect beamshock to stun minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BeamShock }));

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 0, 1, gameSession.getPlayer2Id());

      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(hailstoneGolem.hasActiveModifierClass(SDK.ModifierStunned)).to.equal(true);
    });

    it('expect beamshock to stun generals', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BeamShock }));

      // stun general
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().hasModifierClass(SDK.ModifierStunned)).to.equal(true);
    });

    it('expect lionheart blessing to give a unit zeal: deal damage to draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const suntideMaiden = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SuntideMaiden }, 1, 2, gameSession.getPlayer1Id());
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Magnetize }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LionheartBlessing }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      suntideMaiden.refreshExhaustion();
      const action = suntideMaiden.actionAttack(hailstoneGolem);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize);
    });

    it('expect aegis barrier to prevent being targeted by spells and to draw a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      const suntideMaiden = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SuntideMaiden }, 1, 2, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Magnetize }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AegisBarrier }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize);

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(suntideMaiden.getHP()).to.equal(6);
    });

    it('expect aerial rift to let you summon a minion anywhere on the board this turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AerialRift }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction1.SilverguardSquire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 3);
      gameSession.executeAction(playCardFromHandAction);

      const silverguardSquire = board.getUnitAtPosition({ x: 6, y: 3 });
      expect(silverguardSquire.getHP()).to.equal(4);
    });

    it('expect aerial rift to immediately draw you a card', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Magnetize }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AerialRift }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize);
    });

    it('expect magnetize to pull a friendly minion in front of your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const suntideMaiden = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SuntideMaiden }, 7, 4, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Magnetize }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 4);
      gameSession.executeAction(playCardFromHandAction);

      expect(suntideMaiden.getPosition().x).to.equal(1);
      expect(suntideMaiden.getPosition().y).to.equal(2);
    });

    it('expect magentize to pull an enemy minion in front of your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const jadeOgre = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 7, 4, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Magnetize }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 4);
      gameSession.executeAction(playCardFromHandAction);

      expect(jadeOgre.getPosition().x).to.equal(1);
      expect(jadeOgre.getPosition().y).to.equal(2);
    });

    it('expect sundrop elixir to restore 5 health to target', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      player2.remainingMana = 9;

      // cast spiral technique on player 1
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      var playCardFromHandAction = player2.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(17);

      // end turn and cast sundrop elixir
      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SundropElixir }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);
      // make sure sundrop elixir healed 5 health
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
    });

    it('expect lasting judgement to give a minion +3 atk/-3 hp', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.LastingJudgement }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      // check to see if Silverguard Squire is a 4/1
      expect(silverguardSquire.getHP()).to.equal(1);
      expect(silverguardSquire.getATK()).to.equal(4);
    });

    it('expect martyrdom to kill a minion and restore health to that minion\'s general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // begin placing things on board
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      // put Tempest in hand and then play it
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Tempest }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Martyrdom }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      expect(silverguardSquire.getIsRemoved()).to.equal(true);
      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(25);
    });

    it('expect sunbloom to dispel 2x2 grid', () => {
      // spell.getApplyEffectPositions()     will return array of positions spell is applied at.  check for silence not dispel.   start from bottom left to top right
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      // begin placing things on board
      const jadeOgre = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 0, 0, gameSession.getPlayer2Id());
      const jadeOgre2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 0, 1, gameSession.getPlayer2Id());
      const jadeOgre3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 1, 0, gameSession.getPlayer2Id());
      const jadeOgre4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 1, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SunBloom }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      expect(jadeOgre.getIsSilenced()).to.equal(true);
      expect(jadeOgre2.getIsSilenced()).to.equal(true);
      expect(jadeOgre3.getIsSilenced()).to.equal(true);
      expect(jadeOgre4.getIsSilenced()).to.equal(true);
    });

    it('expect warsurge to give friendly minions +1/+1', () => {
      // *****REVISE TO INCLUDE A SECOND UNIT ON BOARD AND CHECK THAT BOTH UNITS RECEIVE BUFF

      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.WarSurge }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      // check to see if Silverguard Squire is a 2/5
      expect(silverguardSquire.getHP()).to.equal(5);
      expect(silverguardSquire.getATK()).to.equal(2);
    });

    it('expect divine bond to give a minion +attack equal to its current health', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DivineBond }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
      // check to see if Silverguard Squire is a 5/4
      expect(silverguardSquire.getATK()).to.equal(5);
    });

    it('expect decimate to kill minions not near any general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const hailstoneGolem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 6, 2, gameSession.getPlayer1Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 2, gameSession.getPlayer1Id());
      const hailstoneGolem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 1, 2, gameSession.getPlayer2Id());
      const hailstoneGolem4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 2, 2, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Decimate }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(hailstoneGolem1.getIsRemoved()).to.equal(true);
      expect(hailstoneGolem2.getIsRemoved()).to.equal(false);
      expect(hailstoneGolem3.getIsRemoved()).to.equal(false);
      expect(hailstoneGolem4.getIsRemoved()).to.equal(true);
    });

    it('expect holy immolation to heal +4 health and deal 4 damage to all enemy minions and general near target', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const silverguardKnight = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardKnight }, 7, 2, gameSession.getPlayer1Id());
      const hailstoneGolem1 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 1, gameSession.getPlayer2Id());
      const hailstoneGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 8, 1, gameSession.getPlayer2Id());
      const hailstoneGolem3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 6, 1, gameSession.getPlayer2Id());
      const hailstoneGolem4 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 6, 2, gameSession.getPlayer2Id());
      const hailstoneGolem5 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 6, 3, gameSession.getPlayer2Id());
      const hailstoneGolem6 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 7, 3, gameSession.getPlayer2Id());
      const hailstoneGolem7 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 8, 3, gameSession.getPlayer2Id());
      silverguardKnight.setDamage(4);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.HolyImmolation }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 7, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardKnight.getHP()).to.equal(5);
      expect(hailstoneGolem1.getHP()).to.equal(2);
      expect(hailstoneGolem2.getHP()).to.equal(2);
      expect(hailstoneGolem3.getHP()).to.equal(2);
      expect(hailstoneGolem4.getHP()).to.equal(2);
      expect(hailstoneGolem5.getHP()).to.equal(2);
      expect(hailstoneGolem6.getHP()).to.equal(2);
      expect(hailstoneGolem7.getHP()).to.equal(2);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(21);
    });

    it('expect circle of life to deal 5 damage to enemy unit and heal 5 to your general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 0, 1, gameSession.getPlayer2Id());

      player1.remainingMana = 9;
      gameSession.getGeneralForPlayer1().setDamage(6);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CircleLife }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(24);
      expect(hailstoneGolem.getHP()).to.equal(1);
    });
  }); // end Spells describe
});
