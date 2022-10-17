const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../'));
require('coffeescript/register');
const Logger = require('app/common/logger');

Logger.module('AI').log('Initializing AI...');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsPosition = require('app/common/utils/utils_position');
const SDK = require('app/sdk.coffee');
const CONFIG = require('app/common/config');
const ModifierDyingWishReSpawnEntityAnywhere = require('app/sdk/modifiers/modifierDyingWishReSpawnEntityAnywhere');
const ModifierDyingWishSpawnEntityInCorner = require('app/sdk/modifiers/modifierDyingWishSpawnEntityInCorner');
const _ = require('underscore');
const CardIntent = require('./card_intent/card_intent');
const CardIntentType = require('./card_intent/card_intent_type');
const CardTargetType = require('./card_intent/card_target_type');
const CardPhaseType = require('./card_intent/card_phase_type');
const BOUNTY = require('./scoring/bounty');
const THRESHOLD = require('./scoring/threshold');
const ScoreForCard = require('./scoring/base/card');
const ScoreForModifiers = require('./scoring/base/modifiers');
const ScoreForUnit = require('./scoring/base/unit');
const ScoreForUnitDamage = require('./scoring/base/unit_damage');
const ScoreForIntents = require('./scoring/intent/intents');
const ScoreForIntentFollowup = require('./scoring/intent/intent_followup');
const ScoreForCardAtTargetPosition = require('./scoring/position/position_ScoreForCardAtTargetPosition');
const findNearestObjective = require('./scoring/utils/utils_findNearestObjective');
const canCardAndEffectsBeAppliedAnywhere = require('./scoring/utils/utils_canCardAndEffectsBeAppliedAnywhere');
const distanceBetweenBoardPositions = require('./scoring/utils/utils_distanceBetweenBoardPositions');
const isUnitEvasive = require('./scoring/utils/utils_isUnitEvasive');
const willUnitSurviveCard = require('./scoring/utils/utils_willUnitSurviveCard');
const arePositionsEqualOrAdjacent = require('./scoring/utils/utils_arePositionsEqualOrAdjacent');

/**
 * Simple ai that is able to play faction starter decks.
 * @param {SDK.GameSession} gameSession
 * @param {String|Number} playerId
 * @param {Number} [difficulty=1.0] difficulty as a percentage between 0 and 1
 * @constructor
 */
const StarterAI = function (gameSession, playerId, difficulty) {
  this._gameSession = gameSession;
  this._playerId = playerId;
  this._difficulty = _.isNumber(difficulty) && !isNaN(difficulty) ? Math.max(0.0, Math.min(1.0, difficulty)) : 1.0;
  this._resetForNextTurn();
};

