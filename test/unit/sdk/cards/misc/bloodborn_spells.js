var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../../../'))
require('coffee-script/register')
var expect = require('chai').expect;
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var UtilsSDK = require('test/utils/utils_sdk');
var _ = require('underscore');
var Promise = require('bluebird');

// disable the logger for cleaner test output
Logger.enabled = false;

describe("bloodborn spells", function() {

	beforeEach(function () {
		// define test decks.  Spells do not work.  Only add minions and generals this way
		/*			var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];
	*/
	// setup test session
	//UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	/* // USE THIS TO GET THE CURRENT CARDS IN YOUR HAND
	var deck = player1.getDeck();
	console.log(deck.getCardsInHand(1));
	*/
});

afterEach(function () {
	SDK.GameSession.reset();
});


it('expect argeon highmaynes roar to give a friendly minion +2 attack', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction1.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
	var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 4, 4, gameSession.getPlayer1Id());

	var action = player1.actionPlaySignatureCard(4, 4);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(false); //too far away from general to work

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	expect(silverguardSquire.getHP()).to.equal(4);
	expect(silverguardSquire.getATK()).to.equal(3);
});
it('expect ziran sunforges afterglow to restore 3 health to a minion', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction1.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardKnight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 1, 1, gameSession.getPlayer1Id());
	silverguardKnight.setDamage(4);
	expect(silverguardKnight.getHP()).to.equal(1);

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	expect(silverguardKnight.getHP()).to.equal(4);
});
it('expect brome to summon a crestfallen in front of him', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction1.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);
	var knight = board.getUnitAtPosition({x:1, y:2});

	expect(knight.getId()).to.equal(SDK.Cards.Faction1.KingsGuard);
});
it('expect kaelos xaans blink to teleport a friendly minion up to 2 spaces', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);
	var followupCard = action.getCard().getCurrentFollowupCard();
	var followupAction = player1.actionPlayFollowup(followupCard, 3, 1);
	gameSession.executeAction(followupAction);

	var silverguardSquire = board.getUnitAtPosition({x:3, y:1});
	expect(silverguardSquire.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
});
it('expect reva eventides crimson heart to summon a heartseeker', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var heartseeker = board.getUnitAtPosition({x:1, y:1});

	expect(heartseeker.getHP()).to.equal(1);
	expect(heartseeker.getATK()).to.equal(1);
	expect(heartseeker.getId()).to.equal(SDK.Cards.Faction2.Heartseeker);
});
it('expect shidai to put a random spellsword into the action bar that cannot be replaced', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));

	action = player1.actionReplaceCardFromHand(0);
	//expect(action.getIsValid()).to.equal(false);
	gameSession.executeAction(action);

	var hand1 = player1.getDeck().getCardsInHand();
	var spellsword = false;
	if (hand1[0].getId() == SDK.Cards.Spell.SpellSword1)
		spellsword = true;
	else if (hand1[0].getId() == SDK.Cards.Spell.SpellSword2)
		spellsword = true;
	else if (hand1[0].getId() == SDK.Cards.Spell.SpellSword3)
		spellsword = true;
	else if (hand1[0].getId() == SDK.Cards.Spell.SpellSword4)
		spellsword = true;

	expect(spellsword).to.equal(true);
});
it('expect shidais first spellsword to draw a card at end of turn', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpellSword1}));
	var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
	gameSession.executeAction(playCardFromHandAction);

	gameSession.executeAction(gameSession.actionEndTurn());

	var hand = player1.getDeck().getCardsInHand();
	expect(hand[0].getId()).to.equal(SDK.Cards.Neutral.Maw);
	expect(hand[1].getId()).to.equal(SDK.Cards.Neutral.Maw);
});
it('expect shidais second spellsword to allow you to move one more space this turn', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpellSword2}));
	var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 2);
	gameSession.executeAction(playCardFromHandAction);

	var action = gameSession.getGeneralForPlayer1().actionMove({ x: 3, y: 2 });
	gameSession.executeAction(action);

	expect(action.getIsValid()).to.equal(true);
	var newGeneral = board.getUnitAtPosition({x:3, y:2});
	expect(newGeneral.getId()).to.equal(SDK.Cards.Faction2.ThirdGeneral);
});
it('expect shidais third spellsword to move an enemy minion one space', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer2Id());

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpellSword3}));
	var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(playCardFromHandAction);
	var followupCard = playCardFromHandAction.getCard().getCurrentFollowupCard();
	var followupAction = player1.actionPlayFollowup(followupCard, 2, 1);
	gameSession.executeAction(followupAction);

	var newLocation = board.getUnitAtPosition({x:2, y:1});
	expect(newLocation.getId()).to.equal(SDK.Cards.Faction1.SilverguardSquire);
});
it('expect shidais fourth spellsword to give a friendly minion or general backstab(2) until end of turn', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction2.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 2, 1, gameSession.getPlayer1Id());
	var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer2Id());

	silverguardSquire.refreshExhaustion();

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.SpellSword4}));
	var playCardFromHandAction = player1.actionPlayCardFromHand(0, 2, 1);
	gameSession.executeAction(playCardFromHandAction);

	var action = silverguardSquire.actionAttack(silverguardSquire2);
	gameSession.executeAction(action);

	expect(silverguardSquire2.getDamage()).to.equal(3);
	expect(silverguardSquire.getDamage()).to.equal(0);
});
it('expect zirix starstriders wind shroud to summon a 2/2 iron dervish with rush on a random nearby tile next to your general', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction3.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var dervish = UtilsSDK.getEntityOnBoardById(SDK.Cards.Faction3.IronDervish);
	expect(dervish.getId()).to.equal(SDK.Cards.Faction3.IronDervish);
});
it('expect scioness sajs psionic recall to deal double damage to minions', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction3.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var silverguardKnight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 1, 1, gameSession.getPlayer2Id());
	var action = gameSession.getGeneralForPlayer1().actionAttack(silverguardKnight);
	gameSession.executeAction(action);

	expect(silverguardKnight.getHP()).to.equal(1);
});
it('expect ciphyron to lower a minions attack by 2 until their next turn', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction3.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var ironcliffe = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.IroncliffeGuardian}, 1, 1, gameSession.getPlayer2Id());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	expect(ironcliffe.getATK()).to.equal(1);
	gameSession.executeAction(gameSession.actionEndTurn());
	expect(ironcliffe.getATK()).to.equal(1);
	gameSession.executeAction(gameSession.actionEndTurn());
	expect(ironcliffe.getATK()).to.equal(3);
});
it('expect lilithe blightchasers shadowspawn to summon two 1/1 wraithlings near your general', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction4.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var wraithlings = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Faction4.Wraithling);
	expect(wraithlings[0].getId()).to.equal(SDK.Cards.Faction4.Wraithling);
	expect(wraithlings[1].getId()).to.equal(SDK.Cards.Faction4.Wraithling);
	expect(wraithlings.length).to.equal(2);
});
it('expect cassyva soulreapers abyssal scar to deal 1 damage to a minion and make it summon a shadowcreep if it dies', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction4.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardKnight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 1, 1, gameSession.getPlayer2Id());
	silverguardKnight.setDamage(4);

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	var shadowCreep1 = board.getTileAtPosition({x:1,y:1},true);

	expect(shadowCreep1.getOwnerId()).to.equal(player1.getPlayerId());
	expect(shadowCreep1.getId()).to.equal(SDK.Cards.Tile.Shadow);
});
it('expect maehv to kill a friendly minion to summon a 4/4 husk on its space and deal 2 damage to self', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction4.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardKnight = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardKnight}, 1, 1, gameSession.getPlayer1Id());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var husk = board.getUnitAtPosition({x:1,y:1});

	expect(husk.getId()).to.equal(SDK.Cards.Faction4.Husk);
	expect(gameSession.getGeneralForPlayer1().getDamage()).to.equal(2);
});
it('expect starhorn the seekers ability to make both players draw a card', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction5.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();
	var player2 = gameSession.getPlayer2();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Maw}));
	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.Maw}));

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var hand1 = player1.getDeck().getCardsInHand();
	var hand2 = player2.getDeck().getCardsInHand();
	expect(hand1[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
	expect(hand2[0].getBaseCardId()).to.equal(SDK.Cards.Neutral.Maw);
});
it('expect vaath the immortals overload to give your general +1 attack permanently', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction5.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();
	var player2 = gameSession.getPlayer2();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	expect(gameSession.getGeneralForPlayer1().getATK()).to.equal(3);
});
it('expect ragnora to summon a 3/1 celerity egg', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction5.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();
	var player2 = gameSession.getPlayer2();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var egg = board.getUnitAtPosition({x:1,y:1});
	expect(egg.getId()).to.equal(SDK.Cards.Faction5.Egg);

	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	egg = board.getUnitAtPosition({x:1,y:1});
	expect(egg.getId()).to.equal(SDK.Cards.Faction5.Gibblegup);
});
it('expect faie bloodwings warbird to deal 2 damage to all minions and generals in the generals column', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 8, 1, gameSession.getPlayer1Id());
	var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 8, 3, gameSession.getPlayer2Id());

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	expect(silverguardSquire2.getDamage()).to.equal(2);
	expect(silverguardSquire.getDamage()).to.equal(0);
	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
});
it('expect kara winterblades kinetic coil to give minions in your hand +1/+1', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Faction1.SilverguardSquire}));

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var action = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(action);

	var silverguardSquire = board.getUnitAtPosition({x:1, y:1});

	expect(silverguardSquire.getHP()).to.equal(5);
	expect(silverguardSquire.getATK()).to.equal(2);
});
it('expect grandmaster zir to continue drawing bloodborn spells', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction1.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	var grandmasterZir = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.GrandmasterZir}, 0, 1, gameSession.getPlayer1Id());

	var damageAction = new SDK.DamageAction(gameSession);
	damageAction.setTarget(gameSession.getGeneralForPlayer1());
	damageAction.setDamageAmount(gameSession.getGeneralForPlayer1().getHP());
	UtilsSDK.executeActionWithoutValidation(damageAction);

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardSquire = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 1, gameSession.getPlayer1Id());
	var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 4, 4, gameSession.getPlayer1Id());

	var action = player1.actionPlaySignatureCard(4, 4);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(false); //too far away from general to work

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	expect(silverguardSquire.getHP()).to.equal(4);
	expect(silverguardSquire.getATK()).to.equal(3);
});
it('expect kara winterblades kinetic coil to give ash mephyt and all copies +1/+1', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.AltGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AshMephyt}));

	player1.remainingMana = 9;

	var action = player1.actionPlaySignatureCard(1, 1);
	gameSession.executeAction(action);

	var action = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(action);

	var ashmephyts = UtilsSDK.getEntitiesOnBoardById(SDK.Cards.Neutral.AshMephyt);

	expect(ashmephyts[0].getATK()).to.equal(3);
	expect(ashmephyts[0].getHP()).to.equal(4);
	expect(ashmephyts[1].getATK()).to.equal(3);
	expect(ashmephyts[1].getHP()).to.equal(4);
	expect(ashmephyts[2].getATK()).to.equal(3);
	expect(ashmephyts[2].getHP()).to.equal(4);
});
it('expect ilena to stun a nearby enemy minion', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.ThirdGeneral},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var silverguardSquire2 = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction1.SilverguardSquire}, 1, 2, gameSession.getPlayer2Id());

	var action = player1.actionPlaySignatureCard(1, 2);
	gameSession.executeAction(action);

	expect(silverguardSquire2.hasModifierClass(SDK.ModifierStunned)).to.equal(true);
});
it('expect mana vortex to reduce bloodborn spell costs', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.ManaVortex}));
	var playCardFromHandAction = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(playCardFromHandAction);

	player1.remainingMana = 0;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
});
it('expect keshrai fanblade to increase bloodborn spell costs', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();
	var player2 = gameSession.getPlayer2();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	player2.remainingMana = 9;

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Faction2.KeshraiFanblade}));
	var action = player2.actionPlayCardFromHand(0, 8, 1);
	gameSession.executeAction(action);

	gameSession.executeAction(gameSession.actionEndTurn());

	player1.remainingMana = 3;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
	expect(player1.remainingMana).to.equal(0);
});
it('expect archon spellbinder to not increase bloodborn spell costs', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();
	var player2 = gameSession.getPlayer2();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	player2.remainingMana = 9;

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer2Id(), {id: SDK.Cards.Neutral.ArchonSpellbinder}));
	var action = player2.actionPlayCardFromHand(0, 8, 1);
	gameSession.executeAction(action);

	gameSession.executeAction(gameSession.actionEndTurn());

	player1.remainingMana = 2;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
	expect(player1.remainingMana).to.equal(1);
});
it('expect manaforger to not decrease bloodborn spell costs', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	gameSession.executeAction(gameSession.actionEndTurn());

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.Manaforger}));
	var action = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(action);

	player1.remainingMana = 2;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
	expect(player1.remainingMana).to.equal(1);
});
it('expect spell watch cards to be affected by bloodborn spells', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	var chakriAvatar = UtilsSDK.applyCardToBoard({id: SDK.Cards.Faction2.ChakriAvatar}, 0, 1, gameSession.getPlayer1Id());

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
	expect(chakriAvatar.getHP()).to.equal(3);
	expect(chakriAvatar.getATK()).to.equal(2);
});
it('expect alcuin loremaster to return bloodborn spells', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	player1.remainingMana = 9;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AlcuinLoremaster}));
	var action = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(action);
	var action = player1.actionPlayCardFromHand(0, 8, 2);
	gameSession.executeAction(action);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
});
it('expect twilight sorcerer to return bloodborn spells', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	player1.remainingMana = 9;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.TwilightMage}));
	var action = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(action);
	var action = player1.actionPlayCardFromHand(0, 8, 2);
	gameSession.executeAction(action);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(4);
});
it('expect bloodborn spells to be replaceable', function() {
	var player1Deck = [
		{id: SDK.Cards.Faction6.General},
	];

	var player2Deck = [
		{id: SDK.Cards.Faction2.General},
	];

	UtilsSDK.setupSession(player1Deck, player2Deck, true, true);

	var gameSession = SDK.GameSession.getInstance();
	var board = gameSession.getBoard();
	var player1 = gameSession.getPlayer1();

	// cycle turns until you can use bloodborn spell
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());
	gameSession.executeAction(gameSession.actionEndTurn());

	player1.remainingMana = 9;

	var action = player1.actionPlaySignatureCard(8, 2);
	gameSession.executeAction(action);
	expect(action.getIsValid()).to.equal(true);

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInDeckAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Spell.PhoenixFire}));

	UtilsSDK.executeActionWithoutValidation(new SDK.PutCardInHandAction(gameSession, gameSession.getPlayer1Id(), {id: SDK.Cards.Neutral.AlcuinLoremaster}));
	var action = player1.actionPlayCardFromHand(0, 1, 1);
	gameSession.executeAction(action);

	var action = player1.actionReplaceCardFromHand(0);
	gameSession.executeAction(action);

	var hand = player1.getDeck().getCardsInHand();
	var cardDraw = hand[0];
	expect(cardDraw.getBaseCardId()).to.equal(SDK.Cards.Spell.PhoenixFire);

	expect(gameSession.getGeneralForPlayer2().getDamage()).to.equal(2);
});
});
