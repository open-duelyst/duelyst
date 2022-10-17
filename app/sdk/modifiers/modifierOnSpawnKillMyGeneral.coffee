Modifier = require './modifier'
ModifierSilence =   require 'app/sdk/modifiers/modifierSilence'
KillAction = require 'app/sdk/actions/killAction'
DieAction = require 'app/sdk/actions/dieAction'
SwapGeneralAction = require 'app/sdk/actions/swapGeneralAction'

class ModifierOnSpawnKillMyGeneral extends Modifier

  type:"ModifierOnSpawnKillMyGeneral"
  @type:"ModifierOnSpawnKillMyGeneral"

  @modifierName:"ModifierOnSpawnKillMyGeneral"
  @description: "Kill your General"

  @isHiddenToUI: true

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (options) ->
    contextObject = super(options)
    return contextObject

  onActivate: () ->
    super()

    general = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    myCard = @getCard()

    # make sure to remove self to prevent triggering this modifier again
    @getGameSession().removeModifier(@)

    # turn the new unit into your general
    if general?
      swapGeneralAction = new SwapGeneralAction(@getGameSession())
      swapGeneralAction.setIsDepthFirst(false)
      swapGeneralAction.setSource(general)
      swapGeneralAction.setTarget(myCard)
      @getGameSession().executeAction(swapGeneralAction)

    # kill the old general
    dieAction = new DieAction(@getGameSession())
    dieAction.setOwnerId(myCard.getOwnerId())
    dieAction.setTarget(general)
    @getGameSession().executeAction(dieAction)

module.exports = ModifierOnSpawnKillMyGeneral
