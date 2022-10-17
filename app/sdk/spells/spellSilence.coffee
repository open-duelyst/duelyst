Spell =           require './spell'
IntentType =         require 'app/sdk/intentType'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =       require './spellFilterType'
ModifierSilence =     require 'app/sdk/modifiers/modifierSilence'
_ = require 'underscore'

class SpellSilence extends Spell

  targetType: CardType.Entity
  spellFilterType: SpellFilterType.NeutralDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entities = board.getEntitiesAtPosition(applyEffectPosition, true)
    for entity in entities
      if entity?
        @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), entity)

  _getEntitiesForFilter: () ->
    entities = super(true) # allow untargetable (tile) entities
    silenceableEntities = []
    for entity in entities
      # both tiles and units can be dispelled
      if entity? and (entity.getType() == CardType.Tile or entity.getType() == CardType.Unit)
        # only add the position as valid once, for the first
        if !_.contains(silenceableEntities, entity)
          silenceableEntities.push(entity)

    return silenceableEntities


module.exports = SpellSilence
