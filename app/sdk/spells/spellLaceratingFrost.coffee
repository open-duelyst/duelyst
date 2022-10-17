Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'

class SpellLaceratingFrost extends Spell

  targetType: CardType.Unit
  damageAmount: 2


  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    targetEntity = board.getCardAtPosition(applyEffectPosition, @targetType)

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@ownerId)
    damageAction.setSource(@)
    damageAction.setTarget(targetEntity)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

    entities = board.getFriendlyEntitiesAroundEntity(targetEntity, CardType.Unit, 1)
    for entity in entities
      @getGameSession().applyModifierContextObject(ModifierStunnedVanar.createContextObject(), entity)

  _postFilterPlayPositions: (validPositions) ->
    applyEffectPositions = []

    # can only target enemy general
    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if general?
      # apply spell on enemy General
      applyEffectPositions.push(general.getPosition())

    return applyEffectPositions

module.exports = SpellLaceratingFrost
