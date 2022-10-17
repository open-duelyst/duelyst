Modifier = require 'app/sdk/modifiers/modifier'

class PlayerModifier extends Modifier

  type:"PlayerModifier"
  @type:"PlayerModifier"

  # don't allow player modifiers to be dispelled off of the General
  isRemovable: false

  # player modifiers are not cloneable
  isCloneable: false

  # player modifiers should be hidden from UI by default
  @isHiddenToUI: true

  #region PLAYER

  getPlayer: @::getOwner

  getPlayerId: @::getOwnerId

  # endregion PLAYER

module.exports = PlayerModifier