StarterAI.prototype = {

  constructor: StarterAI,

  // region PROPERTIES

  _cacheByCard: null,
  _checkedForLethalOnEnemyGeneral: false,
  _checkingLethalOnEnemyGeneral: false,
  _difficulty: 1.0,
  _followupTargets: null,
  _gameSession: null,
  _hasLethalOnEnemyGeneral: false,
  _invalidPlayedCards: null,
  _invalidMoveActions: null,
  _invalidAttackActions: null,
  _lastInvalidAction: null,
  _lastInvalidMoveSourceUnit: null,
  _lastInvalidMoveTargetPosition: null,
  _lastInvalidAttackSourceUnit: null,
  _lastInvalidAttackTargetUnit: null,
  _markedForDeath: null,
  _nextActions: null,
  _numEnemyUnitsBeforeAction: 0,
  _numUnitsRemovedThisTurn: 0,
  _numSpawnedUnitsThisTurn: 0,
  _playerId: null,
  _unitsMissingAttacks: null,
  _wantsToKillEggAtPosition: null,

  /**
   * Resets ai properties for next turn.
   * @private
   */
  _resetForNextTurn() {
    this._wantsToKillEggAtPosition = null;
    this._checkedForLethalOnEnemyGeneral = false;
    this._hasLethalOnEnemyGeneral = false;
    this._nextActions = [];
    this._numEnemyUnitsBeforeAction = 0;
    this._numUnitsRemovedThisTurn = 0;
    this._numSpawnedUnitsThisTurn = 0;
    this._markedForDeath = [];
    this._followupTargets = [];
    this._unitsMissingAttacks = [];
    this._resetLastInvalidData();
    this.flushCaches();
  },

  _resetLastInvalidData() {
    this._invalidPlayedCards = [];
    this._invalidMoveActions = [];
    this._invalidAttackActions = [];
    this._lastInvalidAction = null;
  },

  // endregion PROPERTIES

  // region GETTERS / SETTERS

  /**
   * Returns game session ai is acting on.
   * @returns {GameSession}
   */
  getGameSession() {
    return this._gameSession;
  },
  /**
   * Returns player id ai is playing as.
   * @returns {String|Number}
   */
  getMyPlayerId() {
    return this._playerId;
  },
  /**
   * Returns player ai is playing as.
   * @returns {Player}
   */
  getMyPlayer() {
    return this.getGameSession().getPlayerById(this.getMyPlayerId());
  },
  /**
   * Returns general ai is playing as.
   * @returns {Player}
   */
  getMyGeneral() {
    return this.getGameSession().getGeneralForPlayerId(this.getMyPlayerId());
  },
  /**
   * Returns opponent player id ai is playing against.
   * @returns {Player}
   */
  getOpponentPlayerId() {
    return this.getGameSession().getOpponentPlayerOfPlayerId(this.getMyPlayerId()).getPlayerId();
  },
  /**
   * Returns opponent ai is playing against.
   * @returns {Player}
   */
  getOpponentPlayer() {
    return this.getGameSession().getOpponentPlayerOfPlayerId(this.getMyPlayerId());
  },
  /**
   * Returns opponent general ai is playing against.
   * @returns {Player}
   */
  getOpponentGeneral() {
    return this.getGameSession().getGeneralForPlayerId(this.getOpponentPlayerId());
  },

  /**
   * Flushes cached data.
   */
  flushCaches() {
    this._cacheByCard = {};
  },

  // endregion GETTERS / SETTERS

  // region NEXT ACTION

  /**
   * Returns next action ai will take given the current game session state, or null if no action.
   * @returns {Action|null}
   */
  nextAction() {
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] nextAction -> next action called for AI.");
    // reset cached card data
    this.flushCaches();

    // find next action
    if (this.getGameSession().isNew()) {
      return this.nextActionForNewGame();
    } if (this.getGameSession().isActive() && this.getGameSession().getCurrentPlayerId() === this.getMyPlayerId()) {
      return this.nextActionForActiveGame();
    }
  },
  /**
   * Returns next action for new game, or null if no action.
   * @returns {Action|null}
   * @see nextAction
   */
  nextActionForNewGame() {
    if (this.getGameSession().isNew()) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> new game detected checking for starting hand.");
      const myPlayer = this.getMyPlayer();
      if (!myPlayer.getHasStartingHand()) {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> no starting hand detected, checking for mulligans.");
        // mulligan non-summon spells and artifacts or cards with mana cost 1 above starting mana
        const mulliganIndices = [];
        const cardsInHand = myPlayer.getDeck().getCardsInHand();
        for (let i = 0, il = cardsInHand.length; i < il; i++) {
          const card = cardsInHand[i];
          if (mulliganIndices.length < CONFIG.STARTING_HAND_REPLACE_COUNT
            && card != null
            && (card instanceof SDK.Artifact
            || card.getManaCost() > myPlayer.getRemainingMana() + 1
            || (card instanceof SDK.Spell
            && (!CardIntent.getHasIntentType(card.getId(), CardIntentType.Summon, true)
            || CARD_INTENT[card.getId()] == null
            || CARD_INTENT[card.getId()].indexOf('summon') === -1)))) {
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> mulligan " + card.getLogName() + "because it is a non summon spell, artifact, or costs too much mana");
            mulliganIndices.push(i);
          }
        }
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> returning action withh " + mulliganIndices.length + " mulligan indices.");
        return myPlayer.actionDrawStartingHand(mulliganIndices);
      }
    }
  },
  /**
   * Returns next action for active game, or null if no action.
   * @returns {Action|null}
   * @see nextAction
   */
  nextActionForActiveGame() {
    let nextAction;

    if (this.getGameSession().isActive() && this.getGameSession().getCurrentPlayerId() === this.getMyPlayerId()) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] finding next actions!");
      // attempt to find next actions
      this._findNextActions();

      // use next action in queue
      nextAction = this._nextActions.shift();
      if (nextAction != null
        && !(nextAction instanceof SDK.EndTurnAction
          || nextAction instanceof SDK.EndFollowupAction
          || nextAction instanceof SDK.ResignAction)) {
        // validate the current action and reset the queue if invalid
        // resetting queue is safest as we don't want to execute queued actions that expected a specific sequence
        // do not emit event when invalid as we don't want anything reacting to this validation
        // it is strictly for internal stability checking and anti-roping
        const emitEventWhenInvalid = false;
        this.getGameSession().validateAction(nextAction, emitEventWhenInvalid);
        if (!nextAction.getIsValid()) {
          // reset the queue
          this._nextActions = [];

          // check whether action is same as last invalid action
          if (this._lastInvalidAction != null
            && this._lastInvalidAction.getType() === nextAction.getType()
            && (this._lastInvalidAction.getSourceIndex() == null || this._lastInvalidAction.getSourceIndex() === nextAction.getSourceIndex())
            && (this._lastInvalidAction.getSourcePosition() == null || this._lastInvalidAction.getSourcePosition().x === nextAction.getSourcePosition().x && this._lastInvalidAction.getSourcePosition().y === nextAction.getSourcePosition().y)
            && (this._lastInvalidAction.getTargetIndex() == null || this._lastInvalidAction.getTargetIndex() === nextAction.getTargetIndex())
            && (this._lastInvalidAction.getTargetPosition() == null || this._lastInvalidAction.getTargetPosition().x === nextAction.getTargetPosition().x && this._lastInvalidAction.getTargetPosition().y === nextAction.getTargetPosition().y)
          ) {
            // end turn immediately
            nextAction = this.getGameSession().actionEndTurn();
          } else {
            // remember action to prevent roping
            this._lastInvalidAction = nextAction;
            if (nextAction instanceof SDK.ApplyCardToBoardAction) {
              const card = nextAction.getCard();
              if (card != null) {
                UtilsJavascript.arrayCautiousAdd(this._invalidPlayedCards, card);
              }
            } else if (nextAction instanceof SDK.AttackAction) {
              this._invalidAttackActions.push(nextAction);
            } else if (nextAction instanceof SDK.MoveAction) {
              this._invalidMoveActions.push(nextAction);
            }

            // recursively find next action
            nextAction = this.nextActionForActiveGame();
          }
        }
      }

      // reset when turn is complete
      if (nextAction instanceof SDK.EndTurnAction) {
        this._resetForNextTurn();
      }
    }

    return nextAction;
  },

  // endregion NEXT ACTION

  // region FIND ACTIONS

  _findNextActions() {
    if (this.getGameSession().getIsFollowupActive()) {
      // we are being called from inside of a followup action. call playcard to continue to resolve current followup
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] followup detected");
      const cardWaitingForFollowups = this.getGameSession().getValidatorFollowup().getCardWaitingForFollowups();
      const currentFollowupCard = cardWaitingForFollowups.getCurrentFollowupCard();
      // check for globally-set followup target
      let targetPosition;
      if (this._followupTargets.length > 0) { // && currentFollowupCard.id != SDK.Cards.Spell.FollowupTeleport) {
        targetPosition = this._followupTargets.shift();
      }
      this._findPlayCardActionsForCard(currentFollowupCard, targetPosition);

      if (this._nextActions.length === 0 || !cardWaitingForFollowups.getIsActionForCurrentFollowup(this._nextActions[0])) {
        this._nextActions.unshift(this.getMyPlayer().actionEndFollowup());
      }

      return;
    } if (this._wantsToKillEggAtPosition != null) {
      // try to find and kill egg at position if we just killed a rebirth unit
      const attackObjectivePosition = this._wantsToKillEggAtPosition;
      this._wantsToKillEggAtPosition = null;
      const eggToAttack = this.getGameSession().getBoard().getUnitAtPosition(attackObjectivePosition);
      if (eggToAttack != null && eggToAttack.hasActiveModifierClass(SDK.ModifierEgg)) {
        this._forceAttackOnTargetIfPossible(eggToAttack);
      }
    }
    if (this._nextActions.length > 0) return;

    // clear any marked for death units that survived
    this._markedForDeath = [];

    // get enemy unit count
    const opponentGeneral = this.getOpponentGeneral();
    const opponentUnits = this.getGameSession().getBoard().getFriendlyEntitiesForEntity(opponentGeneral);
    const numOpponentUnits = opponentUnits.length;
    this._numUnitsRemovedThisTurn += Math.max(0, this._numEnemyUnitsBeforeAction - numOpponentUnits);
    this._numEnemyUnitsBeforeAction = numOpponentUnits;

    // 1, replace cards
    this._replaceCard();
    if (this._nextActions.length > 0) return;

    // 2, check if we have lethal on general
    // generalLethalCheck alters global bounty variables for subsequent functions
    // to be changed to only set global lethal flag rather than altering bounties
    this._generalLethalCheck();

    // try to play high priority cards
    this._findBestPlayCardAction(THRESHOLD.PLAY_CARD_HIGH_PRIORITY);
    if (this._nextActions.length > 0) return;

    // 3, play certain cards first
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing growing watchers and effect watchers (like shadow dancer)");
    this._findPlayCardActionsByIntent('summon_watcher');
    if (this._nextActions.length > 0) return;
    this._findPlayCardActionsByIntent('summon_grow');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing arts");
    this._findPlayCardActionsByType(SDK.CardType.Artifact);
    if (this._nextActions.length > 0) return;
    // play mass burn and removal
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing burn_mass_enemy_minion");
    this._findPlayCardActionsByIntent('burn_mass_enemy_minion');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing burn_mass");
    this._findPlayCardActionsByIntent('burn_mass');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing burn_mass_minion");
    this._findPlayCardActionsByIntent('burn_mass_minion');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing burn_mass_enemy");
    this._findPlayCardActionsByIntent('burn_mass_enemy');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing removal_mass_minion");
    this._findPlayCardActionsByIntent('removal_mass_minion');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing removal_mass_minion");
    this._findPlayCardActionsByIntent('removal_mass_minion');
    if (this._nextActions.length > 0) return;
    // play single target burn or removal and shadownova
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing shadownovas");
    this._findPlayCardActionsByIntent('shadownova');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing removal");
    this._findPlayCardActionsByIntent('removal');
    if (this._nextActions.length > 0) return;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing burn");
    this._findPlayCardActionsByIntent('burn');
    if (this._nextActions.length > 0) return;

    // assemble my units
    // sort units by bounty score from highest to lowest
    // the idea here is that my units with higher bounty (i.e. more atk/hp/abilities)
    // will have a better chance of making favorable trades than my lower bounty units
    const myGeneral = this.getMyGeneral();
    const myUsableUnits = this._getMyUsableUnits();

    // determine what units will not attack
    const numUnitsThatCanMissAttacks = myUsableUnits.length - DIFFICULTY_MIN_UNITS_THAT_ATTACK;
    if (this._difficulty < 1.0 && numUnitsThatCanMissAttacks > 0) {
      const unitsThatCanMissAttacks = _.difference(myUsableUnits, this._unitsMissingAttacks);
      const numMissedAttacks = Math.floor(DIFFICULTY_MAX_MISSED_ATTACKS_PCT * numUnitsThatCanMissAttacks * (1.0 - this._difficulty));
      for (let i = unitsThatCanMissAttacks.length - 1; i >= 0; i--) {
        if (this._unitsMissingAttacks.length >= numMissedAttacks) {
          break;
        } else {
          const unitMissingAttack = unitsThatCanMissAttacks.splice(Math.floor(Math.random() * unitsThatCanMissAttacks.length), 1)[0];
          if (!unitMissingAttack.getIsGeneral() && !unitMissingAttack.hasModifierClass(SDK.ModifierEphemeral)) {
            // never miss attacks with general or ephemeral units
            this._unitsMissingAttacks.push(unitMissingAttack);
          }
        }
      }
    }

    const maxUnitsRemovedPerTurn = Math.max(1, Math.floor(this._difficulty * DIFFICULTY_MAX_UNITS_REMOVED_PER_TURN));

    // start by allowing only lethal
    let allowOnlyLethalAttacks = true;

    // 4, move and attack with units that have lethal on an objective
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] moving");
    _.each(myUsableUnits, (unit) => {
      if (this._nextActions.length > 0
        || (this._difficulty < 1.0 && !unit.getIsGeneral() && this._numUnitsRemovedThisTurn >= maxUnitsRemovedPerTurn)) return;
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] attempting movement for " + unit.getLogName());
      this._findMoveActionsForUnit(unit, allowOnlyLethalAttacks);
      if (this._nextActions.length > 0) return;
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] attempting attack for " + unit.getLogName());
      this._findAttackActionsForUnit(unit, allowOnlyLethalAttacks);
    });
    if (this._nextActions.length > 0) return;

    // after lethal has been handled, allow non-lethal
    allowOnlyLethalAttacks = false;

    // 6, move units that don't have lethal on an objective
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] moving");
    _.each(myUsableUnits, (unit) => {
      if (this._nextActions.length > 0) return;
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] attempting movement for " + unit.getLogName());
      this._findMoveActionsForUnit(unit, allowOnlyLethalAttacks);
    });
    if (this._nextActions.length > 0) return;

    // 7, attack & cast buff/debuff cards with units that don't have lethal attacks
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] attacking - nonlethal allowed", this._unitsMissingAttacks.slice(0));
    _.each(myUsableUnits, (unit) => {
      if (this._nextActions.length > 0
        || (this._difficulty < 1.0 && !unit.getIsGeneral() && this._numUnitsRemovedThisTurn >= maxUnitsRemovedPerTurn)) return;
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] attempting attack for " + unit.getLogName());
      this._findAttackActionsForUnit(unit, allowOnlyLethalAttacks);
    });
    if (this._nextActions.length > 0) return;

    // try to play medium priority cards
    this._findBestPlayCardAction(THRESHOLD.PLAY_CARD_MEDIUM_PRIORITY);
    if (this._nextActions.length > 0) return;

    // play units
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing units");
    this._findPlayCardActionsByType(SDK.CardType.Unit); // summon after moving
    if (this._nextActions.length > 0) return;
    // play remaining spells if able - this includes signature spells
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] playing spells");
    this._findPlayCardActionsByType(SDK.CardType.Spell); // cast spells after moving and summoning units in case mana spring is capped and to use refresh spells
    if (this._nextActions.length > 0) return;

    this._findPlayCardActionsByIntent('hand_improve_minion_mass_bbs');
    if (this._nextActions.length > 0) return;
    this._findPlayCardActionsByIntent('summon_ranged_bbs');
    if (this._nextActions.length > 0) return;

    // check for replace cards again if we didn't the first time (due to hand changes from draw card spells, for example)
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] replace cards 2");
    this._replaceCard();
    if (this._nextActions.length > 0) return;

    // end turn
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] end turn");
    this._nextActions.push(this.getGameSession().actionEndTurn());
  },

  _getMyUsableUnits() {
    // assemble my units
    // sort units by bounty score from highest to lowest
    // the idea here is that my units with higher bounty (i.e. more atk/hp/abilities)
    // will have a better chance of making favorable trades than my lower bounty units
    const myGeneral = this.getMyGeneral();
    const friendlyUnits = this.getGameSession().getBoard().getFriendlyEntitiesForEntity(myGeneral, SDK.CardType.Unit);
    friendlyUnits.push(myGeneral);
    const myUsableUnits = [];
    _.each(friendlyUnits, (unit) => {
      if (!unit.getIsExhausted() && !unit.getIsUncontrollableBattlePet()) {
        UtilsJavascript.arraySortedInsertByScore(myUsableUnits, unit, ScoreForUnit);
      }
    });
    return myUsableUnits;
  },

  _replaceCard() {
    // function - returns 0 if no desired mulls, or a mull action
    const myPlayer = this.getMyPlayer();
    if (myPlayer.getDeck().getCanReplaceCardThisTurn()) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> start");
      let cardsInHand = myPlayer.getDeck().getCardsInHand();
      cardsInHand = _.reject(cardsInHand, (card) => card == null);
      // first, find first card that costs at least 2 more than our max mana
      var cardToReplace = _.find(cardsInHand, (card) => (myPlayer.getDeck().getNumCardsReplacedThisTurn() == 0 && card.getManaCost() >= (myPlayer.getMaximumMana() + 2)));
      if (cardToReplace != null) {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> " + cardToReplace.getLogName() + "because it costs 2 or more than our max mana");
        this._nextActions.push(myPlayer.actionReplaceCardFromHand(myPlayer.getDeck().getCardsInHand().indexOf(cardToReplace)));
        return;
      }

      // then, if we didn't replace yet try to replace anything with more than 1 copy in hand
      var cardToReplace = _.find(cardsInHand, (card) => (myPlayer.getDeck().getNumCardsReplacedThisTurn() == 0 && _.where(cardsInHand, { id: card.getBaseCardId() }).length > 1));
      if (cardToReplace != null) {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> " + cardToReplace.getLogName() + "because we have more than 1 copy in hand.");
        this._nextActions.push(myPlayer.actionReplaceCardFromHand(myPlayer.getDeck().getCardsInHand().indexOf(cardToReplace)));
        return;
      }

      // then, if we have more than 2 spells, force a spell to be replaced at random
      // this is intended to encourage play of units
      const spells = _.filter(cardsInHand, (card) => card instanceof SDK.Spell);
      if (spells.length > 2) {
        var cardToReplace = _.sample(spells);
        if (cardToReplace != null) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> " + cardToReplace.getLogName() + "because we have more than 2 spells in hand.");
          this._nextActions.push(myPlayer.actionReplaceCardFromHand(myPlayer.getDeck().getCardsInHand().indexOf(cardToReplace)));
          return;
        }
      }

      // then, if we have more than 1 artifact, force an artifact to be replaced at random
      // this is intended to encourage play of units
      const artifacts = _.filter(cardsInHand, (card) => card instanceof SDK.Artifact);
      if (artifacts.length > 1) {
        var cardToReplace = _.sample(artifacts);
        if (cardToReplace != null) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> " + cardToReplace.getLogName() + "because we have more than 1 artifact in hand.");
          this._nextActions.push(myPlayer.actionReplaceCardFromHand(myPlayer.getDeck().getCardsInHand().indexOf(cardToReplace)));
          return;
        }
      }

      // finally, if we have no units in hand, force a card to be replaced at random
      // this is intended to encourage play of units
      const unit = _.find(cardsInHand, (card) => card instanceof SDK.Unit);
      if (unit == null) {
        var cardToReplace = _.sample(cardsInHand);
        if (cardToReplace != null) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> " + cardToReplace.getLogName() + "because we have no units in hand.");
          this._nextActions.push(myPlayer.actionReplaceCardFromHand(myPlayer.getDeck().getCardsInHand().indexOf(cardToReplace)));
        }
      }

      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> nothing to replace");
    } else {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] can't replace.");
    }
  },

  _generalLethalCheck() {
    if (!this._checkedForLethalOnEnemyGeneral) {
      this._checkedForLethalOnEnemyGeneral = true;

      if (this._difficulty < Math.max(DIFFICULTY_WHEN_GENERAL_CAN_ATTACK_ENEMY_GENERAL, DIFFICULTY_WHEN_UNITS_CAN_ATTACK_ENEMY_GENERAL)) {
        this._hasLethalOnEnemyGeneral = false;
      } else {
        this._checkingLethalOnEnemyGeneral = true;

        const myPlayer = this.getMyPlayer();
        const myGeneral = this.getMyGeneral();
        const opponentGeneral = this.getOpponentGeneral();
        const opponentGeneralPosition = opponentGeneral.getPosition();
        const opponentGeneralMaxHP = opponentGeneral.getMaxHP();
        const opponentGeneralDamage = opponentGeneral.getDamage();

        // find all units who can attack general this turn who aren't provoked and add up their dmg
        // this is a rough approximation and does not account for units blocking other units
        const myUsableUnits = this._getMyUsableUnits();
        let totalDamage = opponentGeneralDamage;
        const returnBuffedAtkValueOnly_noCast = true;
        _.each(myUsableUnits, (unit) => {
          // units that can move and attack and within approximate range of opponent general
          if (unit.getCanAttack() && !this._isUnitPreventedFromAttacking(unit)
            && (arePositionsEqualOrAdjacent(unit.getPosition(), opponentGeneralPosition)
            || (unit.getCanMove() && !this._isUnitPreventedFromMoving(unit) && distanceBetweenBoardPositions(unit.getPosition(), opponentGeneralPosition) <= unit.getSpeed() + 1))) {
            // add buffed atk
            const buffedAtk = this._findAtkBuffAndBuffedAtkValue(unit, [opponentGeneral], returnBuffedAtkValueOnly_noCast);
            totalDamage += buffedAtk;

            // temporarily set opponent general's damage (will reset at end of check)
            // ideally we'd keep a local counter, but we don't deal this damage until later
            // this way, damage has been "dealt" and further damage calculations will know if they cause lethal
            opponentGeneral.setDamage(totalDamage);
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _generalLethalCheck => unit " + unit.getLogName() + "can deal damage = " + buffedAtk + ", total damage = " + totalDamage + " of " + opponentGeneralMaxHP)
          }
        });

        // find all burn spells
        let currentMana = myPlayer.getRemainingMana();
        _.each(this._getCardsInHandAndSignatureSpell(), (card) => {
          if (this._getCanPlayCard(card, currentMana) && this._getCardIsBurn(card, opponentGeneral)) {
            _.each(CardIntent.getIntentsByIntentTypeWithPartialTargetType(card.getBaseCardId(), CardIntentType.Burn, CardTargetType.General, true), (intentObj) => {
              // add spell damage
              const damage = intentObj.amount || 0;
              totalDamage += damage;

              // temporarily set remaining mana
              currentMana -= card.getManaCost();

              // temporarily set opponent general's damage (will reset at end of check)
              // ideally we'd keep a local counter, but we don't deal this damage until later
              // this way, damage has been "dealt" and further damage calculations will know if they cause lethal
              opponentGeneral.setDamage(totalDamage);
              // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _generalLethalCheck => burn spell " + card.getLogName() + " can deal damage = " + damage + ", total damage = " + totalDamage + " of " + opponentGeneralMaxHP);
            });
          }
        });

        // set whether we have lethal
        this._hasLethalOnEnemyGeneral = totalDamage >= opponentGeneralMaxHP;
        this._checkingLethalOnEnemyGeneral = false;

        // reset opponent general's damage
        opponentGeneral.setDamage(opponentGeneralDamage);
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _generalLethalCheck => has lethal? " + this._hasLethalOnEnemyGeneral);
      }
    }
  },

  _getBountyForDistanceFromOpponentGeneral() {
    if (this._hasLethalOnEnemyGeneral) {
      return BOUNTY.DISTANCE_FROM_OPPONENT_GENERAL_WHEN_LETHAL;
    }
    return BOUNTY.DISTANCE_FROM_OPPONENT_GENERAL;
  },

  _findPlayCardActionsByType(cardType) {
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsByType() -> cardType", cardType);
    const myPlayer = this.getMyPlayer();
    const cardsInHand = this._getCardsInHandAndSignatureSpell();

    // find all playable cards
    let numBuffingArtifacts = 0;
    let playableCards = _.filter(cardsInHand, (card) => {
      if (this._getCanPlayCard(card) && card.getType() == cardType) {
        // allow card but count buff artifacts
        if (card instanceof SDK.Artifact && !this._getIsCardNotBuffOrAllowableBuff(card)) {
          numBuffingArtifacts++;
        }
        return true;
      }
    });
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsByType() -> cardsInHand", cardsInHand.slice(0), "playableCards", playableCards.slice(0));
    if (playableCards.length > 0) {
      // sort cards by score
      playableCards = _.sortBy(playableCards, (card) => ScoreForCard(card)).reverse();

      // try to play each card until one is played
      const hasFullHand = myPlayer.getDeck().getNumCardsInHand() >= CONFIG.MAX_HAND_SIZE;
      for (let i = 0, il = playableCards.length; i < il; i++) {
        const card = playableCards[i];
        // don't allow artifacts that are buffs unless we have more than 1 in hand or hand is full
        if (!(card instanceof SDK.Artifact) || numBuffingArtifacts > 1 || hasFullHand || this._getIsCardNotBuffOrAllowableBuff(card)) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsByType() -> card ", card.getLogName());
          this._findPlayCardActionsForCard(card);
          // end when we have actions because we know card was played
          if (this._nextActions.length > 0) return;
        }
      }
    }
  },

  _getIsCardNotBuffOrAllowableBuff(card) {
    if (card != null) {
      const cardId = card.getBaseCardId();
      if (CardIntent.getHasIntentType(cardId, CardIntentType.ModifyATK, true)
        || CardIntent.getHasIntentType(cardId, CardIntentType.ModifyHP, true)
        || (CARD_INTENT[cardId] != null && CARD_INTENT[cardId].indexOf('buff') !== -1)) {
        return cardId === SDK.Cards.Spell.Roar
          || cardId === SDK.Cards.Spell.Overload;
      }
    }
    return true;
  },

  _getCanUseSignatureCard() {
    return this._difficulty >= 0.5;
  },

  _getCardsInHandAndSignatureSpell() {
    const myPlayer = this.getMyPlayer();
    const cards = myPlayer.getDeck().getCardsInHand().slice(0);
    if (myPlayer.getIsSignatureCardActive()) {
      cards.push(myPlayer.getCurrentSignatureCard());
    }
    return cards;
  },

  _getCanPlayCard(card, currentMana) {
    return card != null
      && (
        (currentMana == null && card.getDoesOwnerHaveEnoughManaToPlay())
        || (currentMana != null && card.getManaCost() <= currentMana)
      )
      && !_.contains(this._invalidPlayedCards, card);
  },

  _findPlayCardActionsByIntent(oldIntentString) {
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsByIntent() -> ", oldIntentString);
    const myPlayer = this.getMyPlayer();
    const cardsInHand = this._getCardsInHandAndSignatureSpell();

    // find all playable cards
    let playableCards = _.filter(cardsInHand, (card) => {
      if (this._getCanPlayCard(card)
        && CARD_INTENT[card.getBaseCardId()] != null
        && CARD_INTENT[card.getBaseCardId()].indexOf(oldIntentString) > -1) {
        return true;
      }
    });

    if (playableCards.length > 0) {
      // sort cards by score
      playableCards = _.sortBy(playableCards, (card) => ScoreForCard(card)).reverse();

      // try to play each card until one is played
      for (let i = 0, il = playableCards.length; i < il; i++) {
        const card = playableCards[i];
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsByIntent() -> card ", card.getLogName());
        this._findPlayCardActionsForCard(card);
        // end when we have actions because we know card was played
        if (this._nextActions.length > 0) return;
      }
    }
  },

  _findBestPlayCardAction(useThreshold) {
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findBestPlayCardAction() -> useThreshold", useThreshold);
    const cardsInHand = this._getCardsInHandAndSignatureSpell();

    // find all playable cards
    const playableCards = _.filter(cardsInHand, (card) => {
      if (this._getCanPlayCard(card) && !this._getCannotPlayCardDueToDifficulty(card)) {
        if (card instanceof SDK.Unit) {
          return true;
        }
        const intents = CardIntent.getIntentsByCardId(card.getBaseCardId());
        return intents != null && intents.length > 0;
      }
      return false;
    });

    if (playableCards.length > 0) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findBestPlayCardAction() -> has", playableCards.length, "playable cards");
      // find playable card with highest score
      let cardWithBestScore;
      let bestTargetPositionAndScore;
      let bestFollowupPositions;
      for (let i = 0, il = playableCards.length; i < il; i++) {
        const card = playableCards[i];
        const validTargetPositions = card.getValidTargetPositions();
        const filteredValidTargetPositionsScoresAndFollowups = this._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, validTargetPositions, useThreshold);
        if (filteredValidTargetPositionsScoresAndFollowups.positionsAndScores.length > 0) {
          const nextTargetPositionAndScore = filteredValidTargetPositionsScoresAndFollowups.positionsAndScores[0];
          if (bestTargetPositionAndScore == null || nextTargetPositionAndScore.score > bestTargetPositionAndScore.score) {
            bestTargetPositionAndScore = nextTargetPositionAndScore;
            bestFollowupPositions = filteredValidTargetPositionsScoresAndFollowups.followupPositions[0];
            cardWithBestScore = card;
          }
        }
      }

      // play card with highest score
      if (cardWithBestScore != null) {
        const player = cardWithBestScore.getOwner();
        const { position } = bestTargetPositionAndScore;
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findBestPlayCardAction() -> playing", cardWithBestScore.getLogName(), "at", position.x, position.y, "with score", bestTargetPositionAndScore.score);

        // store best followup positions
        this._followupTargets = bestFollowupPositions;

        const cardIsFollowup = cardWithBestScore.getIsFollowup();
        const cardIsSignatureSpell = cardWithBestScore.isSignatureCard();
        if (cardIsFollowup) {
          // followups always get played first
          this._nextActions.unshift(player.actionPlayFollowup(cardWithBestScore, position.x, position.y));
        } else if (cardIsSignatureSpell) {
          this._nextActions.push(player.actionPlaySignatureCard(position.x, position.y));
        } else {
          this._nextActions.push(player.actionPlayCardFromHand(player.getDeck().getCardsInHand().indexOf(cardWithBestScore), position.x, position.y));
        }
      }
    }
  },

  _findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, validTargetPositions, useThreshold, withoutCache) {
    const gameSession = this.getGameSession();
    const board = gameSession.getBoard();
    const cardId = card.getBaseCardId();
    let cacheForCard = this._cacheByCard[cardId];
    if (cacheForCard == null || withoutCache) {
      cacheForCard = this._cacheByCard[cardId] = {
        scoreForCard: null,
        anywherePosition: null,
        scoreAndFollowupPositions: {},
        filteredPositionsScoresAndFollowups: {},
      };
    }

    // attempt to use cached filtered positions, scores, and followups
    let filteredPositionsScoresAndFollowups = cacheForCard.filteredPositionsScoresAndFollowups[useThreshold];
    if (filteredPositionsScoresAndFollowups == null) {
      filteredPositionsScoresAndFollowups = cacheForCard.filteredPositionsScoresAndFollowups[useThreshold] = {
        positionsAndScores: [],
        followupPositions: [],
      };

      // card that can be applied anywhere
      // and have either "all" targeted intents
      // or only target general no matter where you play it
      // should only use a single random valid target position
      if (cacheForCard.anywherePosition != null) {
        validTargetPositions = [cacheForCard.anywherePosition];
      } else if (canCardAndEffectsBeAppliedAnywhere(card)) {
        const validTargetPositionsCopy = validTargetPositions.slice(0);
        while (validTargetPositionsCopy.length > 0) {
          const validPosIndex = Math.floor(Math.random() * validTargetPositionsCopy.length);
          const validPos = validTargetPositionsCopy[validPosIndex];
          if (card.isAreaOfEffectOnBoard(validPos)) {
            cacheForCard.anywherePosition = validPos;
            validTargetPositions = [cacheForCard.anywherePosition];
            break;
          } else {
            validTargetPositionsCopy.splice(validPosIndex, 1);
          }
        }
        if (validTargetPositionsCopy.length === 0) {
          validTargetPositions = [];
        }
      } else {
        // reject invalid positions
        validTargetPositions = _.reject(validTargetPositions, (validPos) =>
        // reject positions that:
        // - contain immune units
        // - do not ensure area of effect is fully on board
          this._isTargetImmuneToSource(board.getUnitAtPosition(validPos), card) || !card.isAreaOfEffectOnBoard(validPos));
      }

      if (validTargetPositions.length > 0) {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] filtering target positions for card", card.getLogName(), "starting with", validTargetPositions.length, "valid positions");

        // filter and sort all valid target positions those that pass a usage threshold
        let cardScore = cacheForCard.scoreForCard;
        if (cardScore == null) {
          cardScore = cacheForCard.scoreForCard = ScoreForCard(card);
        }
        const scoreAndFollowupPositionsCache = cacheForCard.scoreAndFollowupPositions;
        const columnCount = board.getColumnCount();
        _.each(validTargetPositions, (validTargetPosition) => {
          const scoreIndex = UtilsPosition.getMapIndexFromPosition(columnCount, validTargetPosition.x, validTargetPosition.y);
          const scoreAndFollowupPositions = scoreAndFollowupPositionsCache[scoreIndex];
          let score;
          let followupPositions;

          // attempt to use cached score data
          if (scoreAndFollowupPositions != null) {
            score = scoreAndFollowupPositions.score;
            followupPositions = scoreAndFollowupPositions.followupPositions;
          } else {
            score = 0;

            // add base card score
            score += cardScore;

            // score intents
            score += ScoreForIntents(card, validTargetPosition);

            // score followups
            const followupScoreAndFollowupPositions = ScoreForIntentFollowup(card, validTargetPosition);
            score += followupScoreAndFollowupPositions.score;
            followupPositions = followupScoreAndFollowupPositions.followupPositions;
            // Logger.module("AI").debug(" > score for", card.getLogName(), "at", validTargetPosition, "=", score);

            // cache score data
            scoreAndFollowupPositionsCache[scoreIndex] = {
              score,
              followupPositions,
            };
          }

          if (score >= useThreshold) {
            // sorted insert of target position based on score
            const positionAndScore = { position: validTargetPosition, score };
            const insertIndex = UtilsJavascript.arraySortedInsertByProperty(filteredPositionsScoresAndFollowups.positionsAndScores, positionAndScore, 'score');
            filteredPositionsScoresAndFollowups.followupPositions[insertIndex] = followupPositions;
          }
        });
      }
    }
    // if (filteredPositionsScoresAndFollowups.positionsAndScores.length > 0) {
    //   Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] best position and score for", card.getLogName(), " = ", filteredPositionsScoresAndFollowups.positionsAndScores[0], "w/ followups", filteredPositionsScoresAndFollowups.followupPositions[0]);
    // }

    return filteredPositionsScoresAndFollowups;
  },

  _getCannotPlayCardDueToDifficulty(card) {
    if (this._difficulty < 1.0) {
      const player = card.getOwner();
      const cardIsSignatureSpell = card.isSignatureCard();

      // don't always allow signature cards
      if (cardIsSignatureSpell && !this._getCanUseSignatureCard()) {
        return true;
      }

      const hasFullHand = player.getDeck().getNumCardsInHand() >= CONFIG.MAX_HAND_SIZE;
      if (!hasFullHand) {
        // summon that is not followup
        if (!card.getIsFollowup() && this._getCardIsSpawn(card)) {
          if (this._numSpawnedUnitsThisTurn >= Math.max(1, Math.floor(this._difficulty * DIFFICULTY_MAX_SPAWNS_PER_TURN))) {
            // skip card when it's a spawn and already played max this turn
            return true;
          }
          const numFriendlyUnits = this.getGameSession().getBoard().getFriendlyEntitiesForEntity(this.getMyGeneral()).length;
          if (numFriendlyUnits >= Math.max(1, Math.floor(this._difficulty * DIFFICULTY_MAX_SPAWNED))) {
            // skip card when it's a spawn and already at max spawned
            return true;
          }
        }

        // burn or removal that is not followup
        if (!card.getIsFollowup() && (this._getCardIsBurn(card) || this._getCardIsRemoval(card)) && this._numUnitsRemovedThisTurn >= Math.max(1, Math.floor(this._difficulty * DIFFICULTY_MAX_UNITS_REMOVED_PER_TURN))) {
          // skip card when it's a burn or removal and already removed max
          return true;
        }
      }
    }

    return false;
  },

  _getCardIsSpawn(card) {
    const cardId = card.getBaseCardId();
    if (card instanceof SDK.Unit) return true;
    if (CardIntent.getHasIntentType(cardId, CardIntentType.Summon, true)) return true;
    // TODO: remove me
    if (CARD_INTENT[cardId] != null && CARD_INTENT[cardId].indexOf('summon') !== -1) return true;
    return false;
  },

  _getCardIsBurn(card, target) {
    const cardId = card.getBaseCardId();
    if (target instanceof SDK.Unit) {
      if (target.getIsGeneral()) {
        if (CardIntent.getHasIntentTypeWithPartialTargetType(cardId, CardIntentType.Burn, CardTargetType.General, true)) {
          return true;
        }
      } else if (CardIntent.getHasIntentTypeWithPartialTargetType(cardId, CardIntentType.Burn, CardTargetType.Minion, true)) {
        return true;
      }
    } else if (CardIntent.getHasIntentType(cardId, CardIntentType.Burn, true)) {
      return true;
    }
    // TODO: remove me
    if (CARD_INTENT[cardId] != null && CARD_INTENT[cardId].indexOf('burn') !== -1) {
      if (target instanceof SDK.Unit) {
        if (!target.getIsGeneral() || CARD_INTENT[cardId].indexOf('minion') === -1) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  },

  _getCardIsAtkBuffFor(card, unit) {
    const cardId = card.getBaseCardId();
    let isBuff = false;
    let intents;
    if (unit.getIsGeneral()) {
      intents = CardIntent.getIntentsByIntentTypeWithPartialTargetType(cardId, CardIntentType.ModifyATK, CardTargetType.General, true);
    } else {
      intents = CardIntent.getIntentsByIntentTypeWithPartialTargetType(cardId, CardIntentType.ModifyATK, CardTargetType.Minion, true);
    }
    for (let i = 0, il = intents.length; i < il; i++) {
      const intentObj = intents[i];
      if (intentObj.amount > 0) {
        isBuff = true;
        break;
      }
    }

    // TODO: remove me
    if (!isBuff) {
      isBuff = (CARD_INTENT[cardId] != null
        && CARD_INTENT[cardId].indexOf('buff') > -1
        && CARD_INTENT[cardId].indexOf('debuff') == -1
        && (!unit.getIsGeneral() || CARD_INTENT[cardId].indexOf('general') != -1));
    }

    // card must ensure that:
    // - this unit's position is a valid target
    // - this unit is NOT immune to
    // - does NOT deal lethal damage to this unit
    return isBuff && card.getIsPositionValidTarget(unit.getPosition()) && !this._isTargetImmuneToSource(unit, card) && willUnitSurviveCard(unit, card);
  },

  _getCardIsAtkDebuffFor(card, unit) {
    const cardId = card.getBaseCardId();
    let isDebuff = false;
    let intents;
    if (unit.getIsGeneral()) {
      intents = CardIntent.getIntentsByIntentTypeWithPartialTargetType(cardId, CardIntentType.ModifyATK, CardTargetType.General, true);
    } else {
      intents = CardIntent.getIntentsByIntentTypeWithPartialTargetType(cardId, CardIntentType.ModifyATK, CardTargetType.Minion, true);
    }
    for (let i = 0, il = intents.length; i < il; i++) {
      const intentObj = intents[i];
      if (intentObj.amount < 0) {
        isDebuff = true;
        break;
      }
    }

    // TODO: remove me
    if (!isDebuff) {
      isDebuff = (CARD_INTENT[cardId] != null
        && CARD_INTENT[cardId].indexOf('debuff') > -1
        && (!unit.getIsGeneral() || CARD_INTENT[cardId].indexOf('general') != -1));
    }

    // card must ensure that:
    // - this unit's position is a valid target
    // - this unit is NOT immune to
    // - does NOT deal lethal damage to this unit
    return isDebuff && card.getIsPositionValidTarget(unit.getPosition()) && !this._isTargetImmuneToSource(unit, card) && willUnitSurviveCard(unit, card);
  },

  _getCardIsRemoval(card) {
    const cardId = card.getBaseCardId();
    if (CardIntent.getHasIntentType(cardId, CardIntentType.Remove, true)) return true;
    // TODO: remove me
    if (CARD_INTENT[cardId] != null && (CARD_INTENT[cardId].indexOf('removal') !== -1 || CARD_INTENT[cardId].indexOf('shadownova') !== -1)) return true;
    return false;
  },

  _getCardIsMass(card) {
    const cardId = card.getBaseCardId();
    if (CardIntent.getAnyIntentsMatchPartialTargetType(cardId, CardTargetType.All, true)) return true;
    // TODO: remove me
    if (CARD_INTENT[cardId] != null && (CARD_INTENT[cardId].indexOf('mass') !== -1 || CARD_INTENT[cardId].indexOf('shadownova') !== -1)) return true;
    return false;
  },

  _findPlayCardActionsForCard(card, targetPosition) {
    if (this._getCanPlayCard(card) && !this._getCannotPlayCardDueToDifficulty(card)) {
      const cardId = card.getBaseCardId();
      const cardIsFollowup = card.getIsFollowup();
      const cardIsSignatureSpell = card.isSignatureCard();
      const player = card.getOwner();
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsForCard ->" + card.getLogName());
      let validTargetPositions;
      if (targetPosition != null) {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsForCard -> target " + targetPosition.x + ", " + targetPosition.y);
        validTargetPositions = [targetPosition];
      } else {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsForCard -> finding target");
        validTargetPositions = card.getValidTargetPositions();
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsForCard -> num valid target positions before filter ", validTargetPositions.length);
        if (validTargetPositions.length > 0) {
          let needsOldBehavior = true;
          const intents = CardIntent.getIntentsByCardId(cardId);
          const hasIntents = intents != null && intents.length > 0;
          if (hasIntents || card instanceof SDK.Unit) {
            needsOldBehavior = false;

            // detemine use threshold
            let useThreshold;
            if (player.getDeck().getNumCardsInHand() >= CONFIG.MAX_HAND_SIZE) {
              // attempt to make space when hand is full
              useThreshold = 0.0;
            } else if (card instanceof SDK.Unit && !hasIntents) {
              // use play card threshold and modulate based on player's remaining mana
              // this should encourage AI to play units with lower value at the start of the game
              // or when the AI is low on mana during a turn
              useThreshold = Math.max(THRESHOLD.PLAY_CARD_MINIMUM, THRESHOLD.PLAY_CARD * Math.min(1.0, (player.getRemainingMana() / (CONFIG.MAX_MANA * 0.6))));
            } else {
              useThreshold = THRESHOLD.PLAY_CARD;
            }

            const filteredValidTargetPositionsScoresAndFollowups = this._findFilteredTargetPositionsScoresAndFollowupsForCardByIntent(card, validTargetPositions, useThreshold);
            if (filteredValidTargetPositionsScoresAndFollowups.positionsAndScores.length > 0) {
              const bestPositionsAndScore = filteredValidTargetPositionsScoresAndFollowups.positionsAndScores[0];
              const followupPositions = filteredValidTargetPositionsScoresAndFollowups.followupPositions[0];
              validTargetPositions = [bestPositionsAndScore.position];
              this._followupTargets = followupPositions;
            } else {
              // if there's nothing that passes the score threshold, don't cast it.
              validTargetPositions = [];
            }
          }

          if (needsOldBehavior) {
            const filteredValidTargetPositions = this._findFilteredTargetPositionsForCardByOldIntent(card, validTargetPositions);

            if (filteredValidTargetPositions.length > 0 && filteredValidTargetPositions[0] == null) {
              // filtered valid target positions ended in bad state
              validTargetPositions = [];
            } else if (filteredValidTargetPositions.length === validTargetPositions.length
              && filteredValidTargetPositions[0].x === validTargetPositions[0].x
              && filteredValidTargetPositions[0].y === validTargetPositions[0].y
              && card.getCanBeAppliedAnywhere()) {
              // pick random position from valid targets when card can be applied anywhere
              validTargetPositions = [validTargetPositions[Math.floor(Math.random() * validTargetPositions.length)]];
            } else {
              validTargetPositions = filteredValidTargetPositions;
            }
          }
        }
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findPlayCardActionsForCard -> num valid target positions after filter ", validTargetPositions.length);
      }

      if (validTargetPositions.length > 0) {
        const validTargetPosition = validTargetPositions[0];
        if (validTargetPosition != null) {
          let playCardAction;
          if (cardIsFollowup) {
            // we must always resolve followups before any possibly loaded subsequent actions (i.e. primordial gazer and repulsor beast)
            playCardAction = player.actionPlayFollowup(card, validTargetPosition.x, validTargetPosition.y);
            this._nextActions.unshift(playCardAction);
          } else if (cardIsSignatureSpell) {
            this._nextActions.push(player.actionPlaySignatureCard(validTargetPosition.x, validTargetPosition.y));

            // add count for spawns
            if (this._getCardIsSpawn(card)) {
              this._numSpawnedUnitsThisTurn++;
            }
          } else {
            playCardAction = player.actionPlayCardFromHand(this.getGameSession().getCurrentPlayer().getDeck().getCardsInHand()
              .indexOf(card), validTargetPosition.x, validTargetPosition.y);
            this._nextActions.push(playCardAction);
            // add count for spawns
            if (this._getCardIsSpawn(card)) {
              this._numSpawnedUnitsThisTurn++;
            }
          }
        }
      }
    }
  },

  _findFilteredTargetPositionsForCardByOldIntent(card, validTargetPositions) {
    const cardId = card.getBaseCardId();
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent -> filtering target positions length = " + validTargetPositions.length + " for card ID =" + cardId);
    if (CARD_INTENT[cardId] != null) {
      // pre-filter valid positions for spells
      if (card instanceof SDK.Spell) {
        validTargetPositions = _.reject(validTargetPositions, (validPos) =>
        // reject immune units
          this._isTargetImmuneToSource(this.getGameSession().getBoard().getUnitAtPosition(validPos), card));
      }
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent -> target positions length after immunity filter = " + validTargetPositions.length + " for card ID =" + cardId);
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent -> card intent = " + CARD_INTENT[cardId] + " for card ID =" + cardId);
      switch (CARD_INTENT[cardId]) {
      case 'draw':
      case 'draw_bbs':
        var cardsInHand = this.getGameSession().getCurrentPlayer().getDeck().getNumCardsInHand();
        if (CARD_INTENT[cardId].indexOf('bbs') !== -1) {
          if (cardsInHand > CONFIG.MAX_HAND_SIZE - CONFIG.CARD_DRAW_PER_TURN) { // don't cast if we have full hand or will after end-turn draw
            validTargetPositions = [];
          }
        } else if (cardsInHand > (CONFIG.MAX_HAND_SIZE - (CONFIG.CARD_DRAW_PER_TURN + 1))) { // don't cast if we have full hand -2 (4) or more cards
          validTargetPositions = [];
        }
        break;
      case 'hand_improve_minion_mass':
      case 'hand_improve_minion_mass_bbs':
        // cast as long as we have at least one minion in hand
        var cardsInHand = this.getGameSession().getCurrentPlayer().getDeck().getCardsInHand();
        var minionsInHand = _.filter(cardsInHand, (card) => card instanceof SDK.Unit);
        if (minionsInHand.length < 1) {
          validTargetPositions = [];
        }
        break;
      case 'stun':
        var myGeneral = this.getMyGeneral();
        validTargetPositions = _.reject(validTargetPositions, (validPos) => {
          // reject empty positions
          const unitAtPosition = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          if (unitAtPosition == null) return true;
          // reject friendly units
          if (unitAtPosition.getIsSameTeamAs(myGeneral)) return true;
          return false;
        });

        // beam shock.  only use it to stun high value minions and not generals (but don't stun a minion that's already stunned)
        validTargetPositions = _.filter(validTargetPositions, (validPos) => {
          const unitAtPos = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          return unitAtPos.getATK() > THRESHOLD_HIGH_ATTACK_UNIT && !unitAtPos.getIsGeneral() && !unitAtPos.hasActiveModifierClass(SDK.ModifierStunned);
        });

        if (validTargetPositions.length > 0) {
          validTargetPositions = _.sortBy(validTargetPositions, (validPos) => ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos))).reverse();
        }
        break;
      case 'burn_stun_minion':
        var myGeneral = this.getMyGeneral();
        validTargetPositions = _.reject(validTargetPositions, (validPos) => {
          // reject empty positions
          const unitAtPosition = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          if (unitAtPosition == null) return true;
          // reject friendly units
          if (unitAtPosition.getIsSameTeamAs(myGeneral)) return true;
          return false;
        });

        // flash freeze. we prefer to use as stun on high bounty units that are not already stunned and are not generals, but will use for lethal burn in some cases
        validTargetPositions = _.filter(validTargetPositions, (validPos) => {
          const unitAtPos = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          return unitAtPos.getHP() <= card.damageAmount || (unitAtPos.getATK() > THRESHOLD_HIGH_ATTACK_UNIT && !unitAtPos.hasActiveModifierClass(SDK.ModifierStunned) && !unitAtPos.getIsGeneral());
        });

        if (validTargetPositions.length > 0) {
          validTargetPositions = _.sortBy(validTargetPositions, (validPos) => ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos))).reverse();
        }
        break;
      case 'burn':
      case 'burn_minion':
      case 'burn_dispel':
        var myGeneral = this.getMyGeneral();
        validTargetPositions = _.reject(validTargetPositions, (validPos) => {
          // reject empty positions
          const unitAtPosition = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          if (unitAtPosition == null) return true;
          // reject friendly units
          if (unitAtPosition.getIsSameTeamAs(myGeneral)) return true;
          return false;
        });

        // chromatic cold. we prefer to use as dispel on high bounty, buffed units, but will use for lethal burn in some cases
        if (!card.getIsFollowup()) {
          validTargetPositions = _.filter(validTargetPositions, (validPos) => {
            const unitAtPos = this.getGameSession().getBoard().getUnitAtPosition(validPos);
            return unitAtPos.getHP() <= card.damageAmount || ((!unitAtPos.getIsGeneral() && ScoreForModifiers(unitAtPos) >= THRESHOLD_DISPEL));
          });
        }

        if (validTargetPositions.length > 0) {
          validTargetPositions = _.sortBy(validTargetPositions, (validPos) => ScoreForUnitDamage(this.getGameSession().getBoard().getUnitAtPosition(validPos), card.damageAmount)).reverse();
        }
        break;
      case 'burn_move_enemy_minion':
        var myGeneral = this.getMyGeneral();
        var validTargetPositions_copy = validTargetPositions.slice(0);
        validTargetPositions = _.reject(validTargetPositions, (validPos) => {
          // reject empty positions
          const unitAtPosition = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          if (unitAtPosition == null) return true;
          // reject friendly units
          if (unitAtPosition.getIsSameTeamAs(myGeneral)) return true;
          return false;
        });
        if (cardId == SDK.Cards.Spell.DaemonicLure) {
          // daemonic lure. we prefer to use as relocate on high bounty units, but will use for lethal burn in some cases
          validTargetPositions = _.reject(validTargetPositions, (validPos) => {
            const unitAtPos = this.getGameSession().getBoard().getUnitAtPosition(validPos);
            return (unitAtPos.getHP() - (card.damageAmount || 0) > 0) || unitAtPos.hasModifierClass(SDK.ModifierRanged);
          });
        }
        if (!this._hasLethalOnEnemyGeneral) {
          // allow burn spell targeting for non-lethal damage when generalLethal is triggered
          validTargetPositions = _.filter(validTargetPositions, (validPos) => {
            const potentialTarget = this.getGameSession().getBoard().getUnitAtPosition(validPos);
            return potentialTarget.getHP() <= card.damageAmount;
          });
        }
        if (validTargetPositions.length > 0) {
          validTargetPositions = _.sortBy(validTargetPositions, (validPos) => ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos))).reverse();
          const generalLethal = _.find(validTargetPositions, (validPos) => {
            const unitAtPos = this.getGameSession().getBoard().getUnitAtPosition(validPos);
            return unitAtPos instanceof SDK.Unit && unitAtPos.getIsGeneral();
          });
          if (generalLethal != null) {
            validTargetPositions[0] = generalLethal;
          }
        } else if (CARD_INTENT[cardId].indexOf('move') > -1) {
          // only move units with ATK of at least 4 or provokers or ranged units
          validTargetPositions = _.reject(validTargetPositions_copy, (validPos) => {
            const enemy = this.getGameSession().getBoard().getUnitAtPosition(validPos);
            return (enemy.getATK() < THRESHOLD.HIGH_ATK && !enemy.hasModifierClass(SDK.ModifierProvoke) && !enemy.hasModifierClass(SDK.ModifierRanged));
          });
          // if a high value move target exists, choose the one with the highest distance bounty
          if (validTargetPositions.length > 0) {
            validTargetPositions[0] = this._highestPositionObjectiveAndScoreFromPositions(card, validTargetPositions).targetPosition;
          }
        }
        break;
      case 'removal':
      case 'removal_buff_minion':
        if (cardId == SDK.Cards.Spell.Martyrdom && this._hasLethalOnEnemyGeneral) // dont cast martyrdom when enemy general within lethal
        { return []; } // NOTE: the expected response is an ARRAY so don't return NULL
        var myGeneral = this.getMyGeneral();
        // reject friendly units
        validTargetPositions = _.reject(validTargetPositions, (validPos) => this.getGameSession().getBoard().getUnitAtPosition(validPos).getIsSameTeamAs(myGeneral));
        validTargetPositions = _.sortBy(validTargetPositions, (validPos) => ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos))).reverse();
        // drawback considerations
        if (cardId == SDK.Cards.Spell.AspectOfTheWolf) // aspect of the fox replace with 3/3
        { validTargetPositions = _.reject(validTargetPositions, (validPos) => ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos)) < 14); } else if (cardId == SDK.Cards.Spell.Martyrdom) // heal enemy general by unit's hp
        { validTargetPositions = _.reject(validTargetPositions, (validPos) => ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos)) < 12); } else validTargetPositions = _.reject(validTargetPositions, (validPos) => (ScoreForUnit(this.getGameSession().getBoard().getUnitAtPosition(validPos)) < 10));
        break;

      case 'shadownova':
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 1");
        var myGeneral = this.getMyGeneral();
        var enemies = this.getGameSession().getBoard().getEnemyEntitiesForEntity(myGeneral, SDK.CardType.Unit);
        var shadownovaDamage = 1;
        var shadowTiles = _.filter(this.getGameSession().getBoard().getTiles(true), (tile) => tile.hasModifierClass(SDK.ModifierStackingShadows));
        // target enemies not already standing on shadow creep
        // this means we never intentionally use shadownova to amplify damage to enemies already standing on shadow creep...
        enemies = _.reject(enemies, (enemy) => _.intersection([enemy.getPosition()], shadowTiles) > 0);
        // reject immune units
        enemies = _.reject(enemies, (enemy) => this._isTargetImmuneToSource(enemy, card));
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 2 enemies.length = " + enemies.length + ". shadownovadamage = " + shadownovaDamage);
        if (_.some(enemies, (enemy) => enemy.getHP() <= shadownovaDamage)) {
          // if we can kill something with shadownova, pick highest bounty target
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 3 enemy can be killed");
          const enemiesWithinLethalRange = _.filter(enemies, (enemy) => enemy.getHP() <= shadownovaDamage);
          const primaryTarget = _.max(enemiesWithinLethalRange, (enemy) => ScoreForUnitDamage(enemy, shadownovaDamage));
          enemies = _.without(enemies, primaryTarget); // remove primary target from remaining enemies
          // get enemies adjacent to primary target and select one with highest damage bounty
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 3.5 primary target = " + primaryTarget.getLogName());
          let secondaryTargetsArray = this.getGameSession().getBoard().getFriendlyEntitiesAroundEntity(primaryTarget, SDK.CardType.Unit);
          // reject enemies already standing on shadow creep...?
          secondaryTargetsArray = _.reject(secondaryTargetsArray, (enemy) => _.intersection([enemy.getPosition()], shadowTiles) > 0);
          if (secondaryTargetsArray.length == 0 && ScoreForUnitDamage(primaryTarget, shadownovaDamage) < 99) {
            // overrides secondry target requirement when general lethal possible
            //* **TODO - SELECT ALTERNATIVE PRIMARY TARGET
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova - no SECONDARY lethal targets. not casting.");
            validTargetPositions = []; // do not cast if we can't affect at least 2 enemies or we're not killing general
          } else {
            let secondaryTarget;
            if (ScoreForUnitDamage(primaryTarget, shadownovaDamage) >= 99) {
              // overrides secondary target requirement when general lethal possible
              secondaryTarget = primaryTarget;
            } else {
              secondaryTarget = _.max(secondaryTargetsArray, (secondaryTarget) => ScoreForUnitDamage(secondaryTarget, shadownovaDamage));
            }
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 4 enemy can be killed, secondary target affected. primary = " + primaryTarget.getLogName() + ". secondary = " + secondaryTarget.getLogName());

            // allow 3rd "auxiliary" target
            // get enemies adjacent to primary AND secondary targets and select one with highest damage bounty
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 4.1 seeking 3rd target");
            let unitsAroundPrimaryTarget = this.getGameSession().getBoard().getFriendlyEntitiesAroundEntity(primaryTarget, SDK.CardType.Unit);
            // exclude secondary
            unitsAroundPrimaryTarget = _.reject(unitsAroundPrimaryTarget, (target) => target == secondaryTarget);
            let unitsAroundSecondaryTarget = this.getGameSession().getBoard().getFriendlyEntitiesAroundEntity(secondaryTarget, SDK.CardType.Unit);
            // exclude primary
            unitsAroundSecondaryTarget = _.reject(unitsAroundSecondaryTarget, (target) => target == primaryTarget);
            // find new units who are adjacent to both our primary and secondary targets by intersecting the adjacent arrays
            let auxiliaryTargetsArray = _.intersection(unitsAroundPrimaryTarget, unitsAroundSecondaryTarget);
            // reject enemies already standing on shadow creep...?
            auxiliaryTargetsArray = _.reject(auxiliaryTargetsArray, (enemy) => _.intersection([enemy.getPosition()], shadowTiles) > 0);
            if (auxiliaryTargetsArray.length > 0) {
              var auxiliaryTarget = _.max(auxiliaryTargetsArray, (auxTarget) => ScoreForUnitDamage(auxTarget, shadownovaDamage));
              // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 4.2 3rd target acquired: " + auxiliaryTarget.name);
            } else {
              auxiliaryTarget = primaryTarget;
            }

            // position to affect all targets - if no auxiliaryTarget, auxiliaryTarget will be same as primary target and will simply be redundant targeting
            const affectPattern = card.getAffectPattern();
            const positionsToMatch = [primaryTarget.getPosition()];
            if (primaryTarget !== secondaryTarget) { positionsToMatch.push(secondaryTarget.getPosition()); }
            if (primaryTarget !== auxiliaryTarget) { positionsToMatch.push(auxiliaryTarget.getPosition()); }
            const positionThatAffectsAllTargets = _.find(validTargetPositions, (pos) => {
              // find position that contains all targets
              const bx = pos.x;
              const by = pos.y;
              let numMatches = 0;
              for (let a = 0, al = affectPattern.length; a < al; a++) {
                const offset = affectPattern[a];
                if (UtilsPosition.getIsPositionInPositions(positionsToMatch, { x: bx + offset.x, y: by + offset.y })) {
                  numMatches++;
                  if (numMatches === positionsToMatch.length) {
                    break;
                  }
                }
              }

              // position must also ensure that area of effect remains on board
              return numMatches === positionsToMatch.length && card.isAreaOfEffectOnBoard(pos);
            });
              // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] done finding target pos.");
            validTargetPositions = [positionThatAffectsAllTargets];
            // flag targets as marked for death - do not allow targets or attacks against them
            // TODO: any other incidental deaths?
            this._markedForDeath.push(primaryTarget);
            this._markedForDeath.push(secondaryTarget);
            this._markedForDeath.push(auxiliaryTarget);
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 5 position to affect both targets = " + positionThatAffectsAllTargets.x + ", " + positionThatAffectsAllTargets.y);
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova 6 primary = " + this._markedForDeath[0].getLogName() + " secondary = " + this._markedForDeath[1].getLogName() + " auxiliary = " + this._markedForDeath[2].getLogName());
            /// /DEBUGGING START
            /// /disable cast
            // validTargetPositions = [];
            /// /DEBUGGING END
          }
        } else { // no lethal targets - don't cast.
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] shadownova - no lethal targets. not casting.");
          validTargetPositions = [];
        }
        break;
      case 'burn_mass_minion':
      case 'burn_mass_enemy_minion':
      case 'burn_mass':
      case 'removal_mass_minion':
      case 'burn_mass_enemy':
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] burn mass detected.");
        var damageAmount = 0;
        if (CARD_INTENT[cardId].indexOf('burn') > -1) damageAmount = card.damageAmount;
        else damageAmount = 999;
        var enemyDamageBounty = 0;
        var myDamageBounty = 0;
        var enemiesKilled = 0;
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] cardid = " + cardId);
        if (cardId == SDK.Cards.Spell.Warbird) {
          // threshold for casting - 23.3 is base dmg to general, so at 3+ cards in hand, requires dmg to at least something else to cast, otherwise we hold. this threshold declines as number of cards in hand declines because saving cards has value
          myDamageBounty += 20 + (this.getMyPlayer().getDeck().getNumCardsInHand() * 1.5);
          enemiesKilled++; // allows warbird to be cast without lethal
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] warbird detected. mybounty = " + myDamageBounty);
        }
        var myGeneral = this.getMyGeneral();
        _.each(this.getGameSession().getBoard().getUnits(), (unit) => {
          if (this._isTargetImmuneToSource(unit, card)) return; // don't count immune units
          if (CARD_INTENT[cardId].indexOf('minion') > -1 && unit.getIsGeneral()) return; // don't count generals if spell effects only minions (i.e. burn_mass_minion)
          if (cardId == SDK.Cards.Spell.Avalanche && this._isOnMySideOfBoard(card, unit.getPosition()) == false) return; // avalanche only deal dmg to units on starting side of field
          if (cardId == SDK.Cards.Spell.Warbird && unit.getPosition().x !== this.getOpponentGeneral().getPosition().x) return; // warbird only deals damage in column of
          if (cardId == SDK.Cards.Spell.PlasmaStorm && unit.getATK() > 3) return; // plasma storm only minions with 3 or less attack
          if (unit.getIsSameTeamAs(myGeneral) && CARD_INTENT[cardId].indexOf('enemy') == -1) {
            myDamageBounty += ScoreForUnitDamage(unit, damageAmount);
          } else if (!unit.getIsSameTeamAs(myGeneral)) {
            enemyDamageBounty += ScoreForUnitDamage(unit, damageAmount);
            if (damageAmount >= unit.getHP()) {
              enemiesKilled++;
            }
          }
        });
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] enemydamagebounty = " + enemyDamageBounty + ". myDamageBounty = " + myDamageBounty);
        if (enemyDamageBounty < myDamageBounty || enemiesKilled == 0) {
          // clear targets (don't cast) as burn spell doesn't meet criteria
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] criteria not met. clearing targets.");
          validTargetPositions = [];
        }
        break;
      case 'burn_mass_column':
        // warbird - DEPRECATED. old design, no longer used
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] burn_mass_column warbird entered.");
        validTargetPositions = [];
        var { damageAmount } = card;
        var enemiesKilled = 0;
        var score = 0;
        var myGeneral = this.getMyGeneral();
        var columnCount = this.getGameSession().getBoard().getColumnCount();
        var bestColumn = { columnNumber: null, score: 1, enemiesKilled: 0 };
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] looping through " + columnCount + " columns.");
        for (i = 0; i < columnCount; i++) {
          // loop through each column
          enemiesKilled = 0;
          score = 0;
          const unitsInColumn = this.getGameSession().getBoard().getEntitiesInColumn(i, SDK.CardType.Unit);
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] " + unitsInColumn.length + " units in column " + i);
          // for each column, loop through each affected unit
          if (unitsInColumn.length > 0) {
            _.each(unitsInColumn, (unit) => {
              if (this._isTargetImmuneToSource(unit, card)) return; // don't count immune units
              // if (CARD_INTENT[cardId].indexOf("minion") > -1 && unit.getIsGeneral()) return; //don't count generals if spell effects only minions (i.e. burn_mass_minion)
              if (unit.getIsSameTeamAs(myGeneral) && CARD_INTENT[cardId].indexOf('enemy') == -1) {
                score -= ScoreForUnitDamage(unit, damageAmount);
              } else if (!unit.getIsSameTeamAs(myGeneral)) {
                score += ScoreForUnitDamage(unit, damageAmount);
                if (damageAmount >= unit.getHP()) {
                  enemiesKilled++;
                }
              }
              // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] score for column " + i + " = " + score + ". enemiesKilled= " + enemiesKilled);
              if (score > bestColumn.score && enemiesKilled > bestColumn.enemiesKilled) {
                // check if best column
                // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] +++++++++++ best column is now column " + i);
                bestColumn.score = score;
                bestColumn.enemiesKilled = enemiesKilled;
                bestColumn.columnNumber = i;
              }
            });
          }
        }

        if (bestColumn.columnNumber != null) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] ==========best column is column " + bestColumn.columnNumber);
          validTargetPositions[0] = { x: bestColumn.columnNumber, y: 1 };
        }
        break;
      case 'move':
        if (validTargetPositions.length > 0) {
          var bestTargetPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(card, validTargetPositions).targetPosition;
          if (bestTargetPosition != null) {
            validTargetPositions[0] = bestTargetPosition;
          } else {
            validTargetPositions = [];
          }
        }
        break;
      case 'move_enemy_minion':
        // only move units with ATK of at least 4 or provokers or ranged units
        validTargetPositions = _.reject(validTargetPositions, (validPos) => {
          const enemy = this.getGameSession().getBoard().getUnitAtPosition(validPos);
          return (enemy.getATK() < THRESHOLD.HIGH_ATK && !enemy.hasModifierClass(SDK.ModifierProvoke) && !enemy.hasModifierClass(SDK.ModifierRanged));
        });
        // if a high value move target exists, choose the one with the highest distance bounty
        if (validTargetPositions.length > 0) {
          var bestTargetPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(card, validTargetPositions).targetPosition;
          if (bestTargetPosition != null) {
            validTargetPositions[0] = bestTargetPosition;
          } else {
            validTargetPositions = [];
          }
        }
        break;
      case 'summon_move_enemy_minion':
        // GOAL: move high atk enemies away or move ranged units close or provokers away
        // find all enemies adjacent to potential spawn locations
        var potentialEnemiesToMove = [];
        var unitsAroundPos = [];
        var enemiesAroundPos = [];
        var original_validTargetPositions = validTargetPositions;
        validTargetPositions = [];
        _.each(original_validTargetPositions, (pos) => {
          unitsAroundPos = this.getGameSession().getBoard().getCardsAroundPosition(pos, SDK.CardType.Unit);
          if (unitsAroundPos.length > 0) {
            const myGeneral = this.getMyGeneral();
            enemiesAroundPos = _.reject(unitsAroundPos, (unit) => unit.getIsSameTeamAs(myGeneral));
            potentialEnemiesToMove = _.union(potentialEnemiesToMove, enemiesAroundPos); // returns array of unique items in one or more arrays, no duplicates
          }
        });
        // can't move generals
        potentialEnemiesToMove = _.reject(potentialEnemiesToMove, (enemy) => enemy.getIsGeneral());
        // reject immune units
        potentialEnemiesToMove = _.reject(potentialEnemiesToMove, (enemy) => this._isTargetImmuneToSource(enemy, card));
        if (potentialEnemiesToMove.length > 0) {
          // then reject if atk < THRESHOLD.HIGH_ATK && not provoke (this means atk > 4 and provokers pass)
          potentialEnemiesToMove = _.reject(potentialEnemiesToMove, (enemy) => (enemy.getATK() < THRESHOLD.HIGH_ATK && !enemy.hasModifierClass(SDK.ModifierProvoke)));
          if (potentialEnemiesToMove.length > 0) {
            // sort by bounty
            potentialEnemiesToMove = _.sortBy(potentialEnemiesToMove, (enemy) => ScoreForUnit(enemy)).reverse();
            // take top enemy on list
            const targetEnemyToMove = potentialEnemiesToMove[0];
            // find available spawn location adjacent to it
            const validTargetPositionsAdjacentToTargetEnemyToMove = _.filter(original_validTargetPositions, (pos) => arePositionsEqualOrAdjacent(pos, targetEnemyToMove.position));
            // if more than one available, sort it by bounty
            if (validTargetPositionsAdjacentToTargetEnemyToMove.length > 0) {
              var bestTargetPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(card, validTargetPositionsAdjacentToTargetEnemyToMove).targetPosition;
              if (bestTargetPosition != null) {
                validTargetPositionsAdjacentToTargetEnemyToMove[0] = bestTargetPosition;
                // we now have spawn location, followup target (the enemy to move), and a way to quickly get the target destination
                // add followup_followTarget as optional paramete to _findPlayCardActionsForCard() for this as it's a triple-target spell.
                // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent() => about to play repulsor beast to " + validTargetPositionsAdjacentToTargetEnemyToMove[0].x + ", " + validTargetPositionsAdjacentToTargetEnemyToMove[0].y + " and then target this enemy to teleport away: " + targetEnemyToMove.getLogName() + " at " + targetEnemyToMove.position.x + ", " + targetEnemyToMove.position.y);
                // since we already calculated it, we can save some time and save it here
                this._followupTargets.unshift(targetEnemyToMove.position); // The unshift() method adds a new element to an array (at the beginning), and "unshifts" older elements:
                validTargetPositions[0] = validTargetPositionsAdjacentToTargetEnemyToMove[0];
              } else {
                validTargetPositions = [];
              }
            }
          }
        }
        break;
      case 'summon':
      case 'summon_heal':
      case 'summon_burn':
      case 'summon_grow':
      case 'summon_watcher':
      case 'summon_ranged_bbs':
        // just find best spawn location for unit
        if (validTargetPositions.length > 0) {
          var bestTargetPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(card, validTargetPositions).targetPosition;
          if (bestTargetPosition != null) {
            validTargetPositions[0] = bestTargetPosition;
          } else {
            validTargetPositions = [];
          }
        }
        break;
      case 'refresh':
        validTargetPositions = _.filter(validTargetPositions, (validPos) => this.getGameSession().getBoard().getUnitAtPosition(validPos).attacksMade > 0);
        break;
      case 'teleport_destination':
        // determine source pos
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent() => teleport destination being selected");
        var followupSourcePos = card.getFollowupSourcePosition();
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent() => teleport destination. source pos = " + followupSourcePos.x + ", " + followupSourcePos.y);
        var cardBeingTeleported = this.getGameSession().getBoard().getUnitAtPosition(followupSourcePos);
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent() => teleport destination. card @ source pos = " + cardBeingTeleported.getLogName());
        if (validTargetPositions.length > 0) {
          var bestTargetPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(cardBeingTeleported, validTargetPositions).targetPosition;
          if (bestTargetPosition != null) {
            validTargetPositions[0] = bestTargetPosition;
          } else {
            validTargetPositions = [];
          }
        }
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findFilteredTargetPositionsForCardByOldIntent() => teleport destination = " + validTargetPositions[0].x + ", " + validTargetPositions[0].y);
        break;
      case 'heal_bbs':
      case 'heal_followup':
        // find most damaged friendly unit
        var myGeneral = this.getMyGeneral();
        var board = this.getGameSession().getBoard();
        var mostDamagedUnit;
        _.each(validTargetPositions, (pos) => {
          const unit = board.getUnitAtPosition(pos);
          if (unit != null && unit.getIsSameTeamAs(myGeneral) && (mostDamagedUnit == null || unit.getDamage() > mostDamagedUnit.getDamage())) {
            mostDamagedUnit = unit;
          }
        });
        if (CARD_INTENT[cardId].indexOf('followup') == -1
            && (mostDamagedUnit == null || (mostDamagedUnit.getDamage() < ((card.healModifier || 0) - 1)))) {
          // if it's not a followup, save the heal until we have a target that will be healed for at least most of the heal value
          validTargetPositions = [];
        } else {
          validTargetPositions = [mostDamagedUnit.getPosition()];
        }
        break;
      case 'buff':
      case 'buff_endOfTurn':
      case 'buff_mass_minion_endOfTurn':
      case 'debuff':
      case 'debuff_minion':
      case 'debuff_mass_minion':
      case 'summon_buff_minion':
      case 'buff_general_endOfTurn':
        validTargetPositions = []; // don't cast buffs/debuffs here - save for attack()
        break;
      case 'buff_minion':
        // normally, don't cast buffs/debuffs here - save for attacks.
        if (!card.isSignatureCard() || !this._getCanUseSignatureCard()) {
          validTargetPositions = [];
        }

        break;
      case 'buff_mass':
      case 'buff_mass_minion':
        var myGeneral = this.getMyGeneral();
        if (this.getGameSession().getBoard().getFriendlyEntitiesForEntity(myGeneral, SDK.CardType.Unit).length < 3) {
          validTargetPositions = [];
        }
        break;
      case 'buff_general':
        // normally, don't cast buffs/debuffs here - save for attacks
        if (!card.isSignatureCard() || !this._getCanUseSignatureCard()) {
          validTargetPositions = [];
        }
        break;
      } // end switch
    } // end spell intent definition check
    else if (card.getType() == SDK.CardType.Unit) {
      // spawning a unit
      if (validTargetPositions.length > 0) {
        var bestTargetPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(card, validTargetPositions).targetPosition;
        if (bestTargetPosition != null) {
          validTargetPositions[0] = bestTargetPosition;
        } else {
          validTargetPositions = [];
        }
      }
    }
    return validTargetPositions;
  },

  _findAtkBuffAndBuffedAtkValue(unit, targets, returnBuffedAtkValueOnly_noCast) {
    // function returns atk buff amount for unit if a buff is loaded into actions
    const baseAtk = unit.getATK();
    let buffedAtk = baseAtk;
    const myPlayer = this.getMyPlayer();
    // if there's an action already loaded, assume it's a buff or debuff and don't bother.
    if (this._nextActions.length === 0 && targets.length > 0) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => for unit " + unit.getLogName());

      // check for playable attack buffs first
      const cardsInHand = this._getCardsInHandAndSignatureSpell();
      let playableBuffs = _.filter(cardsInHand, (card) => this._getCanPlayCard(card) && this._getCardIsAtkBuffFor(card, unit));

      // if we have playable buffs, check for any enemy targets with more hp than unit atk
      if (playableBuffs.length > 0 && _.some(targets, (enemy) => enemy.getHP() > baseAtk)) {
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => " + playableBuffs.length + " atk buffs in hand and lethal targets available");

        // never buff ephemerals unless it's end of turn only
        if (playableBuffs.length > 0 && unit.hasModifierClass(SDK.ModifierEphemeral)) {
          playableBuffs = _.filter(playableBuffs, (buffCard) => {
            const buffCardId = buffCard.getBaseCardId();
            if (CardIntent.getHasIntentTypeWithPartialPhaseType(buffCardId, CardIntentType.ModifyATK, CardPhaseType.EndTurn, true)) return true;
            return CARD_INTENT[buffCardId] != null && CARD_INTENT[buffCardId].indexOf('endOfTurn') !== -1;
          });
        }

        // find the first playable buff that will result in lethal
        _.find(playableBuffs, (buffCard) => {
          const buffCardId = buffCard.getBaseCardId();
          let atkBuff = 0;
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => check playable buff for lethal " + buffCard.getLogName());

          // find value of atk buff
          const hasIntentTypeModifyAtk = CardIntent.getHasIntentType(buffCardId, CardIntentType.ModifyATK, true);
          if (hasIntentTypeModifyAtk) {
            _.each(CardIntent.getIntentsByIntentType(buffCardId, CardIntentType.ModifyATK, true), (intentObj) => {
              if (intentObj.amountIsRebase) {
                atkBuff = intentObj.amount - baseAtk;
              } else {
                atkBuff += intentObj.amount;
              }
            });
          } else if (buffCard.constructor.name == 'SpellBuffAttributeByOtherAttribute' && buffCard.attributeTarget == 'atk') {
            // special case: swap atk and hp
            switch (buffCard.attributeSource) {
            case 'hp':
              atkBuff = unit.getHP();
              break;
            case 'maxHP':
              atkBuff = unit.getMaxHP();
              break;
            case 'atk':
              atkBuff = baseAtk;
              break;
            }
          } else if (buffCardId == SDK.Cards.Spell.Amplification) {
            // hardcoded: amplification
            if (unit.getDamage() > 0) {
              atkBuff = 2;
            }
          } else if (buffCardId == SDK.Cards.Spell.AspectOfTheWolf) {
            // hardcoded: aspect of the wolf
            if (ScoreForUnit(unit) <= 8) {
              // only use aspect of wolf to transform friendly units if the unit is worse than ~2/2)
              atkBuff = 3 - baseAtk;
            }
          } else if (buffCardId == SDK.Cards.Spell.PermafrostShield) {
            // hardcoded: permafrost shield
            atkBuff = buffCard.attackBuff;
          } else {
            // fallback to looking at target modifiers
            const modifiersContextObjects = _.filter(buffCard.targetModifiersContextObjects, (modifierContextObject) => modifierContextObject.attributeBuffs != null && modifierContextObject.attributeBuffs.atk != null);
            if (modifiersContextObjects.length > 0) {
              atkBuff = _.max(modifiersContextObjects, (modifierContextObject) => modifierContextObject.attributeBuffs.atk).attributeBuffs.atk;
            }
          }

          // check if atk buff will result in lethal on a target that we didn't have lethal on
          let hasTargetLethalWithBuff = false;
          if (buffCardId == SDK.Cards.Spell.PsionicStrike
            || buffCardId === SDK.Cards.Spell.MarkOfSolitude) {
            // vetruvian bbs - conditional buff: double dmg to minions only
            // mark of solitude - conditional buff: cannot attack general
            hasTargetLethalWithBuff = _.some(targets, (enemy) => {
              if (enemy.getIsGeneral()) {
                return false;
              }
              const enemyHP = enemy.getHP();
              atkBuff = baseAtk * 2;
              return enemyHP > baseAtk && enemyHP <= (baseAtk + atkBuff);
            });
          } else {
            hasTargetLethalWithBuff = _.some(targets, (enemy) => {
              const enemyHP = enemy.getHP();
              return enemyHP > baseAtk && enemyHP <= (baseAtk + atkBuff);
            });
          }

          if (hasTargetLethalWithBuff) {
            if (returnBuffedAtkValueOnly_noCast) {
              // don't cast buff, just return buffed value
              buffedAtk += atkBuff;
              return true;
            }
            const targetPosition = unit.getPosition();
            // we know the buff is a followup when:
            // - buff card is a unit
            // - buff card has intent type modify atk only when including followups
            if (hasIntentTypeModifyAtk !== CardIntent.getHasIntentType(buffCardId, CardIntentType.ModifyATK)) {
              // find best spawn location for unit with followup buff among the adjacent spaces
              if (buffCard instanceof SDK.Unit) {
                // determine if adjacent space available and set followup target & target
                const validSpawnLocations = this.getGameSession().getBoard().getUnobstructedPositionsForEntityAroundEntity(buffCard, unit);
                // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => unit with followup buff detected, validSpawnLocations:", validSpawnLocations.length);
                if (validSpawnLocations.length > 0) {
                  const initialPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(buffCard, validSpawnLocations).targetPosition;
                  this._findPlayCardActionsForCard(buffCard, initialPosition);
                }
              } else {
                // find play card actions for non-unit cards with followup buff
                // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => spell with followup buff detected");
                this._findPlayCardActionsForCard(buffCard);
              }

              // set buffed attack and add followup when guaranteed to play card
              if (this._nextActions.length > 0) {
                buffedAtk += atkBuff;
                this._followupTargets.unshift(targetPosition);
                return true;
              }
            } else {
              // default cast case for regular buffs
              // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => adding buff action to nextActions.");
              this._findPlayCardActionsForCard(buffCard, targetPosition);
              if (this._nextActions.length > 0) {
                // set buffed attack when guaranteed to play card
                buffedAtk += atkBuff;
                return true;
              }
            }
          }
        });
      }
    }

    // always return buffed attack value
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => returning buffed atk of", buffedAtk);
    return buffedAtk;
  },

  _findAtkDebuffForUnitAndCastOnTarget(unit, target) {
    const myPlayer = this.getMyPlayer();
    // if there's an action already loaded, assume it's a buff or debuff and don't bother.
    if (this._nextActions.length > 0) return;

    const unitHP = unit.getHP();
    const isBlast = unit.hasModifierClass(SDK.ModifierBlastAttack);
    // if blast and target isn't next to blaster, find enemy next to unit or ranged unit in blast path and swap for target
    if (isBlast && distanceBetweenBoardPositions(unit.getPosition(), target.getPosition()) > 1) {
      const enemiesInAttack = this.getGameSession().getBoard().getEnemyEntitiesOnCardinalAxisFromEntityToPosition(unit, target.getPosition(), SDK.CardType.Unit, false, false);
      const swapEnemy = _.find(enemiesInAttack, (enemy) => enemy.getATK() >= unitHP && (distanceBetweenBoardPositions(unit.getPosition(), enemy.getPosition()) <= 1 || enemy.hasModifierClass(SDK.ModifierRanged)));
      if (swapEnemy != null) {
        target = swapEnemy;
      }
    }

    // don't debuff target if this unit won't die due to counterattack
    if (target.getATK() < unitHP) return;

    // don't debuff target if this unit is ranged/blast and target isn't next to unit or isn't ranged
    if ((unit.hasModifierClass(SDK.ModifierRanged) || isBlast)
      && distanceBetweenBoardPositions(unit.getPosition(), target.getPosition()) > 1
      && !target.hasModifierClass(SDK.ModifierRanged)) return;

    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] checkFordeBuff() => 1 counterattack lethal for unit " + unit.getLogName() + " against " + target.getLogName());
    const cardsInHand = this._getCardsInHandAndSignatureSpell();
    const debuffsInHand = _.filter(cardsInHand, (card) => this._getCanPlayCard(card) && this._getCardIsAtkDebuffFor(card, unit));
    if (typeof debuffsInHand !== 'undefined' && debuffsInHand.length > 0) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] checkFordeBuff() => 2 debuff in hand and counterattack is lethal. checking if we have enough mana");
      _.each(debuffsInHand, (debuffCard) => {
        if (this._nextActions.length > 0 || debuffCard == null) return;

        const debuffCardId = debuffCard.getBaseCardId();

        // check if it can target general or not
        if (target.getIsGeneral()
          && (!CardIntent.getHasIntentTypeWithPartialTargetType(debuffCardId, CardIntentType.ModifyATK, CardTargetType.General, true)
            || (CARD_INTENT[debuffCardId] != null && CARD_INTENT[debuffCardId].indexOf('minion') > -1))) {
          // can't target general with this debuff.
          return;
        }
        if (this._isTargetImmuneToSource(target, debuffCard)) return; // reject immune units
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] checkFordeBuff() => 3 playable debuff found.");
        // if (target.hasModifierClass(SDK.ModifierCannotStrikeback)) return;
        if (unit.hasModifierClass(SDK.ModifierEphemeral)) return; // never debuff  to save ephemerals
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] checkFordeBuff() => 4 unit not already debuffed. adding debuff action to nextActions.");

        // Check to see if the debuff is a follow-up
        const targetPosition = target.getPosition();
        const hasIntentTypeModifyAtk = CardIntent.getHasIntentType(debuffCardId, CardIntentType.ModifyATK, true);
        if (hasIntentTypeModifyAtk !== CardIntent.getHasIntentType(debuffCardId, CardIntentType.ModifyATK)) {
          // find best spawn location for unit with followup buff among the adjacent spaces
          if (debuffCard instanceof SDK.Unit) {
            // determine if adjacent space available and set followup target & target
            const validSpawnLocations = this.getGameSession().getBoard().getUnobstructedPositionsForEntityAroundEntity(debuffCard, target);
            const validSummonLocations = this.getGameSession().getBoard().getValidSpawnPositions(debuffCard);
            const actualSummonLocations = [];

            // need to make sure the valid spawn location is actually a location that we can summon
            for (let i = 0; i < validSpawnLocations.length; i++) {
              for (let j = 0; j < validSummonLocations.length; j++) {
                if (validSpawnLocations[i].x === validSummonLocations[j].x && validSpawnLocations[i].y === validSummonLocations[j].y) {
                  actualSummonLocations.push(validSpawnLocations[i]);
                }
              }
            }

            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => unit with followup buff detected, validSpawnLocations:", validSpawnLocations.length);
            if (actualSummonLocations.length > 0) {
              const initialPosition = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(debuffCard, actualSummonLocations).targetPosition;
              this._findPlayCardActionsForCard(debuffCard, initialPosition);
            }
          } else {
            // find play card actions for non-unit cards with followup buff
            // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAtkBuffAndBuffedAtkValue() => spell with followup buff detected");
            this._findPlayCardActionsForCard(debuffCard);
          }

          // add followup when guaranteed to play card
          if (this._nextActions.length > 0) {
            this._followupTargets.unshift(targetPosition);
            return true;
          }
        } else {
          this._findPlayCardActionsForCard(debuffCard, target.getPosition());
        }
      });
    } // end check for debuff
  },

  _isUnitPreventedFromAttacking(unit) {
    return unit.hasModifierClass(SDK.ModifierStunned);
  },

  _isUnitPreventedFromAttackingTarget(unit, target) {
    return _.find(this._invalidAttackActions, (invalidAttackAction) => invalidAttackAction.getSource() === unit
          && invalidAttackAction.getTarget() === target) != null;
  },

  _isTargetImmuneToSource(target, source) {
    if (target instanceof SDK.Card && source instanceof SDK.Card) {
      const immuneModifiers = target.getActiveModifiersByClass(SDK.ModifierImmune);
      if (immuneModifiers.length > 0) {
        const immuneModifier = _.find(immuneModifiers, (modifier) => {
          // immune to attack
          if (modifier instanceof SDK.ModifierImmuneToAttacks) {
            if (modifier instanceof SDK.ModifierImmuneToAttacksByGeneral) {
              if (source instanceof SDK.Unit && source.getIsGeneral()) {
                return true;
              }
            } else if (modifier instanceof SDK.ModifierImmuneToAttacksByRanged) {
              if (source instanceof SDK.Unit && source.hasModifierClass(SDK.ModifierRanged)) {
                return true;
              }
            } else if (source instanceof SDK.Unit) {
              return true;
            }
          }

          // immune to damage
          if (modifier instanceof SDK.ModifierImmuneToDamage) {
            if (modifier instanceof SDK.ModifierForcefieldAbsorb) {
              return false; // technically - the unit isn't IMMUNE to the damage as damage will result in the absorbtion modifier being lost. We still value popping forcefields and do not agree with the SDK re: the "immunity" of the unit.
            }
            if (modifier instanceof SDK.ModifierImmuneToDamageByGeneral) {
              if (source instanceof SDK.Unit && source.getIsGeneral()) {
                return true;
              }
            } else if (modifier instanceof SDK.ModifierImmuneToDamageByRanged) {
              if (source instanceof SDK.Unit && source.hasModifierClass(SDK.ModifierRanged)) {
                return true;
              }
            } else if (modifier instanceof SDK.ModifierImmuneToDamageBySpells) {
              if (this._getCardIsBurn(source, target)) {
                return true;
              }
            } else if (this._getCardIsBurn(source, target) || source instanceof SDK.Unit) {
              return true;
            }
          }

          if (modifier instanceof SDK.ModifierImmuneToSpells) {
            if (source instanceof SDK.Spell && !this._getCardIsMass(source)) {
              if (modifier instanceof SDK.ModifierImmuneToSpellsByEnemy) {
                if (!target.getIsSameTeamAs(source)) {
                  // immune to enemy targeted spells
                  return true;
                }
              } else {
                // immune to targeted spells
                return true;
              }
            }
          }
        });

        if (immuneModifier != null) {
          // a modifier is making target immune to source
          return true;
        }
      }

      // source cannot attack target
      if (source.hasModifierClass(SDK.ModifierCannotAttackGeneral) && target.getIsGeneral()) {
        return true;
      }
    }

    // target does not appear to be immune to source
    return false;
  },

  _isUnitIgnorableForAttacks(unit) {
    return (unit.hasActiveModifierClass(ModifierDyingWishReSpawnEntityAnywhere)
        || unit.getBaseCardId() === SDK.Cards.Faction4.Gor) // Have to use direct base card id because Jaxi uses same modifier
      && unit.getHP() < 3 && unit.getATK() < 3;
  },

  _findAttackActionsForUnit(unit, allowOnlyLethalAttacks) {
    if (unit.getCanAttack() && !_.contains(this._unitsMissingAttacks, unit) && !this._isUnitPreventedFromAttacking(unit)) {
      const unitPosition = unit.getPosition();
      const returnBuffedAtkValueOnly_noCast = false; // allow buff casts for attack actions
      const attackObjectivesAndScores = this._findSortedFilteredAttackObjectivesAndScoresForUnit(unit, unitPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast);
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => potentialAttackTargets 1 - " + attackObjectivesAndScores.length);

      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => potentialAttackTargets 2 - " + attackObjectivesAndScores.length);
      if (attackObjectivesAndScores.length > 0) {
        let attackTarget = true;
        let attackObjective = attackObjectivesAndScores[0].objective;
        let attackObjectiveIndex = 1;
        let unitInRangeToKillEgg = false;
        let attackObjectivePosition;

        // * Special case to not attack FF unit unless we can pop the barrier *
        if (attackTarget && attackObjective.hasActiveModifierClass(SDK.ModifierForcefieldAbsorb)) {
          let successfullyPoppedFF = this._forceAttackOnTargetIfPossible(attackObjective, unit);
          attackTarget = successfullyPoppedFF;
          while (!successfullyPoppedFF && attackObjectiveIndex < attackObjectivesAndScores.length) {
            attackObjective = attackObjectivesAndScores[attackObjectiveIndex].objective;
            if (!attackObjective.hasActiveModifierClass(SDK.ModifierForcefieldAbsorb)) {
              attackTarget = true;
              break;
            } else {
              successfullyPoppedFF = this._forceAttackOnTargetIfPossible(attackObjective, unit);
              attackTarget = successfullyPoppedFF;
              attackObjectiveIndex++;
            }
          }
        }

        // * Special case to not attack rebirth unit unless we can kill off the egg that turn too *
        if (attackTarget && unit.getATK() > attackObjective.getHP() && attackObjective.hasActiveModifierClass(SDK.ModifierRebirth)) {
          unitInRangeToKillEgg = this._isUnitNearbyThatCanAttackTarget(attackObjective, unit);
          attackTarget = unitInRangeToKillEgg;
          // if we don't have a unit nearby to also attack the egg, find the next best target to attack
          while (!unitInRangeToKillEgg && attackObjectiveIndex < attackObjectivesAndScores.length) {
            attackObjective = attackObjectivesAndScores[attackObjectiveIndex].objective;
            if (!attackObjective.hasActiveModifierClass(SDK.ModifierRebirth)) {
              attackTarget = true;
              break;
            } else {
              // if the next target also has rebirth then if we can pop that egg, set it so that we're also allowed to attack it
              unitInRangeToKillEgg = this._isUnitNearbyThatCanAttackTarget(attackObjective, unit);
              attackTarget = unitInRangeToKillEgg;
              attackObjectiveIndex++;
            }
          }
          attackObjectivePosition = attackObjective.getPosition();
        }

        if (attackTarget) {
          this._findAtkDebuffForUnitAndCastOnTarget(unit, attackObjective);
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAttackActionsForUnit() => " + unit.getLogName() + " now attacking " + attackObjective.getLogName());
          const attackAction = unit.actionAttack(attackObjective);
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAttackActionsForUnit() => adding attack action to end of stack after potential buffs/debuffs");
          this._nextActions.push(attackAction);

          if (unitInRangeToKillEgg) {
            // if we just attacked a unit with rebirth and spawned an egg
            // then we want to try to kill that egg next time we look for new actions
            this._wantsToKillEggAtPosition = attackObjectivePosition;
          }
        }
      }/* else {
        Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findAttackActionsForUnit() => No enemies in range or meeting attack parameters. returning");
      } */
    }
  },

  _isUnitNearbyThatCanAttackTarget(attackTarget, ignoreUnit) {
    // returns true if it can find a unit that is in range or can move to be in range to attack the target
    // look through usable units in reverse as they are sorted from best to worst
    const myUsableUnits = this._getMyUsableUnits().reverse();
    let bestMovePosition = null;

    const attackerUnit = _.find(myUsableUnits, (unit) => {
      if (unit !== ignoreUnit
        && unit.getCanAttack() && !unit.getIsProvoked()
        && (!unit.getIsGeneral() || this._isUnitSafeAttackTargetForGeneralUnit(unit, attackTarget))) {
        // check to see if the unit is already next to the unit its trying to attack
        let nearTarget = distanceBetweenBoardPositions(attackTarget.getPosition(), unit.getPosition()) <= 1;

        // find the best place to move the unit if not nearby
        if (!nearTarget && unit.getCanMove() && !this._isUnitPreventedFromMoving(unit)) {
          bestMovePosition = this._bestAttackPositionForUnitWithObjective(unit, attackTarget);
          if (bestMovePosition != null) {
            // if a bestMovePosition was found then it means we can attack the target
            nearTarget = true;
          }
        }

        if (nearTarget) {
          return true; // important: we must now break out of the _.find loop so we don't end up moving all of our units
        }
      }
    });

    // finally, if we found a unit in move + attack range, return true
    return attackerUnit != null;
  },

  _forceAttackOnTargetIfPossible(forcedTarget, ignoreUnit) {
    // finds a unit to attack a target and returns whether was successful
    // look through usable units in reverse as they are sorted from best to worst
    // returns true if completed successfully, otherwise returns false
    const myUsableUnits = this._getMyUsableUnits().reverse();
    let bestMovePosition = null;

    const attackerUnit = _.find(myUsableUnits, (unit) => {
      if (unit !== ignoreUnit
        && unit.getCanAttack()
        && !this._isUnitPreventedFromAttacking(unit)
        && !this._isUnitPreventedFromAttackingTarget(unit, forcedTarget)
        && (!unit.getIsGeneral() || this._isUnitSafeAttackTargetForGeneralUnit(unit, forcedTarget))) {
        // check to see if the unit is already next to the unit its trying to attack
        let nearTarget = distanceBetweenBoardPositions(forcedTarget.getPosition(), unit.getPosition()) <= 1;

        // find the best place to move the unit if not nearby
        if (!nearTarget && unit.getCanMove() && !this._isUnitPreventedFromMoving(unit)) {
          bestMovePosition = this._bestAttackPositionForUnitWithObjective(unit, forcedTarget);
          if (bestMovePosition != null) {
            // if a bestMovePosition was found, move there
            const moveAction = unit.actionMove(bestMovePosition);
            this._nextActions.push(moveAction);
            nearTarget = true;
          }
        }

        // now check to see if that unit that is near the target can actually attack the target
        if (nearTarget) {
          return true; // important: we must now break out of the _.find loop so we use this unit
        }
      }
    });

    // finally, if we have an attacker unit declared (that is nearby the target and can attack the target), attack that target and return true, else return false
    if (attackerUnit != null) {
      const attackAction = attackerUnit.actionAttack(forcedTarget);
      if (bestMovePosition != null) {
        attackAction.setSourcePosition(bestMovePosition);
      }
      this._nextActions.push(attackAction);
      return true;
    }
    return false;
  },

  _bestAttackPositionForUnitWithObjective(unitToSend, objective) {
    // find the highest scoring position for the a unit wanting to attack another unit
    let bestPosition = null;
    const board = this.getGameSession().getBoard();
    const potentialMoves = this._findPotentialMovePositionsForUnit(unitToSend); // get potential move spaces
    if (potentialMoves.length > 0) {
      const locationsNearTarget = board.getUnobstructedPositionsForEntityAroundEntity(unitToSend, objective); // get spaces near the objective
      if (locationsNearTarget.length > 0) {
        // check for provokers near any spaces we might want to move to, unless objective is a provoker
        // and remove all locations near target that are nearby enemy provokers
        if (!objective.hasActiveModifierClass(SDK.ModifierProvoke)) {
          const objectiveFriends = board.getFriendlyEntitiesForEntity(objective, SDK.CardType.Unit);
          for (var i = 0, il = objectiveFriends.length; i < il; i++) {
            const objectiveFriend = objectiveFriends[i];
            const objectiveFriendPos = objectiveFriend.getPosition();
            if (objectiveFriend.hasActiveModifierClass(SDK.ModifierProvoke)) {
              for (let j = locationsNearTarget.length - 1; j >= 0; j--) {
                var locationNearTarget = locationsNearTarget[j];
                if (distanceBetweenBoardPositions(objectiveFriendPos, locationNearTarget) <= 1) {
                  locationsNearTarget.splice(j, 1);
                }
              }
              if (locationsNearTarget.length === 0) {
                // bail, no safe positions
                return null;
              }
            }
          }
        }

        for (var i = 0, il = potentialMoves.length; i < il; i++) {
          const potentialMovePos = potentialMoves[i];
          const potentialX = potentialMovePos.x;
          const potentialY = potentialMovePos.y;
          for (let k = 0, kl = locationsNearTarget.length; k < kl; k++) {
            var locationNearTarget = locationsNearTarget[k];
            if (potentialX === locationNearTarget.x && potentialY === locationNearTarget.y) {
              // if we found a match on the move positions near the objective, find the best one
              if (bestPosition == null) {
                bestPosition = potentialMovePos;
              } else {
                const scoreForNewPosition = ScoreForCardAtTargetPosition(unitToSend, potentialMovePos, objective);
                const scoreForCurrentBestPosition = ScoreForCardAtTargetPosition(unitToSend, bestPosition, objective);
                if (scoreForNewPosition > scoreForCurrentBestPosition) {
                  bestPosition = potentialMovePos;
                }
              }
            }
          }
        }
      }
    }

    return bestPosition;
  },

  _findSortedFilteredAttackObjectivesAndScoresForUnit(unit, targetPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast) {
    const sourceUnit = unit.getIsPlayed() ? unit : this.getGameSession().getGeneralForPlayerId(unit.getOwnerId());
    // get potential attack targets at target position
    const potentialAttackTargets = sourceUnit.getAttackRange().getValidTargets(this.getGameSession().getBoard(), sourceUnit, targetPosition);
    const filteredPotentialAttackTargets = this._filterOutBadTargets(potentialAttackTargets, sourceUnit);
    return this._scoreAndSortAttackTargetsForUnit(unit, filteredPotentialAttackTargets, targetPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast);
  },

  _scoreAndSortAttackTargetsForUnit(unit, attackTargets, targetPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast) {
    // sort and filter targets
    let filteredAttackTargets = this._findFilteredAttackTargetsForUnit(unit, attackTargets);
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => filteredAttackTargets " + filteredAttackTargets.length);

    // get and cast attack buffs that result in lethal unless we've found lethal on enemy general
    let unitATK;
    if ((allowOnlyLethalAttacks || this._hasLethalOnEnemyGeneral) && unit.getIsPlayed() && unit.getCanAttack() && !this._isUnitPreventedFromAttacking(unit)) {
      unitATK = this._findAtkBuffAndBuffedAtkValue(unit, filteredAttackTargets, returnBuffedAtkValueOnly_noCast);
    } else {
      unitATK = unit.getATK();
    }

    // filter for lethal only unless we've found lethal on enemy general
    if (allowOnlyLethalAttacks && !this._hasLethalOnEnemyGeneral) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => allowOnlyLethalAttacks = true. Rejected non-lethal targets. Current # of targets = " + filteredAttackTargets.length);
      filteredAttackTargets = _.reject(filteredAttackTargets, (enemy) => enemy.getHP() > unitATK);
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => # of targets after _.reject = " + filteredAttackTargets.length);
    }

    // scores and sort all filtered attack targets
    const filteredAttackTargetsAndScores = [];
    _.each(filteredAttackTargets, (enemy) => {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => unit " + unit.getLogName() + "'s enemy " + enemy.getLogName() + " sorted bounty = " + score);
      // insert sort objective and score
      let attackScore = ScoreForUnitDamage(enemy, unitATK);
      attackScore += this._scoreAttackTargetForUnit(unit, unitATK, enemy, targetPosition); // redundant with above. to remove.
      const objectiveAndScore = { objective: enemy, score: attackScore };
      UtilsJavascript.arraySortedInsertByProperty(filteredAttackTargetsAndScores, objectiveAndScore, 'score');
    });
    return filteredAttackTargetsAndScores;
  },

  _scoreAttackTargetForUnit(unit, unitATK, enemy, targetPosition) { // todo: remove. redudnant with scoreforunitdamage
    let score = 0;

    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findSortedFilteredAttackObjectivesAndScoresForUnit() => unit " + unit.getLogName() + "'s enemy " + enemy.getLogName() + " score for damage = " + score);
    if (this._difficulty >= DIFFICULTY_WHEN_UNITS_CARE_ABOUT_COUNTERATTACKS && !unit.hasModifierClass(SDK.ModifierRanged) && !unit.hasModifierClass(SDK.ModifierBlastAttack)) {
      score += unit.getHP() >= enemy.getATK() ? BOUNTY.TARGET_COUNTERATTACK_NOT_LETHAL : 0;
    }

    if (enemy.getIsGeneral() && arePositionsEqualOrAdjacent(enemy.getPosition(), targetPosition) && unit.hasModifierClass(SDK.ModifierProvoke)) {
      score += BOUNTY.PROVOKE_ENEMY_GENERAL;
    }
    if (unit.getIsPlayed()) {
      if (unit.hasModifierClass(SDK.ModifierRanged) || unit.hasModifierClass(SDK.ModifierBlastAttack)) {
        // ranged prefer to attack units at range
        score += distanceBetweenBoardPositions(targetPosition, enemy.getPosition()) <= 1 ? 0 : BOUNTY.TARGET_AT_RANGE;
      }
      if (unit.hasModifierClass(SDK.ModifierBackstab)) {
        // backstab prefer to attack units from behind
        score += this.getGameSession().getBoard().getIsPositionBehindEntity(enemy, targetPosition, 1, 0) ? BOUNTY.TARGET_BACKSTAB_PROC : 0;
      }
      if (unit.hasModifierClass(SDK.ModifierBlastAttack)) {
        score += _.reject(this.getGameSession().getBoard().getEntitiesInRow(enemy.getPosition().y, SDK.CardType.Unit), (entity) => entity.getIsSameTeamAs(unit)).length * BOUNTY.TARGET_ENEMIES_IN_SAME_ROW;
      }
    } else { // unit not played, but we still want ranged/blastAttackers to spawn at distance.
      if (unit.hasModifierClass(SDK.ModifierRanged) || unit.hasModifierClass(SDK.ModifierBlastAttack)) {
        // ranged prefer to attack units at range
        score += distanceBetweenBoardPositions(targetPosition, enemy.getPosition()) <= 1 ? 0 : BOUNTY.TARGET_AT_RANGE;
      }
    }

    return score;
  },

  _findFilteredAttackTargetsForUnit(unit, potentialTargets) {
    // filters out illegal or bad targets i.e. suicide targets for generals or illegal targets while provoked or immune units
    potentialTargets = this._findFilteredAttackTargetsForGeneralUnit(unit, potentialTargets);
    potentialTargets = this._findFilteredAttackTargetsForProvokedUnit(unit, potentialTargets);
    potentialTargets = this._findFilteredAttackTargetsForRangedProvokedUnit(unit, potentialTargets);
    potentialTargets = _.reject(potentialTargets, (target) => this._isTargetImmuneToSource(target, unit));
    return potentialTargets;
  },

  _findFilteredAttackTargetsForProvokedUnit(unit, potentialTargets) {
    if (unit.getIsProvoked()) { // may only attack provoker(s)
      potentialTargets = _.filter(potentialTargets, (target) => {
        if (unit.getIsRangedProvoked() && target.getIsRangedProvoker()) {
          return true;
        }

        return target.getIsProvoker();
      });
      potentialTargets = _.filter(potentialTargets, (target) => {
        if (unit.getIsRangedProvoked() && target.getIsRangedProvoker()) {
          return true; // we will further evaluate these targets in the actual ranged provoke filter. don't eliminate them here, though
        }

        return _.contains(target.getEntitiesProvoked(), unit);
      });
    }
    return potentialTargets;
  },

  _findFilteredAttackTargetsForRangedProvokedUnit(unit, potentialTargets) {
    if (unit.getIsRangedProvoked()) { // may only attack provoker(s)
      potentialTargets = _.filter(potentialTargets, (target) => {
        if (unit.getIsProvoked() && target.getIsProvoker()) {
          return true;
        }

        return target.getIsRangedProvoker();
      });
      potentialTargets = _.filter(potentialTargets, (target) => {
        if (unit.getIsProvoked() && target.getIsProvoker()) {
          return true; // we will further evaluate these targets in the actual provoke filter. don't eliminate them here, though
        }

        return _.contains(target.getModifierByType(SDK.ModifierRangedProvoke.type).getEntitiesInAura(), unit);
      });
    }
    return potentialTargets;
  },

  _findFilteredAttackTargetsForGeneralUnit(unit, potentialTargets) {
    if (unit.getIsGeneral()) {
      potentialTargets = _.filter(potentialTargets, (enemy) => this._isUnitSafeAttackTargetForGeneralUnit(unit, enemy));
    }
    return potentialTargets;
  },

  _isUnitSafeAttackTargetForGeneralUnit(unit, enemy) {
    let safe = true;

    if (this._difficulty >= DIFFICULTY_WHEN_GENERAL_CARES_ABOUT_COUNTERATTACKS
      && !this._checkingLethalOnEnemyGeneral && !this._hasLethalOnEnemyGeneral) {
      // only attack units that will counterattack for less than threshold unless checking lethal
      // prevents generals trading damage with high-attack units, i.e. generals attacking into 10 damage units
      // generals also become increasingly wary of costly trades the lower their HP goes. General's current HP
      // is multiplied against THRESHOLD_COUNTERATTACK_HP_PCT_GENERAL which defines the maximum % of current HP
      // a general will trade for [currently set at 0.3 or 30% of current HP at time of writing this comment]
      // Set at 0.30, a general with 25 hp won't trade damage if the counterattack will deal more than 7 dmg
      // At 11 HP, a general won't trade if the counterattack will deal more than 3 damage! thanks for reading
      safe = enemy.getATK() <= unit.getHP() * THRESHOLD_COUNTERATTACK_HP_PCT_GENERAL;
    }

    // avoid suicide
    safe = safe && !_.contains(unit.getEntitiesKilledByAttackOn(enemy), unit);

    return safe;
  },

  _isUnitPreventedFromMoving(unit) {
    return unit.hasModifierClass(SDK.ModifierStunned) || unit.getIsProvoked();
  },

  _isUnitPreventedFromMovingTo(unit, targetPosition) {
    return _.find(this._invalidMoveActions, (invalidMoveAction) => invalidMoveAction.getSource() === unit
        && invalidMoveAction.getTargetPosition().x === targetPosition.x
        && invalidMoveAction.getTargetPosition().y === targetPosition.y) != null;
  },

  _findMoveActionsForUnit(unit, allowOnlyLethalAttacks) {
    if (unit.getCanMove() && !this._isUnitPreventedFromMoving(unit)) {
      // get potential move spaces
      const potentialMoves = this._findPotentialMovePositionsForUnit(unit);
      if (potentialMoves.length > 0) {
        const unitPosition = unit.getPosition();
        const returnBuffedAtkValueOnly_noCast = true; // do not cast buffs during movement+attack lethal calculations. Buffs will cast during attack actions.
        const currentScoreAndObjective = this._positionObjectiveAndScoreForUnitFromSourceToTargetPosition(unit, unitPosition, unitPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast);
        const bestMoveScoreAndObjective = this._highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(unit, potentialMoves, allowOnlyLethalAttacks);
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findMoveActionsForUnit() => " + unit.getLogName() + " best move returned with score " + bestMoveScoreAndObjective.score + " at " + bestMoveScoreAndObjective.targetPosition.x + ", " + bestMoveScoreAndObjective.targetPosition.y + " with objective " + bestMoveScoreAndObjective.objective.getLogName());
        // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findMoveActionsForUnit() => " + unit.getLogName() + " current move returned with score " + currentScoreAndObjective.score + " at " + currentScoreAndObjective.targetPosition.x + ", " + currentScoreAndObjective.targetPosition.y + " with objective " + currentScoreAndObjective.objective.getLogName());
        if (currentScoreAndObjective.score < bestMoveScoreAndObjective.score
          // only allow ephemeral units to be moved if they can reach target
          && (!unit.hasModifierClass(SDK.ModifierEphemeral)
            || distanceBetweenBoardPositions(bestMoveScoreAndObjective.objective.getPosition(), bestMoveScoreAndObjective.targetPosition) <= 1)
          && (!allowOnlyLethalAttacks
            || distanceBetweenBoardPositions(unitPosition, bestMoveScoreAndObjective.targetPosition) <= 1
            || isUnitEvasive(unit))) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _findMoveActionsForUnit() => " + unit.getLogName() + " making move with score " + bestMoveScoreAndObjective.score + " to " + bestMoveScoreAndObjective.targetPosition.x + ", " + bestMoveScoreAndObjective.targetPosition.y + " with objective " + bestMoveScoreAndObjective.objective.getLogName());
          const moveAction = unit.actionMove(bestMoveScoreAndObjective.targetPosition);
          this._nextActions.push(moveAction);
        }
      }
    }
  },

  _findPotentialMovePositionsForUnit(unit) {
    const potentialMoves = [];
    const traversalPath = unit.getMovementRange().getValidPositions(this.getGameSession().getBoard(), unit);
    _.each(traversalPath, (validMoveNodes) => {
      const movePosition = _.last(validMoveNodes);
      if (!this._isUnitPreventedFromMovingTo(unit, movePosition)) {
        potentialMoves.push(movePosition);
      }
    });
    return potentialMoves;
  },

  _isOnMySideOfBoard(unitOrSpell, position) {
    let mySideStartX = 0;
    let mySideEndX = CONFIG.BOARDCOL;

    if (unitOrSpell.isOwnedByPlayer1()) {
      mySideEndX = Math.floor((mySideEndX - mySideStartX) * 0.5 - 1);
    } else if (unitOrSpell.isOwnedByPlayer2()) {
      mySideStartX = Math.floor((mySideEndX - mySideStartX) * 0.5 + 1);
    }

    return position.x >= mySideStartX && position.x <= mySideEndX;
  },

  _highestOrLowestPositionObjectiveAndScoreForUnitFromPositions(sourceUnit, positions, allowOnlyLethalAttacks) {
    const sourcePosition = sourceUnit.getIsPlayed() ? sourceUnit.getPosition() : this.getGameSession().getGeneralForPlayerId(sourceUnit.getOwnerId()).getPosition();
    const myGeneral = this.getMyGeneral();
    let bestScoreAndObjective;

    // get scores and best objectives for each position
    const returnBuffedAtkValueOnly_noCast = true; // don't cast buffs. they will cast during attacks
    const scoresAndObjectives = _.map(positions, (currentPotentialLocation) => this._positionObjectiveAndScoreForUnitFromSourceToTargetPosition(sourceUnit, sourcePosition, currentPotentialLocation, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast));

    // get score and objective with highest or lowest score
    // depending on whether this is my unit or enemy unit
    if (sourceUnit.getIsSameTeamAs(myGeneral)) {
      bestScoreAndObjective = _.max(scoresAndObjectives, (scoreAndObjective) => scoreAndObjective.score);
    } else {
      bestScoreAndObjective = _.min(scoresAndObjectives, (scoreAndObjective) => scoreAndObjective.score);
    }
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _highestOrLowestPositionObjectiveAndScoreForUnitFromPositions() => position with highest/lowest bounty of " + bestScoreAndObjective.score + " is " + bestScoreAndObjective.targetPosition.x + ", " + bestScoreAndObjective.targetPosition.y + " with objective " + bestScoreAndObjective.objective.getLogName());
    return bestScoreAndObjective;
  },

  _lowestPositionObjectiveAndScoreFromPositions(card, positions) {
    // get scores and best objectives for each position
    const allowOnlyLethalAttacks = false;
    const returnBuffedAtkValueOnly_noCast = true;
    const scoresAndObjectives = _.map(positions, (position) => {
      const unitAtPosition = card instanceof SDK.Entity ? card : this.getGameSession().getBoard().getUnitAtPosition(position);
      return this._positionObjectiveAndScoreForUnitFromSourceToTargetPosition(unitAtPosition, position, position, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast);
    });

    // return lowest score and objective
    return _.min(scoresAndObjectives, (scoreAndObjective) => scoreAndObjective.score);
  },

  _highestPositionObjectiveAndScoreFromPositions(card, positions) {
    // get scores and best objectives for each position
    const allowOnlyLethalAttacks = false;
    const returnBuffedAtkValueOnly_noCast = true;
    const scoresAndObjectives = _.map(positions, (position) => {
      const unitAtPosition = card instanceof SDK.Entity ? card : this.getGameSession().getBoard().getUnitAtPosition(position);
      return this._positionObjectiveAndScoreForUnitFromSourceToTargetPosition(unitAtPosition, position, position, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast);
    });

    // return highest score and objective
    return _.max(scoresAndObjectives, (scoreAndObjective) => scoreAndObjective.score);
  },

  // endregion FIND ACTIONS

  // region BOARD SCORE

  _getIsScoredModifier(modifier) {
    return !(
      modifier instanceof SDK.ModifierAirdrop
      || modifier instanceof SDK.ModifierProvoked
      || modifier instanceof SDK.ModifierDyingWish
      || modifier instanceof SDK.ModifierEphemeral
      || modifier instanceof SDK.ModifierOpeningGambit
      || modifier instanceof SDK.ModifierStunned
      || modifier instanceof SDK.ModifierTransformed
      || modifier instanceof SDK.ModifierWall
      || modifier instanceof SDK.ModifierFirstBlood
      || modifier instanceof SDK.ModifierStrikeback
    );
  },

  _filterOutBadTargets(targets, unit) {
    const board = this.getGameSession().getBoard();
    let ignoreWraithlings = false;
    const filteredTargets = _.reject(targets, (target) => {
      // filter out targets we're prevented from attacking
      if (this._isUnitPreventedFromAttackingTarget(unit, target)) {
        return true;
      }

      // don't attack targets out of range
      if (!unit.getAttackRange().getIsValidTarget(board, unit, target)) {
        return true;
      }

      // never attack player general at lowest difficulty
      if (target.getIsGeneral()
        && ((this._difficulty < DIFFICULTY_WHEN_GENERAL_CAN_ATTACK_ENEMY_GENERAL && unit.getIsGeneral())
        || (this._difficulty < DIFFICULTY_WHEN_UNITS_CAN_ATTACK_ENEMY_GENERAL && !unit.getIsGeneral() && !unit.hasModifierClass(SDK.ModifierEphemeral)))) {
        return true;
      }

      // Ignore targets the unit can't attack
      if (this._isTargetImmuneToSource(target, unit)) {
        return true;
      }

      // * Special case to ignore wraithlings if a Bloodmoon Priestess is on the field *
      if (target.getBaseCardId() === SDK.Cards.Faction4.Wraithling) {
        if (ignoreWraithlings == false) {
          const enemyUnits = board.getFriendlyEntitiesForEntity(target);
          for (let i = 0; i < enemyUnits.length; i++) {
            if (enemyUnits[i].getBaseCardId() === SDK.Cards.Faction4.BloodmoonPriestess) {
              ignoreWraithlings = true;
              return true;
            }
          }
        } else {
          return true;
        }
      }

      // * Special case to ignore Sarlac and Gor *
      const isObjectiveIgnorable = this._isUnitIgnorableForAttacks(target);
      if (isObjectiveIgnorable) {
        return true;
      }
      // don't attack units that will die at the end of the turn (shadow creep...)
      // TODO not functioning - needs to be reimplemented
      return _.contains(this._markedForDeath, target);
    });

    return filteredTargets;
  },

  _positionObjectiveAndScoreForUnitFromSourceToTargetPosition(card, sourcePosition, targetPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast) {
    // --PARAMETERS--
    // targetPosition = target position to evaluate for bounty
    // sourcePosition = starting position for selecting best/nearest objective
    let unitToSend;
    if (card == null) {
      unitToSend = this.getMyGeneral();
    } else if (card instanceof SDK.Spell) {
      unitToSend = this.getGameSession().getGeneralForPlayerId(card.getOwnerId());
    } else {
      unitToSend = card;
    }
    const attackObjectivesAndScores = this._findSortedFilteredAttackObjectivesAndScoresForUnit(unitToSend, targetPosition, allowOnlyLethalAttacks, returnBuffedAtkValueOnly_noCast);

    let objective;
    let score = 0;
    if (attackObjectivesAndScores.length === 0) {
      // use nearest if nothing in range
      const enemies = this.getGameSession().getBoard().getEnemyEntitiesForEntity(unitToSend, SDK.CardType.Unit);
      const filteredEnemies = this._filterOutBadTargets(enemies, unitToSend);
      if (filteredEnemies.length === 0) {
        // if no filtered enemies are found (instance of difficulty being too low, find the nearest objective with no filter)
        objective = findNearestObjective(targetPosition, enemies);
      } else {
        objective = findNearestObjective(targetPosition, filteredEnemies);
      }
    } else {
      // otherwise, take top of attack target list
      const objectiveAndScore = attackObjectivesAndScores[0];
      objective = objectiveAndScore.objective;
      if (
        (unitToSend.getIsActive() || unitToSend.hasModifierClass(SDK.ModifierFirstBlood))
        && !unitToSend.hasModifierClass(SDK.ModifierRanged)
        && !unitToSend.hasModifierClass(SDK.ModifierBlastAttack)
      ) {
        // add in objective score for played melee units so they always move towards best objective
        // unplayed units without rush or ranged/blast units should not care about moving towards their best objective
        score += objectiveAndScore.score;
      }
    }

    // add scores for distance and position
    score += ScoreForCardAtTargetPosition(unitToSend, targetPosition, objective);

    // AI should never retreat when below certain difficulty
    if (unitToSend.getIsGeneral() && this._difficulty < DIFFICULTY_WHEN_GENERAL_CAN_RETREAT && unitToSend.getHP() < THRESHOLD_HP_GENERAL_RETREAT) {
      // reverse evasive score
      const distanceFromBestEnemyTarget = distanceBetweenBoardPositions(targetPosition, objective.getPosition());
      const maxDistance = distanceBetweenBoardPositions({ x: 0, y: 0 }, { x: CONFIG.BOARDROW, y: CONFIG.BOARDCOL });
      score -= (distanceFromBestEnemyTarget * BOUNTY.DISTANCE_FROM_BEST_ENEMY_TARGET_EVASIVE) - maxDistance;
      // add normal aggresive score
      score += distanceFromBestEnemyTarget * BOUNTY.DISTANCE_FROM_BEST_ENEMY_TARGET;
    }

    return {
      sourcePosition,
      targetPosition,
      objective,
      score,
    };
  },

  // endregion BOARD SCORE

};

