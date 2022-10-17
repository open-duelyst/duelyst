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

describe('unity', () => {
  describe('faction3', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction3.AltGeneral },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect dreamshaper to draw 2 cards only if you have another golem', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.InnerFocus }));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Dreamcarver }));

      const playCardFromHandAction1 = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction1);
      var hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.not.exist;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Dreamcarver }));
      const playCardFromHandAction2 = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction2);
      var hand1 = player1.getDeck().getCardsInHand();
      expect(hand1[0]).to.exist;
      expect(hand1[1]).to.exist;
    });

    it('expect blood of air to transform an enemy into a friendly 2/2 wind dervish', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 5, 1, gameSession.getPlayer2Id());
      kaidoAssassin.setDamage(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.BloodOfAir }));
      const action = player1.actionPlayCardFromHand(0, 5, 1);
      gameSession.executeAction(action);

      const dervish = board.getUnitAtPosition({ x: 5, y: 1 });
      expect(dervish.getHP()).to.equal(2);
      expect(dervish.getATK()).to.equal(2);
      expect(dervish.getIsExhausted()).to.equal(false);
      expect(dervish.ownerId).to.equal('player1_id');
    });

    it('expect thunderclap to summon minions destroyed with it', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Artifact.Thunderclap }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

      const valeHunter = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.ValeHunter }, 1, 2, gameSession.getPlayer2Id());

      const action = gameSession.getGeneralForPlayer1().actionAttack(valeHunter);
      gameSession.executeAction(action);

      const stolenHunter = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.ValeHunter);
      expect(stolenHunter[0].getId()).to.equal(SDK.Cards.Neutral.ValeHunter);
      expect(stolenHunter[0].ownerId).to.equal('player1_id');
    });

    it('expect wind striker to equip a Staff of Ykir when played from hand', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Windlark }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      const artifact = gameSession.getGeneralForPlayer1().getArtifactModifiers();
      expect(artifact[0].getSourceCard().getId()).to.equal(SDK.Cards.Artifact.StaffOfYKir);
    });

    it('expect sirocco to summon a skyrock golem for each other golem summoned from the action bar ONLY', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      player1.remainingMana = 9;

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HailstoneGolem }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Neutral.HailstoneGolem }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Sirocco }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
      gameSession.executeAction(playCardFromHandAction);

      var skyrock = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.SkyrockGolem);

      expect(skyrock[0].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      expect(skyrock[1].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      expect(skyrock[2]).to.not.exist;

      // now check if it ONLY works from action bar
      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.CircleOfDesiccation }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      player1.remainingMana = 9;
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction3.Sirocco }));
      var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(playCardFromHandAction);

      var skyrock = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.SkyrockGolem);

      expect(skyrock[0].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      expect(skyrock[1].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      expect(skyrock[2].getId()).to.equal(SDK.Cards.Neutral.SkyrockGolem);
      expect(skyrock[3]).to.not.exist;
    });
  });
});
