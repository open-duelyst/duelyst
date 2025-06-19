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
  describe('minions', () => {
    beforeEach(() => {
      const player1Deck = [
        { id: SDK.Cards.Faction2.General },
      ];

      const player2Deck = [
        { id: SDK.Cards.Faction1.General },
      ];

      UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
    });

    afterEach(() => {
      SDK.GameSession.reset();
    });

    it('expect chakri avatar to gain +1/+1 on every allied spell cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const chakriAvatar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.ChakriAvatar }, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(chakriAvatar.getHP()).to.equal(3);
      expect(chakriAvatar.getATK()).to.equal(2);
    });

    it('expect back stab to give bonus damage and not get counter attacked (kaido assassin)', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const kaidoAssassin = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.KaidoAssassin }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());

      kaidoAssassin.refreshExhaustion();
      const action = kaidoAssassin.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(kaidoAssassin.getHP()).to.equal(3);
      expect(brightmossGolem.getHP()).to.equal(6);
    });

    it('expect tusk boar to return to hand at start of next turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const tuskBoar = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.TuskBoar }, 1, 1, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Faction2.TuskBoar);
    });

    it('expect celestial phantom to kill any unit it deals damage to', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const celestialPhantom = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.CelestialPhantom }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());

      celestialPhantom.refreshExhaustion();
      const action = celestialPhantom.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(celestialPhantom.getHP()).to.equal(1);
      expect(brightmossGolem.getIsRemoved()).to.equal(true);
    });

    it('expect gorehorn to gain +1/+1 on attack', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const goreHorn = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.GoreHorn }, 1, 1, gameSession.getPlayer1Id());
      const brightmossGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.BrightmossGolem }, 0, 1, gameSession.getPlayer2Id());

      goreHorn.refreshExhaustion();
      const action = goreHorn.actionAttack(brightmossGolem);
      gameSession.executeAction(action);

      expect(goreHorn.getHP()).to.equal(4);
      expect(goreHorn.getATK()).to.equal(4);
      expect(brightmossGolem.getHP()).to.equal(4);
    });

    it('expect gorehorn to not gain +1/+1 when counter attacking', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const goreHorn = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.GoreHorn }, 0, 1, gameSession.getPlayer1Id());
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer2Id());

      gameSession.executeAction(gameSession.actionEndTurn());

      silverguardSquire.refreshExhaustion();
      const action = silverguardSquire.actionAttack(goreHorn);
      gameSession.executeAction(action);

      expect(goreHorn.getHP()).to.equal(2);
      expect(goreHorn.getATK()).to.equal(3);
      expect(silverguardSquire.getHP()).to.equal(1);
    });

    it('expect jade monk to deal 1 damage to random enemy minion upon taking damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const jadeOgre = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.JadeOgre }, 0, 1, gameSession.getPlayer2Id());
      const silverguardSquire = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 1, 1, gameSession.getPlayer1Id());
      const silverguardSquire2 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 2, 1, gameSession.getPlayer1Id());
      const silverguardSquire3 = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction1.SilverguardSquire }, 3, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      const totalDamage = silverguardSquire.getDamage() + silverguardSquire2.getDamage() + silverguardSquire3.getDamage();

      expect(totalDamage).to.equal(3);
      expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(0);
    });

    it('expect lantern fox to give a phoenix fire when it takes damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const lanternFox = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.LanternFox }, 1, 2, gameSession.getPlayer1Id());
      const hailstoneGolem = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Neutral.HailstoneGolem }, 2, 2, gameSession.getPlayer2Id());

      lanternFox.refreshExhaustion();
      const action = lanternFox.actionAttack(hailstoneGolem);
      gameSession.executeAction(action);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);
    });

    it('expect four winds magi to deal 1 damage and heal your general for 1 on every allied spell cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const fourWindsMagi = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.MageOfFourWinds }, 1, 2, gameSession.getPlayer1Id());

      gameSession.getGeneralForPlayer1().setDamage(2);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(24);
      expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(24);
    });

    it('expect keshrai fanblade to make opponents spells cost 2 more on next turn only', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();
      const player2 = gameSession.getPlayer2();

      player1.remainingMana = 9;

      // var keshraiFanblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KeshraiFanblade}, 1, 2, gameSession.getPlayer1Id());
      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Faction2.KeshraiFanblade }));
      const action = player1.actionPlayCardFromHand(0, 1, 1);
      gameSession.executeAction(action);

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), { id: SDK.Cards.Spell.Magnetize }));

      gameSession.executeAction(gameSession.actionEndTurn());

      const hand = player2.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize);
      expect(cardDraw.getManaCost()).to.equal(3);
    });

    it('expect hamon bladeseeker to deal 2 damage to own general at start of every turn', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      const hamonBladeseeker = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.HamonBlademaster }, 1, 2, gameSession.getPlayer1Id());

      gameSession.executeAction(gameSession.actionEndTurn());
      gameSession.executeAction(gameSession.actionEndTurn());

      expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(23);
    });

    it('expect storm kage to give kage lightning on damaging spell cast', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const stormKage = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.StormKage }, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.PhoenixFire }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      const hand = player1.getDeck().getCardsInHand();
      const cardDraw = hand[0];
      expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.KageLightning);
    });

    it('expect storm kage to not give kage lightning if spell could not cause any damage', () => {
      const gameSession = SDK.GameSession.getInstance();
      const board = gameSession.getBoard();
      const player1 = gameSession.getPlayer1();

      player1.remainingMana = 9;

      const stormKage = UtilsSDK.applyCardToBoard({ id: SDK.Cards.Faction2.StormKage }, 0, 1, gameSession.getPlayer1Id());

      UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), { id: SDK.Cards.Spell.GhostLightning }));
      const playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
      gameSession.executeAction(playCardFromHandAction);

      expect(player1.getDeck().getHand()[0]).to.equal(null);
    });
  });
});