module.exports = StarterAI;

// region THRESHOLD

var THRESHOLD_COUNTERATTACK_HP_PCT_GENERAL = 0.3;
var THRESHOLD_HP_GENERAL_RETREAT = 10.0;
const THRESHOLD_HIGH_VALUE_UNIT = 14;
var THRESHOLD_HIGH_ATTACK_UNIT = 5;
var THRESHOLD_DISPEL = 4;

// endregion THRESHOLD

// region DIFFICULTY

var DIFFICULTY_MAX_SPAWNED = 20; // max number of units spawned at any one time (max spawns * difficulty)
var DIFFICULTY_MAX_SPAWNS_PER_TURN = CONFIG.MAX_HAND_SIZE; // max number of spawns per turn as (max spawns * difficulty)
var DIFFICULTY_MAX_UNITS_REMOVED_PER_TURN = 10; // max number of enemy units that can be removed per turn as (max removed * difficulty)
var DIFFICULTY_MIN_UNITS_THAT_ATTACK = 2; // minimum number of units that must attack per turn
var DIFFICULTY_MAX_MISSED_ATTACKS_PCT = 1.0; // max number of missed attacks per turn as ((num units - min attacks) * max attacks pct * inverse difficulty)
var DIFFICULTY_WHEN_GENERAL_CAN_RETREAT = 0.2; // difficulty at which general will start retreating when at low hp
var DIFFICULTY_WHEN_GENERAL_CAN_ATTACK_ENEMY_GENERAL = 0.0; // difficulty at which general will start attacking player general
var DIFFICULTY_WHEN_UNITS_CAN_ATTACK_ENEMY_GENERAL = 0.1; // difficulty at which units will start attacking player general
var DIFFICULTY_WHEN_GENERAL_CARES_ABOUT_COUNTERATTACKS = 0.75; // difficulty at which general begins avoiding high damage counter attacks
var DIFFICULTY_WHEN_UNITS_CARE_ABOUT_COUNTERATTACKS = 0.75; // difficulty at which units attempt to avoid counter attacks that would kill them

