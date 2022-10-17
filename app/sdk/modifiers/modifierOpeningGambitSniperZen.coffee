ModifierOpeningGambit = require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
SwapUnitAllegianceAction = require 'app/sdk/actions/swapUnitAllegianceAction'

class ModifierOpeningGambitSniperZen extends ModifierOpeningGambit

  type: "ModifierOpeningGambitSniperZen"
  @type: "ModifierOpeningGambitSniperZen"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->

    position = @getCard().getPosition()
    units = @getGameSession().getBoard().getEntitiesInRow(position.y, CardType.Unit)
    if units?
      for unit in units
        if unit? and !unit.getIsGeneral() and unit.getOwnerId() != @getCard().getOwnerId() and unit.getATK() <= 2
          a = new SwapUnitAllegianceAction(@getGameSession())
          a.setTarget(unit)
          @getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitSniperZen
