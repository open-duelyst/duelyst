CONFIG =     require 'app/common/config'
Logger = require 'app/common/logger'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'
ApplyExhaustionAction =  require 'app/sdk/actions/applyExhaustionAction'
AttackAction =   require 'app/sdk/actions/attackAction'
MoveAction = require 'app/sdk/actions/moveAction'
Modifier = require './modifier'
UtilsGameSession = require 'app/common/utils/utils_game_session'
_ = require 'underscore'

i18next = require('i18next')

class ModifierStunned extends Modifier

  type:"ModifierStunned"
  @type:"ModifierStunned"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.stunned_def")

  @modifierName: i18next.t("modifiers.stunned_name")
  @description: null

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1
  durationEndTurn: 2 # stun effect lasts until end of owner's next turn
  fxResource: ["FX.Modifiers.ModifierStunned"]

  onApplyToCardBeforeSyncState: () ->
    super()

    # if your unit is stunned during your turn, they will remain stunned
    # until the end of your NEXT turn
    if @getCard().isOwnersTurn()
      @durationEndTurn = 3

  onValidateAction:(event) ->
    a = event.action

    # stunned unit cannot explicitly attack (but it can do "auto" attacks like strikeback)
    if a.getIsValid()
      if a instanceof AttackAction
        if !a.getIsImplicit() and @getCard() is a.getSource()
          @invalidateAction(a, @getCard().getPosition(), "Stunned, cannot attack.")
      else if a instanceof MoveAction
        if @getCard() is a.getSource()
          @invalidateAction(a, @getCard().getPosition(), "Stunned, cannot move.")

module.exports = ModifierStunned