// endregion DIFFICULTY

// region CARD INTENT

var CARD_INTENT = [];
// lyonar
// CARD_INTENT[SDK.Cards.Spell.TrueStrike] = "burn_minion"; //True Strike | Deal 2 dmg minions
CARD_INTENT[SDK.Cards.Spell.DivineBond] = 'buff_minion'; // Divine_Bond | +atk = hp
// CARD_INTENT[SDK.Cards.Spell.WarSurge] = "buff_mass_minion"; //war surge | buff all minions
// CARD_INTENT[SDK.Cards.Spell.Martyrdom] = "removal"; //Martyrdon | destroy minion, restore hp to general
// CARD_INTENT[SDK.Cards.Spell.Tempest] = "burn_mass"; //Tempest | 3 dmg all generals and minions ***TODO SMARTER TARGETING - lethal
// CARD_INTENT[SDK.Cards.Spell.BeamShock] = "stun"; //Beamshock | stun an enemy minion or general
// CARD_INTENT[SDK.Cards.Spell.AurynNexus] = "buff_minion"; //Auryn Nexus | give a friendly minion +3 health
// CARD_INTENT[SDK.Cards.Spell.SundropElixir] = "heal"; // sundrop elixir | heal a friendly minion or general +5 health
// CARD_INTENT[SDK.Cards.Artifact.SunstoneBracers] = "buff_general"; //Sunstone Bracers | buff general atk
// CARD_INTENT[SDK.Cards.Spell.Roar] = "buff_minion"; //roar | SIGNATURE SPELL - +2 ATK minion near general
// CARD_INTENT[SDK.Cards.Spell.Afterglow] = "heal_bbs"; //Afterglow | SIGNATURE SPELL - Heal 3 to friendly minion
// CARD_INTENT[SDK.Cards.Spell.CircleLife] = "burn"; //circle of life | deal 5 damage and heal 5 to general
// CARD_INTENT[SDK.Cards.Spell.HolyImmolation] = "burn_minion"; //Holy Immolation  | Heal a friendly minion for 4 and deal 4 dmg to nearby enemy minions

