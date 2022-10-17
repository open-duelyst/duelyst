require('coffeescript/register');
const _ = require('underscore');
const AgentActions = require('../../app/sdk/agents/agentActions.coffee');
const SDK = require('../../app/sdk.coffee');

const UtilsSDK = {};

/**
 * Setup a simple game session for unit tests
 * @param {Array} player1Deck
 * @param {Array} player2Deck
 * @param {Boolean} [skipMulligan=false] whether to skip mulligan
 * @param {Boolean} [developerMode=false] whether to set game into developer mode and never randomize card draw
 */
UtilsSDK.setupSession = function (player1Deck, player2Deck, skipMulligan, developerMode) {
  // setup player data
  const player1Data = {
    userId: 'player1_id',
    name: 'player1_name',
    deck: player1Deck,
  };
  const player2Data = {
    userId: 'player2_id',
    name: 'player2_name',
    deck: player2Deck,
  };

  // reset game session
  SDK.GameSession.reset();
  const gameSession = SDK.GameSession.getInstance();

  // set game modes
  gameSession.setIsRunningAsAuthoritative(true);
  gameSession.setIsDeveloperMode(developerMode);
  gameSession.setGameType(SDK.GameType.Sandbox);

  // setup game session
  SDK.GameSetup.setupNewSession(gameSession, player1Data, player2Data);

  if (skipMulligan) {
    gameSession.getPlayer1().setHasStartingHand(true);
    gameSession.getPlayer2().setHasStartingHand(true);
    gameSession.setStatus(SDK.GameStatus.active);
    gameSession.syncState();
  }
};

/**
 * Setup a simple game session for unit tests
 * @param {Challenge} challenge
 */
UtilsSDK.setupSessionForChallenge = function (challenge) {
  SDK.GameSession.reset();
  const gameSession = SDK.GameSession.getInstance();
  gameSession.setUserId('challenge_player_id');
  challenge.setupSession(gameSession);
};

/**
 * Executes all turns in the curent game session's tutorial challenge until OTK.
 */
UtilsSDK.executeTutorialUntilOTK = function () {
  const gameSession = SDK.GameSession.getInstance();
  const challenge = gameSession.getChallenge();
  const myPlayer = gameSession.getMyPlayer();

  while (!gameSession.isOver()) {
    if (gameSession.isNew() && !challenge.getSkipMulligan()) {
      // mulligan as needed
      const action = myPlayer.actionDrawStartingHand(challenge.requiredMulliganHandIndices);
      gameSession.executeAction(action);
    } else {
      // always activate next instruction
      challenge.activateNextInstruction();

      if (gameSession.isMyTurn()) {
        const instruction = challenge.getCurrentInstruction();
        if (instruction != null) {
          let action = null;
          if (instruction.expectedActionType === SDK.EndTurnAction.type) {
            action = gameSession.actionEndTurn();
          } else if (instruction.expectedActionType === SDK.MoveAction.type) {
            const movingUnit = gameSession.getBoard().getUnitAtPosition(instruction.sourcePosition);
            action = movingUnit.actionMove(instruction.targetPosition);
          } else if (instruction.expectedActionType === SDK.AttackAction.type) {
            const attackingUnit = gameSession.getBoard().getUnitAtPosition(instruction.sourcePosition);
            action = attackingUnit.actionAttackEntityAtPosition(instruction.targetPosition);
          } else if (instruction.expectedActionType === SDK.PlayCardFromHandAction.type) {
            let { targetPosition } = instruction;
            if (targetPosition == null) {
              const card = myPlayer.getDeck().getCardInHandAtIndex(instruction.handIndex);
              const validTargetPositions = card.getValidTargetPositions();
              targetPosition = validTargetPositions[Math.floor(Math.random() * validTargetPositions.length)];
            }
            action = myPlayer.actionPlayCardFromHand(instruction.handIndex, targetPosition.x, targetPosition.y);
          } else if (instruction.expectedActionType === SDK.ReplaceCardFromHandAction.type) {
            action = myPlayer.actionReplaceCardFromHand(instruction.handIndex);
          } else if (instruction.expectedActionType === SDK.PlaySignatureCardAction.type) {
            let { targetPosition } = instruction;
            if (targetPosition == null) {
              const card = myPlayer.getDeck().getCardInHandAtIndex(instruction.handIndex);
              const validTargetPositions = card.getValidTargetPositions();
              targetPosition = validTargetPositions[Math.floor(Math.random() * validTargetPositions.length)];
            }
            action = myPlayer.actionPlaySignatureCard(targetPosition.x, targetPosition.y);
          }

          if (action != null) {
            gameSession.executeAction(action);
            if (!action.getIsValid()) {
              throw new Error(`Invalid action in tutorial: ${instruction.expectedActionType} (${action.getValidationMessage()})`);
            }
          } else {
            throw new Error(`Unexpected action type in tutorial: ${instruction.expectedActionType}`);
          }
        } else {
          // no more instructions, move to OTK
          break;
        }
      } else {
        // opponent turn
        UtilsSDK.executeTutorialOpponentTurn();
      }
    }
  }
};

