CONFIG = require 'app/common/config'
Modifier = require './modifier'
Races = require 'app/sdk/cards/racesLookup'
ModifierBelongsToAllRaces = require 'app/sdk/modifiers/modifierBelongsToAllRaces'

class ModifierFeralu extends Modifier

  type:"ModifierFeralu"
  @type:"ModifierFeralu"

  @modifierName:"Feralu"
  @description:""

  _filterPotentialCardInAura: (card) ->
    return (card.getRaceId() isnt Races.Neutral or card.hasModifierClass(ModifierBelongsToAllRaces)) and super(card)

module.exports = ModifierFeralu
