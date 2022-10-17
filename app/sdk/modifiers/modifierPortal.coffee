Modifier = require './modifier'

i18next = require('i18next')

class ModifierPortal extends Modifier

  type:"ModifierPortal"
  @type:"ModifierPortal"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.structure_def")
  @isHiddenToUI: true

  @modifierName:i18next.t("modifiers.structure_name")
  @description:null

  maxStacks: 1
  isRemovable: false

  fxResource: ["FX.Modifiers.ModifierPortal"]

  onActivate: () ->
    super()
    @stopMove()
    @stopAttack()

  # apply "cannot move" and "cannot attack" modifiers as submodifier of this
  # applying as a submodifier so these modifier can be removed seperately from the "structure" modifier itself
  # (ex spell - your Obelysks can now move and attack)
  stopMove: () ->
    speedBuffContextObject = Modifier.createContextObjectOnBoard()
    speedBuffContextObject.attributeBuffs = {"speed": 0}
    speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
    speedBuffContextObject.attributeBuffsFixed = ["speed"]
    speedBuffContextObject.isHiddenToUI = true
    speedBuffContextObject.isCloneable = false
    @getGameSession().applyModifierContextObject(speedBuffContextObject, @getCard(), @)

  stopAttack: () ->
    attackBuffContextObject = Modifier.createContextObjectOnBoard()
    attackBuffContextObject.attributeBuffs = {"atk": 0}
    attackBuffContextObject.attributeBuffsAbsolute = ["atk"]
    attackBuffContextObject.attributeBuffsFixed = ["atk"]
    attackBuffContextObject.isHiddenToUI = true
    attackBuffContextObject.isCloneable = false
    @getGameSession().applyModifierContextObject(attackBuffContextObject, @getCard(), @)

  # if we ever want to allow this Structure to move, remove the cannot move hidden submodifier
  allowMove: () ->
    for subMod in @getSubModifiers()
      if subMod.getBuffsAttribute("speed")
        @getGameSession().removeModifier(subMod)

  # if we ever want to allow this Structure to attack, remove the cannot attack hidden submodifier
  allowAttack: () ->
    for subMod in @getSubModifiers()
      if subMod.getBuffsAttribute("atk")
        @getGameSession().removeModifier(subMod)

module.exports = ModifierPortal
