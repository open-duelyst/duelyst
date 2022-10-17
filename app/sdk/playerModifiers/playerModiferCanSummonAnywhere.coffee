CardType = require 'app/sdk/cards/cardType'
PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'

class PlayerModiferCanSummonAnywhere extends PlayerModifier

  type:"PlayerModiferCanSummonAnywhere"
  @type:"PlayerModiferCanSummonAnywhere"

  isAura: true
  auraIncludeAlly: true
  auraIncludeBoard: false
  auraIncludeEnemy: false
  auraIncludeGeneral: false
  auraIncludeHand: true
  auraIncludeSelf: false
  modifiersContextObjects: [ModifierAirdrop.createContextObject()]

module.exports = PlayerModiferCanSummonAnywhere
