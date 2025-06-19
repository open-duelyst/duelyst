const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../../../'));
require('coffeescript/register');
const expect = require('chai').expect;
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const UtilsSDK = require('test/utils/utils_sdk');
const _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe('monthlies', () => {
  describe('month 7', () => {
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

    it('expect arrow whistler to give other ranged minions +1 attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const arrowWhistler = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArrowWhistler }, 7, 2, gameSession.getPlayer1Id());
      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 7, 3, gameSession.getPlayer1Id());

      expect(arrowWhistler.getATK()).to.equal(2);
      expect(valeHunter.getATK()).to.equal(2);

      const arrowWhistler2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ArrowWhistler }, 6, 2, gameSession.getPlayer1Id());
      expect(arrowWhistler.getATK()).to.equal(3);
      expect(valeHunter.getATK()).to.equal(3);
    });

    it('expect golden justicar to allow your other minions with provoke to move 2 additional spaces', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const goldenJusticar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.GoldenJusticar }, 7, 2, gameSession.getPlayer1Id());
      const silverguardKnight = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardKnight }, 7, 3, gameSession.getPlayer1Id());

      silverguardKnight.refreshExhaustion();
      const action = silverguardKnight.actionMove({ x: 3, y: 3 });
      gameSession.executeAction(action);

      expect(board.getUnitAtPosition({ x: 3, y: 3 }).getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
    });

    /* Test disabled: failing
    it('expect skywing to make your flying minions cost 1 less', function() {
      var gameSession = SDK.GameSession.getInstance();
      var board = gameSession.getBoard();
      var player1 = gameSession.getPlayer1();

      var skywing = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Skywing}, 7, 2, gameSession.getPlayer1Id());

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction3.Oserix}));

      var hand = player1.getDeck().getCardsInHand();
      expect(hand[0].getManaCost()).to.equal(6);

      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      expect(player1.remainingMana).to.equal(3);
    });
    */

    it('expect unseven to summon a card with dying wish from your hand when it dies', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pyromancer }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pyromancer }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.Dilotas }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pyromancer }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Pyromancer }));

      const unseven = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.Unseven }, 7, 2, gameSession.getPlayer1Id());
      unseven.refreshExhaustion();
      unseven.setDamage(3);

      const action = unseven.actionAttack(gameSession.getGeneralForPlayer2());
      gameSession.executeAction(action);

      const dioltas = board.getUnitAtPosition({ x: 7, y: 2 });

      expect(dioltas.getId()).to.equal(SDK.Cards.Neutral.Dilotas);
    });
  });
});
