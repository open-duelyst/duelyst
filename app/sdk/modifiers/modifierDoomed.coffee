ModifierEndTurnWatch = require './modifierEndTurnWatch'
KillAction = require 'app/sdk/actions/killAction'
i18next = require 'i18next'

class ModifierDoomed extends ModifierEndTurnWatch

  type: "ModifierDoomed"
  @type: "ModifierDoomed"

  @modifierName:i18next.t("modifiers.doomed_name")
  @description:i18next.t("modifiers.doomed_1_def")

  fxResource: ["FX.Modifiers.ModifierDoomed"]

  isRemovable: false
  maxStacks: 1

  onTurnWatch: () ->
    super()

    if @numEndTurnsElapsed > 1 # don't kill self on same end turn this modifier was applied!
      entityToKill = @getCard()
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()))
      killAction.setTarget(entityToKill)
      @getGameSession().executeAction(killAction)
      @getGameSession().removeModifier(@)

module.exports = ModifierDoomed
