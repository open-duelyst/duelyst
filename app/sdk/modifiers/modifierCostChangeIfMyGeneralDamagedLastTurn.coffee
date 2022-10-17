ModifierManaCostChange = require './modifierManaCostChange'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch.coffee'
i18next = require 'i18next'

class ModifierCostChangeIfMyGeneralDamagedLastTurn extends ModifierMyGeneralDamagedWatch

  type:"ModifierCostChangeIfMyGeneralDamagedLastTurn"
  @type:"ModifierCostChangeIfMyGeneralDamagedLastTurn"

  @modifierName:"My General Damaged Watch"
  @description:i18next.t("modifiers.cost_change_if_my_general_damaged_last_turn_name_def")

  activeInHand: true
  activeInDeck: true
  activeOnBoard: false

  @createContextObject: (costChange=0, description="", options) ->
    contextObject = super(options)
    costChangeContextObject = ModifierManaCostChange.createContextObject(costChange)
    costChangeContextObject.appliedName = i18next.t("modifiers.cost_change_if_my_general_damaged_last_turn_name_name")
    costChangeContextObject.durationEndTurn = 2
    contextObject.modifiersContextObjects = [costChangeContextObject]
    contextObject.description = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.cost_change_if_my_general_damaged_last_turn_name_def",{desc:@description})
      #return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onDamageDealtToGeneral: (action) ->
    if !@getSubModifiers() || @getSubModifiers()?.length == 0 # if no sub modifiers currently attached to this card
      # and if damage was dealt to my General on opponent's turn
      if @getGameSession().getCurrentPlayer().getPlayerId() is @getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId())
        # apply mana modifier
        @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierCostChangeIfMyGeneralDamagedLastTurn
