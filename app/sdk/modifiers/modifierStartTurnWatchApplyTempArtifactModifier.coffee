ModifierStartTurnWatch = require './modifierStartTurnWatch'

class ModifierStartTurnWatchApplyTempArtifactModifier extends ModifierStartTurnWatch

  type: "ModifierStartTurnWatchApplyTempArtifactModifier"
  @type: "ModifierStartTurnWatchApplyTempArtifactModifier"

  modifierContextObject: null

  onActivate: () ->
    super()

    # when activated on owner's turn, immediately apply modifier for this turn
    if @getCard().isOwnersTurn()
      general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
      @getGameSession().applyModifierContextObject(@modifierContextObject, general, @)

  @createContextObject: (modifierContextObject, options) ->
    contextObject = super(options)
    modifierContextObject.durationEndTurn = 1
    modifierContextObject.isRemovable = false
    contextObject.modifierContextObject = modifierContextObject
    return contextObject

  onTurnWatch: () ->
    super()

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    @getGameSession().applyModifierContextObject(@modifierContextObject, general, @)

module.exports = ModifierStartTurnWatchApplyTempArtifactModifier
