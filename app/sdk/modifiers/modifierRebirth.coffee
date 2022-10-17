CONFIG = 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
ModifierOnDyingSpawnEntity = require './modifierOnDyingSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
_ = require("underscore")

i18next = require('i18next')

class ModifierRebirth extends ModifierOnDyingSpawnEntity

  type:"ModifierRebirth"
  @type:"ModifierRebirth"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.rebirth_def")

  @modifierName:i18next.t("modifiers.rebirth_name")

  fxResource: ["FX.Modifiers.ModifierRebirth"]

  @createContextObject: (options) ->
    contextObject = super({id: Cards.Faction5.Egg}, spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true,options)
    return contextObject

  onDying: (action) ->
    #when this unit dies, if there isn't already a new unit queued to be spawned on the same tile where this unit died
    if !@getGameSession().getBoard().getCardAtPosition(@getCard().getPosition(), CardType.Unit, false, true)
      # add modifier so egg will hatch correct unit
      cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn
      if cardDataOrIndexToSpawn?
        if _.isObject(cardDataOrIndexToSpawn)
          cardDataOrIndexToSpawn = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawn)
        else
          cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()

        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(@getCard().createNewCardData(), null))

        # spawn an egg
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, cardDataOrIndexToSpawn)
        @getGameSession().executeAction(playCardAction)


module.exports = ModifierRebirth