UtilsSDK.executeTutorialOpponentTurn = function () {
  const gameSession = SDK.GameSession.getInstance();
  const challenge = gameSession.getChallenge();
  const opponentAgent = challenge.getOpponentAgent();
  let opponentAgentActions;

  while (true) {
    // gather agent actions
    opponentAgent.gatherAgentActionSequenceAfterStep(gameSession.getLastStep());
    opponentAgentActions = opponentAgent.currentActions;

    // execute final agent action, rest are unnecessary
    // if no final action or final is soft, end turn
    const finalAgentAction = opponentAgent.currentActions[opponentAgent.currentActions.length - 1];
    if (finalAgentAction == null || finalAgentAction.isSoft) {
      gameSession.executeAction(gameSession.actionEndTurn());
      opponentAgentActions = null;
      break;
    } else {
      const opponentAction = AgentActions.createSDKActionFromAgentAction(opponentAgent, finalAgentAction);
      if (opponentAction instanceof SDK.Action) {
        gameSession.executeAction(opponentAction);
        if (!opponentAction.getIsValid()) {
          throw new Error(`Invalid opponent action in tutorial: ${opponentAction.getType()} (${opponentAction.getValidationMessage()})`);
        }
      }
    }
  }
};

UtilsSDK.executeTutorialAndFailOTK = function () {
  UtilsSDK.executeTutorialUntilOTK();

  // fail otk
  const gameSession = SDK.GameSession.getInstance();
  gameSession.executeAction(gameSession.actionEndTurn());

  UtilsSDK.executeTutorialOpponentTurn();
};

/**
 * Applies a card or card from card data to board at a position with an owner.
 * @param {Card|Object} cardOrCardData
 * @param {Number} boardX
 * @param {Number} boardY
 * @param {String|Number} ownerId
 * @returns {Card}
 */
UtilsSDK.applyCardToBoard = function (cardOrCardData, boardX, boardY, ownerId) {
  // get card data as needed
  if (cardOrCardData instanceof SDK.Card) {
    cardOrCardData = cardOrCardData.createNewCardData();
  }

  // apply card
  const action = new SDK.PlayCardAction(SDK.GameSession.getInstance(), ownerId, boardX, boardY, cardOrCardData);
  UtilsSDK.executeActionWithoutValidation(action);

  // return card
  return action.getCard();
};

/**
 * Removes a card from the board at a position.
 * @param {Number} boardX
 * @param {Number} boardY
 * @returns {Card}
 */
UtilsSDK.removeCardFromBoard = function (boardX, boardY) {
  const card = SDK.GameSession.getInstance().getBoard().getEntityAtPosition({ x: boardX, y: boardY }, true);

  if (card != null) {
    // remove card
    const action = new SDK.RemoveAction(SDK.GameSession.getInstance());
    action.setTarget(card);
    UtilsSDK.executeActionWithoutValidation(action);
  }

  return card;
};

UtilsSDK.executeActionWithoutValidation = function (action) {
  const validators = SDK.GameSession.getInstance().getValidators();
  SDK.GameSession.getInstance().setValidators([]);

  SDK.GameSession.getInstance().executeAction(action);

  SDK.GameSession.getInstance().setValidators(validators);
};

UtilsSDK.modifyUnitStats = function (position, atk, maxHP, dmg) {
  const gameSession = SDK.GameSession.getInstance();
  const board = gameSession.getBoard();
  const card = board.getUnitAtPosition(position);
  if (card != null) {
    if (atk != null) {
      card.atk = atk;
    }
    if (maxHP != null) {
      card.maxHP = maxHP;
    }
    if (dmg != null) {
      card.setDamage(dmg);
    }

    // flush card's cached attributes
    card.flushCachedAttributes();

    // execute generic action to update session and engine
    UtilsSDK.executeActionWithoutValidation(new SDK.Action(gameSession));
  }
};

UtilsSDK.getEntityOnBoardById = function (cardId) {
  const gameSession = SDK.GameSession.getInstance();
  const board = gameSession.getBoard();

  const entityArray = board.getEntities(true);

  for (let i = 0; i < entityArray.length; i++) {
    const entity = entityArray[i];
    if (entity.getId() === cardId) {
      return entity;
    }
  }

  return null;
};

UtilsSDK.getEntitiesOnBoardById = function (cardId) {
  const matchingEntities = [];
  const gameSession = SDK.GameSession.getInstance();
  const board = gameSession.getBoard();

  const entityArray = board.getEntities(true);

  for (let i = 0; i < entityArray.length; i++) {
    const entity = entityArray[i];
    if (entity.getId() === cardId) {
      matchingEntities.push(entity);
    }
  }

  return matchingEntities;
};

module.exports = UtilsSDK;
