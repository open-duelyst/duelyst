Modifier = require './modifier'

class ModifierDoubleAttackStat extends Modifier

  type: "ModifierDoubleAttackStat"
  @type: "ModifierDoubleAttackStat"

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  @description: "Doubled Attack"

  constructor: (gameSession) ->
    @attributeBuffs = {}
    @attributeBuffs["atk"] = 0
    super(gameSession)

  onApplyToCardBeforeSyncState: () ->
    super()
    @attributeBuffs["atk"] = @getCard().getATK()


module.exports = ModifierDoubleAttackStat
