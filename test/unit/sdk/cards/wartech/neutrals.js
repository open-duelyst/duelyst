var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var ModifierForcefield = require('app/sdk/modifiers/modifierForcefield');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("wartech", function() {
	describe("neutrals", function(){
		beforeEach(function () {
			var player1Deck = [
				{id: SDK.Cards.Faction6.General},
			];

			var player2Deck = [
				{id: SDK.Cards.Faction4.AltGeneral},
			];

			UtilsSDK.setupSession(player1Deck, player2Deck, true, true);
		});

		afterEach(function () {
			SDK.GameSession.reset();
		});

		it('expect replicant to get other replicants from deck when played', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Replicant}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Replicant}));
      		var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getDeck().getCardInHandAtIndex(0).getId()).to.equal(SDK.Cards.Neutral.Replicant);

		});
		it('expect metaltooth to gain rush only if another mech is in play', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			var metaltooth = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Metaltooth}, 1, 1, gameSession.getPlayer1Id());

			var action = metaltooth.actionMove({ x: 2, y: 1});
			gameSession.executeAction(action);
			expect(metaltooth.getPosition().x).to.equal(1);
			expect(metaltooth.getPosition().y).to.equal(1);

			var metal2th = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Metaltooth}, 1, 3, gameSession.getPlayer1Id());

			var action = metal2th.actionMove({ x: 2, y: 3});
			gameSession.executeAction(action);
			expect(metal2th.getPosition().x).to.equal(2);
			expect(metal2th.getPosition().y).to.equal(3);

		});
		it('expect recombobulous to move a minion one space in a random direction', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 4, 4, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Recombobulus}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 4, 4);
			gameSession.executeAction(followupAction);

			var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 4, 4, gameSession.getPlayer1Id());

			var squires = board.getEntitiesAroundEntity(silverguardSquire2);
			expect(squires.length).to.equal(1);
			expect(squires[0].getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);

		});
		it('expect redsteel minos to gain +2/+2 when your BBS is cast', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var redsteelMinos = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.RedsteelMinos}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(0, 1);
			gameSession.executeAction(action);

			expect(redsteelMinos.getHP()).to.equal(5);
			expect(redsteelMinos.getATK()).to.equal(4);

		});
		it('expect timekeeper to progress buildings by 1 turn', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction4.VoidTalon}));
			var action = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(action);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Timekeeper}));
			var action = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(action);

			var voidTalon = board.getUnitAtPosition({x:1,y:1});
			expect(voidTalon.getATK()).to.equal(6);

		});
		it('expect capricious marauder to change owners when a friendly minion is destroyed', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var valeHunter = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ValeHunter}, 5, 2, gameSession.getPlayer2Id());
			var capriciousMarauder = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.CapriciousMarauder}, 5, 3, gameSession.getPlayer2Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 5, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(capriciousMarauder.ownerId).to.equal('player1_id');

		});
		it('expect impervious giago to gain 2 attack when attacked', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			var imperviousGiago = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.ImperviousGiago}, 7, 2, gameSession.getPlayer1Id());

			gameSession.executeAction(gameSession.actionEndTurn());
			var action = gameSession.getGeneralForPlayer2().actionAttack(imperviousGiago);
			gameSession.executeAction(action);

			expect(imperviousGiago.getATK()).to.equal(3);
		});
		it('expect lost artificer to make the first artifact you equip each turn cost 1 less', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var artificer = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Artificer}, 1, 3, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getRemainingMana()).to.equal(8);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Artifact.StaffOfYKir}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getRemainingMana()).to.equal(6);
		});
		it('expect architect-T2k5 to draw you a card when he or another friendly minion finishes building', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ArchitectT2K5}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ArchitectT2K5}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ArchitectT2K5}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ArchitectT2K5}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ArchitectT2K5}));

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ArchitectT2K5}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RescueRX}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			var hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0]).to.equal(undefined);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.ArchitectT2K5); // from natural draw
			expect(hand1[1].getId()).to.equal(SDK.Cards.Neutral.ArchitectT2K5); // from architect finishing
			expect(hand1[2]).to.equal(undefined);

			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Neutral.ArchitectT2K5); // from natural draw
			expect(hand1[1].getId()).to.equal(SDK.Cards.Neutral.ArchitectT2K5); // from architect finishing
			expect(hand1[2].getId()).to.equal(SDK.Cards.Neutral.ArchitectT2K5); // from natural draw
			expect(hand1[3].getId()).to.equal(SDK.Cards.Neutral.ArchitectT2K5); // from rescueRx finishing
			expect(hand1[4]).to.equal(undefined);
		});
		it('expect bloodbound mentor to put a copy of your bbs in your hand when you use your bbs', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			// cycle turns until you can use bloodborn spell
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());
			gameSession.executeAction(gameSession.actionEndTurn());

			var bbmentor = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.FidgetSpinner}, 4, 3, gameSession.getPlayer1Id());

			var action = player1.actionPlaySignatureCard(0, 1);
			gameSession.executeAction(action);

			hand1 = player1.getDeck().getCardsInHand();
			expect(hand1[0].getId()).to.equal(SDK.Cards.Spell.Warbird);
		});
		it('expect deceptibot to summon a mech from your deck nearby whenever it kills an enemy', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));

			var deceptibot = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Deceptibot}, 5, 1, gameSession.getPlayer1Id());
			var dragonlark = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 6, 1, gameSession.getPlayer2Id());
			deceptibot.refreshExhaustion();

			var action = deceptibot.actionAttack(dragonlark);
			gameSession.executeAction(action);

			var mech = board.getEntitiesAroundEntity(deceptibot);
			expect(mech.length).to.equal(1);
			expect(mech[0].getId()).to.equal(SDK.Cards.Neutral.Mechaz0rHelm);
		});
		it('expect qorrhlmaa to remove all minions that cost 2 or less from both players decks', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			var player2 = gameSession.getPlayer2();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.WhistlingBlade}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.RockPulverizer}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.WhistlingBlade}));
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Spell.PhoenixFire}));

			expect(player1.getDeck().getDrawPile().length).to.equal(5);
			expect(player2.getDeck().getDrawPile().length).to.equal(5);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Qorrhlmaa}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(player1.getDeck().getDrawPile().length).to.equal(2);
			expect(player2.getDeck().getDrawPile().length).to.equal(2);
		});
		it('expect silver to share mech keywords between all mechs whenever its summoned or another is summoned', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var ranged = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mechaz0rCannon}, 5, 1, gameSession.getPlayer1Id());
			var frenzy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.Mechaz0rSword}, 6, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Silver}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);

			var silver = board.getUnitAtPosition({x:1, y:2});

			expect(ranged.hasModifierClass(SDK.ModifierFrenzy));
			expect(ranged.hasModifierClass(SDK.ModifierRanged));
			expect(frenzy.hasModifierClass(SDK.ModifierFrenzy));
			expect(frenzy.hasModifierClass(SDK.ModifierRanged));
			expect(silver.hasModifierClass(SDK.ModifierFrenzy));
			expect(silver.hasModifierClass(SDK.ModifierRanged));

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rChassis}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			var forcefield = board.getUnitAtPosition({x:2,y:2});

			expect(ranged.hasModifierClass(ModifierForcefield));
			expect(frenzy.hasModifierClass(ModifierForcefield));
			expect(silver.hasModifierClass(ModifierForcefield));
			expect(forcefield.hasModifierClass(SDK.ModifierRanged));
			expect(forcefield.hasModifierClass(SDK.ModifierFrenzy));
			expect(forcefield.hasModifierClass(ModifierForcefield));
		});
		it('expect project omega to gain +2/+2 for each mech summoned this game', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
			gameSession.executeAction(playCardFromHandAction);
			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rHelm}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 2);
			gameSession.executeAction(playCardFromHandAction);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.ProjectOmega}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 3, 2);
			gameSession.executeAction(playCardFromHandAction);

			var omega = board.getUnitAtPosition({x:3, y:2});
			expect(omega.getHP()).to.equal(5);
			expect(omega.getATK()).to.equal(5);

			player1.remainingMana = 9;

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Mechaz0rChassis}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 4, 2);
			gameSession.executeAction(playCardFromHandAction);

			expect(omega.getHP()).to.equal(7);
			expect(omega.getATK()).to.equal(7);
		});
		it('expect reqliquarian when used on a neutral minion to gain an artifact with +attack equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.PrimusFist}, 5, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);
		});
		it('expect reqliquarian when used on a lyonar minion to gain an artifact with +attack and healing when attacking equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.IroncliffeGuardian}, 5, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			gameSession.getGeneralForPlayer1().setDamage(10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(5);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(10);

			var action = gameSession.getGeneralForPlayer1().actionAttack(enemy);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(9);
		});
		it('expect reqliquarian when used on a songhai minion to gain an artifact with +attack and damage to a random enemy when attacking equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.KaidoAssassin}, 5, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			var action = gameSession.getGeneralForPlayer1().actionAttack(enemy);
			gameSession.executeAction(action);

			var totalDamage = enemy.getDamage() + gameSession.getGeneralForPlayer2().getDamage();

			expect(totalDamage).to.equal(6); // 4 from general attack + 2 from artifact random proc
		});
		it('expect reqliquarian when used on an abyssian minion to gain an artifact with +attack and steal health from enemy general when attacking equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction4.SpectralRevenant}, 5, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			gameSession.getGeneralForPlayer1().setDamage(10);

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(8);

			var action = gameSession.getGeneralForPlayer1().actionAttack(enemy);
			gameSession.executeAction(action);

			expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(6);
			expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(6);
		});
		it('expect reqliquarian when used on a vetruvian minion to gain an artifact with +attack and revive X number of fallen minions when attacking equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var lark1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 3, 1, gameSession.getPlayer1Id());
			var lark2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 4, 1, gameSession.getPlayer1Id());
			var lark3 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 6, 1, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.Tempest}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction3.OrbWeaver}, 5, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			var action = gameSession.getGeneralForPlayer1().actionAttack(enemy);
			gameSession.executeAction(action);

			var dragonlarks = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.SpottedDragonlark);
			var orbweavers = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction3.OrbWeaver);
			expect(dragonlarks.length + orbweavers.length).to.equal(2);
		});
		it('expect reqliquarian when used on a magmar minion to gain an artifact with +attack and give friendly minions +x/+x when attacking equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var lark1 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 3, 1, gameSession.getPlayer1Id());
			var lark2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.SpottedDragonlark}, 4, 1, gameSession.getPlayer1Id());

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction5.Phalanxar}, 5, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 5, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(8);

			var action = gameSession.getGeneralForPlayer1().actionAttack(enemy);
			gameSession.executeAction(action);

			expect(lark1.getHP()).to.equal(7);
			expect(lark1.getATK()).to.equal(8);
			expect(lark2.getHP()).to.equal(7);
			expect(lark2.getATK()).to.equal(8);
		});
		it('expect reqliquarian when used on a vanar minion to gain an artifact with +attack and summons X 3/3 howlers nearby when attacking equal to that minions attack', function() {
			var gameSession = SDK.GameSession.getInstance();
			var board = gameSession.getBoard();
			var player1 = gameSession.getPlayer1();
			player1.remainingMana = 9;

			var neutral = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction6.CrystalCloaker}, 3, 1, gameSession.getPlayer1Id());
			var enemy = UtilsSDK.applyCardToBoard({id: SDK.Cards.Neutral.WhistlingBlade}, 1, 2, gameSession.getPlayer1Id());

			UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Reliquarian}));
			var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
			gameSession.executeAction(playCardFromHandAction);
			var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
			var followupAction = player1.actionPlayFollowup(followupCard, 3, 1);
			gameSession.executeAction(followupAction);

			expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(4);

			var action = gameSession.getGeneralForPlayer1().actionAttack(enemy);
			gameSession.executeAction(action);

			var howlers = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction6.ShadowVespyr);
			expect(howlers.length).to.equal(2);
		});
	});
});
