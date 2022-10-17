ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'
ModifierStackingShadowsBonusDamage = require './modifierStackingShadowsBonusDamage'
ModifierCounterShadowCreep = require './modifierCounterShadowCreep'

i18next = require('i18next')

class ModifierStackingShadows extends ModifierEndTurnWatch

  type: "ModifierStackingShadows"
  @type: "ModifierStackingShadows"

  @modifierName: i18next.t("modifiers.shadow_creep_name")
  @keywordDefinition: i18next.t("modifiers.shadow_creep_def")
  @description: i18next.t("modifiers.shadow_creep_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierShadowCreep"]

  damageAmount: 1 # shadow creep deal 1 damage by default

  @getDescription: () ->
    return @description

  onApplyToCardBeforeSyncState: () ->
    # apply a shadow creep counter to the General when first shadow creep tile is played
    # once a counter is there, don't need to keep adding - original counter will update on further shadow creep additions
    targetCard = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    if !targetCard.hasActiveModifierClass(ModifierCounterShadowCreep)
      @getGameSession().applyModifierContextObject(ModifierCounterShadowCreep.createContextObject("ModifierStackingShadows"), targetCard)

  @getCardsWithStackingShadows: (board, player) ->
    # get all cards with stacking shadow modifiers owned by a player
    cards = []
    for card in board.getCards(null, allowUntargetable=true)
      if card.isOwnedBy(player) and card.hasModifierClass(ModifierStackingShadows)
        cards.push(card)
    return cards

  @getNumStacksForPlayer: (board, player) ->
    # get the number of stacking shadow modifiers
    numStacks = 0
    for card in board.getCards(null, allowUntargetable=true)
      if card.isOwnedBy(player)
        numStacks += card.getNumModifiersOfClass(ModifierStackingShadows)
    return numStacks

  getShadowCreepDamage: () ->
    multiBonus = 1
    bonusDamage = 0

    # shadow creep base damage can be increased by adding ModifierStackingShadowsBonusDamage to this card
    for mod in @getCard().getActiveModifiersByClass(ModifierStackingShadowsBonusDamage)
      bonusDamage += mod.getFlatBonusDamage()
      multiBonus *= mod.getMultiplierBonusDamage()

    return Math.max(0, (@damageAmount + bonusDamage) * multiBonus)

  getBuffedAttribute: (attributeValue, buffKey) ->
    #this is really just for the inspector, since tiles can't attack
    #calculate the damage that this shadow tile will deal and return that as its "attack" value
    if buffKey == "atk"
      return @getShadowCreepDamage()
    else
      return super(attributeValue, buffKey)

  onActivate: () ->
    super()

    # flush cached atk attribute for this card
    @getCard().flushCachedAttribute("atk")

  onDeactivate: () ->
    super()

    # flush cached atk attribute for this card
    @getCard().flushCachedAttribute("atk")

  onTurnWatch: (actionEvent) ->
    super(actionEvent)
    # at end of my turn, if there is an enemy unit on this shadow creep, deal damage to it
    @_activateCreep()

  activateShadowCreep: () ->
    # when called, if there is an enemy unit on this shadow creep, deal damage to it
    @_activateCreep()

  _activateCreep: () ->
    unit = @getGameSession().getBoard().getUnitAtPosition(@getCard().getPosition())
    if unit? and !@getCard().getIsSameTeamAs(unit)
      damageAction = new DamageAction(this.getGameSession())
      damageAction.setSource(@getCard())
      damageAction.setTarget(unit)
      damageAction.setDamageAmount(@getShadowCreepDamage())
      this.getGameSession().executeAction(damageAction)

module.exports = ModifierStackingShadows
