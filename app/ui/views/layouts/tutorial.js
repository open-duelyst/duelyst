// pragma PKGS: tutorial

const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const BaseSprite = require('app/view/nodes/BaseSprite');
const Light = require('app/view/nodes/fx/Light');
const EntityNode = require('app/view/nodes/cards/EntityNode');
const BottomDeckCardNode = require('app/view/nodes/cards/BottomDeckCardNode');
const InstructionNode = require('app/view/nodes/cards/InstructionNode');
const GameLayer = require('app/view/layers/game/GameLayer');
const EntityNodeVisualStateTag = require('app/view/nodes/visualStateTags/EntityNodeVisualStateTag');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const CardNodeVisualStateTag = require('app/view/nodes/visualStateTags/CardNodeVisualStateTag');
const NodeFactory = require('app/view/helpers/NodeFactory');
const TutorialIntroView = require('app/ui/views/item/tutorial/tutorial_intro');
const TutorialChallengeLostView = require('app/ui/views/item/tutorial/challenge_lost');
const TutorialChallengeStartView = require('app/ui/views/item/tutorial/challenge_start');
const AgentActions = require('app/sdk/agents/agentActions');
const Analytics = require('app/common/analytics');
const GameLayout = require('./game');

const TutorialLayout = GameLayout.extend({

  _playerIntroduced: false,
  _playerReady: false,

  _lesson: null,
  _currentHighlightedTiles: null,

  _currentInstructionShowing: null,
  _instructionNodesForCurrentInstruction: null, // Object containing a map of instruction nodes being used by current instruction by instruction label index
  _fxNodesForCurrentInstruction: null,
  _hidingLightsForCurrentInstruction: false,
  _currentInstructionLabels: null,
  _currentInstructionLabel: null,
  _showNextInstructionLabelTimeoutId: null, // timeout id for showing the next instruction label in sequence
  _currentInstructionLabelDelayTimeoutId: null, // timeout id for showing current instruction label after a delay
  _delayNextInstructionLabel: false, // whether to add a delay to next instruction label

  instructionalGlowTagId: 'InstructionalGlowTagId',
  showPathsLockId: 'TutorialShowPathsLockId',
  playerSelectionLockedId: 'TutorialPlayerSelectionLockedId',

  _targetFriendlySprite: null,
  _targetEnemySprite: null,

  _instructionalArrows: null,

  /* region INITIALIZE */

  initialize() {
    this._currentInstructionLabels = [];
    this._instructionNodesForCurrentInstruction = {};
    this._fxNodesForCurrentInstruction = [];
    this._currentHighlightedTiles = [];
    this._instructionalArrows = [];

    GameLayout.prototype.initialize.apply(this, arguments);
  },

  _startTutorial() {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();

    if (this._lesson.getSkipMulligan()) {
      // skip mulligan
      gameLayer.whenStatus(GameLayer.STATUS.ACTIVE).then(() => {
        // unlock player selection
        Scene.getInstance().getGameLayer().requestPlayerSelectionUnlocked(this.playerSelectionLockedId);

        // activate first instruction
        this._lesson.activateNextInstruction();

        // trigger the agents first action
        const opponentAgent = this._lesson.getOpponentAgent();
        if (opponentAgent && !this._lesson.userIsPlayer1) {
          opponentAgent.gatherAgentActionSequenceAfterStep(null);
          this.executeAgentActions();
        }
      });
    } else {
      // start at mulligan
      gameLayer.whenStatus(GameLayer.STATUS.CHOOSE_HAND).then(() => {
        // unlock player selection
        Scene.getInstance().getGameLayer().requestPlayerSelectionUnlocked(this.playerSelectionLockedId);

        // show mulligan ui
        if (this._lesson.mulliganInstructionLabel) {
          this._currentInstructionLabels = [this._lesson.mulliganInstructionLabel];
          this._instructionNodesForCurrentInstruction = {};
          this._showNextInstructionLabel();
        }

        if (this._lesson.requiredMulliganHandIndices) {
          for (let i = 0; i < this._lesson.requiredMulliganHandIndices.length; i++) {
            const currentMulliganIndex = this._lesson.requiredMulliganHandIndices[i];
            const cardNode = gameLayer.getBottomDeckLayer().getCardNodes()[currentMulliganIndex];
            cardNode.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(true, 3), this._cardToPlayInjectedId);
          }
        }
      });

      gameLayer.whenStatus(GameLayer.STATUS.ACTIVE).then(() => {
        // activate first instruction
        this._lesson.activateNextInstruction();

        // trigger the agents first action
        const opponentAgent = this._lesson.getOpponentAgent();
        if (opponentAgent && !this._lesson.userIsPlayer1) {
          opponentAgent.gatherAgentActionSequenceAfterStep(null);
          this.executeAgentActions();
        }
      });
    }
  },

  /* endregion INITIALIZE */

  /* region STATES */

  showNextStepInGameSetup() {
    let nextStepPromise;

    if (!this._playerIntroduced) {
      // show tutorial intro screen
      this._playerIntroduced = true;
      const tutorialIntroView = new TutorialIntroView({ model: new Backbone.Model({ challenge: this._lesson }) });
      const tutorialIntroPromise = new Promise((resolve, reject) => {
        tutorialIntroView.listenToOnce(tutorialIntroView, 'start_tutorial', resolve);
      });
      nextStepPromise = Promise.all([
        this.customOverlayRegion.show(tutorialIntroView),
        tutorialIntroPromise,
      ]).then(() => {
        // flag tutorial as ready to start
        this._playerReady = true;

        // remove tutorial intro screen
        this.customOverlayRegion.empty();

        // show next step
        return this.showNextStepInGameSetup();
      });
    } else if (this._playerReady) {
      nextStepPromise = GameLayout.prototype.showNextStepInGameSetup.apply(this, arguments);
    } else {
      nextStepPromise = Promise.resolve();
    }

    return nextStepPromise;
  },

  showChooseHand() {
    const showChooseHandPromise = GameLayout.prototype.showChooseHand.apply(this, arguments);

    // hide confirm button for choosing hand immediately
    if (this._lesson.requiredMulliganHandIndices && this._lesson.requiredMulliganHandIndices.length > 0) {
      if (this.chooseHandView) {
        this.chooseHandView.setConfirmButtonVisibility(false);
      }
    }

    return showChooseHandPromise;
  },

  /* endregion STATES */

  /* region EVENTS */

  onShow() {
    this._lesson = SDK.GameSession.getInstance().getChallenge();
    if (this._lesson != null) {
      // proto show
      GameLayout.prototype.onShow.apply(this, arguments);

      const scene = Scene.getInstance();
      const gameLayer = scene && scene.getGameLayer();
      if (gameLayer) {
        // Prevent player selection until tutorial has begun
        gameLayer.requestPlayerSelectionLocked(this.playerSelectionLockedId);

        for (let i = 0; i < this._lesson.hiddenUIElements.length; i++) {
          const hiddenUIElementKey = this._lesson.hiddenUIElements[i];
          if (hiddenUIElementKey == 'HandLayer') {
            gameLayer.getBottomDeckLayer().hideHandLayer();
          }
          if (hiddenUIElementKey == 'Mana') {
            this.$el.addClass('hide-mana');
          }
          if (hiddenUIElementKey == 'CardCount') {
            this.$el.addClass('hide-deck-count');
          }
          if (hiddenUIElementKey == 'Replace') {
            gameLayer.getBottomDeckLayer().getReplaceNode().setIsDisabled(true);
          }
          if (hiddenUIElementKey == 'SignatureCard') {
            gameLayer.getPlayer1Layer().getSignatureCardNode().setIsDisabled(true);
            gameLayer.getPlayer2Layer().getSignatureCardNode().setIsDisabled(true);
          }
        }

        // cache sprites
        this._targetFriendlySprite = new BaseSprite(RSX.target_ring_friendly.img);
        this._targetFriendlySprite.setPosition(cc.p(200, 200));
        this._targetFriendlySprite.setOpacity(0);
        this._targetFriendlySprite.runAction(cc.repeatForever(cc.rotateBy(0.1, Math.PI)));
        gameLayer.middlegroundLayer.addChild(this._targetFriendlySprite);

        this._targetEnemySprite = new BaseSprite(RSX.target_ring_enemy.img);
        this._targetEnemySprite.setPosition(cc.p(300, 300));
        this._targetEnemySprite.setOpacity(0);
        this._targetEnemySprite.runAction(cc.repeatForever(cc.rotateBy(0.1, Math.PI)));
        gameLayer.middlegroundLayer.addChild(this._targetEnemySprite);

        // listen to game events
        this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.start_step, this.onStartStep);
        this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.invalid_action, this.onInvalidAction);
        this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.start_turn, this._onStartTurn);

        this.listenTo(gameLayer.getEventBus(), EVENTS.game_selection_changed, this.onSelectionChanged);
        this.listenTo(gameLayer.getEventBus(), EVENTS.game_hover_changed, this.onHoverChanged);
        this.listenTo(gameLayer.getEventBus(), EVENTS.after_show_action, this.onAfterShowAction);
        this.listenTo(gameLayer.getEventBus(), EVENTS.mulligan_card_selected, this.onMulliganCardSelected);
        this.listenTo(gameLayer.getEventBus(), EVENTS.mulligan_card_deselected, this.onMulliganCardDeselected);
        this.listenTo(gameLayer.getEventBus(), EVENTS.instruction_node_pressed, this.onInstructionNodePressed);
        this.listenTo(gameLayer.getEventBus(), EVENTS.general_speech_done_showing, this.onUIDoneShowing);
        this.listenTo(gameLayer.getEventBus(), EVENTS.instruction_node_done_showing, this.onUIDoneShowing);

        // listen to challenge events
        this.listenTo(this._lesson.getEventBus(), EVENTS.instruction_triggered, this.onInstructionTriggered);
        this.listenTo(this._lesson.getEventBus(), EVENTS.challenge_reset, this.onChallengeReset);
        this.listenTo(this._lesson.getEventBus(), EVENTS.challenge_start, this._showChallengeStart);

        this._startTutorial();
      }
    }
  },

  onDestroy() {
    GameLayout.prototype.onDestroy.call(this);

    if (this._showInstructionTimeoutId != null) {
      clearTimeout(this._showInstructionTimeoutId);
      this._showInstructionTimeoutId = null;
    }

    this.stopExecutingAgentAction();

    this._cleanupCurrentInstruction();
  },

  onResize() {
    GameLayout.prototype.onResize.call(this);

    // restart current instruction
    this._showInstruction(this._currentInstructionShowing);
  },

  onAfterShowStep(e) {
    GameLayout.prototype.onAfterShowStep.call(this, e);

    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    const action = e.step && e.step.action;

    if (!(action instanceof SDK.DrawStartingHandAction) && !(action instanceof SDK.EndTurnAction)) {
      this._lesson.activateNextInstruction();
      gameLayer.requestPlayerSelectionUnlocked(this.playerSelectionLockedId);

      // Drive the tutorial's opponent agent
      const opponentAgent = this._lesson.getOpponentAgent();
      if (!gameLayer.getMyPlayer().isCurrentPlayer && opponentAgent) {
        opponentAgent.gatherAgentActionSequenceAfterStep(e.step);
        this.executeAgentActions();
      }
    }
  },

  onAfterShowAction(event) {
    const { action } = event;
    if (action instanceof SDK.RemoveAction) {
      const actionTarget = action.getTarget();
      if (actionTarget != null && actionTarget.getIsGeneral() && actionTarget.getOwnerId() == SDK.GameSession.current().getMyPlayerId()) {
        this._showChallengeLost();
      }
    }
  },

  onMulliganCardSelected(e) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    if (this._lesson.unmulliganableHandIndices.indexOf(e.handIndex) != -1) {
      gameLayer.getBottomDeckLayer().getCardNodes()[e.handIndex].setSelected(false);
    } else {
      // Reveal confirm mulligan button if all required mulligan cards have been mulliganned
      if (this._lesson && this._lesson.requiredMulliganHandIndices) {
        if (_.difference(this._lesson.requiredMulliganHandIndices, gameLayer.getMulliganIndices()).length == 0) {
          if (this.chooseHandView) {
            this.chooseHandView.setConfirmButtonVisibility(true);
          }
        }
      }
    }
  },

  onMulliganCardDeselected(e) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    // hide confirm mulligan button if any required mulligan cards have not been mulliganned
    if (this._lesson && this._lesson.requiredMulliganHandIndices) {
      if (_.difference(this._lesson.requiredMulliganHandIndices, gameLayer.getMulliganIndices()).length != 0) {
        if (this.chooseHandView) {
          this.chooseHandView.setConfirmButtonVisibility(false);
        }
      }
    }
  },

  onHoverChanged(event) {
    const hovered = event && event.hovered;
    if (this._currentInstructionShowing && hovered != null && hovered.x != null && hovered.y != null) {
      const scene = Scene.getInstance();
      const gameLayer = scene && scene.getGameLayer();
      // reinforce correct play by increasing or decreasing opacity of chevrons
      const hoveringCorrectPosition = UtilsPosition.getPositionsAreEqual(hovered, this._currentInstructionShowing.targetPosition);

      if (this._currentInstructionShowing.handIndex != null) {
        // Player is supposed to be playing a card from hand
        if (hoveringCorrectPosition && this._currentInstructionShowing.handIndex == gameLayer.getMyPlayer().getSelectedCardIndexInHand()) {
          // Increase fade
          _.each(gameLayer.getAltPlayer().pathTiles, (tile) => {
            tile.fadeTo(CONFIG.FADE_MEDIUM_DURATION, CONFIG.INSTRUCTIONAL_UI_CORRECT_TARGET_OPACITY);
          });

          // decrease opacity on highlighted tiles
          this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_OVERLAP_OPACITY);

          // show target tile
          let targetTileSpriteIdentifier;
          if (gameLayer.getMyPlayer().getSelectedCard() instanceof SDK.Spell) {
            targetTileSpriteIdentifier = RSX.tile_spell.frame;
          } else {
            targetTileSpriteIdentifier = RSX.tile_spawn.frame;
          }
          gameLayer.getAltPlayer().showTargetTile(gameLayer.getMyPlayer().getMouseScreenBoardPosition(), true, CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY, CONFIG.FADE_FAST_DURATION, CONFIG.PATH_COLOR, targetTileSpriteIdentifier);
        } else {
          // Decrease fade
          _.each(gameLayer.getAltPlayer().pathTiles, (tile) => {
            tile.fadeTo(CONFIG.FADE_MEDIUM_DURATION, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
          });

          // restore opacity of highlighted tiles
          this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY);

          // remove target tile
          gameLayer.getAltPlayer().removeTargetTile();
        }
      } else if (this._currentInstructionShowing.targetPosition && this._currentInstructionShowing.sourcePosition) {
        if (this._currentInstructionShowing.expectedActionType == SDK.MoveAction.type) {
          // Player is supposed to be moving
          var correctEntitySelected = gameLayer.getMyPlayer().getSelectedEntityNode() && UtilsPosition.getPositionsAreEqual(gameLayer.getMyPlayer().getSelectedEntityNode().getBoardPosition(), this._currentInstructionShowing.sourcePosition);
          if (hoveringCorrectPosition && correctEntitySelected) {
            // increase move path fade
            _.each(gameLayer.getAltPlayer().pathTiles, (tile) => {
              tile.fadeTo(CONFIG.FADE_MEDIUM_DURATION, CONFIG.INSTRUCTIONAL_UI_CORRECT_TARGET_OPACITY);
            });
          } else {
            // decrease move path fade
            _.each(gameLayer.getAltPlayer().pathTiles, (tile) => {
              tile.fadeTo(CONFIG.FADE_MEDIUM_DURATION, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
            });
          }

          // adjust highlighted tiles
          if (this._currentHighlightedTiles != null && this._currentHighlightedTiles.length > 0) {
            const correctEntityHovered = correctEntitySelected || (gameLayer.getMyPlayer().getMouseOverEntityNode() && UtilsPosition.getPositionsAreEqual(gameLayer.getMyPlayer().getMouseOverEntityNode().getBoardPosition(), this._currentInstructionShowing.sourcePosition));
            if (correctEntityHovered) {
              this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_OVERLAP_OPACITY);
            } else {
              this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY);
            }
          }
        } else {
          // Either an attack or a followup
          var correctEntitySelected = gameLayer.getMyPlayer().getSelectedEntityNode() && UtilsPosition.getPositionsAreEqual(gameLayer.getMyPlayer().getSelectedEntityNode().getBoardPosition(), this._currentInstructionShowing.sourcePosition);
          if (hoveringCorrectPosition && correctEntitySelected) {
            // increase chevron fade
            _.each(gameLayer.getAltPlayer().pathTiles, (tile) => {
              tile.fadeTo(CONFIG.FADE_MEDIUM_DURATION, CONFIG.INSTRUCTIONAL_UI_CORRECT_TARGET_OPACITY);
            });

            // show target tile
            gameLayer.getAltPlayer().showTargetTile(gameLayer.getMyPlayer().getMouseScreenBoardPosition(), true, CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY, CONFIG.FADE_FAST_DURATION, CONFIG.PATH_COLOR, RSX.tile_attack.frame);
          } else {
            // decrease chevron fade
            _.each(gameLayer.getAltPlayer().pathTiles, (tile) => {
              tile.fadeTo(CONFIG.FADE_MEDIUM_DURATION, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
            });

            // remove target tile
            gameLayer.getAltPlayer().removeTargetTile();
          }
        }
      }
    }
  },

  onInvalidAction() {
    // cleanup any timeouts
    this._cleanupCurrentInstructionLabelTimeouts();

    // Then restore it to show again after a normal delay
    if (this._currentInstructionLabel) {
      this._currentInstructionLabelDelayTimeoutId = setTimeout(this._showInstructionLabel.bind(this, this._currentInstructionLabel), (0.5 + CONFIG.SPEECH_DURATION) * 1000.0);
    }
  },

  onStartStep(e) {
    // cleanup the currently shown instruction
    this._cleanupCurrentInstruction();

    // This is no longer needed but keep comment as legacy for now 0.58.0
    // Workaround for replace
    // if (e.step && e.step.action && e.step.action.type == ReplaceCardFromHandAction.type) {
    //  this._lesson.activateNextInstruction();
    // }
  },

  _onStartTurn(e) {
    const currentTurnIndex = SDK.GameSession.current().getNumberOfTurns();

    if (this._lesson && this._lesson.hasInstructionForGameTurn(currentTurnIndex)) {
      const scene = Scene.getInstance();
      const gameLayer = scene && scene.getGameLayer();
      gameLayer.requestPlayerSelectionLocked(this.playerSelectionLockedId);
    }
  },

  _cardToPlayInjectedId: 'CardToPlayInjectedId',
  _removeReadinessInjectedId: 'RemoveReadinessInjectedId',
  onInstructionTriggered(e) {
    this._showInstruction(e && e.instruction);
  },

  _showInstruction(instruction) {
    // Cleanup of dismiss delay
    this._delayNextInstructionLabel = false;

    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    if (instruction != null && gameLayer != null) {
      this._cleanupCurrentInstruction();

      this._currentInstructionShowing = instruction;
      this._currentInstructionLabels = instruction.instructionLabels;
      this._instructionNodesForCurrentInstruction = {};
      this._fxNodesForCurrentInstruction = [];
      if (instruction == null) {
        throw new Error('tutorial.js:onInstructionTriggered - received null instruction');
      }

      let statusPromise;
      if (this._lesson.getSkipMulligan()) {
        statusPromise = gameLayer.whenStatus(GameLayer.STATUS.ACTIVE);
      } else {
        statusPromise = gameLayer.whenStatus(GameLayer.STATUS.CHOOSE_HAND);
      }

      statusPromise.then(() => {
        // make sure the currently showing instruction matches this one
        if (this._currentInstructionShowing === instruction) {
          if (instruction.preventSelectionUntilLabelIndex != null) {
            gameLayer.requestPlayerSelectionLocked(this.playerSelectionLockedId);
            const instructionLabelToUnfreeze = this._currentInstructionLabels[instruction.preventSelectionUntilLabelIndex];
            instructionLabelToUnfreeze._unfreezeSelectection = true;
          }

          // Any visual state tags that need to be applied (just readiness for now)
          if (instruction.disableReadiness) {
            gameLayer.addTagWithIdToAllEntities(EntityNodeVisualStateTag.createShowReadinessForPlayerTag(false, 4), this._removeReadinessInjectedId);
          }

          // Handle sticky targeting already having already selected current entity prior to start of instruction
          const selectedEntityNode = gameLayer.getMyPlayer().getSelectedEntityNode();
          if (selectedEntityNode != null) {
            this._onSelectEntityNodeStart(selectedEntityNode);
          }

          // show instruction after start turn shown
          gameLayer.whenStartTurnShown().then(() => {
            // make sure the currently showing instruction matches this one
            if (this._currentInstructionShowing === instruction) {
              // show instruction fx
              this._showFXForInstruction(instruction);

              // show instruction ui
              if (instruction.preventSelectionUntilLabelIndex == null) {
                this._showUIForInstruction(instruction);
              }

              // show instruction label
              if (instruction.instructionLabels) {
                this._showNextInstructionLabel();
              }
            }
          });
        }
      });
    }
  },

  _showFXForInstruction(instruction) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null && CONFIG.TUTORIAL_INSTRUCTION_FX_ENABLED) {
      // source fx
      const sourceBoardPosition = instruction.sourcePosition;
      if (sourceBoardPosition != null) {
        const sourceFX = NodeFactory.createFX(CONFIG.TUTORIAL_INSTRUCTION_FX_TEMPLATE, { targetBoardPosition: sourceBoardPosition });
        gameLayer.addNodes(sourceFX);
        this._fxNodesForCurrentInstruction = this._fxNodesForCurrentInstruction.concat(sourceFX);
      }

      // target fx
      const targetBoardPosition = instruction.targetPosition;
      if (targetBoardPosition != null && !UtilsPosition.getPositionsAreEqual(sourceBoardPosition, targetBoardPosition)) {
        const targetFX = NodeFactory.createFX(CONFIG.TUTORIAL_INSTRUCTION_FX_TEMPLATE, { targetBoardPosition });
        gameLayer.addNodes(targetFX);
        this._fxNodesForCurrentInstruction = this._fxNodesForCurrentInstruction.concat(targetFX);
      }

      // make the light radius smaller based on the distance between source/target positions
      let lightRadius;
      if (sourceBoardPosition != null && targetBoardPosition != null) {
        const dx = targetBoardPosition.x - sourceBoardPosition.x;
        const dy = targetBoardPosition.y - sourceBoardPosition.y;
        lightRadius = CONFIG.TILESIZE * Math.sqrt(dx * dx + dy * dy) * 2.0;
      } else {
        lightRadius = CONFIG.TILESIZE * CONFIG.TUTORIAL_INSTRUCTION_FX_LIGHT_RADIUS;
      }
      lightRadius = Math.min(CONFIG.TILESIZE * CONFIG.TUTORIAL_INSTRUCTION_FX_LIGHT_RADIUS, Math.max(CONFIG.TILESIZE, lightRadius));

      if (this._fxNodesForCurrentInstruction.length > 0) {
        for (let i = 0, il = this._fxNodesForCurrentInstruction.length; i < il; i++) {
          const fxNode = this._fxNodesForCurrentInstruction[i];
          if (fxNode instanceof Light) {
            // when any fx are lights, hide the battlemap lights
            if (fxNode.getParent() != null) {
              this._hidingLightsForCurrentInstruction = true;
            }

            // apply radius
            fxNode.setRadius(lightRadius);
          }
        }

        if (this._hidingLightsForCurrentInstruction) {
          gameLayer.getBattleMap().hideLights(CONFIG.TUTORIAL_INSTRUCTION_FX_FADE_DURATION);
        }
      }
    }
  },

  _showUIForInstruction(instruction) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      // get entity nodes
      let sourceEntityNode;
      const sourceBoardPosition = instruction.sourcePosition;
      let sourceScreenPosition;
      if (sourceBoardPosition != null) {
        sourceScreenPosition = UtilsEngine.transformBoardToTileMap(sourceBoardPosition);
        sourceEntityNode = gameLayer.getUnitNodeAtBoardPosition(sourceBoardPosition.x, sourceBoardPosition.y, true, true);
      }
      var targetEntityNode;
      const targetBoardPosition = instruction.targetPosition;
      let targetScreenPosition;
      if (targetBoardPosition != null) {
        targetScreenPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
        targetEntityNode = gameLayer.getUnitNodeAtBoardPosition(targetBoardPosition.x, targetBoardPosition.y, true, true);
      }

      gameLayer.getAltPlayer().removePath(); // TODO: Is this still needed it's in a couple places
      gameLayer.getAltPlayer().removeTargetTile();

      // Highlight a card in hand if one is required for this instruction
      if (instruction.handIndex != null) {
        var cardNode = gameLayer.getBottomDeckLayer().getCardNodes()[instruction.handIndex];
        cardNode.addInjectedVisualStateTagWithId(CardNodeVisualStateTag.createShowGlowForPlayerTag(true, 2), this._cardToPlayInjectedId);
      }

      // Show movement path if we want to execute a move action
      if (instruction.expectedActionType == SDK.MoveAction.type) {
        const board = SDK.GameSession.current().getBoard();
        const sourceEntity = board.getEntityAtPosition(sourceBoardPosition);
        const path = sourceEntity.getMovementRange().getPathTo(board, sourceEntity, targetBoardPosition);
        gameLayer.getAltPlayer().showPath(path, true, false, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
        gameLayer.getMyPlayer().requestShowPathsLocked(this.showPathsLockId);
      }

      if (sourceEntityNode) {
        sourceEntityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowInstructionalGlowTag(true, 1), this.instructionalGlowTagId);
      }

      // Highlight the target tile the player should focus on
      if (targetBoardPosition != null) {
        if (!targetEntityNode) {
          // If there is no entity at target position, highlight the tile
          const locs = [this._currentInstructionShowing.targetPosition];
          gameLayer.getTileLayer().removeTilesWithFade(this._currentHighlightedTiles);
          this._currentHighlightedTiles = [];
          this._currentHighlightedTiles = gameLayer.getTileLayer().displayMergedTiles(locs, null, null, RSX.tile_merged_hover.frame, 1, CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY, CONFIG.FADE_FAST_DURATION, CONFIG.INSTRUCTIONAL_TARGET_COLOR, this._currentHighlightedTiles);

          const correctEntitySelected = gameLayer.getMyPlayer().getSelectedEntityNode() && UtilsPosition.getPositionsAreEqual(gameLayer.getMyPlayer().getSelectedEntityNode().getBoardPosition(), this._currentInstructionShowing.sourcePosition);
          const correctEntityHovered = correctEntitySelected || (gameLayer.getMyPlayer().getMouseOverEntityNode() && UtilsPosition.getPositionsAreEqual(gameLayer.getMyPlayer().getMouseOverEntityNode().getBoardPosition(), this._currentInstructionShowing.sourcePosition));
          if (correctEntityHovered) {
            this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_OVERLAP_OPACITY);
          } else {
            this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY);
          }
        } else {
          // There is an entity at target position
          if (sourceEntityNode != null) {
            // If there an entity at source and target positions show a chevron path between them
            gameLayer.getAltPlayer().showPath([sourceScreenPosition, targetScreenPosition], true, true, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
            gameLayer.getMyPlayer().requestShowPathsLocked(this.showPathsLockId);
          } else {
            // If there is an entity at target position but no source position/entity show the friendly reticle
            this._targetFriendlySprite.runAction(cc.fadeIn(0.2));
            this._targetFriendlySprite.setPosition(cc.p(
              targetEntityNode.getPosition().x,
              targetEntityNode.getPosition().y + 15,
            ));
          }
        }
      }

      // Show any drop down arrows
      if (instruction.instructionArrowPositions) {
        for (let i = 0; i < instruction.instructionArrowPositions.length; i++) {
          const instructionArrowPosition = instruction.instructionArrowPositions[i];
          var targetEntityNode = gameLayer.getEntityNodeAtBoardPosition(instructionArrowPosition.x, instructionArrowPosition.y, true, true);
          if (targetEntityNode) {
            gameLayer.showInstructionalArrowForEntityNode(targetEntityNode);
          } else {
            gameLayer.showInstructionalArrowForBoardPosition(instructionArrowPosition);
          }
        }
      }

      if (instruction.persistentInstructionArrowPosition) {
        const arrowPosition = UtilsEngine.transformBoardToScreen(instruction.persistentInstructionArrowPosition);
        this._instructionalArrows.push(gameLayer.showPersistentInstructionalArrow(arrowPosition));
      }

      // Show any default end turn ui
      if (instruction.expectedActionType == SDK.EndTurnAction.type) {
        // Show a persistent arrow at end turn button
        const cardsInHandEndPosition = UtilsEngine.getCardsInHandEndPosition();
        const submitTurnScreenTCPosition = {
          x: cardsInHandEndPosition.x + 110.0,
          y: cardsInHandEndPosition.y + 70.0,
        };
        this._instructionalArrows.push(gameLayer.showPersistentInstructionalArrow(submitTurnScreenTCPosition));
      }

      // If playing a card, show a instructional ray from that card
      if (instruction.handIndex != null && targetBoardPosition != null) {
        var cardNode = gameLayer.getBottomDeckLayer().cardNodes[instruction.handIndex];

        gameLayer.getAltPlayer().showPath([cardNode.getPosition(), targetScreenPosition], true, true, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
        gameLayer.getMyPlayer().requestShowPathsLocked(this.showPathsLockId);
      }

      // If replacing a card, show an instructional ray to the replace node
      if (instruction.handIndex != null && instruction.expectedActionType == SDK.ReplaceCardFromHandAction.type) {
        var cardNode = gameLayer.getBottomDeckLayer().cardNodes[instruction.handIndex];
        const replaceNode = gameLayer.getBottomDeckLayer().getReplaceNode();

        gameLayer.getAltPlayer().showPath([cardNode.getPosition(), replaceNode.getPosition()], true, true, CONFIG.INSTRUCTIONAL_UI_INITIAL_OPACITY);
        gameLayer.getMyPlayer().requestShowPathsLocked(this.showPathsLockId);
      }
    }
  },

  _updateHighlightedTilesToOpacity(opacity) {
    const highlightedTiles = this._currentHighlightedTiles;
    if (highlightedTiles != null && highlightedTiles.length > 0) {
      _.each(highlightedTiles, (tile) => {
        tile.stopAllActions();

        const pulsateAction = cc.repeatForever(cc.sequence(
          cc.fadeTo(1.0, opacity),
          cc.fadeTo(1.0, 150),
        ));
        const fadeToPulsateAction = cc.sequence(
          cc.fadeTo(0.1, opacity),
          pulsateAction,
        );
        fadeToPulsateAction.setTag(CONFIG.FADE_TAG);
        tile.runAction(fadeToPulsateAction);
      });
    }
  },

  _cleanupHighlightedTiles() {
    const highlightedTiles = this._currentHighlightedTiles;
    if (highlightedTiles != null && highlightedTiles.length > 0) {
      this._currentHighlightedTiles = [];

      const scene = Scene.getInstance();
      const gameLayer = scene && scene.getGameLayer();
      if (gameLayer != null) {
        gameLayer.getTileLayer().removeTilesWithFade(highlightedTiles);
      }
    }
  },

  _cleanupCurrentInstruction() {
    this._cleanupFXForCurrentInstruction();
    this._cleanupUIForCurrentInstruction();
    this._cleanupCurrentInstructionLabels();
    this._currentInstructionShowing = null;
  },

  _cleanupFXForCurrentInstruction() {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      // remove any fx for instruction
      if (this._fxNodesForCurrentInstruction != null && this._fxNodesForCurrentInstruction.length > 0) {
        const fxForCurrentInstruction = this._fxNodesForCurrentInstruction;
        this._fxNodesForCurrentInstruction = [];
        for (let i = 0, il = fxForCurrentInstruction.length; i < il; i++) {
          const fxSprite = fxForCurrentInstruction[i];
          if (fxSprite != null) {
            fxSprite.destroy(CONFIG.TUTORIAL_INSTRUCTION_FX_FADE_DURATION);
          }
        }
      }

      if (this._hidingLightsForCurrentInstruction) {
        this._hidingLightsForCurrentInstruction = false;
        gameLayer.getBattleMap().showLights(CONFIG.TUTORIAL_INSTRUCTION_FX_FADE_DURATION);
      }
    }
  },

  _cleanupUIForCurrentInstruction() {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();

    // if there's no longer a game layer this shouldn't be needed, but this is in case we ever persist GL
    if (gameLayer != null) {
      // remove any previously shown path and target
      gameLayer.getAltPlayer().removePath();
      gameLayer.getAltPlayer().removeTargetTile();

      // Allow player to show paths again
      gameLayer.getMyPlayer().requestShowPathsUnlocked(this.showPathsLockId);

      // remove highlighting a card in hand if one is required for this instruction
      if (this._currentInstructionShowing != null && this._currentInstructionShowing.handIndex != null) {
        const cardNode = gameLayer.getBottomDeckLayer().getCardNodes()[this._currentInstructionShowing.handIndex];
        cardNode.removeInjectedVisualStateTagById(this._cardToPlayInjectedId);
      }

      // TODO: comment
      this._targetEnemySprite.runAction(cc.fadeOut(0.1));
      this._targetFriendlySprite.runAction(cc.fadeOut(0.1));

      // remove any instructional highlights
      gameLayer.removeTagWithIdFromAllEntities(this.instructionalGlowTagId);

      // Any visual state tags that need to be applied (just readiness for now
      gameLayer.removeTagWithIdFromAllEntities(this._removeReadinessInjectedId);

      // Cleanup old tile highlights
      this._cleanupHighlightedTiles();

      // cleanup any persistent instruction arrows
      for (let i = 0; i < this._instructionalArrows.length; i++) {
        this._instructionalArrows[i].destroy(CONFIG.FADE_FAST_DURATION);
      }
    }
  },

  _cleanupCurrentInstructionLabels() {
    this._cleanupCurrentInstructionLabelTimeouts();
    this._delayNextInstructionLabel = false;

    if (this._currentInstructionLabels && this._currentInstructionLabels.length > 0) {
      for (let i = 0; i < this._currentInstructionLabels.length; i++) {
        const instructionLabel = this._currentInstructionLabels[i];
        if (instructionLabel.reshowTimeoutID) {
          clearTimeout(instructionLabel.reshowTimeoutID);
          instructionLabel.reshowTimeoutID = undefined;
        }
        instructionLabel.entityNode = null;
      }
      this._currentInstructionLabels = [];
    }

    if (this._instructionNodesForCurrentInstruction != null) {
      for (const key in this._instructionNodesForCurrentInstruction) {
        const speechNode = this._instructionNodesForCurrentInstruction[key];
        speechNode.stopShowingIfAble();
      }
      this._instructionNodesForCurrentInstruction = {};
    }

    this._currentInstructionLabel = null;
  },

  _cleanupCurrentInstructionLabelTimeouts() {
    if (this._showNextInstructionLabelTimeoutId) {
      clearTimeout(this._showNextInstructionLabelTimeoutId);
      this._showNextInstructionLabelTimeoutId = null;
    }

    if (this._currentInstructionLabelDelayTimeoutId) {
      clearTimeout(this._currentInstructionLabelDelayTimeoutId);
      this._currentInstructionLabelDelayTimeoutId = null;
    }
  },

  _getIsCurrentInstructionLooping() {
    if (this._currentInstructionLabel == null) {
      return false;
    }
    const currentInstructionLabelIndex = this._currentInstructionLabels.indexOf(this._currentInstructionLabel);
    return this._currentInstructionLabel.triggersInstructionIndex == currentInstructionLabelIndex;
  },

  _showNextInstructionLabel() {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();

    if (gameLayer != null) {
      // clear any timeouts
      this._cleanupCurrentInstructionLabelTimeouts();

      let nextInstructionLabel;
      if (this._currentInstructionLabels && this._currentInstructionLabels.length) {
        if (this._currentInstructionLabel == null) {
          // Show the first instruction label
          nextInstructionLabel = this._currentInstructionLabels[0];
        } else {
          nextInstructionLabel = this._currentInstructionLabels[this._currentInstructionLabel.triggersInstructionIndex];
        }
      }

      this._currentInstructionLabel = nextInstructionLabel;

      if (nextInstructionLabel) {
        if (nextInstructionLabel.duration == null) {
          if (nextInstructionLabel.isSpeech) {
            nextInstructionLabel.duration = CONFIG.GENERAL_SPEECH_DURATION;
          } else {
            nextInstructionLabel.duration = CONFIG.INSTRUCTIONAL_SHORT_DURATION;
          }
        }

        // TODO: better solution for persistent nodes
        if (nextInstructionLabel.isPersistent) {
          nextInstructionLabel.duration = 10000;
        }

        // Default to a sequence that loops final instruction
        if (nextInstructionLabel.triggersInstructionIndex === undefined) {
          const instructionLabelIndex = this._currentInstructionLabels.indexOf(nextInstructionLabel);
          if (instructionLabelIndex != this._currentInstructionLabels.length - 1) {
            // Not the last one, play the next
            nextInstructionLabel.triggersInstructionIndex = instructionLabelIndex + 1;
          } else {
            // If it's my turn then loop, otherwise don't
            if (gameLayer.getMyPlayer().isCurrentPlayer) {
              nextInstructionLabel.triggersInstructionIndex = instructionLabelIndex;
            } else {
              nextInstructionLabel.triggersInstructionIndex = null;
            }
          }
        }

        if (nextInstructionLabel.delay == null) {
          nextInstructionLabel.delay = CONFIG.INSTRUCTIONAL_DEFAULT_DELAY;
        }

        // Set up showing the label after it's specified delay
        let nextInstructionLabelDelay = this._currentInstructionLabel.delay * 1000.0;
        if (this._delayNextInstructionLabel) {
          nextInstructionLabelDelay += CONFIG.INSTRUCTIONAL_DISMISSED_LOOP_DELAY * 1000.0;
        }
        this._delayNextInstructionLabel = false;
        this._currentInstructionLabelDelayTimeoutId = setTimeout(this._showInstructionLabel.bind(this, this._currentInstructionLabel), nextInstructionLabelDelay);

        if (nextInstructionLabel._unfreezeSelectection && gameLayer.getPlayerSelectionLocked()) {
          gameLayer.requestPlayerSelectionUnlocked(this.playerSelectionLockedId);
          this._showUIForInstruction(this._currentInstructionShowing);
        }
      }

      // If done showing agents instruction labels, perform it's action
      if (!nextInstructionLabel && !gameLayer.getMyPlayer().isCurrentPlayer) {
        this.executeAgentSDKAction();
        // Clear the current instruction labels as consumed
        this._currentInstructionLabels = [];
      }
    }
  },

  // Define a general function for showing instructional labels
  _showInstructionLabel(instructionLabel) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();

    // clear any timeouts
    this._cleanupCurrentInstructionLabelTimeouts();

    // fade player details back in as needed
    if (this._myPlayerDetailsHidden) {
      this._myPlayerDetailsHidden = false;
      $('.my-player .mana, .my-player .user-details').fadeIn(CONFIG.FADE_FAST_DURATION * 1000.0);
    }
    if (this._opponentPlayerDetailsHidden) {
      this._opponentPlayerDetailsHidden = false;
      $('.opponent-player .mana, .opponent-player .user-details').fadeIn(CONFIG.FADE_FAST_DURATION * 1000.0);
    }

    if (!instructionLabel || !this._currentInstructionLabels || !gameLayer) {
      return;
    }

    const instructionLabelIndex = this._currentInstructionLabels.indexOf(instructionLabel);
    const { label } = instructionLabel;
    if (!label) {
      throw new Error('Tutorial:onInstructionTriggered - Attempt to display instruction label without label text');
    }
    //
    if (instructionLabel.duration == null) {
      if (instructionLabel.isSpeech) {
        instructionLabel.duration = CONFIG.GENERAL_SPEECH_DURATION;
      } else {
        instructionLabel.duration = CONFIG.INSTRUCTIONAL_SHORT_DURATION;
      }
    }

    // TODO: better solution for persistent nodes
    if (instructionLabel.isPersistent) {
      instructionLabel.duration = 10000;
    }

    if (instructionLabel.delay == null) {
      instructionLabel.delay = 0;
    }

    if (instructionLabel.isSpeech) {
      // Show a general speech node
      let player;
      if (instructionLabel.isOpponent) {
        player = gameLayer.getOpponentPlayer();
      } else {
        player = gameLayer.getMyPlayer();
      }
      gameLayer.showSpeechForPlayer(player, instructionLabel.label, null, instructionLabel.duration, false, instructionLabel.yPosition, instructionLabel.isPersistent);
      const generalCard = SDK.GameSession.getInstance().getGeneralForPlayerId(player.getSdkPlayer().getPlayerId());
      const generalNode = gameLayer.getNodeForSdkCard(generalCard);
      const generalSpeechNode = gameLayer.getOrCreateSpeechNodeForSdkCard(generalCard);
      this._instructionNodesForCurrentInstruction[instructionLabelIndex] = generalSpeechNode;
    } else {
      // Show an instruction node
      const { position } = instructionLabel;
      let instructionEntityNode = instructionLabel.entityNode;
      if (position && !instructionEntityNode && Number.isInteger(position.x) && Number.isInteger(position.y)) {
        // If we have a position and no entity node, get one and store it on the instruction (if one exists)
        // - this allows the isntruction to stick to a unit
        instructionEntityNode = gameLayer.getEntityNodeAtBoardPosition(position.x, position.y, true, true);
        instructionLabel.entityNode = instructionEntityNode;
      }

      // Now for showing the label
      let instructionNode;
      var carrotDirection;
      let isNotDismissable = false;
      // Set carrot direction if needed
      if (instructionLabel.focusUp) {
        carrotDirection = InstructionNode.DIRECTION_UP;
      } else if (instructionLabel.focusLeft) {
        carrotDirection = InstructionNode.DIRECTION_LEFT;
      } else if (instructionLabel.focusRight) {
        carrotDirection = InstructionNode.DIRECTION_RIGHT;
      } else if (instructionLabel.focusDown) {
        carrotDirection = InstructionNode.DIRECTION_DOWN;
      }
      if (instructionLabel.isNotDismissable) {
        isNotDismissable = instructionLabel.isNotDismissable;
      }
      if (instructionEntityNode) {
        instructionNode = gameLayer.showInstructionForSdkNode(instructionEntityNode, label, null, instructionLabel.duration, isNotDismissable, carrotDirection);
      } else if (instructionLabel.positionAtReplace) {
        const replaceNode = gameLayer.getBottomDeckLayer().getReplaceNode();
        const replacePosition = replaceNode.getPosition();
        replacePosition.y += replaceNode.height * 0.55;
        instructionNode = gameLayer.showInstructionAtPosition(replacePosition, label, null, instructionLabel.duration, isNotDismissable, carrotDirection);
      } else if (instructionLabel.positionAtSignatureSpell) {
        let signatureCardNode;
        var instructionDirection;
        if (this._lesson.userIsPlayer1) {
          signatureCardNode = gameLayer.getPlayer1Layer().getSignatureCardNode();
          instructionDirection = InstructionNode.DIRECTION_LEFT;
        } else {
          signatureCardNode = gameLayer.getPlayer2Layer().getSignatureCardNode();
          instructionDirection = InstructionNode.DIRECTION_RIGHT;
        }
        instructionNode = gameLayer.showInstructionForSdkNode(signatureCardNode, label, null, instructionLabel.duration, isNotDismissable, instructionDirection);
      } else if (instructionLabel.positionAtPlayerArtifactIndex != null) {
        let artifactNodes;
        if (this._lesson.userIsPlayer1) {
          artifactNodes = gameLayer.getPlayer1ArtifactNodes();
        } else {
          artifactNodes = gameLayer.getPlayer2ArtifactNodes();
        }
        const artifactNode = artifactNodes && artifactNodes[instructionLabel.positionAtPlayerArtifactIndex];
        if (artifactNode == null) {
          throw new Error(`TutorialLayout._showInstructionLabel: Attempt to position at nonexistent artifact index ${instructionLabel.positionAtPlayerArtifactIndex}`);
        }
        const artifactPosition = artifactNode.getPosition();
        const artifactContentSize = artifactNode.getContentSize();
        const artifactInstructionPosition = cc.p(
          artifactPosition.x + artifactContentSize.width,
          artifactPosition.y,
        );
        var carrotDirection;
        if (this._lesson.userIsPlayer1) {
          carrotDirection = InstructionNode.DIRECTION_LEFT;
        } else {
          carrotDirection = InstructionNode.DIRECTION_RIGHT;
        }
        instructionNode = gameLayer.showInstructionAtPosition(artifactInstructionPosition, label, null, instructionLabel.duration, false, carrotDirection);
      } else if (instructionLabel.positionAtHandIndex != null) {
        const bottomDeckCardNode = gameLayer.getBottomDeckLayer().getCardNodes()[instructionLabel.positionAtHandIndex];
        instructionNode = gameLayer.showInstructionForSdkNode(bottomDeckCardNode, label, null, instructionLabel.duration, isNotDismissable, InstructionNode.DIRECTION_DOWN);
      } else if (instructionLabel.positionAtManaIndex != null) {
        var playerFramePosition;
        let manaScreenPosition;
        if (this._lesson.userIsPlayer1) {
          playerFramePosition = UtilsEngine.getPlayer1FramePosition();
          manaScreenPosition = {
            x: playerFramePosition.x + 170.0 + (instructionLabel.positionAtManaIndex * 32.0),
            y: playerFramePosition.y - 130.0 + (instructionLabel.positionAtManaIndex * 7.0),
          };
        } else {
          playerFramePosition = UtilsEngine.getPlayer2FramePosition();
          manaScreenPosition = {
            x: playerFramePosition.x - 170.0 - (instructionLabel.positionAtManaIndex * 32.0),
            y: playerFramePosition.y - 130.0 + (instructionLabel.positionAtManaIndex * 7.0),
          };
        }

        instructionNode = gameLayer.showInstructionAtPosition(manaScreenPosition, label, null, instructionLabel.duration, isNotDismissable, InstructionNode.DIRECTION_UP);
      } else if (instructionLabel.positionAtEndTurn) {
        const cardsInHandEndPosition = UtilsEngine.getCardsInHandEndPosition();
        const submitTurnScreenTCPosition = {
          x: cardsInHandEndPosition.x + 105.0,
          y: cardsInHandEndPosition.y + 70.0,
        };
        instructionNode = gameLayer.showInstructionAtPosition(submitTurnScreenTCPosition, label, null, instructionLabel.duration, isNotDismissable, InstructionNode.DIRECTION_DOWN);
      } else if (instructionLabel.positionAtMyHealth) {
        if (!this._myPlayerDetailsHidden) {
          // fade my player details out so it doesn't overlap
          this._myPlayerDetailsHidden = true;
          $('.my-player .mana, .my-player .user-details').fadeOut(CONFIG.FADE_FAST_DURATION * 1000.0);
        }

        var playerFramePosition;
        var generalHealthScreenPosition;
        var instructionDirection;
        if (this._lesson.userIsPlayer1) {
          playerFramePosition = UtilsEngine.getPlayer1FramePosition();
          instructionDirection = InstructionNode.DIRECTION_LEFT;
          generalHealthScreenPosition = {
            x: playerFramePosition.x + 130.0,
            y: playerFramePosition.y - 130.0,
          };
        } else {
          playerFramePosition = UtilsEngine.getPlayer2FramePosition();
          instructionDirection = InstructionNode.DIRECTION_RIGHT;
          generalHealthScreenPosition = {
            x: playerFramePosition.x - 130.0,
            y: playerFramePosition.y - 130.0,
          };
        }
        instructionNode = gameLayer.showInstructionAtPosition(generalHealthScreenPosition, label, null, instructionLabel.duration, isNotDismissable, instructionDirection);
      } else if (instructionLabel.positionAtEnemyHealth) {
        if (!this._opponentPlayerDetailsHidden) {
          // fade opponent player details out so it doesn't overlap
          this._opponentPlayerDetailsHidden = true;
          $('.opponent-player .mana, .opponent-player .user-details').fadeOut(CONFIG.FADE_FAST_DURATION * 1000.0);
        }

        var playerFramePosition;
        var generalHealthScreenPosition;
        var instructionDirection;
        if (this._lesson.userIsPlayer1) {
          playerFramePosition = UtilsEngine.getPlayer2FramePosition();
          instructionDirection = InstructionNode.DIRECTION_RIGHT;
          generalHealthScreenPosition = {
            x: playerFramePosition.x - 130.0,
            y: playerFramePosition.y - 130.0,
          };
        } else {
          playerFramePosition = UtilsEngine.getPlayer1FramePosition();
          instructionDirection = InstructionNode.DIRECTION_LEFT;
          generalHealthScreenPosition = {
            x: playerFramePosition.x + 130.0,
            y: playerFramePosition.y - 130.0,
          };
        }
        instructionNode = gameLayer.showInstructionAtPosition(generalHealthScreenPosition, label, null, instructionLabel.duration, isNotDismissable, instructionDirection);
      } else {
        const adjustedPosition = position;
        instructionNode = gameLayer.showInstructionOverTile(adjustedPosition, label, null, instructionLabel.duration, isNotDismissable, carrotDirection);
      }
      if (instructionNode) {
        // Store the speech node in case we want to tear it down early
        this._instructionNodesForCurrentInstruction[instructionLabelIndex] = instructionNode;

        // Set a tag in case we need to identify this node later
        instructionLabel._tag = `InstructionLabel${instructionLabelIndex}`;
        instructionNode.setTag(instructionLabel._tag);
      }
    }

    // Show any instruction arrows attached to this label
    if (instructionLabel.instructionArrowPositions) {
      for (let i = 0; i < instructionLabel.instructionArrowPositions.length; i++) {
        const instructionArrowPosition = instructionLabel.instructionArrowPositions[i];
        const targetEntityNode = gameLayer.getEntityNodeAtBoardPosition(instructionArrowPosition.x, instructionArrowPosition.y, true, true);
        if (targetEntityNode) {
          gameLayer.showInstructionalArrowForEntityNode(targetEntityNode);
        } else {
          gameLayer.showInstructionalArrowForBoardPosition(instructionArrowPosition);
        }
      }
    }
  },

  onSelectionChanged(event) {
    const selection = event && event.selection;
    if (selection instanceof EntityNode) {
      this._onSelectEntityNodeStart(selection);
    } else if (selection instanceof BottomDeckCardNode) {
      this._onSelectCardStart(selection);
    } else {
      // restore opacity of highlighted tiles
      this._updateHighlightedTilesToOpacity(CONFIG.INSTRUCTIONAL_UI_HIGHLIGHTED_OPACITY);
    }
  },

  _onSelectEntityNodeStart(entityNodeSelected) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();

    if (entityNodeSelected != null && this._currentInstructionShowing && this._currentInstructionShowing.sourcePosition) {
      // Check if they have selected the card that is the source of current instruction
      if (entityNodeSelected.getBoardPosition().x == this._currentInstructionShowing.sourcePosition.x && entityNodeSelected.getBoardPosition().y == this._currentInstructionShowing.sourcePosition.y) {
        // We have selected the source entity node
        // Show an instructional arrow on target if there is one
        if (this._currentInstructionShowing.targetPosition) {
          const targetEntityNode = gameLayer.getEntityNodeAtBoardPosition(this._currentInstructionShowing.targetPosition.x, this._currentInstructionShowing.targetPosition.y, true, true);
          if (targetEntityNode) {
            gameLayer.showInstructionalArrowForEntityNode(targetEntityNode);
          } else {
            // Highlight the target tile the player should focus on
            if (this._currentInstructionShowing.targetPosition) {
              gameLayer.showInstructionalArrowForBoardPosition(this._currentInstructionShowing.targetPosition);
            }
          }
        }
      }
    }
  },

  _onSelectCardStart(selectedCard) {
    const scene = Scene.getInstance();
    const gameLayer = scene && scene.getGameLayer();

    if (selectedCard != null && this._currentInstructionShowing && this._currentInstructionShowing.handIndex != null && this._currentInstructionShowing.targetPosition) {
      const targetEntityNode = gameLayer.getEntityNodeAtBoardPosition(this._currentInstructionShowing.targetPosition.x, this._currentInstructionShowing.targetPosition.y, true, true);
      if (targetEntityNode) {
        gameLayer.showInstructionalArrowForEntityNode(targetEntityNode);
      } else {
        gameLayer.showInstructionalArrowForBoardPosition(this._currentInstructionShowing.targetPosition);
      }
    }
  },

  onChallengeReset(e) {
    this._showChallengeLost();
  },

  _showChallengeLost() {
    const challengeLostView = new TutorialChallengeLostView({ model: new Backbone.Model({ challenge: this._lesson }) });
    challengeLostView.listenToOnce(challengeLostView, 'retry_challenge', this.onChallengeRetry.bind(this));
    this.customOverlayRegion.show(challengeLostView);
  },

  onChallengeRetry() {
    Analytics.track('challenge restart', {
      category: 'Challenge',
      challenge_type: this._lesson.type,
    }, {
      label_key: 'challenge_type',
    });

    this.customOverlayRegion.empty();

    // Behind the scenes perform the sdk rollback
    this._lesson.challengeRollback();
    this._lesson.getOpponentAgent().currentTurnIndex = 0;
  },

  _showChallengeStart() {
    const challengeStartView = new TutorialChallengeStartView({ model: new Backbone.Model({ challenge: this._lesson }) });
    challengeStartView.listenToOnce(challengeStartView, 'start_challenge', this.onChallengeStart.bind(this));
    this.customOverlayRegion.show(challengeStartView);
  },

  onChallengeStart() {
    this.customOverlayRegion.empty();
  },

  onInstructionNodePressed(e) {
    if (this._currentInstructionLabels && this._currentInstructionLabel && this._getIsCurrentInstructionLooping()) {
      this._delayNextInstructionLabel = true;
    }
  },

  onUIDoneShowing(e) {
    if (this._currentInstructionLabel && e.tag == this._currentInstructionLabel.label) {
      this._showNextInstructionLabel();
    }
  },

  executeAgentActions() {
    if (this._lesson.isChallengeLost) {
      return;
    }

    // Find if there were any instruction labels
    let instructionLabels = null;
    const opponentAgent = this._lesson.getOpponentAgent();
    for (let i = 0; i < opponentAgent.currentActions.length; i++) {
      const currentAction = opponentAgent.currentActions[i];
      if (currentAction.type == AgentActions._showInstructionLabelsActionType) {
        instructionLabels = currentAction.instructionLabels;
        break;
      }
    }

    if (instructionLabels) {
      this._currentInstructionLabels = instructionLabels;
      this._showNextInstructionLabel();
    } else {
      this.executeAgentSDKAction();
    }
  },

  executeAgentSDKAction() {
    // always stop attempting to execute previous
    this.stopExecutingAgentAction();

    // Agent SDK action is the last hard action in it's queue, if there is none then it's end turn
    const opponentAgent = this._lesson.getOpponentAgent();
    const finalAgentAction = opponentAgent.currentActions[opponentAgent.currentActions.length - 1];
    if (!finalAgentAction || finalAgentAction.isSoft) {
      this._opponentAgentTimeoutId = setTimeout(() => {
        SDK.GameSession.getInstance().submitExplicitAction(SDK.GameSession.getInstance().actionEndTurn());
      }, opponentAgent.delayBetweenActions);
    } else {
      this._opponentAgentTimeoutId = setTimeout(((finalAgentAction) => {
        SDK.GameSession.current().executeAction(AgentActions.createSDKActionFromAgentAction(opponentAgent, finalAgentAction));
      }).bind(this, finalAgentAction), opponentAgent.delayBetweenActions);
    }
  },

  stopExecutingAgentAction() {
    if (this._opponentAgentTimeoutId != null) {
      clearTimeout(this._opponentAgentTimeoutId);
      this._opponentAgentTimeoutId = null;
    }
  },

  /* endregion EVENTS */

});

module.exports = TutorialLayout;
