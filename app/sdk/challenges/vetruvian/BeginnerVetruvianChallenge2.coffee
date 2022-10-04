Challenge = require("app/sdk/challenges/challenge")
Instruction 	= require 'app/sdk/challenges/instruction'
MoveAction 		= require 'app/sdk/actions/moveAction'
AttackAction 	= require 'app/sdk/actions/attackAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
EndTurnAction 	= require 'app/sdk/actions/endTurnAction'
Cards 			= require 'app/sdk/cards/cardsLookupComplete'
Deck 			= require 'app/sdk/cards/deck'
GameSession 			= require 'app/sdk/gameSession'
AgentActions = require 'app/sdk/agents/agentActions'
CONFIG = require 'app/common/config'
RSX = require('app/data/resources')
ChallengeCategory = require('app/sdk/challenges/challengeCategory')
_ = require 'underscore'
i18next = require('i18next')

# http://forums.duelyst.com/t/starter-challenge-vanar/7519

class BeginnerVetruvianChallenge2 extends Challenge

	@type: "BeginnerVetruvianChallenge2"
	type: "BeginnerVetruvianChallenge2"
	categoryType: ChallengeCategory.expert.type


	name: i18next.t("challenges.beginner_vetruvian_2_title")
	description:i18next.t("challenges.beginner_vetruvian_2_description")
	iconUrl: RSX.speech_portrait_vetruvian.img

	_musicOverride: RSX.music_battlemap_vetruv.audio

	otkChallengeStartMessage: i18next.t("challenges.beginner_vetruvian_2_start")
	otkChallengeFailureMessages: [
		i18next.t("challenges.beginner_vetruvian_2_fail")
	]

	battleMapTemplateIndex: 6
	snapShotOnPlayerTurn: 0
	startingManaPlayer: 9
	startingHandSizePlayer: 1

	constructor: ()->
		super()
		@hiddenUIElements = _.without(@hiddenUIElements, "SignatureCard")

	getMyPlayerDeckData: (gameSession)->
		return [
			{id: Cards.Faction3.AltGeneral}
			{id: Cards.Artifact.AnkhFireNova}
			{id: Cards.Neutral.ArtifactHunter}
			{id: Cards.Spell.AurorasTears}
		]

	getOpponentPlayerDeckData: (gameSession)->
		return [
			{id: Cards.Faction2.General}
			{id: Cards.TutorialSpell.TutorialFireOrb}
		]

	setupBoard: (gameSession) ->
		super(gameSession)

		myPlayerId = gameSession.getMyPlayerId()
		opponentPlayerId = gameSession.getOpponentPlayerId()

		general1 = gameSession.getGeneralForPlayerId(myPlayerId)
		general1.setPosition({x: 2, y: 2})
		general1.maxHP = 25
		general1.setDamage(25-10)
		general2 = gameSession.getGeneralForPlayerId(opponentPlayerId)
		general2.setPosition({x: 8, y: 2})
		general2.maxHP = 25
		general2.setDamage(25-10)

		# set signature card to be always ready for this session
		gameSession.getPlayer1().setIsSignatureCardActive(true)

		@applyCardToBoard({id: Cards.Faction3.WindShrike}, 1, 3, myPlayerId)
		@applyCardToBoard({id: Cards.Artifact.StaffOfYKir},2,2, myPlayerId)
		@applyCardToBoard({id: Cards.Faction3.NightfallMechanyst}, 6, 2, myPlayerId)

		@applyCardToBoard({id: Cards.Faction2.ScarletViper},4,2,opponentPlayerId)
		@applyCardToBoard({id: Cards.Neutral.WhistlingBlade},7,2,opponentPlayerId)
		@applyCardToBoard({id: Cards.Faction2.CelestialPhantom},8,4,opponentPlayerId)
		@applyCardToBoard({id: Cards.Faction2.Widowmaker},8,0,opponentPlayerId)

	setupOpponentAgent: (gameSession) ->
		super(gameSession)

		@_opponentAgent.addActionForTurn(0,AgentActions.createAgentSoftActionShowInstructionLabels([
			label:i18next.t("challenges.beginner_vetruvian_2_taunt")
			isSpeech:true
			yPosition:.6
			isPersistent:true
			isOpponent: true
		]))
		@_opponentAgent.addActionForTurn(0,AgentActions.createAgentActionPlayCardFindPosition(0,(() ->
			return [GameSession.getInstance().getGeneralForPlayer1().getPosition()]
		).bind(this)))


module.exports = BeginnerVetruvianChallenge2
