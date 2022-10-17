process.on('uncaughtException', (err) => {
  console.error(err.stack);
});

const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../'));
require('coffeescript/register');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const generatePushId = require('app/common/generate_push_id');
const Promise = require('bluebird');
const _ = require('underscore');
const cluster = require('cluster');
const CLUSTER_NUMBEROFWORKERS = require('os').cpus().length;
const StarterAI = require('./starter_ai');
const ScoreForBoard = require('./scoring/base/board');
const ScoreForModifiers = require('./scoring/base/modifiers');
const ScoreForUnit = require('./scoring/base/unit');
const ScoreForUnitDamage = require('./scoring/base/unit_damage');
const UsableDecks = require('./decks/usable_decks');
const distanceBetweenBoardPositions = require('./scoring/utils/utils_distanceBetweenBoardPositions');
const findBestObjectiveForCardAtTargetPosition = require('./scoring/utils/utils_findBestObjectiveForCardAtTargetPosition');
const ScoreForCardAtTargetPosition = require('./scoring/position/position_ScoreForCardAtTargetPosition');
const filterAttackTargetsForUnit = require('./scoring/utils/utils_filterAttackTargetsForUnit');
const BOUNTY = require('./scoring/bounty');

// Logger.enabled = false;
// ++++++++++CLUSTER START+++++++++++

