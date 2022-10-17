ModifierOpeningGambit =       require './modifierOpeningGambit'
ModifierStackingShadows =  require './modifierStackingShadows'
Stringifiers = require 'app/sdk/helpers/stringifiers'
Modifier = require './modifier'

class ModifierOpeningGambitBuffSelfByShadowTileCount extends ModifierOpeningGambit

  type: "ModifierOpeningGambitBuffSelfByShadowTileCount"
  @type: "ModifierOpeningGambitBuffSelfByShadowTileCount"

  @modifierName: "Opening Gambit"
  @description: "Gains %X for each of your Shadow Creep"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericBuff"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.numTilesAtSpawn = 0

    return p

  @createContextObject: (attackBuff = 0, maxHPBuff = 0, options = undefined) ->
    contextObject = super(options)
    perTileStatBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    perTileStatBuffContextObject.appliedName = "Drawn Power"
    contextObject.modifiersContextObjects = [perTileStatBuffContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  applyManagedModifiersFromModifiersContextObjects: (modifiersContextObjects, card) ->
    # apply once per sacrifice
    for i in [0...@_private.numTilesAtSpawn]
      super(modifiersContextObjects, card)

  onOpeningGambit: () ->
    super()

    @_private.numTilesAtSpawn = ModifierStackingShadows.getNumStacksForPlayer(this.getGameSession().getBoard(), @getCard().getOwner())
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierOpeningGambitBuffSelfByShadowTileCount
