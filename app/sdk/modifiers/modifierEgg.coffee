ModifierRemoveAndReplaceEntity = require './modifierRemoveAndReplaceEntity'
ModifierSpawnedFromEgg = require 'app/sdk/modifiers/modifierSpawnedFromEgg'
_ = require 'underscore'
GameSession = require 'app/sdk/gameSession'

i18next = require('i18next')

class ModifierEgg extends ModifierRemoveAndReplaceEntity

  type:"ModifierEgg"
  @type:"ModifierEgg"

  @modifierName: ""
  @isHiddenToUI: false
  isRemovable: true
  isInherent: true # eggs should show description in card text

  maxStacks: 1

  cardDataOrIndexToSpawn: null
  durationEndTurn: 2 # eggs placed on owner's turn take 2 turns to hatch (until end of enemy's next turn)

  fxResource: ["FX.Modifiers.ModifierEgg"]

  @createContextObject: (cardDataOrIndexToSpawn) ->
    contextObject = super(cardDataOrIndexToSpawn)
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      cardName = GameSession.getCardCaches().getCardById(modifierContextObject.cardDataOrIndexToSpawn.id).getName()
      return i18next.t("modifiers.egg_text",{unit_name: cardName})

  onActivate: () ->
    super()

    # reset turns elapsed and duration when activating due to changed location
    # ex: played from hand to board
    if !@_private.cachedWasActiveInLocation and @_private.cachedIsActiveInLocation
      @setNumEndTurnsElapsed(0)
      @updateDurationForOwner()

  onApplyToCardBeforeSyncState: () ->
    super()
    @getCard().setReferencedCardData(@cardDataOrIndexToSpawn)
    @updateDurationForOwner()

  onChangeOwner: (fromOwnerId, toOwnerId) ->
    super(fromOwnerId, toOwnerId)

    @updateDurationForOwner()

  updateDurationForOwner: () ->
    if !@getCard().isOwnersTurn()
      # eggs placed during enemy turn will hatch at the end of that turn
      @durationEndTurn = @numEndTurnsElapsed + 1
    else
      # eggs placed during owner's turn will hatch at end of enemy's next turn
      @durationEndTurn = @numEndTurnsElapsed + 2

  replace: () ->
    if @cardDataOrIndexToSpawn? and !_.isObject(@cardDataOrIndexToSpawn) then @cardDataOrIndexToSpawn = @getGameSession().getCardByIndex(@cardDataOrIndexToSpawn).createNewCardData()
    @cardDataOrIndexToSpawn.additionalModifiersContextObjects ?= []
    @cardDataOrIndexToSpawn.additionalModifiersContextObjects.push(ModifierSpawnedFromEgg.createContextObject())
    super()

module.exports = ModifierEgg
