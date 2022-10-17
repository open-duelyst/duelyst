class SDKObject

  _private: null # all private values that should not be serialized

  constructor: (gameSession)->
    # define private default properties
    # these are all properties private to a sub-class that should not get serialized
    # this pattern allows us to add more properties to these classes
    # without increasing the time it takes to serialize the objects
    Object.defineProperty(@, "_private", {
      enumerable: false, writable: true,
      value: @getPrivateDefaults(gameSession)
    })

  getPrivateDefaults: (gameSession) ->
    return {
      gameSession: gameSession
    }

  setGameSession: (val) ->
    @_private.gameSession = val

  getGameSession: () ->
    return @_private.gameSession

module.exports = SDKObject
