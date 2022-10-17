SDKObject = require('./object')
UtilsJavascript = require 'app/common/utils/utils_javascript'

class GameTurn extends SDKObject

  steps: null
  playerId: ""
  createdAt: null
  updatedAt: null
  ended: false

  constructor: (gameSession, playerId) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @playerId = playerId
    @steps = []
    @createdAt = Date.now()
    @updatedAt = Date.now()
    
  setPlayerId: (val) ->
    @playerId = val
    
  getPlayerId: () ->
    return @playerId

  getSteps: () ->
    return @steps

  addStep: (step) ->
    @steps.push(step)
    
  setEnded: (val) ->
    @ended = val
    
  getEnded: () ->
    return @ended
    
  deserialize: (data) ->
    UtilsJavascript.fastExtend(@, data)
    
    @steps = []
    if data.steps?
      for stepData in data.steps
        step = @getGameSession().deserializeStepFromFirebase(stepData)
        @steps.push(step)

module.exports = GameTurn
