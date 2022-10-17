SpellAspectBase = require './spellAspectBase'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class SpellAspectOfTheDrake extends SpellAspectBase

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # transform target into a frost drake

    # apply flying modifier to friendly units around original target position
    applyEffectPosition = {x: x, y: y}
    for entity in board.getCardsWithinRadiusOfPosition(applyEffectPosition, CardType.Unit, 1, false)
      if entity.getOwnerId() is @getOwnerId() # friendly (based on spell caster) unit around target unit
        if !entity.getIsGeneral() # don't apply to Generals
          @getGameSession().applyModifierContextObject(ModifierFlying.createContextObject(), entity)

module.exports = SpellAspectOfTheDrake