if (cluster.isMaster) {
  Logger.module('AI').debug('AI v2 starting...');
  // running game data record
  // should only have 1 game running at a time
  let runningGameData = null;

  // setup express server
  const express = require('express');
  const bodyParser = require('body-parser');
  const helmet = require('helmet');
  const cors = require('cors');
  const config = require('config/config');
  const app = express();

  // setup middleware
  app.use(cors());
  app.use(helmet.noCache());
  app.use(helmet.xssFilter());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  // bind to a port
  app.listen(5001);

  // add routes for dev
  app.get('/', (req, res) => {
    res.send('AI v2 running...');
  });

  /**
   * API Route to find next actions for v1 AI.
   * @param {GameSession} game_session_data
   * @param {String} player_id
   * @see ai_findActionSequence
   */
  app.post('/v1_find_next_actions', (req, res, next) => {
    try {
      const difficulty = req.body.difficulty != null ? req.body.difficulty : 1.0;

      // deserialize
      const gameSessionData = JSON.parse(req.body.game_session_data);
      // force game session game type to single player
      // for development we're usually in sandbox
      // which causes the game session to get incorrectly flagged as a local client game
      // and this activates systems that are unnecessary and performance intensive
      gameSessionData.gameType = SDK.GameType.SinglePlayer;
      const gameSession = SDK.GameSession.create();
      gameSession.setIsRunningAsAuthoritative(true);
      gameSession.deserializeSessionFromFirebase(gameSessionData);

      const playerId = req.body.player_id || gameSession.getCurrentPlayerId();
      Logger.module('AI').debug(`AI v1 finding next actions for ${playerId}`);

      const ai = new StarterAI(gameSession, playerId, difficulty);

      const actions = [];
      let nextAction = ai.nextAction();
      while (nextAction != null) {
        Logger.module('AI').debug(` > next action ${nextAction.getLogName()}`);
        if (nextAction instanceof SDK.EndTurnAction) {
          actions.push(nextAction);
          break;
        } else {
          gameSession.executeAction(nextAction);
          if (nextAction.getIsValid()) {
            actions.push(nextAction);
          } else {
            throw new Error(`Invalid action ${nextAction.getLogName()}`);
          }
          nextAction = ai.nextAction();
        }
      }

      // respond with action
      const actionsJSON = gameSession.serializeToJSON(actions);
      res.status(200).json({ actions: actionsJSON });
    } catch (error) {
      Logger.module('AI').debug(`v1_find_next_actions -> error: ${error.message}`);
      Logger.module('AI').debug(`v1_find_next_actions -> error stack: ${error.stack}`);
      Logger.module('AI').log('ERROR: Request.post /v1_find_next_actions failed!');
      return next(error);
    }
  });

  /**
   * API Route to find action sequence for v2 AI.
   * @param {GameSession} game_session_data
   * @param {String} player_id
   * @param {Number} [depth_limit=9999] maximum depth of sequence for v2 before it stops "thinking"
   * @param {Number} [ms_time_limit=0] maximum time budget in ms for v2 before it stops "thinking"
   * @see ai_findActionSequence
   */
  app.post('/v2_find_action_sequence', (req, res, next) => {
    try {
      // deserialize
      const gameSessionData = JSON.parse(req.body.game_session_data);
      // force game session game type to single player
      // for development we're usually in sandbox
      // which causes the game session to get incorrectly flagged as a local client game
      // and this activates systems that are unnecessary and performance intensive
      gameSessionData.gameType = SDK.GameType.SinglePlayer;
      const gameSession = SDK.GameSession.create();
      gameSession.setIsRunningAsAuthoritative(true);
      gameSession.deserializeSessionFromFirebase(gameSessionData);

      const playerId = req.body.player_id != null ? req.body.player_id : gameSession.getCurrentPlayerId();
      const depthLimit = req.body.depth_limit != null ? req.body.depth_limit : 9999;
      const msTimeLimit = req.body.ms_time_limit != null ? req.body.ms_time_limit : 0;
      Logger.module('AI').debug(`AI v2 finding action sequence for ${playerId}`);

      ai_findActionSequence(gameSession, playerId, depthLimit, msTimeLimit)
        .then((results) => {
          const { sequence } = results;
          const { rootNode } = results;

          // log performance results
          Logger.module('AI').debug(`[G:${getGameId(rootNode)}] ai_findActionSequence( ) -> \n`
            + `Best action sequence length = ${sequence.actions.length}\n`
            + `Current Board Score = ${rootNode.boardScore.toFixed(2)}\n`
            + `Board Score After Best Sequence = ${sequence.score.toFixed(2)}\n`
            + `Execution time = ${Math.round((Date.now() - rootNode.startTime))}ms\n`
            + `Base # of Actions = ${rootNode.numberOfChildren}\n`
            + `Est. # of Action Sequences = ${factorial(rootNode.numberOfChildren)}\n`
            + `Sequences fully evaluated = ${rootNode.numSequencesEvaluated}\n`
            + `Branches Pruned = ${rootNode.branchesPruned}\n`
            + `Pruning Threshold = ${PRUNING_THRESHOLD}\n`
            + `min. # of actions = ${preProc_minimumNumberOfActionsToEvaluate}\n`
            + `% Eval. After Min. = ${preProc_percentOfActionsToEvaluateAfterMinimum}\n`
            + `depthLimit = ${rootNode.depthLimit}\n`
            + `msTimeLimit = ${rootNode.msTimeLimit}`);

          // respond with sequence actions
          const sequenceActionsJSON = gameSession.serializeToJSON(sequence.actions);
          res.status(200).json({ sequence_actions: sequenceActionsJSON });
        })
        .catch((error) => {
          Logger.module('AI').debug(`v2_find_action_sequence -> error: ${error.message}`);
          Logger.module('AI').debug(`v2_find_action_sequence -> error stack: ${error.stack}`);
          return next(error);
        });
    } catch (error) {
      Logger.module('AI').log('ERROR: Request.post /v2_find_action_sequence failed!');
      return next(error);
    }
  });

  /**
   * API Route to start an AI vs AI game.
   * NOTE: only one game may be running at a time!
   * @param {Number} ai_1_general_id
   * @param {Number} ai_1_general_id
   * @param {Number} [ai_1_version=2]
   * @param {Number} [ai_2_version=2]
   * @param {Number} [depth_limit=9999] maximum depth of sequence for v2 before it stops "thinking"
   * @param {Number} [ai_1_num_random_cards=0]
   * @param {Number} [ai_2_num_random_cards=0]
   * @returns {GameSession}
   */
  app.post('/start_game', (req, res, next) => {
    try {
      const ai1GeneralId = req.body.ai_1_general_id;
      const ai2GeneralId = req.body.ai_2_general_id;
      const ai1Version = req.body.ai_1_version != null ? req.body.ai_1_version : 2;
      const ai2Version = req.body.ai_2_version != null ? req.body.ai_2_version : 2;
      const depthLimit = req.body.depth_limit != null ? req.body.depth_limit : 9999;
      const msTimeLimit = req.body.ms_time_limit != null ? req.body.ms_time_limit : 0;
      const ai1NumRandomCards = req.body.ai_1_num_random_cards != null ? parseInt(req.body.ai_1_num_random_cards) : 0;
      const ai2NumRandomCards = req.body.ai_2_num_random_cards != null ? parseInt(req.body.ai_2_num_random_cards) : 0;
      const ai1Deck = UsableDecks.getAutomaticUsableDeck(ai1GeneralId, 1.0, ai1NumRandomCards);
      const ai2Deck = UsableDecks.getAutomaticUsableDeck(ai2GeneralId, 1.0, ai2NumRandomCards);

      // replace general in deck with requested general
      ai1Deck[0] = { id: ai1GeneralId };
      ai2Deck[0] = { id: ai2GeneralId };

      // setup player data
      const ai1PlayerId = `AI1_v${ai1Version}`;
      const ai2PlayerId = `AI2_v${ai2Version}`;
      let player1Data = {
        userId: ai1PlayerId,
        name: ai1PlayerId,
        deck: ai1Deck,
      };
      let player2Data = {
        userId: ai2PlayerId,
        name: ai2PlayerId,
        deck: ai2Deck,
      };

      // randomize starting player
      let ai2IsPlayer1 = false;
      if (Math.random() > 0.5) {
        ai2IsPlayer1 = true;
        const tempData = player1Data;
        player1Data = player2Data;
        player2Data = tempData;
      }

      const gameId = generatePushId();
      const gameSession = SDK.GameSession.create();
      gameSession.gameType = SDK.GameType.SinglePlayer;
      gameSession.gameId = gameId;
      gameSession.setIsRunningAsAuthoritative(true);
      SDK.GameSetup.setupNewSession(gameSession, player1Data, player2Data);

      Logger.module('AI').debug(`AI Simulator Server starting game ${gameId} using v${ai1Version} w/ general ${SDK.CardFactory.cardForIdentifier(ai1GeneralId, SDK.GameSession.getInstance()).getName()} vs v${ai2Version} w/ general ${SDK.CardFactory.cardForIdentifier(ai2GeneralId, SDK.GameSession.getInstance()).getName()}`);

      // setup game data
      runningGameData = {
        session: gameSession,
        ai2IsPlayer1,
        ai1: null,
        ai1PlayerId,
        ai1Version,
        ai2: null,
        ai2PlayerId,
        ai2Version,
        depthLimit,
        msTimeLimit,
      };

      // setup AI
      if (ai1PlayerId != null && ai1Version != null) {
        if (ai1Version === 1) {
          runningGameData.ai1 = new StarterAI(gameSession, ai1PlayerId, 1.0);
        }
      }
      if (ai2PlayerId != null && ai2Version != null) {
        if (ai2Version === 1) {
          runningGameData.ai2 = new StarterAI(gameSession, ai2PlayerId, 1.0);
        }
      }

      // mulligan for both ai
      const aiPromises = [];

      if (runningGameData.ai1 instanceof StarterAI) {
        var aiAction = runningGameData.ai1.nextAction();
        if (aiAction != null) {
          gameSession.executeAction(aiAction);
        }
      } else {
        aiPromises.push(ai_findAndExecuteActionSequence(gameSession, runningGameData.ai1PlayerId, runningGameData.depthLimit, runningGameData.msTimeLimit));
      }

      if (runningGameData.ai2 instanceof StarterAI) {
        var aiAction = runningGameData.ai2.nextAction();
        if (aiAction != null) {
          gameSession.executeAction(aiAction);
        }
      } else {
        aiPromises.push(ai_findAndExecuteActionSequence(gameSession, runningGameData.ai2PlayerId, runningGameData.depthLimit, runningGameData.msTimeLimit));
      }

      // respond with the game session once mulligan complete
      Promise.all(aiPromises)
        .then(() => {
          res.status(200).json({ game_session_data: gameSession.serializeToJSON(gameSession) });
        })
        .catch((error) => {
          Logger.module('AI').debug(`start_game -> error: ${error.message}`);
          Logger.module('AI').debug(`start_game -> error stack: ${error.stack}`);
          return next(error);
        });
    } catch (error) {
      Logger.module('AI').log('ERROR: Request.post /start_game failed!');
      return next(error);
    }
  });

  /**
   * API Route to start an AI vs AI game from game session data.
   * NOTE: only one game may be running at a time!
   * @param {String} game_session_data
   * @param {Number} [ai_1_version=2]
   * @param {Number} [ai_2_version=2]
   * @param {Number} [depth_limit=9999] maximum depth of sequence for v2 before it stops "thinking"
   * @param {Number} [ms_time_limit=0] maximum time budget in ms for v2 before it stops "thinking"
   * @returns {GameSession}
   */
  app.post('/start_game_from_data', (req, res, next) => {
    try {
      const ai1Version = req.body.ai_1_version != null ? req.body.ai_1_version : 2;
      const ai2Version = req.body.ai_2_version != null ? req.body.ai_2_version : 2;
      const depthLimit = req.body.depth_limit != null ? req.body.depth_limit : 9999;
      const msTimeLimit = req.body.ms_time_limit != null ? req.body.ms_time_limit : 0;

      // deserialize
      const gameSessionData = JSON.parse(req.body.game_session_data);
      // force game session game type to single player
      // for development we're usually in sandbox
      // which causes the game session to get incorrectly flagged as a local client game
      // and this activates systems that are unnecessary and performance intensive
      gameSessionData.gameType = SDK.GameType.SinglePlayer;
      if (gameSessionData.gameId == null) { gameSessionData.gameId = generatePushId(); }
      const gameSession = SDK.GameSession.create();
      gameSession.setIsRunningAsAuthoritative(true);
      gameSession.deserializeSessionFromFirebase(gameSessionData);
      const { gameId } = gameSession;
      Logger.module('AI').debug(`AI Simulator Server starting game from data ${gameId} using v${ai1Version} vs v${ai2Version}`);

      // setup game data
      const ai1PlayerId = gameSession.getPlayer1Id();
      const ai2PlayerId = gameSession.getPlayer2Id();
      runningGameData = {
        session: gameSession,
        ai2IsPlayer1: false,
        ai1: null,
        ai1PlayerId,
        ai1Version,
        ai2: null,
        ai2PlayerId,
        ai2Version,
        depthLimit,
        msTimeLimit,
      };

      // setup AI
      if (ai1PlayerId != null && ai1Version != null) {
        if (ai1Version === 1) {
          runningGameData.ai1 = new StarterAI(gameSession, ai1PlayerId, 1.0);
        }
      }
      if (ai2PlayerId != null && ai2Version != null) {
        if (ai2Version === 1) {
          runningGameData.ai2 = new StarterAI(gameSession, ai2PlayerId, 1.0);
        }
      }

      // respond that everything is okay
      res.status(200).json({});
    } catch (error) {
      Logger.module('AI').log('ERROR: Request.post /start_game_from_data failed!');
      return next(error);
    }
  });

  /**
   * API Route to stop the currently running AI vs AI game.
   */
  app.post('/stop_game', (req, res, next) => {
    try {
      Logger.module('AI').debug('AI Simulator Server stopping game');
      runningGameData = null;
      res.status(200).json({});
    } catch (error) {
      Logger.module('AI').log('ERROR: Request.post /stop_game failed!');
      return next(error);
    }
  });

  /**
   * API Route to progress the currently running AI vs AI game.
   */
  app.post('/step_game', (req, res, next) => {
    try {
      if (runningGameData != null) {
        const gameSession = runningGameData.session;
        const aiPromises = [];
        if (!gameSession.isOver()) {
          // determine what players need to execute actions
          let playerIdsToExecuteActions;
          if (gameSession.isNew()) {
            playerIdsToExecuteActions = [gameSession.getPlayer1Id(), gameSession.getPlayer2Id()];
          } else {
            playerIdsToExecuteActions = [gameSession.getCurrentPlayerId()];
          }

          // for each player that needs to execute actions
          for (let i = 0, il = playerIdsToExecuteActions.length; i < il; i++) {
            const currentPlayerId = playerIdsToExecuteActions[i];
            var ai;
            if (currentPlayerId === gameSession.getPlayer2Id()) {
              ai = runningGameData.ai2IsPlayer1 ? runningGameData.ai1 : runningGameData.ai2;
            } else {
              ai = runningGameData.ai2IsPlayer1 ? runningGameData.ai2 : runningGameData.ai1;
            }

            if (ai instanceof StarterAI) {
              aiPromises.push(new Promise((resolve, reject) => {
                const stepsExecuted = [];
                const aiAction = ai.nextAction();
                if (aiAction != null) {
                  gameSession.executeAction(aiAction);
                  if (aiAction.getIsValid()) {
                    let lastStep = gameSession.getLastStep();
                    while (lastStep != null) {
                      stepsExecuted.unshift(lastStep);
                      lastStep = lastStep.getParentStep();
                    }
                  }
                }
                resolve(stepsExecuted);
              }));
            } else {
              aiPromises.push(ai_findAndExecuteActionSequence(gameSession, currentPlayerId, runningGameData.depthLimit, runningGameData.msTimeLimit));
            }
          }
        }

        // respond once all steps have been executed
        Promise.all(aiPromises).then((results) => {
          let stepsExecuted = [];
          for (let i = 0, il = results.length; i < il; i++) {
            stepsExecuted = stepsExecuted.concat(results[i]);
          }
          const stepsJSON = gameSession.serializeToJSON(stepsExecuted);
          res.status(200).json({ steps: stepsJSON });
        })
          .catch((error) => {
            Logger.module('AI').debug(`step_game -> error: ${error.message}`);
            Logger.module('AI').debug(`step_game -> error stack: ${error.stack}`);
            return next(error);
          });
      } else {
        throw new Error('No game active!');
      }
    } catch (error) {
      Logger.module('AI').log('ERROR: Request.post /step_game failed!');
      return next(error);
    }
  });

  /**
   * API Route to run N headless AI vs AI games and log win/loss stats.
   * @param {Array} ai_1_deck
   * @param {Array} ai_2_deck
   * @param {Number} [ai_1_version=2]
   * @param {Number} [ai_2_version=2]
   * @param {Number} [num_games=10]
   * @param {Number} [depth_limit=9999] maximum depth of sequence for v2 before it stops "thinking"
   * @param {Number} [ms_time_limit=0] maximum time budget in ms for v2 before it stops "thinking"
   * @returns {GameSession}
   */
  app.post('/run_headless_games', (req, res, next) => {
    try {
      const ai1GeneralId = req.body.ai_1_general_id;
      const ai2GeneralId = req.body.ai_2_general_id;
      const ai1Version = req.body.ai_1_version != null ? req.body.ai_1_version : 2;
      const ai2Version = req.body.ai_2_version != null ? req.body.ai_2_version : 2;
      const numGames = req.body.num_games != null ? req.body.num_games : 10;
      const depthLimit = req.body.depth_limit != null ? req.body.depth_limit : 9999;
      const msTimeLimit = req.body.ms_time_limit != null ? req.body.ms_time_limit : 0;
      const ai1NumRandomCards = req.body.ai_1_num_random_cards != null ? parseInt(req.body.ai_1_num_random_cards) : 0;
      const ai2NumRandomCards = req.body.ai_2_num_random_cards != null ? parseInt(req.body.ai_2_num_random_cards) : 0;
      const ai1PlayerId = `AI1_v${ai1Version}`;
      const ai2PlayerId = `AI2_v${ai2Version}`;
      Logger.module('AI').debug(`AI Simulator Server running ${numGames} games`);

      // respond that everything is okay
      res.status(200).json({});

      // setup games stats list
      const gamesStats = [];

      // turn off logger temporarily
      Logger.enabled = false;

      // setup method to log errors and roping
      const handleErrorsAndRoping = function (error) {
        let errorGameState = '';
        if (gameSession != null) {
          const currentPlayerId = gameSession.getCurrentPlayerId();
          errorGameState += `\nAI version: ${currentPlayerId === ai2PlayerId ? ai2Version : ai1Version}`;

          // turn
          errorGameState += `\nturn: ${gameSession.getCurrentPlayer() === gameSession.getPlayer2() ? 'p2' : 'p1'}`;

          // action
          const lastAction = gameSession.getLastStep() && gameSession.getLastStep().getAction();
          errorGameState += `\nlast action: ${((lastAction && lastAction.getLogName()) + (lastAction instanceof SDK.PlayCardFromHandAction ? (` playing ${lastAction.getCard() && lastAction.getCard().getLogName()}`) : '')) || 'none'}`;

          // mana
          errorGameState += `\nmana: ${gameSession.getCurrentPlayer().getRemainingMana()} / ${gameSession.getCurrentPlayer().getMaximumMana()}`;

          // bbs
          const signatureCard = gameSession.getCurrentPlayer().getCurrentSignatureCard();
          errorGameState += `\nbbs: ${(signatureCard && signatureCard.getName()) || 'none'}`;

          if (gameSession.getIsFollowupActive()) {
            const followupParentCard = gameSession.getValidatorFollowup().getCardWaitingForFollowups();
            const followupRootCard = followupParentCard.getRootCard();
            errorGameState += `\nfollowup: ${followupParentCard.getName()}`;
            errorGameState += `\nfollowup root: ${followupRootCard.getName()} at ${followupRootCard.getPositionX()}, ${followupRootCard.getPositionY()}`;
          } else {
            errorGameState += '\nfollowup: none';
          }

          // get hand
          errorGameState += '\n\nhand:';
          const cardsInHand = gameSession.getCurrentPlayer().getDeck().getCardsInHand();
          _.each(cardsInHand, (cardInHand, i) => {
            if (cardInHand == null) {
              errorGameState += `\n[${i}]: empty`;
            } else {
              errorGameState += `\n[${i}]: ${cardInHand.getName()} ${cardInHand.getIndex()}`;
            }
          });

          // get board
          errorGameState += '\n\nboard:';
          const cardsOnBoard = gameSession.getBoard().getEntities(true);
          _.each(cardsOnBoard, (cardOnBoard, i) => {
            if (cardOnBoard != null) {
              errorGameState += `\n${cardOnBoard.getName()} ${cardOnBoard.getIndex()} (x:${cardOnBoard.getPosition().x}, y:${cardOnBoard.getPosition().y}, hp:${cardOnBoard.getHP()}, atk:${cardOnBoard.getATK()}, owner:${cardOnBoard.isOwnedByPlayer2() ? 'p2' : 'p1'})`;
            }
          });
        }

        // restore logger
        Logger.enabled = true;
        if (error != null) {
          if (_.isObject(error)) {
            Logger.module('AI').debug(`run_headless_games -> error: ${error.message}`);
            Logger.module('AI').debug(`run_headless_games -> error stack: ${error.stack}`);
          } else {
            Logger.module('AI').debug(`run_headless_games -> error: ${error}`);
          }
        }
        if (errorGameState) {
          Logger.module('AI').debug(`run_headless_games -> error game state: ${errorGameState}`);
        }
      };

      // run each game in sequence
      let gameSession;
      const games = _.range(numGames);
      Promise.each(games, (i) => new Promise((gameResolve, gameReject) => {
        // timestamp start of game
        const startTime = Date.now();

        // pick random general if none provided
        let ai1GeneralIdForGame;
        if (ai1GeneralId == null) {
          ai1GeneralIdForGame = _.sample(_.sample(SDK.FactionFactory.getAllPlayableFactions()).generalIds);
        } else {
          ai1GeneralIdForGame = ai1GeneralId;
        }
        let ai2GeneralIdForGame;
        if (ai2GeneralId == null) {
          ai2GeneralIdForGame = _.sample(_.sample(SDK.FactionFactory.getAllPlayableFactions()).generalIds);
        } else {
          ai2GeneralIdForGame = ai2GeneralId;
        }

        // get deck for faction
        const ai1Deck = UsableDecks.getAutomaticUsableDeck(ai1GeneralIdForGame, 1.0);
        const ai2Deck = UsableDecks.getAutomaticUsableDeck(ai2GeneralIdForGame, 1.0);

        // randomize decks as needed
        let ai1DeckForGame;
        if (_.isNumber(ai1NumRandomCards) && ai1NumRandomCards > 0) {
          ai1DeckForGame = UsableDecks.randomizeDeck(ai1Deck, ai1NumRandomCards);
        } else {
          ai1DeckForGame = ai1Deck;
        }
        let ai2DeckForGame;
        if (_.isNumber(ai2NumRandomCards) && ai2NumRandomCards > 0) {
          ai2DeckForGame = UsableDecks.randomizeDeck(ai2Deck, ai2NumRandomCards);
        } else {
          ai2DeckForGame = ai2Deck;
        }

        // replace general in deck with requested general
        ai1DeckForGame[0] = { id: ai1GeneralIdForGame };
        ai2DeckForGame[0] = { id: ai2GeneralIdForGame };

        // setup player data and randomize starting player
        let ai2IsPlayer1;
        let player1Data;
        let player2Data;
        if (Math.random() > 0.5) {
          ai2IsPlayer1 = true;
          player1Data = { userId: ai2PlayerId, name: ai2PlayerId, deck: ai2DeckForGame };
          player2Data = { userId: ai1PlayerId, name: ai1PlayerId, deck: ai1DeckForGame };
        } else {
          ai2IsPlayer1 = false;
          player1Data = { userId: ai1PlayerId, name: ai1PlayerId, deck: ai1DeckForGame };
          player2Data = { userId: ai2PlayerId, name: ai2PlayerId, deck: ai2DeckForGame };
        }

        // setup session
        const gameId = generatePushId();
        gameSession = SDK.GameSession.create();
        gameSession.gameType = SDK.GameType.SinglePlayer;
        gameSession.gameId = gameId;
        gameSession.setIsRunningAsAuthoritative(true);
        SDK.GameSetup.setupNewSession(gameSession, player1Data, player2Data);
        // turn on logger temporarily
        Logger.enabled = true;

        // log start of game
        Logger.module('AI').debug(`AI Simulator Server running game ${i + 1} / ${numGames} with id ${gameId} using v${ai1Version} w/ general ${SDK.CardFactory.cardForIdentifier(ai1GeneralIdForGame, SDK.GameSession.getInstance()).getName()} vs v${ai2Version} w/ general ${SDK.CardFactory.cardForIdentifier(ai2GeneralIdForGame, SDK.GameSession.getInstance()).getName()}`);

        // turn off logger temporarily
        Logger.enabled = false;

        // setup AI
        let ai1;
        if (ai1PlayerId != null && ai1Version != null) {
          if (ai1Version === 1) {
            ai1 = new StarterAI(gameSession, ai1PlayerId, 1.0);
          }
        }
        let ai2;
        if (ai2PlayerId != null && ai2Version != null) {
          if (ai2Version === 1) {
            ai2 = new StarterAI(gameSession, ai2PlayerId, 1.0);
          }
        }

        // setup function to mulligan
        const executeMulligan = function () {
          const aiPromises = [];

          if (ai1 instanceof StarterAI) {
            aiPromises.push(new Promise((resolve, reject) => {
              const stepsExecuted = [];
              const aiAction = ai1.nextAction();
              if (aiAction != null) {
                gameSession.executeAction(aiAction);
                if (aiAction.getIsValid()) {
                  let lastStep = gameSession.getLastStep();
                  while (lastStep != null) {
                    stepsExecuted.unshift(lastStep);
                    lastStep = lastStep.getParentStep();
                  }
                }
              }
              resolve(stepsExecuted);
            }));
          } else {
            aiPromises.push(ai_findAndExecuteActionSequence(gameSession, ai1PlayerId, depthLimit, msTimeLimit));
          }

          if (ai2 instanceof StarterAI) {
            aiPromises.push(new Promise((resolve, reject) => {
              const stepsExecuted = [];
              const aiAction = ai2.nextAction();
              if (aiAction != null) {
                gameSession.executeAction(aiAction);
                if (aiAction.getIsValid()) {
                  stepsExecuted.push(gameSession.getLastStep());
                }
              }
              resolve(stepsExecuted);
            }));
          } else {
            aiPromises.push(ai_findAndExecuteActionSequence(gameSession, ai2PlayerId, depthLimit, msTimeLimit));
          }

          return Promise.all(aiPromises);
        };

        // setup recursive method for executing turns until game is over
        var executeTurnsUntilGameOver = function () {
          let aiPromise;
          if (gameSession.isOver()) {
            return Promise.resolve();
          }
          // find ai
          const currentPlayerId = gameSession.getCurrentPlayerId();
          let ai;
          if (currentPlayerId === gameSession.getPlayer2Id()) {
            ai = ai2IsPlayer1 ? ai1 : ai2;
          } else {
            ai = ai2IsPlayer1 ? ai2 : ai1;
          }

          // get ai next actions
          if (ai instanceof StarterAI) {
            aiPromise = new Promise((resolve, reject) => {
              const stepsExecuted = [];
              const aiAction = ai.nextAction();
              if (aiAction != null) {
                gameSession.executeAction(aiAction);
                if (aiAction.getIsValid()) {
                  stepsExecuted.push(gameSession.getLastStep());
                } else {
                  // AI made an invalid action that it can't recover from
                  console.log(`run_headless_games -> INVALID ACTION ${aiAction.getLogName()}${aiAction instanceof SDK.PlayCardFromHandAction ? (` playing ${aiAction.getCard() && aiAction.getCard().getLogName()}`) : ''} / VALIDATED BY: ${aiAction.getValidatorType()} / MESSAGE: ${aiAction.getValidationMessage()}`);
                }
              }
              resolve(stepsExecuted);
            });
          } else {
            aiPromise = ai_findAndExecuteActionSequence(gameSession, currentPlayerId, depthLimit, msTimeLimit);
          }

          // recurse
          return aiPromise.then((stepsExecuted) => {
            if (stepsExecuted == null || stepsExecuted.length === 0) {
              return Promise.reject('Roping detected!');
            }
            return executeTurnsUntilGameOver();
          });
        };

        // setup method to handle game over
        const afterGameOver = function () {
          Logger.module('AI').debug(`AI Simulator Server finished running game ${gameId}`);
          // push stats object to list
          const gameStats = {};
          gameStats.gameId = gameId;
          gameStats.duration = Date.now() - startTime;
          gameStats.winnerId = gameSession.getWinnerId();
          gameStats.loserId = gameSession.getLoserId();
          gameStats.numberOfTurns = gameSession.getNumberOfTurns();
          if (gameStats.winnerId == null) {
            gameStats.isDraw = true;
          } else {
            gameStats.isDraw = false;
            gameStats.winnerVersion = gameStats.winnerId === ai1PlayerId ? ai1Version : ai2Version;
            const winnerSetupData = gameSession.getPlayerSetupDataForPlayerId(gameStats.winnerId);
            gameStats.winnerFactionId = winnerSetupData.factionId;
            gameStats.winnerGeneralId = winnerSetupData.generalId;
            const loserSetupData = gameSession.getPlayerSetupDataForPlayerId(gameStats.loserId);
            gameStats.loserFactionId = loserSetupData.factionId;
            gameStats.loserGeneralId = loserSetupData.generalId;
          }
          gamesStats.push(gameStats);

          // resolve and move to next game
          gameResolve();
        };

        // run game
        executeMulligan()
          .then(executeTurnsUntilGameOver)
          .then(afterGameOver)
          .catch(handleErrorsAndRoping);
      }))
        .then(() => {
          // restore logger
          Logger.enabled = true;
          Logger.module('AI').debug(`AI Simulator Server finished running ${numGames} games`);

          const winsByAINumber = {};
          const winsByVersion = {};
          const winsByFactionId = {};
          const numGamesByFactionId = {};
          const winsByGeneralId = {};
          const numGamesByGeneralId = {};
          const winsByVersionAndFactionId = {};
          const winsByVersionAndGeneralId = {};
          let draws = 0;
          let totalDuration = 0;
          let totalNumberOfTurns = 0;
          for (var i = 0, il = gamesStats.length; i < il; i++) {
            const gameStats = gamesStats[i];
            totalDuration += gameStats.duration;
            totalNumberOfTurns += gameStats.numberOfTurns;
            if (gameStats.isDraw) {
              draws++;
            } else {
              const aiNumber = gameStats.winnerId === ai2PlayerId ? 2 : 1;
              if (winsByAINumber[aiNumber] == null) winsByAINumber[aiNumber] = 0;
              winsByAINumber[aiNumber]++;

              if (winsByVersion[gameStats.winnerVersion] == null) winsByVersion[gameStats.winnerVersion] = 0;
              winsByVersion[gameStats.winnerVersion]++;

              if (winsByFactionId[gameStats.winnerFactionId] == null) winsByFactionId[gameStats.winnerFactionId] = 0;
              winsByFactionId[gameStats.winnerFactionId]++;

              if (numGamesByFactionId[gameStats.winnerFactionId] == null) numGamesByFactionId[gameStats.winnerFactionId] = 0;
              numGamesByFactionId[gameStats.winnerFactionId]++;
              if (gameStats.winnerFactionId !== gameStats.loserFactionId) {
                if (numGamesByFactionId[gameStats.loserFactionId] == null) numGamesByFactionId[gameStats.loserFactionId] = 0;
                numGamesByFactionId[gameStats.loserFactionId]++;
              }

              if (winsByGeneralId[gameStats.winnerGeneralId] == null) winsByGeneralId[gameStats.winnerGeneralId] = 0;
              winsByGeneralId[gameStats.winnerGeneralId]++;

              if (numGamesByGeneralId[gameStats.winnerGeneralId] == null) numGamesByGeneralId[gameStats.winnerGeneralId] = 0;
              numGamesByGeneralId[gameStats.winnerGeneralId]++;
              if (gameStats.winnerGeneralId !== gameStats.loserGeneralId) {
                if (numGamesByGeneralId[gameStats.loserGeneralId] == null) numGamesByGeneralId[gameStats.loserGeneralId] = 0;
                numGamesByGeneralId[gameStats.loserGeneralId]++;
              }

              var versionAndFactionId = `${gameStats.winnerVersion}_${gameStats.winnerFactionId}`;
              if (winsByVersionAndFactionId[versionAndFactionId] == null) winsByVersionAndFactionId[versionAndFactionId] = 0;
              winsByVersionAndFactionId[versionAndFactionId]++;

              var versionAndGeneralId = `${gameStats.winnerVersion}_${gameStats.winnerGeneralId}`;
              if (winsByVersionAndGeneralId[versionAndGeneralId] == null) winsByVersionAndGeneralId[versionAndGeneralId] = 0;
              winsByVersionAndGeneralId[versionAndGeneralId]++;
            }
          }

          // create stats string
          let statsString = 'AI Simulator Server run games stats: \n';
          statsString += `Average game duration = ${((totalDuration / 1000.0) / numGames).toFixed(3)} seconds\n`;
          statsString += `Average number of turns = ${(totalNumberOfTurns / numGames).toFixed(2)}\n`;
          statsString += `Wins for AI 1 = ${winsByAINumber[1]} with a ratio of ${((winsByAINumber[1] / numGames) * 100.0).toFixed(1)}\n`;
          statsString += `Wins for AI 2 = ${winsByAINumber[2]} with a ratio of ${((winsByAINumber[2] / numGames) * 100.0).toFixed(1)}\n`;
          const versions = Object.keys(winsByVersion);
          for (var i = 0, il = versions.length; i < il; i++) {
            var version = versions[i];
            var wins = winsByVersion[version];
            statsString += `Wins for version ${version} = ${wins} with a ratio of ${((wins / numGames) * 100.0).toFixed(1)}%\n`;
          }
          const factionIds = Object.keys(winsByFactionId);
          for (var i = 0, il = factionIds.length; i < il; i++) {
            var factionId = factionIds[i];
            var factionData = SDK.FactionFactory.factionForIdentifier(factionId);
            var wins = winsByFactionId[factionId];
            statsString += `Wins for ${factionData.devName || factionData.name} (f${factionId}) = ${wins} with a ratio of ${((wins / numGamesByFactionId[factionId]) * 100.0).toFixed(1)}% (${numGamesByFactionId[factionId]} total games)\n`;
          }
          const generalIds = Object.keys(winsByGeneralId);
          for (var i = 0, il = generalIds.length; i < il; i++) {
            var generalId = generalIds[i];
            var wins = winsByGeneralId[generalId];
            statsString += `Wins for ${SDK.CardFactory.cardForIdentifier(generalId, SDK.GameSession.getInstance()).getName()} = ${wins} with a ratio of ${((wins / numGamesByGeneralId[generalId]) * 100.0).toFixed(1)}% (${numGamesByGeneralId[generalId]} total games)\n`;
          }
          const versionAndFactionIds = Object.keys(winsByVersionAndFactionId);
          for (var i = 0, il = versionAndFactionIds.length; i < il; i++) {
            var versionAndFactionId = versionAndFactionIds[i];
            var version = versionAndFactionId.split('_')[0];
            var factionId = versionAndFactionId.split('_')[1];
            var factionData = SDK.FactionFactory.factionForIdentifier(factionId);
            var wins = winsByFactionId[factionId];
            statsString += `Wins for version ${version} with ${factionData.devName || factionData.name} (f${factionId}) = ${wins} with a ratio of ${((wins / numGamesByFactionId[factionId]) * 100.0).toFixed(1)}% (${numGamesByFactionId[factionId]} total games)\n`;
          }
          const versionAndGeneralIds = Object.keys(winsByVersionAndGeneralId);
          for (var i = 0, il = versionAndGeneralIds.length; i < il; i++) {
            var versionAndGeneralId = versionAndGeneralIds[i];
            var version = versionAndGeneralId.split('_')[0];
            var generalId = versionAndGeneralId.split('_')[1];
            var wins = winsByGeneralId[generalId];
            statsString += `Wins for version ${version} with ${SDK.CardFactory.cardForIdentifier(generalId, SDK.GameSession.getInstance()).getName()} = ${wins} with a ratio of ${((wins / numGamesByGeneralId[generalId]) * 100.0).toFixed(1)}% (${numGamesByGeneralId[generalId]} total games)\n`;
          }

          // log stats
          Logger.module('AI').debug(statsString);
        })
        .catch(handleErrorsAndRoping);
    } catch (error) {
      // restore logger
      Logger.enabled = true;
      Logger.module('AI').log('ERROR: Request.post /run_headless_games failed!');
      return next(error);
    }
  });

  let ai_cluster_ready = false;
  let ai_cluster_workers_ready = 0;

  // this is stored persistently(?) until workers return all awaiting child branch evaluations
  var ai_cluster_rootNodesByGameId = {}; // @chuck this is {} because it is a lookup table and not an array
  var ai_cluster_findActionSequenceResolveByGameId = {};

  // create queue of gamesessions awaiting evaluation
  var ai_cluster_evaluationQueue = [];

  // create worker pool
  var ai_cluster_workerPool_busy = [];
  var ai_cluster_workerPool_idle = [];

  // create message receiver method
  const ai_cluster_master_receiveMessageFromWorker = function (msg) {
    const worker = this;
    // Logger.module("AI").debug("ai_cluster_master_receiveMessageFromWorker() -> *Master:* " + process.pid + " received message from worker " + worker.process.pid);
    if (msg.ready) {
      ai_cluster_workers_ready++;
      if (ai_cluster_workers_ready >= CLUSTER_NUMBEROFWORKERS) {
        ai_cluster_ready = true;
        Logger.module('AI').debug('Master and workers ready!');
      }
    } else if (msg.actions != null) {
      // find worker and move it from busy to idle
      for (let i = 0; i < ai_cluster_workerPool_busy.length; i++) {
        const obj = ai_cluster_workerPool_busy[i];
        if (obj === worker) {
          ai_cluster_workerPool_busy.splice(i, 1);
          ai_cluster_workerPool_idle.push(worker);
          // Logger.module("AI").debug("ai_cluster_master_receiveMessageFromWorker() -> *Master:* Moved worker #" + worker.process.pid + " from busy to idle.");
          break;
        }
      }
      // since we have an idle worker, check for work
      ai_cluster_master_evaluateQueuedGameSessions();
      // now handle the returned sequence
      ai_cluster_master_addReturnedSequenceToRootNode(msg);
    }
  };

  // spin up all workers at program start and listen for messages
  for (var i = 0; i < CLUSTER_NUMBEROFWORKERS; i++) {
    const worker = cluster.fork();
    Logger.module('AI').debug(`Master forking worker #${worker.process.pid}...`);
    // receive messages from this worker and handle them in the master process.
    worker.on('message', ai_cluster_master_receiveMessageFromWorker.bind(worker));

    // add new worker to idle pool
    ai_cluster_workerPool_idle.push(worker);
  }

  // Be notified when worker processes die.
  // TODO DEATH HANDLING
  cluster.on('death', (worker) => {
    Logger.module('AI').debug(`Worker ${worker.process.pid} died.`);
  });
} else if (cluster.isWorker) {
  // create method to evaluate game session and send actions to master
  const ai_cluster_worker_evaluateGameSessionAndSendToMaster = function (gameSession, bestScoresByDepth, depthLimit, msTimeLimit, includedRandomness) {
    Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* evaluating gameSession. depthlimit = ${depthLimit}. mstimelimit = ${msTimeLimit}`);

    ai_init(); // TODO: remove me

    const rootNode = generateRootNode(gameSession, depthLimit, msTimeLimit);
    rootNode.includedRandomness = includedRandomness;
    Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* added action to rootNode.parentPsuedoAction = ${rootNode.parentPsuedoAction}`);
    // console.log(gameSession.getLastStep().getAction());
    // console.log(rootNode.parentPsuedoAction);
    // pruning - pre-load prior-evaluated best scores by depth if available
    rootNode.bestScoresByDepth = bestScoresByDepth;
    buildTree(rootNode, gameSession);
    Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* gameSession tree fully built. bestLeaf boardscore: ${rootNode.bestLeaf.boardScore}. bestLeaf's parentPsuedoAction =`, rootNode.bestLeaf.parentPsuedoAction);
    var psuedoActionSequence = [];
    // find best sequence here - will return empty array when no actions/branches were found!
    // also truncates any nodes that ocurred after an action with RNG
    const nodeSequence = buildNodeSequenceFromTreeRoot(rootNode);
    if (nodeSequence.length > 0) {
      var psuedoActionSequence = _.map(nodeSequence, (node) =>
        // Logger.module("AI").debug("ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#" + process.pid + ":* Mapping actions from bestLeaf's node sequence. On action:", node.parentPsuedoAction);
        node.parentPsuedoAction);
    }
    // add parent action to beginning of sequence - this is the action that *master* executed to create the branch the worker is evaluating.
    Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* **sequence created - now adding the root branch action. getLastStep().getAction = `, gameSession.getLastStep().getAction());
    // Logger.module("AI").debug("ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#" + process.pid + ":* **psuedoAction from this action = ", generatePseudoActionFromAction(gameSession.getLastStep().getAction()));
    // since this always happens in a worker, the "last step" action should be the master's action branch - this is the only reliable action as it's possible for workers to NOT find any actions at all, in which case just the master's branched action is taken here
    // it's possible (in a 1 action only scenario) that the action sequence only consists of 1 action (from master).
    psuedoActionSequence.unshift(generatePseudoActionFromAction(gameSession.getLastStep().getAction()));
    // check for sequence completion - if no actions are left on bestLeaf OR bestLeaf was rootNode (in which case no further actions are selected from worker)
    if (rootNode.truncated == false && (rootNode.bestLeaf.noMoreActions == true || rootNode.bestLeaf == rootNode)) {
      Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* gameSession tree fully built. sequence length = ${psuedoActionSequence.length}. no more actions found on bestLeaf node AND NOT TRUNCATED pushing an endTurn action onto end of sequence now. truncated = ${rootNode.truncated}. no more actions = ${rootNode.bestLeaf.noMoreActions}. rootNode.bestLeaf == rootNode = ${rootNode.bestLeaf}` == rootNode);
      psuedoActionSequence.push({ actionType: SDK.EndTurnAction.type });
    } else {
      Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* gameSession tree fully built. sequence length = ${psuedoActionSequence.length}. bestLeaf still has actions left, so NOT adding endTurn action onto sequence.`);
    }

    Logger.module('AI').debug(`ai_cluster_worker_evaluateGameSessionAndSendToMaster() *Worker#${process.pid}:* action sequence fully built. Sending back to master! length = ${psuedoActionSequence.length}. actions = `, psuedoActionSequence);
    // send message to master: ai_cluster_master_receiveMessageFromWorker( )
    process.send({
      actions: psuedoActionSequence, score: rootNode.bestLeaf.boardScore, branchesPruned: rootNode.branchesPruned, numSequencesEvaluated: rootNode.numSequencesEvaluated, bestScoresByDepth: rootNode.bestScoresByDepth, gameId: getGameId(rootNode),
    });
  };

  // receive messages from the master process
  process.on('message', (msg) => {
    Logger.module('AI').debug(`ai_cluster_master_receiveMessageFromWorker() *Worker#${process.pid}:* evaluating gameSession. depthlimit = ${msg.depthLimit}. mstimelimit = ${msg.msTimeLimit}`);
    // deserialize gameSession
    let gameSessionCopy = SDK.GameSession.create();
    gameSessionCopy.setIsRunningAsAuthoritative(true);
    gameSessionCopy.deserializeSessionFromFirebase(JSON.parse(msg.gameSession));
    if (msg.cardWaitingForFollowupsIndex != null) {
    // followup was active in parent node prior to serialization and transmission to worker. this will restore the active followup into the worker branch post-deserialization
      gameSessionCopy = injectFollowupIntoGameSession(gameSessionCopy, cardWaitingForFollowupsIndex);
    }
    ai_cluster_worker_evaluateGameSessionAndSendToMaster(gameSessionCopy, msg.bestScoresByDepth, msg.depthLimit, msg.msTimeLimit, msg.includedRandomness);
  });

  // send message to master process that worker is ready
  Logger.module('AI').debug(`Worker #${process.pid} ready`);
  process.send({ ready: true });
}

/**
 * Finds the best action sequence in a game session for current player. Requires playerId for DrawStartingHandAction
 * @param {GameSession} gameSession
 * @param {String} playerId
 * @param {Number} depthLimit
 * @param {Number} msTimeLimit
 * @returns {Promise} promise resolves with array of steps executed
 */
var ai_findAndExecuteActionSequence = function (gameSession, playerId, depthLimit, msTimeLimit) {
  return ai_findActionSequence(gameSession, playerId, depthLimit, msTimeLimit)
    .then((results) => {
      const { sequence } = results;
      const { actions } = sequence;
      const stepsExecuted = [];
      Logger.module('AI').debug(`[G:${gameSession.gameId}] ai_findAndExecuteActionSequence( ) -> actions: `, actions);

      for (let i = 0, il = actions.length; i < il; i++) {
        const pseudoAction = actions[i];
        Logger.module('AI').debug(`[G:${gameSession.gameId}] ai_findAndExecuteActionSequence( ) -> building actions from psuedoactions: on psuedoAction# ${i}. Object:  `, pseudoAction);
        const action = generateActionFromPseudoAction(gameSession, pseudoAction);
        gameSession.executeAction(action);
        if (action.getIsValid()) {
          stepsExecuted.push(gameSession.getLastStep());
        } else {
          throw new Error(`ai_findAndExecuteActionSequence -> invalid action in found sequence: ${JSON.stringify(pseudoAction)}`);
        }
      }

      return stepsExecuted;
    });
};

/**
 * Finds the best action sequence in a game session for a player matching a playerId.
 * @param {GameSession} gameSession
 * @param {String} playerId
 * @param {Number} depthLimit
 * @param {Number} msTimeLimit
 * @returns {Promise} promise resolves with {sequence: sequence object, rootNode: root node object}
 */
var ai_findActionSequence = function (gameSession, playerId, depthLimit, msTimeLimit) {
  const gameId = getGameId(gameSession);
  return new Promise((resolve, reject) => {
    Logger.module('AI').debug(`[G:${gameId}] ai_findActionSequence( ) -> depthLimit = ${depthLimit}. msTimeLimit = ${msTimeLimit}. playerId = ${playerId}`);
    // store resolve to be triggered async when finished with evaluation
    ai_cluster_findActionSequenceResolveByGameId[gameId] = resolve;

    ai_init(); // TODO: remove me

    // create root node
    const rootNode = generateRootNode(gameSession, depthLimit, msTimeLimit);
    if (cluster.isMaster) {
      // store true root node by game id to be accessed async
      Logger.module('AI').debug(`ai_findActionSequence() *Master:* rootNode generated and added to ai_cluster_rootNodesByGameId[] keyed to gameId: ${getGameId(gameSession)}`);
      ai_cluster_rootNodesByGameId[gameId] = rootNode;
    }
    if (gameSession.isNew()) {
      // mulligan
      // generate a pseudo action, then spoof a worker message to end-point function to return single action
      const drawStartingHandPseudoAction = ai_getDrawStartingHandPseudoAction(gameSession, playerId);
      rootNode.numberOfChildren = 1;
      var spoofedWorkerMsg = ai_getSpoofedWorkerMsg(gameSession, drawStartingHandPseudoAction);
      ai_cluster_master_addReturnedSequenceToRootNode(spoofedWorkerMsg);
    } else if (gameSession.getPlayerById(playerId).getDeck().getCanReplaceCardThisTurn() && gameSession.getLastStep().getAction().getType() == SDK.EndTurnAction.type || gameSession.getLastStep().getAction().getType() == SDK.DrawStartingHandAction.type) {
      // dont need mull, can replace
      // generate a pseudo action, then spoof a worker message to end-point function to return single action

      // +++TODO - RNG Detection to allow mid-turn replace actions. Can't use score = 999 and spoofed msg with # of children = 1 to force an early return. Doesn't make sense.
      // +++CURRENTLY only allows card replace at beginning of turn! Because RNG detection is needed
      const replaceCardFromHandPseudoAction = ai_getReplaceCardFromHandPseudoAction(gameSession, playerId);
      if (replaceCardFromHandPseudoAction !== null) {
        rootNode.numberOfChildren = 1;
        var spoofedWorkerMsg = ai_getSpoofedWorkerMsg(gameSession, replaceCardFromHandPseudoAction);
        ai_cluster_master_addReturnedSequenceToRootNode(spoofedWorkerMsg);
      } else {
        // game not new, can replace, but dont want to rn. just build tree instead
        buildTree(rootNode, gameSession);
      }
    } else {
      // dont need mulligan and can't replace card, build tree
      // build tree to determine action sequence that will yield the best board state
      buildTree(rootNode, gameSession);
    }
  });
};

/**
 * Called when a best action sequence is found and triggers the find action sequence resolve.
 * NOTE: passes resolve a results object consisting of {sequence: sequence object, rootNode: root node object}
 * @param {Object} rootNode
 */
const ai_foundActionSequence = function (rootNode) {
  const { gameId } = rootNode;

  // pick highest scoring sequence
  Logger.module('AI').debug(`ai_foundActionSequence() -> *Master:* Selecting best sequence out of ${rootNode.evaluatedSequences.length} sequences.`);
  const sequence = _.max(rootNode.evaluatedSequences, (sequence) => sequence.score);
  Logger.module('AI').debug(`ai_foundActionSequence() -> *Master:* Sequence selected with score = ${sequence.score} and # of actions = ${sequence.actions.length}`);
  Logger.module('AI').debug('ai_foundActionSequence() -> *Master:* ', sequence.actions);
  // clear queue of matching game sessions
  if (ai_cluster_evaluationQueue.length > 0) {
    ai_cluster_evaluationQueue = _.reject(ai_cluster_evaluationQueue, (gameSession) => getGameId(gameSession) == gameId);
  }

  // delete root node from record
  delete ai_cluster_rootNodesByGameId[gameId];

  // delete resolve from record
  const resolve = ai_cluster_findActionSequenceResolveByGameId[gameId];
  delete ai_cluster_findActionSequenceResolveByGameId[gameId];

  // resolve with best sequence and root node
  resolve({
    sequence,
    rootNode,
  });
};

var ai_cluster_master_evaluateQueuedGameSessions = function () {
  // evaluate gameSession if worker available
  while (ai_cluster_evaluationQueue.length > 0 && ai_cluster_workerPool_idle.length > 0) {
    Logger.module('AI').debug('ai_cluster_master_evaluateQueuedGameSessions() -> *Master:* Idle worker and queued gameSession detected. Launching evaluation.');
    const worker = ai_cluster_workerPool_idle.shift();
    ai_cluster_workerPool_busy.push(worker);
    const gameSession = ai_cluster_evaluationQueue.shift();
    const serializedGameSession = gameSession.generateGameSessionSnapshot();
    // get depth scores for pruning if available
    const { bestScoresByDepth } = ai_cluster_rootNodesByGameId[getGameId(gameSession)];
    const { depthLimit } = ai_cluster_rootNodesByGameId[getGameId(gameSession)];
    const { msTimeLimit } = ai_cluster_rootNodesByGameId[getGameId(gameSession)];
    const lastStep = gameSession.getLastStep();
    let cardWaitingForFollowupsIndex = null;
    if (gameSession.getIsFollowupActive()) {
    // transmit the followupcard index with the active followup so that we can inject it after deserializing in the worker process
      cardWaitingForFollowupsIndex = gameSession.getValidatorFollowup().getCardWaitingForFollowups().getIndex();
    }
    const includedRandomness = lastStep.getIncludedRandomness();
    Logger.module('AI').debug(`ai_cluster_master_evaluateQueuedGameSessions() -> *Master:* Sending serialized gameSession from Queue to worker. depthLimit = ${depthLimit}. msTimeLimit = ${msTimeLimit}`);
    worker.send({
      gameSession: serializedGameSession, bestScoresByDepth, depthLimit, msTimeLimit, includedRandomness, cardWaitingForFollowupsIndex,
    });
  }
};

var ai_cluster_master_addReturnedSequenceToRootNode = function (msgFromWorker) {
  // bestSequence: actionSequence, score: rootNode.bestLeaf.boardScore, branchesPruned: rootNode.branchesPruned, numSequencesEvaluated: rootNode.numSequencesEvaluated, bestScoresByDepth: rootNode.bestScoresByDepth });
  Logger.module('AI').debug('ai_cluster_master_addReturnedSequenceToRootNode() -> Conjoining returned worker data to True Root...');
  const { gameId } = msgFromWorker;
  const rootNode = ai_cluster_rootNodesByGameId[gameId];
  if (rootNode == null) {
    return; // root no longer exists due to time limit being exceeded. discard results
  }
  Logger.module('AI').debug(`ai_cluster_master_addReturnedSequenceToRootNode() -> Retrieved True Root = ${rootNode.gameId}. Adding the following actions to sequences: `, msgFromWorker.actions);
  rootNode.evaluatedSequences.push(msgFromWorker);
  rootNode.branchesPruned += msgFromWorker.branchesPruned;
  rootNode.numSequencesEvaluated += msgFromWorker.numSequencesEvaluated;
  // update best scores by depth (pruning) if better than existing - will be pre-loaded for subsequently-launched workers
  for (i = 0; i < msgFromWorker.bestScoresByDepth.length; i++) {
    if (msgFromWorker.bestScoresByDepth[i] !== null && rootNode.bestScoresByDepth[i] == null) {
      rootNode.bestScoresByDepth[i] = msgFromWorker.bestScoresByDepth[i];
    } else if (msgFromWorker.bestScoresByDepth[i] != null && msgFromWorker.bestScoresByDepth[i] > rootNode.bestScoresByDepth[i]) {
      rootNode.bestScoresByDepth[i] = msgFromWorker.bestScoresByDepth[i];
    }
  }

  // check if ALL rootNode's children have returned or if we've hit our time limit
  if (getIsTimeLimitReached(rootNode) || rootNode.evaluatedSequences.length >= rootNode.numberOfChildren) {
    Logger.module('AI').debug(`[G:${getGameId(rootNode)}]ai_cluster_master_addReturnedSequenceToRootNode() *Master:* finished. Returning root to ai_foundActionSequence()...`);
    ai_foundActionSequence(rootNode);
  } else {
    Logger.module('AI').debug(`[G:${getGameId(rootNode)}]ai_cluster_master_addReturnedSequenceToRootNode() *Master:* Child # ${rootNode.evaluatedSequences.length} returned out of ${rootNode.numberOfChildren} total children. Checking for more work...`);
    ai_cluster_master_evaluateQueuedGameSessions();
  }
};

// +++++++++++CLUSTER END+++++++++++

// TODO: remove me
let _checkedForLethalOnEnemyGeneral = false;
let _nextActions = [];
let _followupTargets = [];
let _debugMode = true;
var ai_init = function () {
  _debugMode = true;
  _checkedForLethalOnEnemyGeneral = false;
  _nextActions = [];
  _followupTargets = [];
};

const ai_preprocessProtoActions = function (protoActions, gameSession) {
  // var protoAction = {
  //    card: card,
  //    targetsAndScores: [{target,score}],
  //    actionType: "playCardAction"
  // }; `

  // score actions
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] ai_preprocessProtoActions() => preprocessing " + protoActions.length + " protoActions");
  _.each(protoActions, (protoAction) => {
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] ai_preprocessProtoActions() => scoring " + protoAction.targetsAndScores.length + " targets for protoAction");
    _.each(protoAction.targetsAndScores, (targetAndScore) => {
      targetAndScore.score = ai_getScoreForAction(protoAction.card, targetAndScore.target, protoAction.actionType, gameSession);
    });
  });

  // now filter actions
  const filteredProtoActions = [];
  _.each(protoActions, (protoAction) => {
    protoAction = ai_preProc_filterProtoActionTargets(protoAction);
    if (protoAction.targetsAndScores.length > 0) {
      filteredProtoActions.push(protoAction);
    }
  });

  return filteredProtoActions;
};

var ai_preProc_filterProtoActionTargets = function (protoAction) {
  // reject targets which don't meet preProc criteria
  let filteredProtoActionTargetsAndScores = protoAction.targetsAndScores;

  // objective filtering first
  // rejects any PlayCardFromHandAction action that scores below qualitythreshold
  if (protoAction.actionType == 'PlayCardFromHandAction') {
    // TODO: unexpected behavior with summon spells - consider excluding summons or diff. threshold for summons?
    filteredProtoActionTargetsAndScores = _.filter(filteredProtoActionTargetsAndScores, (targetAndScore) => targetAndScore.score > preProc_qualityThreshold_playCard);
  }

  // relative filtering next
  const targetsAndScoresToReturn = [];
  // sort targets in descending order
  // optimize - to remove/replace with faster sorting (during scoring)
  // Logger.module("AI").debug("ai_preprocessProtoActions() => BEFORE SORT: ", filteredProtoActionTargetsAndScores);
  filteredProtoActionTargetsAndScores = _.sortBy(filteredProtoActionTargetsAndScores, (targetAndScore) => targetAndScore.score).reverse();
  // Logger.module("AI").debug("ai_preprocessProtoActions() => AFTER SORT: ", filteredProtoActionTargetsAndScores);

  // while targets remain, take targets up to quality threshold setting starting with best target and descending
  while (filteredProtoActionTargetsAndScores.length > 0 && targetsAndScoresToReturn.length < preProc_minimumNumberOfActionsToEvaluate) {
    targetsAndScoresToReturn.push(filteredProtoActionTargetsAndScores.shift()); // changed to shift(). was pop() but we sorted in reverse() [descending], so if we pop, we'd be taking the LOWEST scored action first...?
  }
  // anything beyond threshold, take floor of depth variable
  if (filteredProtoActionTargetsAndScores.length > 0) {
    const numberToTake = Math.floor(filteredProtoActionTargetsAndScores.length * preProc_percentOfActionsToEvaluateAfterMinimum);
    for (let i = 0; i < numberToTake; i++) {
      targetsAndScoresToReturn.push(filteredProtoActionTargetsAndScores.shift()); // changed to shift(). was pop() but we sorted in reverse() [descending], so if we pop, we'd be taking the LOWEST scored action first...?
    }
  }

  // discard everything else
  protoAction.targetsAndScores = targetsAndScoresToReturn;
  // Logger.module("AI").debug("ai_preprocessProtoActions() => returning filtered targets and scores for " + protoAction.card.getLogName());
  // Logger.module("AI").debug("ai_preprocessProtoActions() => returning filtered targets and scores: ", protoAction.targetsAndScores);
  return protoAction;
};

var ai_getScoreForAction = function (card, target, actionType, gameSession) {
  // ai_getScoreForAction(protoAction.card, target, protoAction.actionType);
  let score = 0;
  switch (actionType) {
  case SDK.MoveAction.type:
    score = ScoreForCardAtTargetPosition(card, target, gameSession);
    break;
  case SDK.AttackAction.type:
    var targetedEnemyUnit = gameSession.getBoard().getUnitAtPosition(target);
    score += ScoreForUnitDamage(gameSession, targetedEnemyUnit, card.getATK());
    score -= ScoreForUnitDamage(gameSession, card, targetedEnemyUnit.getATK());
    break;
  case SDK.PlayCardAction.type:
  case SDK.PlayCardFromHandAction.type:
  case SDK.PlaySignatureCardAction.type:
    score = ai_getScoreForPlayCardAction(card, target, gameSession);
    break;
  }
  return score;
};

var ai_getScoreForPlayCardAction = function (card, target, gameSession) {
  let score = 0;
  score += ai_preProc_playCard_module_draw(card, target, gameSession);
  score += ai_preProc_playCard_module_dealDamage(card, target, gameSession);
  score += ai_preProc_playCard_module_summon(card, target, gameSession);
  score += ai_preProc_playCard_module_removal(card, target, gameSession);

  // switch (0) {
  //  //case "draw":
  //  case "burn":
  //  case "burn_minion":
  //  case "burn_dispel":
  //  case "burn_stun_minion":
  //  case "burn_move_enemy_minion":
  //  case "removal":
  //  case "removal_buff_minion":
  //  case "shadownova":
  //  case "burn_mass_minion":
  //  case "burn_mass_enemy_minion":
  //  case "burn_mass":
  //  case "removal_mass_minion":
  //  case "buff_mass":
  //  case "buff_mass_minion":
  //  case "move":
  //  case "move_enemy_minion":
  //  case "summon_move_enemy_minion":
  //  case "summon":
  //  case "summon_watcher":
  //  case "refresh":
  //  case "teleport_destination":
  //  case "heal":
  //  case "buff":
  //  case "buff_EndOfTurn":
  //  case "buff_minion":
  //  case "buff_mass_minion_EndOfTurn":
  //  case "debuff":
  //  case "debuff_minion":
  //  case "debuff_mass_minion":
  //  case "summon_buff_minion":
  //    break;
  // }
  return score;
};