// songhai
// CARD_INTENT[SDK.Cards.Spell.SaberspineSeal] = "buff_endOfTurn"; //Saberspine Seal | +3 atk this turn
CARD_INTENT[SDK.Cards.Spell.MistDragonSeal] = 'move'; // mist dragon seal | +1/+1, followup: move friendly any space
// CARD_INTENT[SDK.Cards.Spell.PhoenixFire] = "burn"; //phoenix fire | 3 dmg
// CARD_INTENT[SDK.Cards.Spell.InnerFocus] = "refresh"; //inner focus | refresh w/ 3 or less attack
// CARD_INTENT[SDK.Cards.Spell.GhostLightning] = "burn_mass_enemy_minion"; //Ghost Lightning | 1 dmg all enemy minions ***TODO SMARTER TARGETING - lethal
// CARD_INTENT[SDK.Cards.Spell.KillingEdge] = "buff_minion"; //Killing Edge | +4/+2 on minion
CARD_INTENT[SDK.Cards.Faction2.ChakriAvatar] = 'summon_grow'; // chakri avatar | unit with spellWatch. to cast with high priority before spells
CARD_INTENT[SDK.Cards.Spell.Blink] = 'move'; // Blink | SIGNATURE SPELL - move friendly minion up to 2 spaces
// CARD_INTENT[SDK.Cards.Spell.ArcaneHeart] = "summon_ranged_bbs"; //ArcaneHeart | SIGNATURE SPELL - summon heartseeker nearby general
// CARD_INTENT[SDK.Cards.Spell.SpiralTechnique] = "burn"; // spiral technique | deal 8 damage to a minion or general

