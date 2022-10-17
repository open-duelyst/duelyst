CONFIG = 'app/common/config'
UtilsJavascript = require 'app/common/utils/utils_javascript'
ModifierDyingWishSpawnEntity = require './modifierDyingWishSpawnEntity'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
_ = require("underscore")

class ModifierDyingWishSpawnEgg extends ModifierDyingWishSpawnEntity

  type:"ModifierDyingWishSpawnEgg"
  @type:"ModifierDyingWishSpawnEgg"

  @isKeyworded: false
  @keywordDefinition: "When this dies, it leaves behind a 0/1 Egg that hatches into %X"

  @modifierName:"Rebirth: Serpenti"
  @description: "Will leave behind a Serpenti egg when killed"

  fxResource: ["FX.Modifiers.ModifierRebirth"]

  @createContextObject: (cardDataOrIndexToSpawnAsEgg, spawnDescription, options) ->
    contextObject = super({id: Cards.Faction5.Egg}, spawnDescription = "", spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true,options)
    contextObject.cardDataOrIndexToSpawnAsEgg = cardDataOrIndexToSpawnAsEgg
    contextObject.spawnDescription = spawnDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = "a "+modifierContextObject.spawnDescription
      return @description.replace /%X/, replaceText
    else
      return @description

  onDyingWish: (action) ->
    #when this unit dies, if there isn't already a new unit queued to be spawned on the same tile where this unit died
    if !@getGameSession().getBoard().getCardAtPosition(@getCard().getPosition(), CardType.Unit, false, true)
      # add modifier so egg will hatch correct unit
      cardDataOrIndexToSpawn = @cardDataOrIndexToSpawn

      if cardDataOrIndexToSpawn?
        if _.isObject(cardDataOrIndexToSpawn)
          cardDataOrIndexToSpawn = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawn)
        else
          cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(cardDataOrIndexToSpawn).createNewCardData()

        cardDataOrIndexToSpawnAsEgg = @cardDataOrIndexToSpawnAsEgg
        if cardDataOrIndexToSpawnAsEgg?
          if _.isObject(cardDataOrIndexToSpawnAsEgg)
            cardDataOrIndexToSpawnAsEgg = UtilsJavascript.fastExtend({}, cardDataOrIndexToSpawnAsEgg)
          else
            cardDataOrIndexToSpawnAsEgg = @getGameSession().getCardByIndex(cardDataOrIndexToSpawnAsEgg).createNewCardData()

        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
        cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(cardDataOrIndexToSpawnAsEgg, "Serpenti"))
        #cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(cardDataOrIndexToSpawnAsEgg, cardDataOrIndexToSpawnAsEgg.getName()))

        # spawn an egg
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, cardDataOrIndexToSpawn)
        @getGameSession().executeAction(playCardAction)


module.exports = ModifierDyingWishSpawnEgg
