ModifierBanded = require './modifierBanded'
Modifier = require './modifier'

class ModifierBandedDoubleAttack extends ModifierBanded

  type: "ModifierBandedDoubleAttack"
  @type: "ModifierBandedDoubleAttack"

  @modifierName: "Zealed: Lion's Growth"
  @description: "Double this minion's Attack at the end of your turn"

  fxResource: ["FX.Modifiers.ModifierZealed", "FX.Modifiers.ModifierZealedDoubleAttack"]

  onEndTurn:() ->
    super()

    if @getGameSession().getCurrentPlayer() is @getCard().getOwner()
      if @getCard().getATK() * 2 < 999 # arbitrary limit at the moment, don't want to push crazy huge number to firebase. also messes up the UI if attack gets too big
        modifierContextObject = Modifier.createContextObjectWithAttributeBuffs(@getCard().getATK())
      else
        modifierContextObject = Modifier.createContextObjectWithAttributeBuffs(999 - @getCard().getATK())
      modifierContextObject.appliedName = "Radiance"
      @getCard().getGameSession().applyModifierContextObject(modifierContextObject, @getCard())


module.exports = ModifierBandedDoubleAttack