// vetruvian
// CARD_INTENT[SDK.Cards.Spell.EntropicDecay] = "removal_minion"; //entropic decay | destroy minion next to general
// CARD_INTENT[SDK.Cards.Spell.ScionsFirstWish] = "buff_minion"; //scions first wish | +1/+1 minion, draw card
// CARD_INTENT[SDK.Cards.Spell.CosmicFlesh] = "buff_minion"; //cosmic flesh | +2/+4 +provoke minion
// CARD_INTENT[SDK.Cards.Spell.ScionsSecondWish] = "buff_minion"; //scions second wish | +2/+2 immune to general
// CARD_INTENT[SDK.Cards.Spell.Blindscorch] = "debuff_minion"; //blindscorch | lower minion atk to 0 until ur next turn
// CARD_INTENT[SDK.Cards.Spell.SiphonEnergy] = "dispel_minion"; //Siphon Energy | dispel a minion
// CARD_INTENT[SDK.Cards.Spell.FountainOfYouth] = "mass_heal_minion"; //Fountain of Youth | heal all minions to full health
// CARD_INTENT[SDK.Cards.Spell.InnerOasis] = "mass_buff_minion"; //Inner Oasis | +0/+3 all minions
// CARD_INTENT[SDK.Cards.Faction3.OrbWeaver] = "summon"; // Orb Weaver | summon a copy of itself on a nearby space
// CARD_INTENT[SDK.Cards.Spell.Enslave] = "removal_minion"; // Dominate Will | take control of a minion next to general
// CARD_INTENT[SDK.Cards.Artifact.StaffOfYKir] = "buff_general"; //Staff of Y'Kir | buff general atk
// CARD_INTENT[SDK.Cards.Spell.WindShroud] = "summon"; //WindShroud | SIGNATURE SPELL - summ 2/2 ephemeral with rush near general
CARD_INTENT[SDK.Cards.Spell.PsionicStrike] = 'buff_general_endOfTurn'; // PsionicStrike | SIGNATURE SPELL - general deals double dmg to minions this turn
// CARD_INTENT[SDK.Cards.Spell.BoneSwarm] = "burn_general"; //Bone Swarm | deal 2 damage to general and all nearby minions

