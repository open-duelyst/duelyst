PlayerModifier = require './playerModifier'
PlayerModifierMechazorSummoned = require './playerModifierMechazorSummoned'
ModifierCounterMechazorBuildProgress = require 'app/sdk/modifiers/modifierCounterMechazorBuildProgress'

i18next = require('i18next')

class PlayerModifierMechazorBuildProgress extends PlayerModifier

  type:"PlayerModifierMechazorBuildProgress"
  @type:"PlayerModifierMechazorBuildProgress"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.mechaz0r_def")

  @modifierName:i18next.t("modifiers.mechaz0r_name")
  #@description: "Progresses MECHAZ0R build by +%X%"

  @isHiddenToUI: true

  progressContribution: 0 # amount that this tracker contributes to the mechaz0r build, 1 = 20%, 2 = 40%, etc

  @createContextObject: (progressContribution=1, options) ->
    contextObject = super(options)
    contextObject.progressContribution = progressContribution
    return contextObject

  onApplyToCardBeforeSyncState: () ->
    # apply a mechaz0r counter to the General when first mechaz0r progress is added
    # once a counter is there, don't need to keep adding - original counter will update on further modifier additions
    if !@getCard().hasActiveModifierClass(ModifierCounterMechazorBuildProgress)
      @getGameSession().applyModifierContextObject(ModifierCounterMechazorBuildProgress.createContextObject("PlayerModifierMechazorBuildProgress","PlayerModifierMechazorSummoned"), @getCard())

  @followupConditionIsMechazorComplete: (cardWithFollowup, followupCard) ->

    # can we build him?

    #get how far progress is
    mechazorProgress = 0
    for modifier in cardWithFollowup.getOwner().getPlayerModifiersByClass(PlayerModifierMechazorBuildProgress)
      mechazorProgress += modifier.getProgressContribution()

    # check how many times mechaz0r has already been built
    numMechazorsSummoned = cardWithFollowup.getOwner().getPlayerModifiersByClass(PlayerModifierMechazorSummoned).length

    return (mechazorProgress - (numMechazorsSummoned * 5)) >= 5

  getProgressContribution: () ->
    return @progressContribution

  getStackType: () ->
    # progress contributions should stack only with same contributions
    return super() + "_progress" + @getProgressContribution()

module.exports = PlayerModifierMechazorBuildProgress
