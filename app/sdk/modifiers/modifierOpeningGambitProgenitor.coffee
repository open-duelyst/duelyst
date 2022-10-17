ModifierOpeningGambit = require './modifierOpeningGambit'
ModifierEgg = require './modifierEgg'
Cards = require 'app/sdk/cards/cardsLookupComplete'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierOpeningGambitProgenitor extends ModifierOpeningGambit

  type:"ModifierOpeningGambitProgenitor"
  @type:"ModifierOpeningGambitProgenitor"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->

    ownerId = @getOwnerId()
    myPosition = @getCard().getPosition()

    if @getGameSession().getIsRunningAsAuthoritative()

      friendlyMinions = []
      for unit in @getGameSession().getBoard().getUnits()
        if unit?.getOwnerId() is ownerId and unit.getBaseCardId() isnt Cards.Faction5.Egg and !unit.getIsGeneral() and !(unit.getPosition().x is myPosition.x and unit.getPosition().y is myPosition.y)
          friendlyMinions.push(unit)

      playerOffset = 0
      if @getCard().isOwnedByPlayer1() then playerOffset = -1 else playerOffset = 1

      for minion in friendlyMinions
        spawnPosition = {x:minion.getPosition().x+playerOffset, y:minion.getPosition().y}
        if !@getGameSession().getBoard().getObstructionAtPositionForEntity(spawnPosition, minion)

          egg = {id: Cards.Faction5.Egg}
          egg.additionalInherentModifiersContextObjects ?= []
          egg.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(minion.createNewCardData(), minion.getName()))

          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, egg)
          spawnAction.setSource(@getCard())
          @getGameSession().executeAction(spawnAction)

module.exports = ModifierOpeningGambitProgenitor