// abyssian
// CARD_INTENT[SDK.Cards.Spell.DarkTransformation] = "removal"; //dark transformation | destroy enemy minion, summon 1/1 wraith
// CARD_INTENT[SDK.Cards.Spell.SoulshatterPact] = "buff_mass_minion_endOfTurn"; //soul shatter pact | friendly minions +2 atk this turn
// CARD_INTENT[SDK.Cards.Spell.WraithlingSwarm] = "summon"; //wraithling swam | summon 3 1/1 wraithlings near each other
CARD_INTENT[SDK.Cards.Spell.DaemonicLure] = 'burn_move_enemy_minion'; // daemonic lure | 1 dmg and teleport enemy minion
CARD_INTENT[SDK.Cards.Spell.ShadowNova] = 'shadownova'; // shadownova | 2x2 shadow creep area
// CARD_INTENT[SDK.Cards.Spell.VoidPulse] = "burn_general"; //void pulse | deal 2 damage to enemy general, restore 3 health to own general
// CARD_INTENT[SDK.Cards.Faction4.DarkSiren] = "summon_debuff_minion"; //Blood Siren | give nearby enemy -2 attack this turn
CARD_INTENT[SDK.Cards.Faction4.ShadowWatcher] = 'summon_grow'; // shadowwatcher | 2/2 deathwatcher. defined to cast with high priority
CARD_INTENT[SDK.Cards.Faction4.BloodmoonPriestess] = 'summon_watcher'; // Bloodmoon Priestess | summon 1/1 minion deathwatch
CARD_INTENT[SDK.Cards.Faction4.SharianShadowdancer] = 'summon_watcher'; // Shadow Dancer | deal 1 damage and heal 1 deathwatch
// CARD_INTENT[SDK.Cards.Faction4.NightsorrowAssassin] = "summon_removal"; //Nightsorrow Assassin | kill enemy minion with 2 attack or less
// CARD_INTENT[SDK.Cards.Spell.ShadowReflection] = "buff_minion"; //Shadow Reflection | give friendly minion +5 attack
// CARD_INTENT[SDK.Cards.Spell.BreathOfTheUnborn] = "burn_mass_enemy_minion"; //Breath of the Unborn | deal 2 damage to all enemy minions and restore all friendly minions to full health
// CARD_INTENT[SDK.Cards.Spell.DarkSeed] = "burn_general"; //Dark seed | deal damage to enemy general equal to their cards in hand  *** Possibly would need new logic??***
// CARD_INTENT[SDK.Cards.Spell.Shadowspawn] = "summon"; //Shadowspawn | SIGNATURE SPELL - summ 2 1/1s near general
// CARD_INTENT[SDK.Cards.Spell.AbyssalScar] = "burn_minion"; //AbyssalScar | SIGNATURE SPELL - deal 1 dmg to minion, leave shadow creep if kill

