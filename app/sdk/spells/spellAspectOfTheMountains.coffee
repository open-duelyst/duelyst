SpellAspectBase = require './spellAspectBase'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'
_ = require 'underscore'

class SpellAspectOfTheMountains extends SpellAspectBase

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction) # transform target into a seismic elemental

    # damage ALL nearby minions around target location
    applyEffectPosition = {x: x, y: y}
    for entity in board.getCardsWithinRadiusOfPosition(applyEffectPosition, CardType.Unit, 1, false)
      if !entity.getIsGeneral() and entity.getOwnerId() isnt @getOwnerId() # don't damage Generals or friendly units
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@ownerId)
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = SpellAspectOfTheMountains
