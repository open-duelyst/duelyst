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

describe('faction2', () => {
  describe('spells', () => {
    beforeEach(() => {
      // define test decks.  Spells do not work.  Only add minions and generals this way
      const player1Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
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

    it('expect inner focus to reactivate unit with 3 or less attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const action = kaidoAssassin.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(3);
      expect(brightmossGolem.getHP()).to.equal(6);
    });

    it('expect inner focus to not be castable on unit with more than 3 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));

      // define the valid positions of true strike
      const hand = player1.getDeck().getCardsInHand();
      const innerFocus = hand[0];
      const validTargetPositions = innerFocus.getValidTargetPositions();
      const innerFocus2 = player1.getDeck().getCardInHandAtIndex(0); // an easier way of calling it

      // make sure that there's only 1 valid target position and that it equals the Kaido Assassin
      // other way is to loop through valid target positions and make sure neither generals are in the list
      expect(validTargetPositions[0]).to.exist;
      expect(validTargetPositions[0].x === 1 && validTargetPositions[0].y === 1).to.equal(true);
      expect(validTargetPositions[1]).to.not.exist;

      // attempt to play Inner Focus on the golem anyway
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
      gameSession.executeAction(playCardFromHandAction);

      // the action should not be allowed
      expect(playCardFromHandAction.getIsValid()).to.equal(false);
    });

    it('expect juxtaposition to switch 2 units positions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.Juxtaposition }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 8, 1);
      gameSession.executeAction(followupAction);

      expect(followupAction.getIsValid()).to.equal(true);

      expect(kaidoAssassin.getPosition().x).to.equal(8);
      expect(kaidoAssassin.getPosition().y).to.equal(1);
      expect(brightmossGolem.getPosition().x).to.equal(1);
      expect(brightmossGolem.getPosition().y).to.equal(1);
    });

    it('expect mana vortex to reduce the mana cost of the next spell cast this turn only', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ManaVortex }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(1);

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(2);
    });

    it('expect mana vortex to not reduce the mana cost of spells after a spell with a follow-up is played', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ManaVortex }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(1);

      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MistDragonSeal }));
      const action = player1.actionPlayCardFromHand(1, 5, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);
      expect(followupAction.getIsValid()).to.equal(true);
      expect(heartSeeker.getPosition().x).to.equal(0);
      expect(heartSeeker.getPosition().y).to.equal(1);

      var hand = player1.getDeck().getCardsInHand();
      var cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(cardDraw.getManaCost()).to.equal(2);
    });
    /* it('expect mana vortex to draw you 1 extra card at end of turn', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ManaVortex}));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));

      gameSession.executeAction(gameSession.actionEndTurn());
      expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);
    }); */
    it('expect ancestral divination to draw you a card for each friendly minion on the battlefield', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));

      var silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      var silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 1, gameSession.getPlayer1Id());
      var silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.AncestralDivination }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.SpiralTechnique);
      expect(hand[2].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect ghost lightning to deal 1 damage to all enemy minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer2Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 8, 1, gameSession.getPlayer2Id());
      const brightmossGolem2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 7, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(silverguardSquire.getHP()).to.equal(3);
      expect(brightmossGolem.getHP()).to.equal(8);
      expect(brightmossGolem2.getHP()).to.equal(9); // to make sure our own don't get targeted
    });

    it('expect mist walking to move your general 2 spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MistWalking }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
      gameSession.executeAction(playCardFromHandAction);

      // throw in an extra test to make sure I can't cast it anywhere
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MistWalking }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 6, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getPosition().x).to.equal(2);
      expect(gameSession.getGeneralForPlayer1().getPosition().y).to.equal(2);
    });

    it('expect saberspine seal to give minion or general +3 attack until end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SaberspineSeal }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
    });

    it('expect artifact defiler to remove all artifacts on the enemy general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Artifact.SunstoneBracers }));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(0, 1, 1));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(1, 1, 1));
      UtilsSDK.executeActionWithoutValidation(player2.actionPlayCardFromHand(2, 1, 1));

      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(5);

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.ArtifactDefiler }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(2);
    });

    it('expect deathstrike seal to allow a friendly minion to kill any enemy minion it damages', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 5, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.DeathstrikeSeal }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 5, 1));

      heartSeeker.refreshExhaustion();
      const action = heartSeeker.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(brightmossGolem.getIsRemoved()).to.equal(true);
    });

    it('expect eight gates to increase all spell damage by 2 until end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.EightGates }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(20);
    });

    it('expect mist dragon seal to give a friendly unit +1/+1', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MistDragonSeal }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      gameSession.executeAction(player1.actionEndFollowup(followupCard));

      expect(heartSeeker.getHP()).to.equal(2);
      expect(heartSeeker.getATK()).to.equal(2);
    });

    it('expect mist dragon seal to teleport a friendly minion across the map', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.MistDragonSeal }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);
      const followupCard = action.getCard().getCurrentFollowupCard();
      const followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
      gameSession.executeAction(followupAction);

      expect(followupAction.getIsValid()).to.equal(true);
      expect(heartSeeker.getPosition().x).to.equal(0);
      expect(heartSeeker.getPosition().y).to.equal(1);
    });

    it('expect phoenix fire to deal 3 damage to an enemy general or minion', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      // cast spiral technique on player 1
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(22);
    });

    it('expect killing edge to give a friendly minion +4/+2', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const heartSeeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.Heartseeker }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.KillingEdge }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(heartSeeker.getHP()).to.equal(3);
      expect(heartSeeker.getATK()).to.equal(5);
    });

    it('expect killing edge to draw an extra card at end of turn when cast on backstab unit', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.KillingEdge }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));

      gameSession.executeAction(gameSession.actionEndTurn());
      expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect onyx bear seal to turn enemy minion into 0/2 Panddo', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.OnyxBearSeal }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const panddo = board.getUnitAtPosition({ x: 5, y: 1 });

      expect(panddo.getATK()).to.equal(0);
      expect(panddo.getHP()).to.equal(2);
    });

    it('expect Panndo cannot be attacked by generals or minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      const kaidoAssassin2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 6, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.OnyxBearSeal }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const panddo = board.getUnitAtPosition({ x: 5, y: 1 });

      kaidoAssassin2.refreshExhaustion();
      var action = kaidoAssassin2.actionAttack(panddo);
      gameSession.executeAction(action);

      expect(panddo.getATK()).to.equal(0);
      expect(panddo.getHP()).to.equal(2);
    });

    it('expect Panndo when buffed can attack and be counter attacked', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      const kaidoAssassin2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 6, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.OnyxBearSeal }));
      var action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const panddo = board.getUnitAtPosition({ x: 5, y: 1 });

      gameSession.executeAction(gameSession.actionEndTurn());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.SaberspineSeal }));
      var action = player2.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      panddo.refreshExhaustion();
      var action = panddo.actionAttack(kaidoAssassin2);
      gameSession.executeAction(action);

      expect(kaidoAssassin2.getIsRemoved()).to.equal(true);
      expect(panddo.getIsRemoved()).to.equal(true);
    });

    it('expect twin strike to deal 2 damage to 2 enemy minions', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      const kaidoAssassin2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 6, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TwinStrike }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(action.getIsValid()).to.equal(true);

      expect(kaidoAssassin.getHP()).to.equal(1);
      expect(kaidoAssassin2.getHP()).to.equal(1);
    });

    it('expect twin strikes to draw an extra card at end of turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      const kaidoAssassin2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 6, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TwinStrike }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));

      gameSession.executeAction(gameSession.actionEndTurn());

      expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect twin strikes cannot be cast unless 2 or more enemy minions are on board', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.TwinStrike }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      expect(action.getIsValid()).to.equal(false);

      expect(kaidoAssassin.getHP()).to.equal(3);
    });

    it('expect heavens eclipse to draw 3 spell cards from deck', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.MaskOfShadows }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.ChakriAvatar }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KaidoAssassin }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.MaskOfShadows }));

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.HeavensEclipse }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      expect(hand[2].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
      expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
      expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.InnerFocus);
    });

    it('expect spiral technique to deal 8 damage to a minion or general', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      // cast spiral technique on player 1
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.SpiralTechnique }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(17);
    });
  }); // end Spells describe
});