// magmar
// CARD_INTENT[SDK.Cards.Spell.NaturalSelection] = "removal"; //natural selection | destroy minion with lowest attack
CARD_INTENT[SDK.Cards.Spell.PlasmaStorm] = 'removal_mass_minion'; // plasma storm | destroy all minions with 3 or less attack
// CARD_INTENT[SDK.Cards.Spell.GreaterFortitude] = "buff_minion"; //greater fortitude | +2/+2 minion
CARD_INTENT[SDK.Cards.Spell.DampeningWave] = 'debuff_minion'; // dampening wave | no counter atk permanent minion
// CARD_INTENT[SDK.Cards.Faction5.PrimordialGazer] = "summon_buff_minion"; //primordial gazer | 2/2, followup +2/+2 adjacent minion
// CARD_INTENT[SDK.Cards.Spell.ManaBurn] = "burn_mass_minion"; //mana burn | 2 dmg to each minion adjacent to mana tile   *** OUTDATED AND NEEDS TO BE REMOVED ***
// CARD_INTENT[SDK.Cards.Artifact.AdamantineClaws] = "buff_general"; //Adamantine Claws | buff general atk
// CARD_INTENT[SDK.Cards.Spell.Amplification] = "buff_minion"; // Amplification | give a friendly damaged minion +2/+4
// CARD_INTENT[SDK.Cards.Spell.DiretideFrenzy] = "buff_minion"; // Diretide Frenzy | give a friendly minion +1 attack and frenzy  *** I feel like the frenzy will be wasted without a rework***
// CARD_INTENT[SDK.Cards.Spell.Tremor] = "stun_minion"; // Tremor | stun enemy minions in 2x2 grid  *** Do we have 2x2 grid logic?***
// CARD_INTENT[SDK.Cards.Spell.EarthSphere] = "heal_general"; // Earth Sphere | heal general 8 health
// CARD_INTENT[SDK.Cards.Spell.Overload] = "buff_general"; //Overload | SIGNATURE SPELL - +1 ATK to general
// CARD_INTENT[SDK.Cards.Spell.SeekingEye] = "draw_bbs"; //SeekingEye | SIGNATURE SPELL - both players draw a card

// vanar
// CARD_INTENT[SDK.Cards.Spell.AspectOfTheWolf] = "removal_buff_minion"; //aspect of the fox | destroy any minion, replace with 3/3
// CARD_INTENT[SDK.Cards.Spell.Avalanche] = "burn_mass"; //avalanche | 4 dmg and stun to ALL minions and generals on your side of field
CARD_INTENT[SDK.Cards.Spell.PermafrostShield] = 'buff_minion'; // Permafrost shield/ AKA Frostfire |+3 atk minion, if vespyr +3 hp
// CARD_INTENT[SDK.Cards.Spell.FlashFreeze] = "burn_stun_minion"; //flash freeze |1 dmg to minion & stun
// CARD_INTENT[SDK.Cards.Spell.ChromaticCold] = "burn_dispel"; //chromatic cold | 2 dmg and dispel
CARD_INTENT[SDK.Cards.Artifact.Snowpiercer] = 'buff_general'; // Snowpiercer | buff general atk
CARD_INTENT[SDK.Cards.Spell.BonechillBarrier] = 'summon'; // bonechill barrier | summon 3 0/2 walls that stun enemy minions who attack it
CARD_INTENT[SDK.Cards.Faction6.BoreanBear] = 'summon_grow'; // borean bear | gain +1 attack for every vespyr summoned
// CARD_INTENT[SDK.Cards.Spell.IceCage] = "removal"; //hailstone prison | bounce minion back to owners hand
CARD_INTENT[SDK.Cards.Spell.BlazingSpines] = 'summon'; // blazing spines | summon 2 3/3 walls
CARD_INTENT[SDK.Cards.Faction6.SnowElemental] = 'summon_watcher'; // glacial elemental | deal 2 damaage to a random minion for every friendly vespyr summoned
CARD_INTENT[SDK.Cards.Faction6.Razorback] = 'summon_buff_mass_minion_endOfTurn'; // Razorback | all friendly minions gain +2 attack until end of turn
// CARD_INTENT[SDK.Cards.Spell.Warbird] = "burn_mass_enemy"; //Warbird | SIGNATURE SPELL - 2 dmg all enemies in enemy general's column
// CARD_INTENT[SDK.Cards.Spell.KineticSurge] = "hand_improve_minion_mass_bbs"; //KineticSurge | SIGNATURE SPELL - +1/+1 minions in hand
// CARD_INTENT[SDK.Cards.Spell.Cryogenesis] = "burn_minion"; //Cryogenesis | Deal 4 dmg to a minion and draw a vespyr

// neutral
CARD_INTENT[SDK.Cards.Neutral.RepulsionBeast] = 'summon_move_enemy_minion'; // repulsor beast |
// CARD_INTENT[SDK.Cards.Neutral.BloodtearAlchemist] = "summon_burn"; //Bloodtear Alchemist |  deals 1 damage to an enemy
// CARD_INTENT[SDK.Cards.Neutral.EphemeralShroud] = "summon_dispel"; //Ephemeral Shroud | dispel a nearby tile
// CARD_INTENT[SDK.Cards.Neutral.HealingMystic] = "summon_heal"; //Healing Mystic | restore 2 health to a minion or general
// CARD_INTENT[SDK.Cards.Neutral.EmeraldRejuvenator] = "summon_heal"; //Emerald Rejuvenator | restore 4 health to both generals
// CARD_INTENT[SDK.Cards.Neutral.Maw] = "summon_burn_minion"; // Maw |  deals 2 damage to an enemy minion
// CARD_INTENT[SDK.Cards.Neutral.PrimusFist] = "summon_buff_minion"; //Primus Fist |  give +2 attack to friendly nearby minion
CARD_INTENT[SDK.Cards.Neutral.CrimsonOculus] = 'summon_grow'; // Crimson Oculus |  gain +1/+1 whenever opponent summons a minion
CARD_INTENT[SDK.Cards.Neutral.PrismaticIllusionist] = 'summon_watcher'; // Prismatic Illusionist |  summon 2/1 illusion every time you cast a spell
CARD_INTENT[SDK.Cards.Neutral.Firestarter] = 'summon_watcher'; // Firestarter |  summon 1/1 spellspark with rush every time you cast a spell
// followups
CARD_INTENT[SDK.Cards.Spell.FollowupTeleport] = 'teleport_destination'; // Followup to: mist dragon seal SDK.Cards.Spell.MistDragonSeal, repulsor beast SDK.Cards.Neutral.RepulsionBeast | Teleport to any space | "Teleport"
// CARD_INTENT[SDK.Cards.Spell.FollowupHeal] = "heal_followup"; //Followup to: Healing_Mystic_10981 | Heals 2 dmg | "Heal_Damge"
// CARD_INTENT[SDK.Cards.Spell.FollowupDamage] = "burn"; //Followup to: Bloodtear Alchemist | Deals 1 dmg |
// CARD_INTENT[SDK.Cards.Spell.ApplyModifiers] = "buff_minion"; //Followup to: primordial gazer SDK.Cards.Faction5.PrimordialGazer | +2/+2 | "apply modifiers"
// CARD_INTENT[SDK.Cards.Spell.CloneSourceEntity] = "summon"; //Followup to: CloneSourceEntity2X | "CloneSourceEntity"
// CARD_INTENT[SDK.Cards.Spell.CloneSourceEntity2X] = "summon"; //Followup to: wraithling swarm SDK.Cards.Spell.WraithlingSwarm | "CloneSourceEntity2X"

// endregion CARD INTENT
