ModifierSummonWatchFromActionBar = require './modifierSummonWatchFromActionBar'
Cards = require 'app/sdk/cards/cardsLookup'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

i18next = require('i18next')

class ModifierSandPortal extends ModifierSummonWatchFromActionBar

  type: "ModifierSandPortal"
  @type: "ModifierSandPortal"

  @modifierName: i18next.t("modifiers.exhuming_sand_name")
  @keywordDefinition: i18next.t("modifiers.exhuming_sand_def")
  @description: i18next.t("modifiers.exhuming_sand_def")

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierShadowCreep"]

  @getDescription: () ->
    return @description

  @getCardsWithSandPortal: (board, player) ->
    # get all cards with sand portal modifiers owned by a player
    cards = []
    for card in board.getCards(null, allowUntargetable=true)
      if card.isOwnedBy(player) and card.hasModifierClass(ModifierSandPortal)
        cards.push(card)
    return cards

  onSummonWatch: (action) ->
    super(action)
    board = @getGameSession().getBoard()
    entity = @getGameSession().getCardCaches().getCardById(Cards.Faction3.IronDervish)
    position = @getCard().getPosition()

    appliedToBoardByAction = @getCard().getAppliedToBoardByAction()
    if appliedToBoardByAction != undefined
      rootAppliedByCard = action.getRootAction().getCard?().getRootCard()
      thisAppliedByCard = appliedToBoardByAction.getRootAction().getCard?().getRootCard()
      # spawn an Iron Dervish on this tile when you summon another minion UNLESS the minion being summoned also caused this tile to spawn
      # (i.e. don't trigger on own creation by opening gambit)
      if !board.getObstructionAtPositionForEntity(position, entity) and rootAppliedByCard != thisAppliedByCard
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), position.x, position.y, {id: Cards.Faction3.IronDervish})
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

    else
      if !board.getObstructionAtPositionForEntity(position, entity)
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), position.x, position.y, {id: Cards.Faction3.IronDervish})
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierSandPortal
