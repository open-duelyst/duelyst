ModifierStartTurnWatch = require './modifierStartTurnWatch'
UtilsGameSession = require 'app/common/utils/utils_game_session'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
_ = require 'underscore'
i18next = require 'i18next'

class ModifierStartTurnWatchEquipArtifact extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchEquipArtifact"
  @type:"ModifierStartTurnWatchEquipArtifact"

  @description:i18next.t("modifiers.start_turn_watch_equip_artifact_def")

  amount: 1 # number of artifacts to equip

  @createContextObject: (amount=1, includedCards, options) ->
    contextObject = super(options)
    contextObject.amount = amount
    contextObject.includedCards = includedCards
    return contextObject

  onTurnWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      for i in [0...@amount]
        artifactCard = @includedCards[@getGameSession().getRandomIntegerForExecution(@includedCards.length)] # random artifact
        cardDataOrIndexToPutInHand = artifactCard
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, cardDataOrIndexToPutInHand)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierStartTurnWatchEquipArtifact
