ModifierSentinel = require './modifierSentinel'
CardType = require 'app/sdk/cards/cardType'
AttackAction = require 'app/sdk/actions/attackAction'

i18next = require('i18next')

class ModifierSentinelOpponentGeneralAttack extends ModifierSentinel

  type:"ModifierSentinelOpponentGeneralAttack"
  @type:"ModifierSentinelOpponentGeneralAttack"

  @description: i18next.t("modifiers.sentinel_general_attack")

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description
    else
      return super()

  getIsActionRelevant: (action) ->
    # watch for opponent General attacking
    if action instanceof AttackAction and action.getSource() is @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      return true
    else
      return false

  onOverwatch: (action) ->
    newUnit = super(action)
    if @getIsActionRelevant(action) and action.getTarget() is @getCard()
      action.setTarget(newUnit)

module.exports = ModifierSentinelOpponentGeneralAttack
