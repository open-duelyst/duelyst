Modifier = require './modifier'
DieAction = require 'app/sdk/actions/dieAction'
DamageAction = require 'app/sdk/actions/damageAction'
Stringifiers = require 'app/sdk/helpers/stringifiers'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
KillAction = require 'app/sdk/actions/killAction'
SwapGeneralAction = require 'app/sdk/actions/swapGeneralAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CONFIG = require 'app/common/config'

class ModifierDieSpawnNewGeneral extends Modifier

  type:"ModifierDieSpawnNewGeneral"
  @type:"ModifierDieSpawnNewGeneral"

  @modifierName:"Die Spawn New General"
  @description: "When this reaches low HP, watch out!"

  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  fxResource: ["FX.Modifiers.ModifierSecondWind"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription = "", spawnCount=1, spawnPattern=CONFIG.PATTERN_3x3, spawnSilently=false, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.summonNewGeneralAtActionIndex = -1 # index of action triggering second wind

    return p

  onAfterCleanupAction: (event) ->
    super(event)

    action = event.action

    if @getGameSession().getIsRunningAsAuthoritative() and @_private.summonNewGeneralAtActionIndex == action.getIndex()
      # after cleaning up action, trigger second wind
      @onSummonNewGeneral(action)

  onValidateAction: (event) ->
    super(event)

    action = event.action

    # when our entity would die, invalidate the action until second wind executes
    if action instanceof DieAction and action.getTarget() is @getCard() and action.getParentAction() instanceof DamageAction
      # record index of parent action of die action, so we know when to trigger second wind
      @_private.summonNewGeneralAtActionIndex = action.getParentAction().getIndex()
      @invalidateAction(action, @getCard().getPosition(), @getCard().getName() + " combines to form D3cepticle!")

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  onSummonNewGeneral: (action) ->
    # silence self to remove all existing buffs/debuffs
    # set this modifier as not removable until we complete second wind
    @isRemovable = false
    @getCard().silence()

    card = @getCard()

    # summon the new unit
    ownerId = @getCard().getOwnerId()
    spawnPositions = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier(@, ModifierDieSpawnNewGeneral)
    for spawnPosition in spawnPositions
      cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn()
      if @spawnSilently
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
      else
        spawnAction = new PlayCardAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
      spawnAction.setSource(@getCard())
      @getGameSession().executeAction(spawnAction)

    # make sure to remove self to prevent triggering this modifier again
    @getGameSession().removeModifier(@)

    # turn the new unit into your general
    if spawnAction? and card.getIsGeneral()
      oldGeneral = @getGameSession().getGeneralForPlayerId(card.getOwnerId())
      newGeneral = spawnAction.getCard()
      swapGeneralAction = new SwapGeneralAction(@getGameSession())
      swapGeneralAction.setIsDepthFirst(false)
      swapGeneralAction.setSource(oldGeneral)
      swapGeneralAction.setTarget(newGeneral)
      @getGameSession().executeAction(swapGeneralAction)

    # kill the old unit
    dieAction = new DieAction(@getGameSession())
    dieAction.setOwnerId(card.getOwnerId())
    dieAction.setTarget(card)
    @getGameSession().executeAction(dieAction)

module.exports = ModifierDieSpawnNewGeneral
