Modifier = require './modifier'

class ModifierDoubleHealthStat extends Modifier

  type: "ModifierDoubleHealthStat"
  @type: "ModifierDoubleHealthStat"

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  @description: "Doubled Health"

  constructor: (gameSession) ->
    @attributeBuffs = {}
    @attributeBuffs["maxHP"] = 0
    super(gameSession)

  onApplyToCardBeforeSyncState: () ->
    super()
    @attributeBuffs["maxHP"] = @getCard().getHP()

module.exports = ModifierDoubleHealthStat
