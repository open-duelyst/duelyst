Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierOpeningGambitProgressBuild = require 'app/sdk/modifiers/modifierOpeningGambitProgressBuild'

class ModifierBuildWatch extends Modifier

  type:"ModifierBuildWatch"
  @type:"ModifierBuildWatch"

  @modifierName:"Build Watch"
  @description: "Build Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierBuildWatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action

    # watch for a unit transformed by building complete
    if @getIsActionRelevant(action) and @getIsCardRelevantToWatcher(action.getCard())
      @onBuildWatch(action)

  getIsActionRelevant: (action) ->
    return action instanceof PlayCardAsTransformAction and (action.getTriggeringModifier() instanceof ModifierBuilding or action.getTriggeringModifier() instanceof ModifierOpeningGambitProgressBuild)

  onBuildWatch: (action) ->
    # override me in sub classes to implement special behavior

  getIsCardRelevantToWatcher: (card) ->
    return true # override me in sub classes to implement special behavior


module.exports = ModifierBuildWatch
