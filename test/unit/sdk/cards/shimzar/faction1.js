var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("shimzar", function() {
	describe("faction1", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction1.General},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect fighting spirit to give all friendly minions +1 health', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 1, gameSession.getPlayer1Id());
			var silverguardSquire3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 3, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FightingSpirit}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(silverguardSquire.getHP()).to.equal(5);
			expect(silverguardSquire2.getHP()).to.equal(5);
			expect(silverguardSquire3.getHP()).to.equal(5);
		});
		it('expect fighting spirit to draw a random f1/neutral battlepet', function() {
			for(var i = 0; i < 100; i++){
				var player1Deck = [
					{id: SDK.Cards.Faction1.General}
				];

				var player2Deck = [
					{id: SDK.Cards.Faction3.General}
				];

				// setup test session
				UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

				var gameSession = SDK.GameSession.getInstance();
				var board = gameSession.getBoard();
				var player1 = gameSession.getPlayer1();
				player1.remainingMana = 9;

				UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.FightingSpirit}));
				var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
				gameSession.executeAction(playCardFromHandAction);

				var hand = player1.getDeck().getCardsInHand();
				expect(hand[0]).to.exist;
				expect(hand[0].getRaceId()).to.equal(SDK.Races.BattlePet);
				expect(hand[0].getFactionId() === SDK.Factions.Faction1 || hand[0].getFactionId() === SDK.Factions.Neutral).to.equal(true);

				expect(hand[0].getBaseCardId()).to.not.equal(SDK.Cards.Faction5.Kin);

				SDK.GameSession.reset();
			}
		});
		it('expect fiz restore 2 health to a minion or general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;
			gameSession.getGeneralForPlayer1().setDamage(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.Fiz}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 0, 2);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getHP()).to.equal(22);
		});
		it('expect lucent beam to deal 2 damage to an enemy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LucentBeam}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
		});
		it('expect lucent beam to deal 4 damage to an enemy if something was healed this turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			gameSession.getGeneralForPlayer1().setDamage(5);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.LucentBeam}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);
			expect(playCardFromHandAction.getIsValid()).to.equal(true);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
		});
		it('expect sun wisp to draw you a card', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SunWisp}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
		});
		it('expect afterblaze to give a friendly minion +2/+4', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var heartSeeker = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.Heartseeker}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Afterblaze}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			expect(heartSeeker.getHP()).to.equal(5);
			expect(heartSeeker.getATK()).to.equal(3);
		});
		it('expect afterblaze to draw a card when cast on zeal unit', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var windblade = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.WindbladeAdept}, 5, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.InnerFocus}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Afterblaze}));
			var action = player1.actionPlayCardFromHand(0, 5, 1);
			gameSession.executeAction(action);

			gameSession.executeAction(gameSession.actionEndTurn());
			expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Spell.InnerFocus);
		});
		it('expect radiant dragoon to give a friendly minion +1 health at end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			var shiro = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.RadiantDragoon}, 1, 2, gameSession.getPlayer1Id());
			var maw1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Maw}, 1, 1, gameSession.getPlayer1Id());
			var maw2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Maw}, 2, 2, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());

	  		var healthbuff = 0;
			if(maw1.getHP() == 3){
				healthbuff++;
			}
			if(maw2.getHP() == 3){
				healthbuff++;
			}
			expect(healthbuff).to.equal(1);
		});
		it('expect sky burial to destroy a minion not nearby a general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 2, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SkyBurial}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(valeHunter.getIsRemoved()).to.equal(true);
		});
		it('expect sky burial to not destroy a minion nearby general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SkyBurial}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(valeHunter.getIsRemoved()).to.equal(false);
		});
		it('expect sunforge lancer to give your general +1 attack whenever anything is healed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var sunforge = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SunforgeLancer}, 1, 2, gameSession.getPlayer1Id());
			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 2, 2, gameSession.getPlayer2Id());
			valeHunter.setDamage(1);
			sunforge.setDamage(1);
			gameSession.getGeneralForPlayer1().setDamage(2);
			gameSession.getGeneralForPlayer2().setDamage(2);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 0, 2);
			gameSession.executeAction(playCardFromHandAction);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SundropElixir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 8, 2);
			gameSession.executeAction(playCardFromHandAction);
			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);
		});
		it('expect ironcliffe heart to transform a friendly minion into an ironcliffe guardian', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IroncliffeHeart}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var ironcliffe = board.getUnitAtPosition({x: 1, y: 2});
			expect(ironcliffe.getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
			expect(ironcliffe.getATK()).to.equal(3);
			expect(ironcliffe.getHP()).to.equal(10);
		});
		it('expect an ironcliffe hearted minion to not permanently provoke after being bounced back to hand', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 1, 2, gameSession.getPlayer1Id());
			var valeHunter2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 2, 2, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IroncliffeHeart}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var ironcliffe = board.getUnitAtPosition({x: 1, y: 2});
			expect(ironcliffe.getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
			expect(ironcliffe.getATK()).to.equal(3);
			expect(ironcliffe.getHP()).to.equal(10);

			expect(valeHunter2.hasActiveModifierClass(SDK.ModifierProvoked)).to.equal(true);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IceCage}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(valeHunter2.hasActiveModifierClass(SDK.ModifierProvoked)).to.equal(false);
		});
		it('expect ironcliffe heart to leave an exhausted minion exhausted', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ValeHunter}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IroncliffeHeart}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var ironcliffe = board.getUnitAtPosition({x: 1, y: 2});
			expect(ironcliffe.getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
			expect(ironcliffe.getATK()).to.equal(3);
			expect(ironcliffe.getHP()).to.equal(10);

			var action = ironcliffe.actionMove({ x: 2, y: 3 });
			gameSession.executeAction(action);

			expect(ironcliffe.getPosition().x).to.equal(1);
			expect(ironcliffe.getPosition().y).to.equal(2);
		});
		it('expect ironcliffe heart to leave a non-exhausted minion non-exhausted', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.SaberspineTiger}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.IroncliffeHeart}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var ironcliffe = board.getUnitAtPosition({x: 1, y: 2});
			expect(ironcliffe.getId()).to.equal(SDK.Cards.Faction1.IroncliffeGuardian);
			expect(ironcliffe.getATK()).to.equal(3);
			expect(ironcliffe.getHP()).to.equal(10);

			var action = ironcliffe.actionMove({ x: 2, y: 3 });
			gameSession.executeAction(action);

			expect(ironcliffe.getPosition().x).to.equal(2);
			expect(ironcliffe.getPosition().y).to.equal(3);
		});
		it('expect dawns eye to grant +4 attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.DawnsEye}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(6);
		});
		it('expect dawns eye to restore durability of all artifacts at the end of turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.DawnsEye}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.SunstoneBracers}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 1, 1));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			UtilsSDK.executeActionWithoutValidation(player1.actionPlayCardFromHand(0, 0, 0));

			var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers()
			expect(modifiers[0].getDurability()).to.equal(2);
			expect(modifiers[1].getDurability()).to.equal(2);

			gameSession.executeAction(gameSession.actionEndTurn());

			var modifiers = gameSession.getGeneralForPlayer1().getArtifactModifiers();
			expect(modifiers[0].getDurability()).to.equal(3);
			expect(modifiers[1].getDurability()).to.equal(3);
		});
		it('expect solarius to draw 2 extra cards at end of turn when zealed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var solarius1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Solarius}, 1, 2, gameSession.getPlayer1Id());
			var solarius2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.Solarius}, 2, 2, gameSession.getPlayer1Id()); //out of zeal range

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Magnetize}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Magnetize}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Magnetize}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Magnetize}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Magnetize}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Magnetize}));

			gameSession.executeAction(gameSession.actionEndTurn());

			var hand = player1.getDeck().getCardsInHand();
			expect(hand[0].getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize)
			expect(hand[1].getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize)
			expect(hand[2].getBaseCardId()).to.equal(SDK.Cards.Spell.Magnetize)
			expect(hand[3]).to.not.exist;
		});
		it('expect sky phalanx summon 3 silverguard knights near your general', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SkyPhalanx}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 1, 2);
			gameSession.executeAction(followupAction);
			var followupCard2 = followupAction.getCard().getCurrentFollowupCard();
			var followupAction2 = player1.actionPlayFollowup(followupCard2, 1, 3);
			gameSession.executeAction(followupAction2);

			var knight1 = board.getUnitAtPosition({x: 1, y: 1});
			var knight2 = board.getUnitAtPosition({x: 1, y: 2});
			var knight3 = board.getUnitAtPosition({x: 1, y: 3});

			expect(knight1.getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
			expect(knight2.getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
			expect(knight3.getId()).to.equal(SDK.Cards.Faction1.SilverguardKnight);
		});
	});
});