// --------begin region preProc_playCard modules

var ai_preProc_playCard_module_summon = function (card, targetPosition, gameSession) {
  let score = 0;
  if (card.getType() == SDK.CardType.Unit) {
    score += ScoreForCardAtTargetPosition(card, targetPosition, gameSession);
    score += ScoreForUnit(card);
  }
  return score;
};

var ai_preProc_playCard_module_draw = function (card, target, gameSession) {
  // scores according to how useful a draw will be based on # of cards in hand, # of cards drawn at end of turn, and remaining mana

  // example cases
  // 1) draw 3, 2 spots in hand (+2, -1), 1 mana after = 1 point - note: ideally this would be additional -0.5 for unlikelihood of topdecking a 1 mana card, but left this fine-tuning out for optimization
  // 2) draw 1, 1 spot in hand (+1), 0 mana after (-2) = -1 point
  // 3) draw 1, 5 spots in hand (+1), 2 mana after = 1 point
  // 4) draw 3, 5 spots in hand (+3) = 3 points
  // 5) draw 3, 0 spots in hand (-3) = -3 points

  let score = 0;
  if (card.drawCardsPostPlay !== null) {
    const numberOfCardsInHand = gameSession.getCurrentPlayer().getDeck().getNumCardsInHand();
    const maxHandSize = CONFIG.MAX_HAND_SIZE;
    const remainingManaAfterCast = gameSession.getCurrentPlayer().getRemainingMana() - card.getManaCost();
    var maxPotentialDraw = maxHandSize - numberOfCardsInHand;
    var cardsToDraw = card.drawCardsPostPlay;

    // 1 point for each card you will draw
    while (cardsToDraw > 0 && maxPotentialDraw > 0) {
      score++;
      maxPotentialDraw--;
      cardsToDraw--;
    }
    // -1 point for each wasted card draw
    while (cardsToDraw > 0 && maxPotentialDraw == 0) {
      score--;
      cardsToDraw--;
    }

    // if mana will be zero after casting, penalize for each missed card draw at end of turn: -1 point each
    if (remainingManaAfterCast == 0) {
      var cardsToDraw = CONFIG.CARD_DRAW_PER_TURN;
      var maxPotentialDraw = maxHandSize - numberOfCardsInHand - card.drawCardsPostPlay;
      // -1 point for each wasted card draw
      while (cardsToDraw > 0 && maxPotentialDraw < 1) {
        score--;
        cardsToDraw--;
      }
    }
  }
  return score;
};

var ai_preProc_playCard_module_removal = function (card, targetPosition, gameSession) {
  // ++++++TODO - SCORING FOR UNPLAYED CARDS NEEDS TO INCLUDE THRESHOLD SCORING FOR REMOVAL CARDS!
  let score = 0;
  const cardId = card.getBaseCardId();
  if (CARD_INTENT[cardId] != null && CARD_INTENT[cardId].indexOf('removal') !== -1) {
    let affectedUnits; // array of units that will be affected by spell.
    const myPlayer = card.getOwner();
    const opponentGeneral = gameSession.getGeneralForOpponentPlayer(myPlayer);
    if (CARD_INTENT[cardId].indexOf('mass')) {
      // find targets here
      affectedUnits = gameSession.getBoard().getUnits();
      if (CARD_INTENT[cardId].indexOf('enemy') !== -1) {
        affectedUnits = _.reject(affectedUnits, (unit) => unit.getOwner() == myPlayer);
      }
      if (CARD_INTENT[cardId].indexOf('minion') !== -1) {
        affectedUnits = _.reject(affectedUnits, (unit) => unit.getIsGeneral());
      }
      if (cardId == SDK.Cards.Spell.PlasmaStorm) { // TODO+++++ REMOVE CARD SPECIFIC CODE?
        affectedUnits = _.reject(affectedUnits, (unit) => unit.getATK() > 3);
      }
    } else {
      // use target position only
      affectedUnits = [gameSession.getBoard().getUnitAtPosition(targetPosition)];
    }
    _.each(affectedUnits, (affectedUnit) => {
      // score for each removed unit
      const scoreOfAffectedUnit = ScoreForUnit(affectedUnit);
      //* **+++TODO - HAND SCORING MODULE (FOR UNPLAYED CARDS) NEEDS TO INCLUDE THRESHOLD SCORING FOR REMOVAL CARDS!
      // subtract opportunity cost of removal to create a base threshold for removal (so we don't waste removal on 1/1's)
      // removal spells range from 2 (martyrdor) to 5 (abyssian hard removal). Most are 3-4.
      score -= ((card.getManaCost() * 1) + 4); // baseline threshold of ~6-9 which translates to ~2/2 or better
      // subtract score of friendly unit from score, add enemy
      if (affectedUnit.getOwner() == myPlayer) {
        score -= scoreOfAffectedUnit;
      } else {
        score += scoreOfAffectedUnit;
      }

      // drawback considerations
      // TODO++++MOVE CARD-SPECIFIC CODE INTO SEPARATE MODULE!
      if (cardId == SDK.Cards.Spell.Martyrdom && opponentGeneral.getHP() < 10) {
        score -= ((10 - opponentGeneral.getHP()) / 4) * affectedUnit.getHP();
        // lower the general's HP and higher heal amount, bigger the score penalty
        // general HP1  2  3  4  5  6 //amount healed
        //---------------------------------------
        // 9        0  1  1  1  1  2
        // 8        1   1  2  2  3  3
        // 7        1  2  2  3  4  5
        // 6          1  2  3  4  5  6
        // 5       1  3  4  5  6  8
        // 4        2  3  5  6  8  9
        // 3        2  4  5  7  9  11
        // 2        2  4  6  8  10  12
        // 1        2  5  7  9  11  14
        // score penalty
      } else if (cardId == SDK.Cards.Spell.AspectOfTheWolf) {
        // aspect of the fox replace with 3/3
        // baseline threshold is ~2/2, adding 5 bumps this up to ~4/4
        score -= 5;
      }
    }); // end _.each affectedUnits
  }
  return score;
};

var ai_preProc_playCard_module_dealDamage = function (card, targetPosition, gameSession) {
  let score = 0;
  const cardId = card.getBaseCardId();
  if (card.damageAmount !== null) {
    // ++++++TODO - SCORING FOR UNPLAYED CARDS NEEDS TO INCLUDE THRESHOLD SCORING FOR damage CARDS!
    if (CARD_INTENT[cardId] != null && CARD_INTENT[cardId].indexOf('burn') !== -1) {
      let affectedUnits; // array of units that will be affected by spell.
      const myPlayer = card.getOwner();
      if (CARD_INTENT[cardId].indexOf('mass')) {
        // find targets here
        affectedUnits = gameSession.getBoard().getUnits();
        if (CARD_INTENT[cardId].indexOf('enemy') !== -1) {
          affectedUnits = _.reject(affectedUnits, (unit) => unit.getOwner() == myPlayer);
        }
        if (CARD_INTENT[cardId].indexOf('minion') !== -1) {
          affectedUnits = _.reject(affectedUnits, (unit) => unit.getIsGeneral());
        }
      } else {
        // use target position only
        affectedUnits = [gameSession.getBoard().getUnitAtPosition(targetPosition)];
      }
      _.each(affectedUnits, (affectedUnit) => {
        // score for each removed unit
        const scoreOfAffectedUnit = ScoreForUnitDamage(gameSession, affectedUnit, card.damageAmount);
        //* **+++TODO - HAND SCORING MODULE (FOR UNPLAYED CARDS) NEEDS TO INCLUDE THRESHOLD SCORING FOR REMOVAL CARDS!
        // subtract opportunity cost of removal to create a base threshold for removal (so we don't waste removal on 1/1's)
        // removal spells range from 2 (martyrdor) to 5 (abyssian hard removal). Most are 3-4.
        score -= (BOUNTY.DAMAGE_LETHAL - 5); // baseline threshold lethal BOUNTY.BOUNTY - this causes most burn spells to be held unless 1 or more unit is killed
        // subtract score of friendly unit from score, add enemy
        if (affectedUnit.getOwner() == myPlayer) {
          score -= scoreOfAffectedUnit;
        } else {
          score += scoreOfAffectedUnit;
        }
      }); // end _.each affectedUnits
    }
  }
  return score;
};

// -----------end region preproc playcard modules

var ai_getSpoofedWorkerMsg = function (gameSession, psuedoAction) {
  // for mull and replace card actions
  // skips workers and sends action immediately back to root for execution
  return {
    actions: [psuedoAction],
    score: 999,
    branchesPruned: 0,
    numSequencesEvaluated: 1,
    bestScoresByDepth: [],
    gameId: getGameId(gameSession),
  };
};

var ai_getDrawStartingHandPseudoAction = function (gameSession, playerId) {
  if (gameSession.isNew()) {
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> new game detected checking for starting hand.");
    const myPlayer = gameSession.getPlayerById(playerId);
    if (!myPlayer.getHasStartingHand()) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> no starting hand detected, checking for mulligans.");
      // mulligan non-summon spells and artifacts or cards with mana cost 1 above starting mana
      const mulliganIndices = [];
      const cardsInHand = myPlayer.getDeck().getCardsInHand();
      for (let i = 0, il = cardsInHand.length; i < il; i++) {
        const card = cardsInHand[i];
        if (mulliganIndices.length < CONFIG.STARTING_HAND_REPLACE_COUNT && card != null && ((card instanceof SDK.Spell && CARD_INTENT[card.getBaseCardId()] != 'summon') || card instanceof SDK.Artifact || card.getManaCost() > myPlayer.getRemainingMana() + 1)) {
          // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> mulligan " + card.getLogName() + "because it is a non summon spell, artifact, or costs too much mana");
          mulliganIndices.push(i);
        }
      }
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _nextActionForNewGame -> returning action withh " + mulliganIndices.length + " mulligan indices.");
      return generatePseudoActionFromAction(myPlayer.actionDrawStartingHand(mulliganIndices));
    }
  }
};

var ai_getReplaceCardFromHandPseudoAction = function (gameSession, playerId) {
  const myPlayer = gameSession.getPlayerById(playerId);
  if (myPlayer.getDeck().getCanReplaceCardThisTurn()) {
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> start");
    let cardToReplace;
    const cardsInHand = myPlayer.getDeck().getCardsInHandExcludingMissing();

    // find first card that costs at least 2 more than our max mana
    cardToReplace = _.find(cardsInHand, (card) => (myPlayer.getDeck().getNumCardsReplacedThisTurn() == 0 && card.getManaCost() >= (myPlayer.getMaximumMana() + 2)));

    // if we didn't replace yet try to replace anything with more than 1 copy in hand
    if (cardToReplace == null) {
      cardToReplace = _.find(cardsInHand, (card) => (myPlayer.getDeck().getNumCardsReplacedThisTurn() == 0 && _.where(cardsInHand, { id: card.getBaseCardId() }).length > 1));
    }

    // if we have more than 2 spells, force a spell to be replaced at random
    // this is intended to encourage play of units
    if (cardToReplace == null) {
      cardToReplace = _.sample(_.filter(cardsInHand, (card) => card instanceof SDK.Spell));
    }

    // if we have more than 1 artifact, force an artifact to be replaced at random
    // this is intended to encourage play of units
    if (cardToReplace == null) {
      cardToReplace = _.sample(_.filter(cardsInHand, (card) => card instanceof SDK.Artifact));
    }

    // if we have no units in hand, force a card to be replaced at random
    // this is intended to encourage play of units
    const unitInHand = _.find(cardsInHand, (card) => card instanceof SDK.Unit);
    if (unitInHand == null) {
      cardToReplace = _.sample(cardsInHand);
    }

    if (cardToReplace != null) {
      // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> " + cardToReplace.getLogName() + "");
      return generatePseudoActionFromAction(myPlayer.actionReplaceCardFromHand(myPlayer.getDeck().getHand().indexOf(cardToReplace.getIndex())));
    }
    return null;
    // Logger.module("AI").debug("[G:" + this.getGameSession().gameId + "] _replaceCard -> nothing to replace");
  }
};

var getGameId = function (gameSessionOrRootNode) {
  if (gameSessionOrRootNode.gameId == 'N/A') {
    return 666;
  }

  return gameSessionOrRootNode.gameId;
};

var factorial = function (n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

const getIsDepthLimitReached = function (node) {
  return node.root.depthLimit > 0 && node.depth >= node.root.depthLimit;
};

var getIsTimeLimitReached = function (node) {
  return node.root.msTimeLimit > 0 && Math.round((Date.now() - node.root.startTime)) >= node.root.msTimeLimit;
};

var buildTree = function (parentNode, gameSession) {
  // take a node and gameSession find all actions, if actions then build tree for each action (recurse)

  // var protoAction = {
  //    card: card,
  //    targetsAndScores: [{target,score}],
  //    actionType: "playCardAction" };

  // check if another leaf discovered a winning sequence already, halt execution and return if so.
  if (parentNode.root.bestLeaf.boardScore == 99999) {
    return;
  }

  // check for game over & win/loss due to previous action execution
  if (gameSession.isOver()) {
    parentNode.noMoreActions = true;
    if (gameSession.getCurrentPlayer().getIsWinner()) {
      // victory
      parentNode.boardScore = 99999;
      parentNode.root.bestScoresByDepth[parentNode.depth] = parentNode.boardScore;
      parentNode.root.bestLeaf = parentNode;
      parentNode.root.bestLeaf.boardScore = parentNode.boardScore;
      return;
    }

    // loss
    parentNode.boardScore = -99999;
    return;
  }
  let depthLimitReached = false;
  let timeLimitReached = false;
  // check for limits as long as followups don't need to be resolved.
  if (!gameSession.getIsFollowupActive()) {
    depthLimitReached = getIsDepthLimitReached(parentNode);
    timeLimitReached = getIsTimeLimitReached(parentNode);
  }

  // pruning start
  if (parentNode.parent != null && parentNode.parent.boardScore == null) {
    // score board every other node
    parentNode.boardScore = ScoreForBoard(gameSession);
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> current node's parent not scored. scored current node = " + parentNode.boardScore);
    if (parentNode.root.bestScoresByDepth[parentNode.depth] == null || parentNode.boardScore > parentNode.root.bestScoresByDepth[parentNode.depth]) {
      parentNode.root.bestScoresByDepth[parentNode.depth] = parentNode.boardScore;
    } else if (parentNode.boardScore < (parentNode.root.bestScoresByDepth[parentNode.depth] * PRUNING_THRESHOLD)) {
      /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> current node's score " + parentNode.boardScore + " has fallen below pruning threshold of " + parentNode.root.bestLeaf.boardScore * PRUNING_THRESHOLD);
      // treat branch as a terminated leaf and return upwards

      // Increment stat counter. Will not work reliably in multithreaded environment
      parentNode.root.branchesPruned++;
      return;
    }
  }
  // pruning end

  // check for RNG - if parentNode's action/step included randomness, flag it. when selecting best sequences from master,
  // if the best sequence overall includes randomness, only a partial sequence will be returned to be stepped-through.
  const lastStep = gameSession.getLastStep();
  if (!cluster.isMaster && lastStep.getIncludedRandomness()) {
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> randomness detected at STEP: ", lastStep);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> randomness detected at ACTION:", lastStep.getAction());
    parentNode.includedRandomness = true;
  }

  let protoActions = _findAllProtoActions(gameSession);
  let actions = [];
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> # of actions = " + protoActions.length);
  if (protoActions.length > 0) {
    protoActions = ai_preprocessProtoActions(protoActions, gameSession); // removes targets from protoActions, or the protoAction itself if no targets
  }
  if (!depthLimitReached && !timeLimitReached && protoActions.length > 0) {
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> # of actions after preproc = " + protoActions.length);
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> protoactions = " + protoActions);
    var snapshotOfCurrentGameSession = gameSession.generateGameSessionSnapshot();
    _.each(protoActions, (protoAction) => {
      if (protoAction.targetsAndScores.length > 0) {
        const actionsToPush = _buildActionsAndBranchFromProtoAction(gameSession, protoAction, snapshotOfCurrentGameSession);
        actions = actions.concat(actionsToPush);
      }
    });
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> branched actions = ", actions);
    _.each(actions, (action) => {
      const child = generateNode(action, parentNode, parentNode.root, getGameId(gameSession));
      const gameSessionBranched = action.getGameSession(); // branching takes place inside findAllActions()
      // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] buildTree( ) -> executing current action: ", action);
      gameSessionBranched.executeAction(action);
      if (cluster.isMaster) {
        // Logger.module("AI").debug("buildTree() *Master:* rootNode generated and added to ai_cluster_rootNodesByGameId[] keyed to gameId: " + getGameId(gameSession));
        ai_cluster_evaluationQueue.push(gameSessionBranched);
      } else {
        // Logger.module("AI").debug("buildTree() *Worker#" + process.pid + ":* recursing downwards");
        buildTree(child, gameSessionBranched); // recurse
      }
    });
    if (cluster.isMaster) {
      // this should only be called once by master
      // clear out true root's children until they return from workers
      parentNode.root.children = [];
      // Logger.module("AI").debug("buildTree() *Master:* children cleared. calling ai_cluster_master_evaluateQueuedGameSessions() for worker evaluation.");
      ai_cluster_master_evaluateQueuedGameSessions();
    }
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] buildTree( ) -> actions fully evaluated, returning.");
  } else {
    Logger.module('AI').debug(`[G:${gameSession.gameId}] buildTree( ) -> terminating leaf. # of actions = ${protoActions.length}. depthLimitReached = ${depthLimitReached}. timeLimitReached = ${timeLimitReached}`);
    // parent node is terminating leaf due to depth/time limit or no more actions left
    if (cluster.isMaster) {
      // master true root desires/has no actions - possible when re-evaluating after partial sequence execution to check for additional actions.
      // simply spoof an end turn sequence
      const endTurnPsuedoAction = { actionType: SDK.EndTurnAction.type };
      parentNode.root.numberOfChildren = 1;
      const spoofedWorkerMsg = ai_getSpoofedWorkerMsg(gameSession, endTurnPsuedoAction);
      ai_cluster_master_addReturnedSequenceToRootNode(spoofedWorkerMsg);
    }
    // get board score, apply to leaf, check root for best leaf (overwriting if applicable), then return
    const myPlayerId = gameSession.getCurrentPlayerId();
    // check for sequence completion
    if (protoActions.length == 0) {
      parentNode.noMoreActions = true;
      // end turn here before board score to cause end of turn buffs/debuffs to fall off, shadowcreep dmg, etc.
      var snapshotOfCurrentGameSession = gameSession.generateGameSessionSnapshot();
      const gameSessionCopy = SDK.GameSession.create();
      //* **must be authoratative mode...
      gameSessionCopy.setIsRunningAsAuthoritative(true);
      gameSessionCopy.deserializeSessionFromFirebase(JSON.parse(snapshotOfCurrentGameSession));
      gameSessionCopy.executeAction(gameSessionCopy.actionEndTurn());
      // now check for end of game
      if (gameSessionCopy.isOver()) {
        if (gameSessionCopy.getPlayerById(myPlayerId).getIsWinner()) {
          // victory
          parentNode.boardScore = 99999;
          parentNode.noMoreActions = true;
          parentNode.root.bestScoresByDepth[parentNode.depth] = parentNode.boardScore;
          parentNode.root.bestLeaf = parentNode;
          parentNode.root.bestLeaf.boardScore = parentNode.boardScore;
          return;
        }

        // loss
        parentNode.boardScore = -99999;
        parentNode.noMoreActions = true;
        return;
      }
    }
    // force rescoring of board for end-turn effects
    parentNode.boardScore = ScoreForBoard(gameSession, myPlayerId);

    Logger.module('AI').debug(`[G:${gameSession.gameId}] buildTree( ) -> no actions from parentNode. parentNode is terminating leaf. leaf score = ${parentNode.boardScore}`);

    parentNode.root.numSequencesEvaluated++;
    if (parentNode.root.bestScoresByDepth[parentNode.depth] == null || parentNode.boardScore > parentNode.root.bestScoresByDepth[parentNode.depth]) {
      parentNode.root.bestScoresByDepth[parentNode.depth] = parentNode.boardScore;
    }
    if (parentNode.boardScore > parentNode.root.bestLeaf.boardScore) {
      parentNode.root.bestLeaf = parentNode;
      parentNode.root.bestLeaf.boardScore = parentNode.boardScore;
      Logger.module('AI').debug('buildTree( ) -> leafScore is higher than best leaf. best leaf is now current parent. returning. bestLeaf\'s parentPsuedoAction = ', parentNode.root.bestLeaf.parentPsuedoAction);
    }
  }
};

const ai_Logger = function () {
  if (_debugMode) {
    Logger.module('AI').debug.apply(this, arguments);
  }
};

var buildNodeSequenceFromTreeRoot = function (root) {
  // Logger.module("AI").debug("[G:" + getGameId(root) + "] buildNodeSequenceFromTreeRoot( ) -> begin");
  // takes an action tree and traces backwards from best leaf to root, bulding a sequence of nodes each of which will have a single action associated with it.
  const { bestLeaf } = root;
  let currentNodeInTraversal = bestLeaf;
  let nodeSequence = [];
  // if bestLeaf == rootNode, then we do not want to take any actions from the sequences.
  const isBestLeafRootNode = bestLeaf == root;
  // Logger.module("AI").debug("[G:" + getGameId(root) + "] buildNodeSequenceFromTreeRoot( ) -> **isBestLeafRootNode = " + isBestLeafRootNode);
  if (!isBestLeafRootNode) {
    // Logger.module("AI").debug("[G:" + getGameId(root) + "] buildNodeSequenceFromTreeRoot( ) -> **addedbestLeaf to node sequence. parentPsuedoAction = ", bestLeaf.parentPsuedoAction);
    while (currentNodeInTraversal.parent !== null) {
      // check for RNG and flag it
      if (currentNodeInTraversal !== bestLeaf && currentNodeInTraversal.includedRandomness == true) {
        // Logger.module("AI").debug("[G:" + getGameId(root) + "] buildNodeSequenceFromTreeRoot( ) -> About to truncate all nodes in sequence of length = " + nodeSequence.length);
        nodeSequence = []; // truncates node Sequence after RNG occurs
        root.truncated = true;
      }
      Array.prototype.unshift.call(nodeSequence, currentNodeInTraversal);
      currentNodeInTraversal = currentNodeInTraversal.parent;
      // Logger.module("AI").debug("[G:" + getGameId(root) + "] buildNodeSequenceFromTreeRoot( ) -> added another node. sequence length = " + nodeSequence.length + ". parentPsuedoAction = ", currentNodeInTraversal.parentPsuedoAction);
    }
  }
  // Logger.module("AI").debug("[G:" + getGameId(root) + "] buildNodeSequenceFromTreeRoot( ) -> END. returning sequence of length = " + nodeSequence.length);
  return nodeSequence;
};

var generateNode = function (action, parent, root, gameId) {
  const child = {
    parent, root, children: [], parentPsuedoAction: generatePseudoActionFromAction(action), boardScore: null, depth: ++parent.depth, numberOfChildren: 0, gameId, noMoreActions: false, includedRandomness: false,
  };
  // Logger.module("AI").debug("[G:" + getGameId(root) + "] generateNode( ) -> child created. parentPsuedoAction = ", child.parentPsuedoAction);
  parent.children.push(child);
  parent.numberOfChildren++;
  return child;
};

var generateRootNode = function (gameSession, depthLimit, msTimeLimit) {
  // MUST END TURN BEFORE SCORING BASELINE!
  // end turn here before board score to cause end of turn buffs/debuffs to fall off, shadowcreep dmg, ephemeral death etc.
  const myPlayerId = gameSession.getCurrentPlayerId();
  const snapshotOfCurrentGameSession = gameSession.generateGameSessionSnapshot();
  const gameSessionCopy = SDK.GameSession.create();
  //* **must be authoratative mode...
  gameSessionCopy.setIsRunningAsAuthoritative(true);
  gameSessionCopy.deserializeSessionFromFirebase(JSON.parse(snapshotOfCurrentGameSession));
  gameSessionCopy.executeAction(gameSessionCopy.actionEndTurn());
  const baseBoardScore = ScoreForBoard(gameSessionCopy, myPlayerId); // sometimes NOT acting is better. sequences will have to beat this baseline to be selected
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] generateRootNode( ) -> baseline board score = " + baseBoardScore);
  // create root node
  const rootNode = {
    parent: null, root: null, children: [], parentPsuedoAction: null, boardScore: baseBoardScore, bestLeaf: null, numSequencesEvaluated: 0, branchesPruned: 0, depth: 0, bestScoresByDepth: [], numberOfChildren: 0, startTime: Date.now(), gameId: getGameId(gameSession), depthLimit, msTimeLimit, evaluatedSequences: [], includedRandomness: false, truncated: false,
  };
  rootNode.root = rootNode;
  rootNode.bestLeaf = rootNode;
  return rootNode;
};

const PseudoAction = function (action) {
  this.actionType = action.getType();
  this.playerId = action.getOwnerId();
};
PseudoAction.prototype = {
  constructor: PseudoAction,
  actionType: '',
  playerId: null,
};

const DrawStartingHandPseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.mulliganIndices = action.getMulliganIndices();
};
DrawStartingHandPseudoAction.prototype = Object.create(PseudoAction.prototype);
DrawStartingHandPseudoAction.prototype.constructor = DrawStartingHandPseudoAction;
DrawStartingHandPseudoAction.prototype.mulliganIndices = [];

const ReplaceCardFromHandPseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.handIndex = action.getIndexOfCardInHand();
};
ReplaceCardFromHandPseudoAction.prototype = Object.create(PseudoAction.prototype);
ReplaceCardFromHandPseudoAction.prototype.constructor = ReplaceCardFromHandPseudoAction;
ReplaceCardFromHandPseudoAction.prototype.handIndex = -1;

const PlayCardFromHandPseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.handIndex = action.getIndexOfCardInHand();
  this.targetPosition = action.getTargetPosition();
};
PlayCardFromHandPseudoAction.prototype = Object.create(PseudoAction.prototype);
PlayCardFromHandPseudoAction.prototype.constructor = PlayCardFromHandPseudoAction;
PlayCardFromHandPseudoAction.prototype.handIndex = -1;
PlayCardFromHandPseudoAction.prototype.targetPosition = { x: -1, y: -1 };

const PlaySignatureCardPseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.targetPosition = action.getTargetPosition();
};
PlaySignatureCardPseudoAction.prototype = Object.create(PseudoAction.prototype);
PlaySignatureCardPseudoAction.prototype.constructor = PlaySignatureCardPseudoAction;
PlaySignatureCardPseudoAction.prototype.targetPosition = { x: -1, y: -1 };

const PlayFollowupPseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.targetPosition = action.getTargetPosition();
};
PlayFollowupPseudoAction.prototype = Object.create(PseudoAction.prototype);
PlayFollowupPseudoAction.prototype.constructor = PlayFollowupPseudoAction;
PlayFollowupPseudoAction.prototype.targetPosition = { x: -1, y: -1 };

const MovePseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.sourcePosition = action.getSourcePosition();
  this.targetPosition = action.getTargetPosition();
};
MovePseudoAction.prototype = Object.create(PseudoAction.prototype);
MovePseudoAction.prototype.constructor = MovePseudoAction;
MovePseudoAction.prototype.sourcePosition = null;
MovePseudoAction.prototype.targetPosition = null;

const AttackPseudoAction = function (action) {
  PseudoAction.call(this, action);
  this.sourcePosition = action.getSourcePosition();
  this.targetPosition = action.getTargetPosition();
};
AttackPseudoAction.prototype = Object.create(PseudoAction.prototype);
AttackPseudoAction.prototype.constructor = AttackPseudoAction;
AttackPseudoAction.prototype.sourcePosition = null;
AttackPseudoAction.prototype.targetPosition = null;

var generatePseudoActionFromAction = function (action) {
  // Logger.module("AI").debug("[G:" + getGameId(root) + "] generatePseudoActionFromAction( ) -> action = ", action);
  // Logger.module("AI").debug("[G:" + getGameId(root) + "] generatePseudoActionFromAction( ) -> actionType = ", action.getType());
  switch (action.getType()) {
  case SDK.MoveAction.type:
    return new MovePseudoAction(action);
  case SDK.AttackAction.type:
    return new AttackPseudoAction(action);
  case SDK.PlayCardFromHandAction.type:
    return new PlayCardFromHandPseudoAction(action);
  case SDK.ReplaceCardFromHandAction.type:
    return new ReplaceCardFromHandPseudoAction(action);
  case SDK.EndTurnAction.type:
    return new PseudoAction(action);
  case SDK.PlayCardAction.type:
    return new PlayFollowupPseudoAction(action);
  case SDK.PlaySignatureCardAction.type:
    return new PlaySignatureCardPseudoAction(action);
  case SDK.DrawStartingHandAction.type:
    return new DrawStartingHandPseudoAction(action);
  }

  throw new Error(`Cannot generate pseudo action for action type ${action.getType()}`);
};

var generateActionFromPseudoAction = function (gameSession, pseudoAction) {
  switch (pseudoAction.actionType) {
  case SDK.MoveAction.type:
    var sourceCard = gameSession.getBoard().getUnitAtPosition(pseudoAction.sourcePosition);
    var { targetPosition } = pseudoAction;
    return sourceCard.actionMove(targetPosition);
  case SDK.AttackAction.type:
    var sourceCard = gameSession.getBoard().getUnitAtPosition(pseudoAction.sourcePosition);
    var { targetPosition } = pseudoAction;
    return sourceCard.actionAttackEntityAtPosition(targetPosition);
  case SDK.PlayCardFromHandAction.type:
    var player = gameSession.getPlayerById(pseudoAction.playerId);
    var { targetPosition } = pseudoAction;
    return player.actionPlayCardFromHand(pseudoAction.handIndex, targetPosition.x, targetPosition.y);
  case SDK.PlaySignatureCardAction.type:
    var player = gameSession.getPlayerById(pseudoAction.playerId);
    var { targetPosition } = pseudoAction;
    return player.actionPlaySignatureCard(targetPosition.x, targetPosition.y);
  case SDK.ReplaceCardFromHandAction.type:
    var player = gameSession.getPlayerById(pseudoAction.playerId);
    return player.actionReplaceCardFromHand(pseudoAction.handIndex);
  case SDK.EndTurnAction.type:
    return gameSession.actionEndTurn();
  case SDK.PlayCardAction.type:
    var player = gameSession.getPlayerById(pseudoAction.playerId);
    var cardWaitingForFollowups = gameSession.getValidatorFollowup().getCardWaitingForFollowups();
    var currentFollowupCard = cardWaitingForFollowups.getCurrentFollowupCard();
    var { targetPosition } = pseudoAction;
    return player.actionPlayFollowup(currentFollowupCard, targetPosition.x, targetPosition.y);
  case SDK.DrawStartingHandAction.type:
    var player = gameSession.getPlayerById(pseudoAction.playerId);
    return player.actionDrawStartingHand(pseudoAction.mulliganIndices);
  }

  throw new Error(`Cannot generate action for pseudo action type ${pseudoAction.actionType}`);
};

