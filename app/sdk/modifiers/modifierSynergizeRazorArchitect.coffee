ModifierSynergize = require './modifierSynergize'
ModifierStunnedVanar = require './modifierStunnedVanar'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierSynergizeRazorArchitect extends ModifierSynergize

  type:"ModifierSynergizeRazorArchitect"
  @type:"ModifierSynergizeRazorArchitect"

  onSynergize: (action) ->
    super(action)
    minionPosition = @getCard().getPosition()

    entities = @getGameSession().getBoard().getEntitiesInRow(minionPosition.y, CardType.Unit)
    if entities?
      for entity in entities
        if entity? and entity.getOwnerId() != @getCard().getOwnerId() and !entity.getIsGeneral()
          damageAction = new DamageAction(this.getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          damageAction.setSource(@getCard())
          damageAction.setTarget(entity)
          damageAction.setDamageAmount(1)
          @getGameSession().executeAction(damageAction)

          stunModifier = ModifierStunnedVanar.createContextObject()
          @getGameSession().applyModifierContextObject(stunModifier, entity)

module.exports = ModifierSynergizeRazorArchitect
