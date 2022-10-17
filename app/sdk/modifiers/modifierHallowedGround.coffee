ModifierEndTurnWatch = require './modifierEndTurnWatch'
CardType = require 'app/sdk/cards/cardType'
HealAction = require 'app/sdk/actions/healAction'

i18next = require('i18next')

class ModifierHallowedGround extends ModifierEndTurnWatch

  type: "ModifierHallowedGround"
  @type: "ModifierHallowedGround"

  @modifierName: i18next.t("modifiers.hallowed_ground_name")
  @keywordDefinition: i18next.t("modifiers.hallowed_ground_def")
  @description: i18next.t("modifiers.hallowed_ground_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierHallowedGround"]

  healAmount: 1 # hallowed ground heals 1 damage by default

  @getDescription: () ->
    return @description

  @getCardsWithHallowedGround: (board, player) ->
    # get all cards with hallowed ground modifiers owned by a player
    cards = []
    for card in board.getCards(null, allowUntargetable=true)
      if card.isOwnedBy(player) and card.hasModifierClass(ModifierHallowedGround)
        cards.push(card)
    return cards

  @getNumStacksForPlayer: (board, player) ->
    # get the number of stacking hallowed ground modifiers
    numStacks = 0
    for card in board.getCards(null, allowUntargetable=true)
      if card.isOwnedBy(player)
        numStacks += card.getNumModifiersOfClass(ModifierHallowedGround)
    return numStacks

  onTurnWatch: (actionEvent) ->
    super(actionEvent)

    # at end of my turn, if there is a friendly unit on this hallowed ground
    unit = @getGameSession().getBoard().getUnitAtPosition(@getCard().getPosition())
    if unit? and @getCard().getIsSameTeamAs(unit)
      healAction = new HealAction(this.getGameSession())
      healAction.setSource(@getCard())
      healAction.setTarget(unit)
      healAction.setHealAmount(@healAmount)
      this.getGameSession().executeAction(healAction)

module.exports = ModifierHallowedGround
