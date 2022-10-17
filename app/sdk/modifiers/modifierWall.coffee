Modifier = require './modifier'
RemoveAction =  require 'app/sdk/actions/removeAction'

i18next = require('i18next')

class ModifierWall extends Modifier

  type:"ModifierWall"
  @type:"ModifierWall"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.wall_def")

  @modifierName:i18next.t("modifiers.wall_name")
  @description: null

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierWall"]

  onActivate: () ->
    # apply "cannot move" speed modifier as a submodifier of this
    # applying as a submodifier so speed modifier can be removed without seperately from the "wall" modifier itself
    # (ex spell - your Walls can now move)
    speedBuffContextObject = Modifier.createContextObjectOnBoard()
    speedBuffContextObject.attributeBuffs = {"speed": 0}
    speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
    speedBuffContextObject.attributeBuffsFixed = ["speed"]
    speedBuffContextObject.isHiddenToUI = true
    speedBuffContextObject.isCloneable = false
    @getGameSession().applyModifierContextObject(speedBuffContextObject, @getCard(), @)
    super()

  onRemoveFromCard: ()  ->
    # if modifier removed for reason other than entity dying (dispelled for example)
    if @getGameSession().getCanCardBeScheduledForRemoval(@getCard())
      # then remove entity from the board (just remove, don't die)
      removeAction = @getGameSession().createActionForType(RemoveAction.type)
      removeAction.setOwnerId(@getCard().getOwnerId())
      removeAction.setSource(@getCard())
      removeAction.setTarget(@getCard())
      @getGameSession().executeAction(removeAction)

    super()

  # if we ever want to allow this Wall to move, remove the cannot move hidden submodifier
  allowMove: () ->
    for subMod in @getSubModifiers()
      @getGameSession().removeModifier(subMod)

module.exports = ModifierWall
