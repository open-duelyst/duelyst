ModifierSummonWatch = require './modifierSummonWatch'
PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
DamageAction = require 'app/sdk/actions/damageAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'
UtilsPosition = require 'app/common/utils/utils_position'

class ModifierReduceCostOfMinionsAndDamageThem extends ModifierSummonWatch

  type:"ModifierReduceCostOfMinionsAndDamageThem"
  @type:"ModifierReduceCostOfMinionsAndDamageThem"

  @modifierName:"Summon Watch (reduce cost of minions and damage them)"
  @description: "Your minions cost %X less to summon and take %Y damage when summoned from your action bar"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  @createContextObject: (costChange, damageAmount, options) ->
    contextObject = super(options)
    contextObject.costChange = costChange
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description.replace /%Y/, modifierContextObject.costChange
      return replaceText.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onActivate: ()  ->
    super()

    # set player mana modifier as sub-modifier of this modifier. that way, if this
    # unit is dispelled or killed, player modifier will be removed as well
    contextObject = PlayerModifierManaModifier.createCostChangeContextObject(-1 * @costChange, CardType.Unit)
    contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
    contextObject.activeOnBoard = true
    ownPlayerId = @getCard().getOwnerId()
    ownGeneral = @getGameSession().getGeneralForPlayerId(ownPlayerId)
    @applyManagedModifiersFromModifiersContextObjectsOnce([contextObject], ownGeneral)

  getIsActionRelevant: (action) ->
    # watch for a unit being summoned from action bar by the player who owns this entity, don't trigger on summon of this unit
    return action instanceof PlayCardFromHandAction and action.getCard() isnt @getCard() and super(action)

  onSummonWatch: (action) ->
    unitToDamage = action.getTarget()
    if unitToDamage? and !UtilsPosition.getPositionsAreEqual(unitToDamage.getPosition(), @getCard().getPosition()) # make sure we aren't trying to damage a clone summoned by a followup spawn (mirage master)
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(unitToDamage)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierReduceCostOfMinionsAndDamageThem
