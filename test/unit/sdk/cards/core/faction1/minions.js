var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("faction1", function() {
	describe("minions", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction2.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect arclyte sentinel to give a unit +2 attack and -2 health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			//begin placing things on board
			var hailstoneGolem = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.HailstoneGolem}, 0, 1, gameSession.getPlayer2Id());

			//put arclyte sentinel in hand
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.ArclyteSentinel}));

			// give Lyonar player 9 mana
			player1.remainingMana = 9;

			//play the followup
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);
			var followupCard = action.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 1);
			gameSession.executeAction(followupAction);

			expect(followupAction.getIsValid()).to.equal(true);
			expect(hailstoneGolem.getHP()).to.equal(4);
			expect(hailstoneGolem.getATK()).to.equal(6);
		});

		it('expect sunstone templar to dispel a unit on attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var sunstoneTemplar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SunstoneTemplar}, 0, 1, gameSession.getPlayer1Id());
			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 1, gameSession.getPlayer2Id());

			sunstoneTemplar.refreshExhaustion();
			var action = sunstoneTemplar.actionAttack(valeHunter);
			gameSession.executeAction(action);

			expect(valeHunter.getIsSilenced()).to.equal(true);
			expect(valeHunter.isRanged()).to.equal(false);
			expect(valeHunter.getHP()).to.equal(1);
		});
		it('expect zeal to be active while in range of general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var windbladeAdept = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 0, 1, gameSession.getPlayer1Id());

			expect(windbladeAdept.hasActiveModifierClass(SDK.ModifierBanded)).to.equal(true);
			windbladeAdept.refreshExhaustion();
			var action = windbladeAdept.actionMove({ x: 2, y: 1 });
			gameSession.executeAction(action);
			expect(windbladeAdept.getPosition().x).to.equal(2);
			expect(windbladeAdept.getPosition().y).to.equal(1);
			expect(windbladeAdept.hasActiveModifierClass(SDK.ModifierBanded)).to.equal(false);
		});
		it('expect lightchaser to gain +1/+1 when a friendly or enemy minion or general is healed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var lightChaser = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Lightchaser}, 0, 1, gameSession.getPlayer1Id());

			gameSession.getGeneralForPlayer1().setDamage(2);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(lightChaser.getHP()).to.equal(3);
			expect(lightChaser.getATK()).to.equal(4);
		});
		it('expect sunriser to deal 2 damage to all nearby enemy units when a friendly or enemy minion or general is healed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			//Play sunriser next to enemy general
			var sunriser = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Sunriser}, 7, 2, gameSession.getPlayer1Id());
			var fourWindsMagi1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 7, 1, gameSession.getPlayer2Id());
			var fourWindsMagi2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 8, 1, gameSession.getPlayer2Id());
			var fourWindsMagi3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 6, 1, gameSession.getPlayer2Id());
			var fourWindsMagi4 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 6, 2, gameSession.getPlayer2Id());
			var fourWindsMagi5 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 6, 3, gameSession.getPlayer2Id());
			var fourWindsMagi6 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 7, 3, gameSession.getPlayer2Id());
			var fourWindsMagi7 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.MageOfFourWinds}, 8, 3, gameSession.getPlayer2Id());

			gameSession.getGeneralForPlayer1().setDamage(2);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(fourWindsMagi1.getHP()).to.equal(2);
			expect(fourWindsMagi2.getHP()).to.equal(2);
			expect(fourWindsMagi3.getHP()).to.equal(2);
			expect(fourWindsMagi4.getHP()).to.equal(2);
			expect(fourWindsMagi5.getHP()).to.equal(2);
			expect(fourWindsMagi6.getHP()).to.equal(2);
			expect(fourWindsMagi7.getHP()).to.equal(2);
			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(23);
		});
		it('expect suntide maiden to be healed to full health at end of turn when in zeal range', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var suntideMaiden = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SuntideMaiden}, 0, 1, gameSession.getPlayer1Id());

			suntideMaiden.setDamage(2);

			expect(suntideMaiden.getHP()).to.equal(4);
			gameSession.executeAction(gameSession.actionEndTurn());
			expect(suntideMaiden.getHP()).to.equal(6);
		});
		it('expect elyx stormblade to grant allied minions and general +1 movement', function() {
				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();

				var elyxStormblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 0, 1, gameSession.getPlayer1Id());

				expect(elyxStormblade.getSpeed()).to.equal(3);
				expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(3);
		});
		it('expect elyx stormblade grant enemy minions and general +1 movement if mind controlled instead of your own', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var elyxStormblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 0, 1, gameSession.getPlayer1Id());

			var swapAction = new SDK.SwapUnitAllegianceAction(gameSession);
			swapAction.setTarget(elyxStormblade);
			UtilsSDK.executeActionWithoutValidation(swapAction);

			expect(elyxStormblade.getSpeed()).to.equal(3);
			expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(2);
			expect(gameSession.getGeneralForPlayer2().getSpeed()).to.equal(3);
		});
		it('expect elyx stormblade to not grant +1 movement to allied minions and general when dead or dispeled', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var elyxStormblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 0, 1, gameSession.getPlayer1Id());
			gameSession.applyModifierContextObject(SDK.ModifierSilence.createContextObject(), elyxStormblade)
			//elyxStormblade.silence();    ALSO WORKS

			expect(elyxStormblade.getSpeed()).to.equal(2);
			expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(2);
		});
		it('expect elyx stormblade to not be able to move when sand trapped', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var elyxStormblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 5, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.DrainMorale}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(elyxStormblade.getSpeed()).to.equal(0);
			expect(gameSession.getGeneralForPlayer2().getSpeed()).to.equal(3);
		});
		it('expect elyx stormblade to grant allied minions and general +2 movement if two elyx stormblades out', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var elyxStormblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 0, 1, gameSession.getPlayer1Id());
			var elyxStormblade2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.ElyxStormblade}, 1, 1, gameSession.getPlayer1Id());

			expect(elyxStormblade.getSpeed()).to.equal(4);
			expect(gameSession.getGeneralForPlayer1().getSpeed()).to.equal(4);
		});
		it('expect grandmaster zir to become your general when you die', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
		});
		it('expect ruby rifter to draw a card and get buffed when general dies with a grandmaster zir on the field', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());
			var rubyRifter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RubyRifter}, 2, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			expect(rubyRifter.getATK()).to.equal(6);
			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getId()).to.equal(SDK.Cards.Spell.PhoenixFire);
			expect(hand[1]).to.not.exist;
		});
		it('expect songhai to play a zendo and then lyonar to die and turn into zir and zir acts like a battle pet', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var zendo = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.GrandmasterZendo}, 6, 1, gameSession.getPlayer2Id());
			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(grandmasterZir.getPosition().x).to.not.equal(0);
		});
		it('expect lyonar to die and turn into zir and songhai plays zendo and zir acts like a battle pet', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			gameSession.executeAction(gameSession.actionEndTurn());
			var zendo = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.GrandmasterZendo}, 6, 1, gameSession.getPlayer2Id());
			gameSession.executeAction(gameSession.actionEndTurn());

			expect(grandmasterZir.getPosition().x).to.not.equal(0);
		});
		it('expect grandmaster zir to be able to equip artifacts', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.SunstoneBracers}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);
		});
		it('expect grandmaster zir to replace another grandmaster zir when it dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			var grandmasterZir2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 4, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
		});
		it('expect with 3 zirs on board each will cycle through becoming the general when one dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());
			var grandmasterZir2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 4, 1, gameSession.getPlayer1Id());
			var grandmasterZir3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 5, 1, gameSession.getPlayer1Id());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
		});
		it('expect with a Grandmaster Zir on board and artifacts equipped that Argeon will lose the artifacts when dying', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.SunstoneBracers}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.ArclyteRegalia}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			//UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			//UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 2));

			gameSession.getGeneralForPlayer1().setDamage(24);

			// CHECK ARTIFACT DURABILITY
			var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
			expect(modifiers[0].getDurability()).to.equal(3);
			expect(modifiers[1].getDurability()).to.equal(3);
			expect(modifiers[2].getDurability()).to.equal(3);

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());
			var grandmasterZir2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 4, 1, gameSession.getPlayer1Id());
			var grandmasterZir3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 5, 1, gameSession.getPlayer1Id());

			// Kill argeon
			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(25);
			UtilsSDK.executeActionWithoutValidation(damageAction);

			/*var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
			expect(modifiers[0].getDurability()).to.equal(2); // +1
			expect(modifiers[1].getDurability()).to.equal(2); // +2
			expect(modifiers[2].getDurability()).to.equal(2); // +2*/

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			//playing a new artifact
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.AdamantineClaws}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(9);
		});
		it('expect grandmaster zir to not become your general when you die if its dispeled', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());
			gameSession.applyModifierContextObject(SDK.ModifierSilence.createContextObject(), grandmasterZir)

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(0);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(2);
		});
		it('expect grandmaster zir to become your enemys general when hes mind controlled and enemy general dies', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

			var swapAction = new SDK.SwapUnitAllegianceAction(gameSession);
			swapAction.setTarget(grandmasterZir);
			UtilsSDK.executeActionWithoutValidation(swapAction);

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer2());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer2().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer2().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer2().getATK()).to.equal(5);
		});
		it('expect grandmaster zir + blind scorch + psychic conduit + own general suicide = temporarily become Zir but then lose the game when psychic conduit wears off', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Blindscorch}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PsychicConduit}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 1);
			gameSession.executeAction(playCardFromHandAction);

			expect(grandmasterZir.ownerId).to.equal(player1.getPlayerId());

			var damageAction = new SDK.DamageAction(gameSession);
			damageAction.setTarget(gameSession.getGeneralForPlayer1());
			damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
			UtilsSDK.executeActionWithoutValidation(damageAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(12);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(0);

			gameSession.executeAction(gameSession.actionEndTurn());

			expect(gameSession.getGeneralForPlayer1()).to.not.exist;
			expect(gameSession.isOver()).to.equal(true);
		});
	});
});
