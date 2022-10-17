ModifierEquipFriendlyArtifactWatch = require './modifierEquipFriendlyArtifactWatch'
Modifier = require './modifier'

class ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost extends ModifierEquipFriendlyArtifactWatch

  type:"ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost"
  @type:"ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost"

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  buffName: null

  @createContextObject: (buffName, options) ->
    contextObject = super(options)
    contextObject.buffName = buffName
    return contextObject

  onEquipFriendlyArtifactWatch: (action, artifact) ->

    if artifact?
      manaCost = artifact.getManaCost()
      if manaCost? and manaCost > 0
        attackModifier = Modifier.createContextObjectWithAttributeBuffs(manaCost,0)
        attackModifier.appliedName = @buffName
        @getCard().getGameSession().applyModifierContextObject(attackModifier, @getCard())

module.exports = ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost
