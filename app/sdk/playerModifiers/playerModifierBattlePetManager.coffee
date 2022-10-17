EVENTS = require 'app/common/event_types'
PlayerModifier = require 'app/sdk/playerModifiers/playerModifier.coffee'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet.coffee'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance.coffee'
StartTurnAction = require 'app/sdk/actions/startTurnAction.coffee'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'

class PlayerModifierBattlePetManager extends PlayerModifier

  type:"PlayerModifierBattlePetManager"
  @type:"PlayerModifierBattlePetManager"

  maxStacks: 1

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.battlePetsToAct = []
    p.battlePetActions = []
    p.queuedBattlePets = [] # manually queued up battle pets (activate a battle pet mid turn)
    return p

  onEvent: (event) ->
    super(event)

    if @_private.listeningToEvents
      if @getGameSession().getIsRunningAsAuthoritative() and event.type == EVENTS.after_step
        action = event.step.action
        if action instanceof StartTurnAction and action.getOwnerId() is @getCard().getOwnerId()
          # watch for my turn to trigger my battle pets
          @startBattlePetActions()
        else if !@getGameSession().getIsBufferingEvents() and @_private.queuedBattlePets.length > 0
          # manually trigger individual battle pets
          @startBattlePetActions()
        else if action.getIsAutomatic()
          # if battle pets are currently acting, try to execute next battle pet action
          # otherwise, find next battle pet that needs to act and generate a new set of actions
          if @_private.battlePetActions.length > 0
            @executeNextBattlePetAction()
          else if @_private.battlePetsToAct.length > 0
            @generateNextBattlePetActions()
            @executeNextBattlePetAction()

  startBattlePetActions: () ->
    myOwnerId = @getCard().getOwnerId()

    # always reset battle pet list before generting new actions
    @_private.battlePetsToAct = []
    @_private.battlePetActions = []
    # manually queued some battle pets to act
    if @_private.queuedBattlePets.length > 0
      for battlePet in @_private.queuedBattlePets
        @_private.battlePetsToAct.push(battlePet) # add it to the list of battle pets to generate actions for
        if battlePet.hasModifierType(ModifierTranscendance.type) # if battle pet has celerity, give it 2 chances to act
          @_private.battlePetsToAct.push(battlePet)
      @_private.queuedBattlePets = [] # reset any individually queued up battle pets
    # if there are no manually queued battle pets, then we'll activate all battle pets for this player
    else
      for unit in @getGameSession().getBoard().getUnits()
        # check for my uncontrollable battle pets - but ignore "tamed" battle pets as those can be manually controlled
        if myOwnerId? and unit.getOwnerId() is myOwnerId and unit.getIsUncontrollableBattlePet()
          @_private.battlePetsToAct.push(unit) # add it to the list of battle pets to generate actions for
          if unit.hasActiveModifierType(ModifierTranscendance.type) # if battle pet has celerity, give it 2 chances to act
            @_private.battlePetsToAct.push(unit)

    if @_private.battlePetsToAct.length > 0
      @generateNextBattlePetActions()
      @executeNextBattlePetAction()

  executeNextBattlePetAction: () ->
    if @_private.battlePetActions.length > 0
      nextAction = @_private.battlePetActions.shift()

      # execute next action as long as source unit is still active
      isValid = nextAction.getSource().getIsActive()
      if isValid
        @getGameSession().executeAction(nextAction)
        isValid = nextAction.getIsValid()

      # if action was invalid for any reason, try again
      if !isValid
        @executeNextBattlePetAction()

  generateNextBattlePetActions: () ->
    # create actions for next battle pet. if next battle pet in list doesn't create any actions
    # keep trimming battle pets list until we find one that generates actions (or no more pets left to act)
    while @_private.battlePetsToAct.length > 0 and @_private.battlePetActions.length == 0
      # extract next battle pet from list
      battlePet = @_private.battlePetsToAct[0]
      @_private.battlePetsToAct.shift()

      # attempt to generate battle pet actions
      if battlePet.getIsActive()
        battlePetModifier = battlePet.getModifierByClass(ModifierBattlePet)
        if battlePetModifier?
          @_private.battlePetActions = battlePetModifier.generateActions()

  triggerBattlePet: (battlePet) ->
    if @getGameSession().getIsRunningAsAuthoritative() and battlePet?
      if battlePet.getIsUncontrollableBattlePet()
        @_private.queuedBattlePets.push(battlePet)
      else
        # controllable battle pets get refreshed on activate
        refreshExhaustionAction = new RefreshExhaustionAction(@getGameSession())
        refreshExhaustionAction.setTarget(battlePet)
        @getGameSession().executeAction(refreshExhaustionAction)

module.exports = PlayerModifierBattlePetManager
