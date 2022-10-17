ModifierDyingWish = require './modifierDyingWish'
Races = require 'app/sdk/cards/racesLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'
RemoveAction = require 'app/sdk/actions/removeAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierDyingWishGoldenGuide extends ModifierDyingWish

  type:"ModifierDyingWishGoldenGuide"
  @type:"ModifierDyingWishGoldenGuide"

  fxResource: ["FX.Modifiers.ModifierDyingWish"]

  onDyingWish: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()

      friendlyDervishes = []
      for unit in @getGameSession().getBoard().getUnits()
        if unit? and unit.getIsSameTeamAs(@getCard()) and !unit.getIsGeneral() and @getGameSession().getCanCardBeScheduledForRemoval(unit) and unit.getBelongsToTribe(Races.Dervish)
          friendlyDervishes.push(unit)

      if friendlyDervishes.length > 0
        unitToRemove = friendlyDervishes[@getGameSession().getRandomIntegerForExecution(friendlyDervishes.length)]
        position = unitToRemove.getPosition()

        removeAction = new RemoveAction(@getGameSession())
        removeAction.setOwnerId(@getCard().getOwnerId())
        removeAction.setTarget(unitToRemove)
        @getGameSession().executeAction(removeAction)

        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, {id: Cards.Faction3.GoldenGuide})
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

module.exports = ModifierDyingWishGoldenGuide