/**
 * Summary: Returns all possible actions for a gameSession, sorted by score (descending - best to worst actions)
 and organized by entity, then by action type
 * @parameter: gameSession
 -type: {GameSession}
 -Description: the gameSession to use for finding available actions. Used for branched gamesessions.
 * @returns [actions]
 */
var _findAllProtoActions = function (gameSession) {
  let protoActions = [];
  // if no active f/u, then compile actions for all friendly entities in play and in hand
  //* ** ATTACKS
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] gathering move actions...");
  protoActions = protoActions.concat((_findMoveProtoActions(gameSession)));
  //* *** MOVES
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] gathering attack actions...");
  protoActions = protoActions.concat((_findAttackProtoActions(gameSession)));
  //* *** PLAY CARDS
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] gathering play card actions...");
  protoActions = protoActions.concat(_findPlayCardProtoActions(gameSession));

  return protoActions;
};

const ai_getCardsInHandAndSignatureSpell = function (gameSession) {
  const myPlayer = gameSession.getCurrentPlayer();
  return [].concat(myPlayer.getDeck().getCardsInHand(), myPlayer.getCurrentSignatureCard());
};

var _findPlayCardProtoActions = function (gameSession) {
  const protoActions = [];
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findPlayCardProtoActions()");
  const myPlayer = gameSession.getCurrentPlayer();
  let playableCards = [];
  if (gameSession.getIsFollowupActive()) {
    // followups must be resolved - active f/u card will be the only playableCard
    // Logger.module("AI").debug("[G:" + gameSession.gameId + "] followup detected");
    const cardWaitingForFollowups = gameSession.getValidatorFollowup().getCardWaitingForFollowups();
    const currentFollowupCard = cardWaitingForFollowups.getCurrentFollowupCard();
    playableCards.push(currentFollowupCard);
  } else {
    // no followup active
    const cardsInHand = ai_getCardsInHandAndSignatureSpell(gameSession);
    // find all playable cards in hand
    playableCards = _.filter(cardsInHand, (card) => {
      if (card != null && card.getDoesOwnerHaveEnoughManaToPlay()) {
        return true;
      }
    });
    if (cluster.isMaster) {
      // eliminate redundant cards for base branching actions only
      playableCards = _.uniq(playableCards, (card) => card.getBaseCardId());
    }
  }
  if (playableCards.length > 0) {
    // find play card actions for each card
    for (let i = 0, il = playableCards.length; i < il; i++) {
      const card = playableCards[i];
      const cardIsSignatureSpell = card.isSignatureCard();
      // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findPlayCardProtoActions -> card ", card.getLogName());
      let targetPositions = card.getValidTargetPositions();
      if (targetPositions.length > 0) {
        // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findPlayCardProtoActions -> targetPositions.length ", targetPositions.length);
        if (targetPositions.length >= (CONFIG.BOARDCOL * CONFIG.BOARDROW) && !card.getTargetsSpace()) {
          // take arbitrary tile for mass/global spells or artifacts, don't apply to spells that targets spaces (like chromatic cold's dispel)...
          targetPositions = [targetPositions[Math.floor(Math.random() * targetPositions.length)]];
        }
        const targetsAndScores = _.map(targetPositions, (target) => ({ target, score: null }));
        const protoAction = {
          card,
          targetsAndScores,
        };
        if (card.getIsFollowup()) {
          protoAction.actionType = SDK.PlayCardAction.type;
        } else if (cardIsSignatureSpell) {
          protoAction.actionType = SDK.PlaySignatureCardAction.type;
        } else {
          protoAction.actionType = SDK.PlayCardFromHandAction.type;
        }
        protoActions.push(protoAction);
      }
    }
  }
  return protoActions;
};

var _findAttackProtoActions = function (gameSession) {
  const protoActions = [];
  if (gameSession.getIsFollowupActive()) { return protoActions; }
  // assemble my units
  const myGeneral = gameSession.getGeneralForPlayer(gameSession.getCurrentPlayer());

  const myUnits = gameSession.getBoard().getFriendlyEntitiesForEntity(myGeneral);
  myUnits.push(myGeneral);
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findAttackProtoActions() -> units: ", myUnits);
  _.each(myUnits, (unit) => {
    if (!_isUnitPreventedFromAttacking(unit)) {
      const potentialAttackTargets = unit.getAttackRange().getValidTargets(gameSession.getBoard(), unit, unit.getPosition());
      // filter out bad targets i.e. suicide targets for generals or illegal targets while provoked or immune units
      const filteredPotentialAttackTargets = filterAttackTargetsForUnit(unit, potentialAttackTargets);
      const potentialAttackPositions = _.map(filteredPotentialAttackTargets, (target) => target.getPosition());
      if (potentialAttackPositions.length > 0) {
        const targetsAndScores = _.map(potentialAttackPositions, (target) => ({ target, score: null }));
        const protoAction = {
          card: unit,
          targetsAndScores,
          actionType: SDK.AttackAction.type,
        };
        protoActions.push(protoAction);
      }
    }
  });
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _findAttackProtoActions() -> attack proto actions: ", protoActions);
  return protoActions;
};

var _findMoveProtoActions = function (gameSession) {
  const protoActions = [];
  if (gameSession.getIsFollowupActive()) { return protoActions; }
  // assemble my units
  const myGeneral = gameSession.getGeneralForPlayer(gameSession.getCurrentPlayer());
  const myUnits = gameSession.getBoard().getFriendlyEntitiesForEntity(myGeneral);
  myUnits.push(myGeneral);

  _.each(myUnits, (unit) => {
    if (!_isUnitPreventedFromMoving(unit)) {
      const potentialMoves = _findPotentialMovePositionsForUnit(gameSession, unit);
      if (potentialMoves.length > 0) {
        const targetsAndScores = _.map(potentialMoves, (target) => ({ target, score: null }));
        const protoAction = {
          card: unit,
          targetsAndScores,
          actionType: SDK.MoveAction.type,
        };
        protoActions.push(protoAction);
      }
    }
  });
  return protoActions;
};

const _branch = function (gameSession, snapshotOfCurrentGameSession) {
  // called by _findBestActionSequence() for each available action
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] _branch( ) begin.");
  // clone gameSession
  const gameSessionCopy = SDK.GameSession.create();
  //* **must be authoratative mode...
  gameSessionCopy.setIsRunningAsAuthoritative(true);
  gameSessionCopy.deserializeSessionFromFirebase(JSON.parse(snapshotOfCurrentGameSession));
  // return cloned gameSession advanced by the action
  /// /Logger.module("AI").debug("[G:" + gameSessionCopy.gameId + "] _branch( ) returning gameSession copy.");
  return gameSessionCopy;
};

var injectFollowupIntoGameSession = function (gameSession, followupParentCardIndex) {
  const parentCard = gameSession.getCardByIndex(followupParentCardIndex);
  // inject copied followups onto branched parent card since they were cleared during branching deserialization
  const referenceCardForFollowup = gameSession.getCardCaches().getCardById(parentCard.getId());
  parentCard.setFollowups(referenceCardForFollowup.getFollowups().slice(0));
  // now inject the branched parentCard (with live followups) into the followup card stack in branched game
  gameSession.getValidatorFollowup()._cardStack.push(parentCard);
  // now we should have an active followup again
  const cardInBranchedSession = parentCard.getCurrentFollowupCard();
  gameSession._startFollowup();
  // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] injectFollowupIntoGameSession() => followup detected and injected into branched session. followupCard = " + cardInBranchedSession.getLogName());
  return gameSession;
};

var _buildActionsAndBranchFromProtoAction = function (gameSession, protoAction, snapshotOfCurrentGameSession) {
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _buildActionsAndBranchFromProtoAction() => building actions for protoAction with targets length = " + protoAction.targetsAndScores.length);
  const { targetsAndScores } = protoAction;
  const { card } = protoAction;
  // Logger.module("AI").debug("[G:" + gameSession.gameId + "] _buildActionsAndBranchFromProtoAction() => building actions for card " + card.getLogName() + ". card.getIsFollowup() = " + card.getIsFollowup());
  const actions = [];
  // for each potential target, build appropriate action
  _.each(targetsAndScores, (targetAndScore) => {
    const position = targetAndScore.target;
    let gameSessionBranched = _branch(gameSession, snapshotOfCurrentGameSession);
    if (card.getIsFollowup()) {
      // reconstruct followup data in cloned gamesession
      const followupParentCardIndex = card.getParentCardIndex();
      gameSessionBranched = injectFollowupIntoGameSession(gameSessionBranched, followupParentCardIndex);
    } else if (protoAction.actionType == SDK.PlaySignatureCardAction.type) {
      // do nothing
    } else {
      var cardInBranchedSession = gameSessionBranched.getCardByIndex(card.getIndex());
    }

    switch (protoAction.actionType) {
    case SDK.AttackAction.type:
      // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] _buildActionsAndBranchFromProtoAction() => building attack action for card " + cardInBranchedSession.getLogName() + " attacking unit " + gameSessionBranched.getBoard().getUnitAtPosition(position).getLogName());
      actions.push(cardInBranchedSession.actionAttackEntityAtPosition(position));
      break;
    case SDK.MoveAction.type:
      // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] _buildActionsAndBranchFromProtoAction() => building move action for card " + cardInBranchedSession.getLogName() + " moving to " + position.x + ", " + position.y);
      actions.push(cardInBranchedSession.actionMove(position));
      break;
    case SDK.PlayCardFromHandAction.type:
      var myPlayerBranched = gameSessionBranched.getCurrentPlayer();
      var indexOfCard = myPlayerBranched.getDeck().getCardsInHand().indexOf(cardInBranchedSession);
      // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] _buildActionsAndBranchFromProtoAction() => building actionPlayCardFromHand for card at index " + indexOfCard + " to " + position.x + ", " + position.y + ". Card is " + myPlayerBranched.getDeck().getCardInHandAtIndex(indexOfCard).getLogName());
      actions.push(myPlayerBranched.actionPlayCardFromHand(indexOfCard, position.x, position.y));
      break;
    case SDK.PlayCardAction.type:
      var myPlayerBranched = gameSessionBranched.getCurrentPlayer();
      // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] _buildActionsAndBranchFromProtoAction() => building actionPlayFollowup for followupcard " + cardInBranchedSession.getLogName() + " to " + position.x + ", " + position.y);
      actions.push(myPlayerBranched.actionPlayFollowup(cardInBranchedSession, position.x, position.y));
      break;
    case SDK.PlaySignatureCardAction.type:
      var myPlayerBranched = gameSessionBranched.getCurrentPlayer();
      // Logger.module("AI").debug("[G:" + gameSessionBranched.gameId + "] _buildActionsAndBranchFromProtoAction() => building actionPlayFollowup for followupcard " + cardInBranchedSession.getLogName() + " to " + position.x + ", " + position.y);
      actions.push(myPlayerBranched.actionPlaySignatureCard(position.x, position.y));
      break;
    }
  });
  return actions;
};

var _isUnitPreventedFromAttacking = function (unit) {
  return !unit.getCanAttack() || unit.hasModifierClass(SDK.ModifierStunned);
};

var _isUnitPreventedFromMoving = function (unit) {
  return !unit.getCanMove() || unit.hasModifierClass(SDK.ModifierStunned) || unit.getIsProvoked();
};

var _findPotentialMovePositionsForUnit = function (gameSession, unit) {
  const potentialMoves = [];
  const traversalPath = unit.getMovementRange().getValidPositions(gameSession.getBoard(), unit);
  _.each(traversalPath, (validMoveNodes) => {
    potentialMoves.push(_.last(validMoveNodes));
  });
  return potentialMoves;
};

const _isUnitAdjacentToOrOnManaTile = function (unit) {
  const gameSession = unit.getGameSession();
  const manaTiles = _.filter(gameSession.getBoard().getTiles(true), (tile) => tile.getBaseCardId() === SDK.Cards.Tile.BonusMana);
  return _.some(manaTiles, (manaTile) => _arePositionsEqualOrAdjacent(unit.position, manaTile.position));
};

// endregion FIND ACTIONS

// region BOARD SCORE

let _arePositionsEqualOrAdjacent = function (positionA, positionB) {
  return Math.abs(positionA.x - positionB.x) <= 1 && Math.abs(positionA.y - positionB.y) <= 1;
};

// specific case positioning
// PARAMETERS:
//  gameSession
//  unit
//  position to evaluate

const scoreForUnit_module_generalRetreat = function (gameSession, unit, position) {
  let score = 0;
  const myGeneral = gameSession.getGeneralForPlayerId(unit.getOwnerId());
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_generalRetreat() => 1unit " + unit.getLogName() + ". score = " + score);
  /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_generalRetreat() => 2unit " + unit.getLogName() + ". score = " + score + " general hp = " + myGeneral.getHP());
  if (!_hasLethalOnEnemyGeneral && myGeneral.getHP() < THRESHOLD_HP_GENERAL_RETREAT) {
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_generalRetreat() => 3unit " + unit.getLogName() + ". score = " + score);
    if (unit.getIsGeneral()) {
      // retreating generals prefer to be as far away as possible from all enemy units unless has lethal on opponent
      const allEnemyUnits = gameSession.getBoard().getEnemyEntitiesForEntity(unit, SDK.CardType.Unit);
      _.each(allEnemyUnits, (enemyUnit) => {
        const distanceFromEnemyUnit = _distanceBetweenPositions(position, enemyUnit.getPosition());
        score += distanceFromEnemyUnit - BOUNTY.MY_GENERAL_RETREAT_V2; // 12 is max distance. this provides a penalty of 12, lower the further away
      });
    } else if (!unit.getIsPlayed()) {
      // when in retreating mode, always prefer to spawn units surrounding my own general
      // todo: this sucks
      score += distanceBetweenBoardPositions(position, myGeneral.getPosition()) * BOUNTY.DISTANCE_FROM_MY_GENERAL_RETREATING;
    }
    /// /Logger.module("AI").debug("[G:" + gameSession.gameId + "] scoreForUnit_module_generalRetreat() => unit " + unit.getLogName() + ". score = " + score);
  }

  return score;
};

// positioning/distance using best target
// PARAMETERS:
//  gameSession
//  unit
//  position to evaluate
//  best target

// end score modules

const _getIsScoredModifier = function (modifier) {
  return !(
  // modifier instanceof SDK.ModifierClone ||
    modifier instanceof SDK.ModifierAirdrop
    || modifier instanceof SDK.ModifierProvoked
    || modifier instanceof SDK.ModifierDyingWish
    || modifier instanceof SDK.ModifierEphemeral
    || modifier instanceof SDK.ModifierOpeningGambit
    || modifier instanceof SDK.ModifierStunned
    || modifier instanceof SDK.ModifierTransformed
    || modifier instanceof SDK.ModifierWall
    || modifier instanceof SDK.ModifierFirstBlood
  );
};

const _getBountyForDistanceFromMyGeneral = function (gameSession, playerId) {
  // yields exponentially increasing desire to be near general as his health declines
  return BOUNTY.DISTANCE_FROM_MY_GENERAL * (BOUNTY.DISTANCE_FROM_MY_GENERAL_FACTOR / gameSession.getGeneralForPlayer(gameSession.getPlayerById(playerId)).getHP());
};

const _getBountyForDistanceFromOpponentGeneral = function () {
  if (_hasLethalOnEnemyGeneral) {
    return BOUNTY.DISTANCE_FROM_OPPONENT_GENERAL_WHEN_LETHAL;
  }
  return BOUNTY.DISTANCE_FROM_OPPONENT_GENERAL;
};

const findNearestObjective = function (position, objectives) {
  let nearestObjective = objectives[0];
  let closestDistance = 999;
  // this should be _.min, lol
  _.each(objectives, (objective) => {
    const distance = distanceBetweenBoardPositions(position, objective.getPosition());
    if (distance < closestDistance) {
      nearestObjective = objective;
      closestDistance = distance;
    }
  });
  /// ///Logger.module("AI").debug("[G:" + gameSession.gameId + "] findNearestObjective() => nearest objective is " + nearestObjective.getLogName() + " at " + nearestObjective.position.x + " , " + nearestObjective.position.y)
  return nearestObjective;
};

const ai_getScoreForAttackAction = function (attackSource, attackTargetPosition) {
  let score = 0;
  const gameSession = attackSource.getGameSession();
  const targetedEnemyUnit = gameSession.getBoard().getUnitAtPosition(attackTargetPosition);
  score += ScoreForUnitDamage(gameSession, targetedEnemyUnit, attackSource.getATK());
  score -= ScoreForUnitDamage(gameSession, attackSource, targetedEnemyUnit.getATK());
  return score;
};

// endregion BOARD SCORE

// var preProc_allow_burnFriendlyUnits = false;
// var preProc_allow_removeFriendlyUnits = false;
// var preProc_allow_buffEnemyUnits = false;
// var preProc_allow_badMoves = false;
// var preProc_allow_massTargetSpellCastWithoutAffectedUnits = false;
// var preProc_threshold_teleportDestinationsToEvaluateDescending = 3;
// var preProc_threshold_minimumScoreOfUnitForRemoval = 8;
// var preProc_threshold_minimumHpBeforeWatcherUnitAggression = 4;
/// /card specific
// var preProc_threshold_aspectOfTheFox_minimumScoreOfUnitForRemoval = 12;

// region PRE_PROCESSING CONFIG end

var PRUNING_THRESHOLD = 0.90; // if a branch falls below XX% of best depth score, it is pruned
var preProc_percentOfActionsToEvaluateAfterMinimum = 0.2;
var preProc_minimumNumberOfActionsToEvaluate = 2;
var preProc_qualityThreshold_playCard = -2;

// region CARD INTENT

var CARD_INTENT = [];
// lyonar
CARD_INTENT[SDK.Cards.Spell.TrueStrike] = 'burn_minion'; // True Strike | Deal 2 dmg minions
CARD_INTENT[SDK.Cards.Spell.DivineBond] = 'buff_minion'; // Divine_Bond | +atk = hp
CARD_INTENT[SDK.Cards.Spell.WarSurge] = 'buff_mass_minion'; // war surge | buff all minions
CARD_INTENT[SDK.Cards.Spell.Martyrdom] = 'removal'; // Martyrdon | destroy minion, restore hp to general
CARD_INTENT[SDK.Cards.Spell.Tempest] = 'burn_mass'; // Tempest | 3 dmg all generals and minions ***TODO SMARTER TARGETING - lethal
CARD_INTENT[SDK.Cards.Spell.BeamShock] = 'stun'; // Beamshock | stun an enemy minion or general
CARD_INTENT[SDK.Cards.Spell.AurynNexus] = 'buff_minion'; // Auryn Nexus | give a friendly minion +3 health
CARD_INTENT[SDK.Cards.Spell.SundropElixir] = 'heal'; // sundrop elixir | heal a friendly minion or general +5 health
CARD_INTENT[SDK.Cards.Artifact.SunstoneBracers] = 'buff_general'; // Sunstone Bracers | buff general atk
CARD_INTENT[SDK.Cards.Spell.Roar] = 'buff_minion'; // roar | SIGNATURE SPELL - +2 ATK minion near general
// songhai
CARD_INTENT[SDK.Cards.Spell.SaberspineSeal] = 'buff_EndOfTurn'; // Saberspine Seal | +3 atk this turn
CARD_INTENT[SDK.Cards.Spell.MistDragonSeal] = 'move'; // mist dragon seal | +1/+1, followup: move friendly any space
CARD_INTENT[SDK.Cards.Spell.PhoenixFire] = 'burn'; // phoenix fire | 3 dmg
CARD_INTENT[SDK.Cards.Spell.InnerFocus] = 'refresh'; // inner focus | refresh w/ 3 or less attack
CARD_INTENT[SDK.Cards.Spell.GhostLightning] = 'burn_mass_enemy_minion'; // Ghost Lightning | 1 dmg all enemy minions ***TODO SMARTER TARGETING - lethal
CARD_INTENT[SDK.Cards.Spell.KillingEdge] = 'buff_minion'; // Killing Edge | +4/+2 on minion
CARD_INTENT[SDK.Cards.Faction2.ChakriAvatar] = 'summon_grow'; // chakri avatar | unit with spellWatch. to cast with high priority before spells
CARD_INTENT[SDK.Cards.Spell.Blink] = 'move'; // Blink | SIGNATURE SPELL - move friendly minion up to 2 spaces

// vetruvian
CARD_INTENT[SDK.Cards.Spell.EntropicDecay] = 'removal_minion'; // entropic decay | destroy minion next to general
CARD_INTENT[SDK.Cards.Spell.ScionsFirstWish] = 'buff_minion'; // scions first wish | +1/+1 minion, draw card
CARD_INTENT[SDK.Cards.Spell.CosmicFlesh] = 'buff_minion'; // cosmic flesh | +2/+4 +provoke minion
CARD_INTENT[SDK.Cards.Spell.ScionsSecondWish] = 'draw'; // scions second wish | draw 2
CARD_INTENT[SDK.Cards.Spell.Blindscorch] = 'debuff_minion'; // blindscorch | lower minion atk to 0 until ur next turn
CARD_INTENT[SDK.Cards.Spell.SiphonEnergy] = 'dispel_minion'; // Siphon Energy | dispel a minion
CARD_INTENT[SDK.Cards.Spell.FountainOfYouth] = 'mass_heal_minion'; // Fountain of Youth | heal all minions to full health
CARD_INTENT[SDK.Cards.Spell.InnerOasis] = 'mass_buff_minion'; // Inner Oasis | heal all minions to full health
CARD_INTENT[SDK.Cards.Faction3.OrbWeaver] = 'summon'; // Orb Weaver | summon a copy of itself on a nearby space
CARD_INTENT[SDK.Cards.Spell.Enslave] = 'removal_minion'; // Dominate Will | take control of a minion next to general
CARD_INTENT[SDK.Cards.Artifact.StaffOfYKir] = 'buff_general'; // Staff of Y'Kir | buff general atk
CARD_INTENT[SDK.Cards.Spell.WindShroud] = 'summon'; // WindShroud | SIGNATURE SPELL - summ 2/2 ephemeral with rush near general

// abyssian
CARD_INTENT[SDK.Cards.Spell.DarkTransformation] = 'removal'; // dark transformation | destroy enemy minion, summon 1/1 wraith
CARD_INTENT[SDK.Cards.Spell.SoulshatterPact] = 'buff_mass_minion_EndOfTurn'; // soul shatter pact | friendly minions +2 atk this turn
CARD_INTENT[SDK.Cards.Spell.WraithlingSwarm] = 'summon'; // wraithling swam | summon 3 1/1 wraithlings near each other
CARD_INTENT[SDK.Cards.Spell.DaemonicLure] = 'burn_move_enemy_minion'; // daemonic lure | 1 dmg and teleport enemy minion
CARD_INTENT[SDK.Cards.Spell.ShadowNova] = 'shadownova'; // shadownova | 2x2 shadow creep area
CARD_INTENT[SDK.Cards.Spell.VoidPulse] = 'burn_general'; // void pulse | deal 2 damage to enemy general, restore 3 health to own general
CARD_INTENT[SDK.Cards.Faction4.DarkSiren] = 'summon_debuff_minion'; // Blood Siren | give nearby enemy -2 attack this turn
CARD_INTENT[SDK.Cards.Faction4.ShadowWatcher] = 'summon_grow'; // shadowwatcher | 2/2 deathwatcher. defined to cast with high priority
CARD_INTENT[SDK.Cards.Faction4.BloodmoonPriestess] = 'summon_watcher'; // Bloodmoon Priestess | summon 1/1 minion deathwatch
CARD_INTENT[SDK.Cards.Faction4.SharianShadowdancer] = 'summon_watcher'; // Shadow Dancer | deal 1 damage and heal 1 deathwatch
CARD_INTENT[SDK.Cards.Faction4.NightsorrowAssassin] = 'summon_removal'; // Nightsorrow Assassin | kill enemy minion with 2 attack or less
CARD_INTENT[SDK.Cards.Spell.ShadowReflection] = 'buff_minion'; // Shadow Reflection | give friendly minion +5 attack
CARD_INTENT[SDK.Cards.Spell.BreathOfTheUnborn] = 'mass_burn_minion'; // Breath of the Unborn | deal 2 damage to all enemy minions and restore all friendly minions to full health
// CARD_INTENT[SDK.Cards.Spell.DarkSeed] = "burn_general"; //Dark seed | deal damage to enemy general equal to their cards in hand  *** Possibly would need new logic??***
CARD_INTENT[SDK.Cards.Spell.Shadowspawn] = 'summon'; // Shadowspawn | SIGNATURE SPELL - summ 2 1/1s near general

// magmar
CARD_INTENT[SDK.Cards.Spell.NaturalSelection] = 'removal'; // natural selection | destroy minion with lowest attack
CARD_INTENT[SDK.Cards.Spell.PlasmaStorm] = 'removal_mass_minion'; // plasma storm | destroy all minions with 3 or less attack
CARD_INTENT[SDK.Cards.Spell.GreaterFortitude] = 'buff_minion'; // greater fortitude | +2/+2 minion
CARD_INTENT[SDK.Cards.Spell.DampeningWave] = 'debuff_minion'; // dampening wave | no counter atk permanent minion
CARD_INTENT[SDK.Cards.Faction5.PrimordialGazer] = 'summon_buff_minion'; // primordial gazer | 2/2, followup +2/+2 adjacent minion
// CARD_INTENT[SDK.Cards.Spell.ManaBurn] = "burn_mass_minion"; //mana burn | 2 dmg to each minion adjacent to mana tile   *** OUTDATED AND NEEDS TO BE REMOVED ***
CARD_INTENT[SDK.Cards.Artifact.AdamantineClaws] = 'buff_general'; // Adamantine Claws | buff general atk
CARD_INTENT[SDK.Cards.Spell.Amplification] = 'buff_minion'; // Amplification | give a friendly damaged minion +2/+4
// CARD_INTENT[SDK.Cards.Spell.DiretideFrenzy] = "buff_minion"; // Diretide Frenzy | give a friendly minion +1 attack and frenzy  *** I feel like the frenzy will be wasted without a rework***
// CARD_INTENT[SDK.Cards.Spell.Tremor] = "stun_minion"; // Tremor | stun enemy minions in 2x2 grid  *** Do we have 2x2 grid logic?***
CARD_INTENT[SDK.Cards.Spell.EarthSphere] = 'heal_general'; // Earth Sphere | heal general 8 health
CARD_INTENT[SDK.Cards.Spell.Overload] = 'buff_general'; // Overload | SIGNATURE SPELL - +1 ATK to general

// vanar
CARD_INTENT[SDK.Cards.Spell.AspectOfTheWolf] = 'removal_buff_minion'; // aspect of the fox | destroy any minion, replace with 3/3
CARD_INTENT[SDK.Cards.Spell.Avalanche] = 'burn_mass'; // avalanche | 4 dmg and stun to ALL minions and generals on your side of field
CARD_INTENT[SDK.Cards.Spell.PermafrostShield] = 'buff_minion'; // Permafrost shield/ AKA Frostfire |+3 atk minion, if vespyr +3 hp
CARD_INTENT[SDK.Cards.Spell.FlashFreeze] = 'burn_stun_minion'; // flash freeze |1 dmg to minion & stun
// CARD_INTENT[SDK.Cards.Spell.ChromaticCold] = "burn_minion"; //chromatic cold | 2 dmg enemy minions in row and stun
CARD_INTENT[SDK.Cards.Spell.ChromaticCold] = 'burn_dispel'; // chromatic cold | 2 dmg and dispel
CARD_INTENT[SDK.Cards.Artifact.Snowpiercer] = 'buff_general'; // Snowpiercer | buff general atk
CARD_INTENT[SDK.Cards.Spell.BonechillBarrier] = 'summon'; // bonechill barrier | summon 3 0/2 walls that stun enemy minions who attack it
CARD_INTENT[SDK.Cards.Faction6.BoreanBear] = 'summon_grow'; // borean bear | gain +1 attack for every vespyr summoned
CARD_INTENT[SDK.Cards.Spell.IceCage] = 'removal'; // hailstone prison | bounce minion back to owners hand
CARD_INTENT[SDK.Cards.Spell.BlazingSpines] = 'summon'; // blazing spines | summon 2 3/3 walls
CARD_INTENT[SDK.Cards.Faction6.SnowElemental] = 'summon_watcher'; // glacial elemental | deal 2 damaage to a random minion for every friendly vespyr summoned
CARD_INTENT[SDK.Cards.Faction6.Razorback] = 'summon_buff_mass_minion_EndOfTurn'; // Razorback | all friendly minions gain +2 attack until end of turn
CARD_INTENT[SDK.Cards.Spell.Warbird] = 'burn_mass_enemy'; // Warbird | SIGNATURE SPELL - 2 dmg all enemies in enemy general's column

// neutral
CARD_INTENT[SDK.Cards.Neutral.RepulsionBeast] = 'summon_move_enemy_minion'; // repulsor beast |
CARD_INTENT[SDK.Cards.Neutral.BloodtearAlchemist] = 'summon_burn'; // Bloodtear Alchemist |  deals 1 damage to an enemy
CARD_INTENT[SDK.Cards.Neutral.EphemeralShroud] = 'summon_dispel'; // Ephemeral Shroud | dispel a nearby tile
CARD_INTENT[SDK.Cards.Neutral.HealingMystic] = 'summon_heal'; // Healing Mystic | restore 2 health to a minion or general
CARD_INTENT[SDK.Cards.Neutral.Maw] = 'summon_burn_minion'; // Maw |  deals 2 damage to an enemy minion
CARD_INTENT[SDK.Cards.Neutral.PrimusFist] = 'summon_buff_minion'; // Primus Fist |  give +2 attack to friendly nearby minion
CARD_INTENT[SDK.Cards.Neutral.CrimsonOculus] = 'summon_grow'; // Crimson Oculus |  gain +1/+1 whenever opponent summons a minion
CARD_INTENT[SDK.Cards.Neutral.PrismaticIllusionist] = 'summon_watcher'; // Prismatic Illusionist |  summon 2/1 illusion every time you cast a spell
CARD_INTENT[SDK.Cards.Neutral.Firestarter] = 'summon_watcher'; // Firestarter |  summon 1/1 spellspark with rush every time you cast a spell
// followups
CARD_INTENT[SDK.Cards.Spell.FollowupTeleport] = 'teleport_destination'; // Followup to: mist dragon seal SDK.Cards.Spell.MistDragonSeal, repulsor beast SDK.Cards.Neutral.RepulsionBeast | Teleport to any space | "Teleport"
CARD_INTENT[SDK.Cards.Spell.FollowupHeal] = 'heal'; // Followup to: Healing_Mystic_10981 | Heals 2 dmg | "Heal_Damge"
CARD_INTENT[SDK.Cards.Spell.FollowupDamage] = 'burn'; // Followup to: Bloodtear Alchemist | Deals 1 dmg |
CARD_INTENT[SDK.Cards.Spell.ApplyModifiers] = 'buff_minion'; // Followup to: primordial gazer SDK.Cards.Faction5.PrimordialGazer | +2/+2 | "apply modifiers"
CARD_INTENT[SDK.Cards.Spell.CloneSourceEntity] = 'summon'; // Followup to: CloneSourceEntity2X | "CloneSourceEntity"
CARD_INTENT[SDK.Cards.Spell.CloneSourceEntity2X] = 'summon'; // Followup to: wraithling swarm SDK.Cards.Spell.WraithlingSwarm | "CloneSourceEntity2X"

// endregion CARD INTENT
