ModifierStartTurnWatch = require './modifierStartTurnWatch'
UtilsGameSession = require 'app/common/utils/utils_game_session'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup.coffee'
_ = require 'underscore'

class ModifierStartTurnWatchPlaySpell extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchPlaySpell"
  @type:"ModifierStartTurnWatchPlaySpell"

  @description: "At the start of your turn, cast %X"

  @createContextObject: (cardDataOrIndexToCast, cardDescription,options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToCast = cardDataOrIndexToCast
    contextObject.cardDescription = cardDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.cardDescription
    else
      return @description

  onTurnWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      playCardAction = new PlayCardAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, @cardDataOrIndexToCast)
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierStartTurnWatchPlaySpell
