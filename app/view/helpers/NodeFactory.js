const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const UtilsEngine = require('app/common/utils/utils_engine');
const SDK = require('app/sdk');

/** **************************************************************************
Node/sprite creation factory.
 *************************************************************************** */

const NodeFactory = {

  entries: {},
  utilPositionA: cc.p(),
  utilPositionB: cc.p(),

  /**
   * Maps a class to a string type.
   * @param {String} type
   * @param {Class} cls
   */
  setByType(type, cls) {
    if (!this.entries[type]) {
      this.entries[type] = cls;
    } else {
      throw new Error(`NodeFactory::setByType is trying to remap an existing entry for${type}`);
    }
  },

  /**
   * Returns a class based on a string type.
   * @param {String} type
   * @returns {Class} class (not an instance!)
   */
  getByType(type) {
    return this.entries[type];
  },

  /**
   * Creates fx from an array of fx option objects, then adds them to the game.
   * Note: if you need to create, do something, then add, use the "createFX" and "addFX" methods.
   * @param {Array|Object} fx single or array of per fx options objects
   * @param {Object} [options] options to be applied to all fx
   * @return {Array} array of fx sprites created
   * @example
   * The fx object is passed to the "create" method of the fx class, and is structured as follows:
   * fx = {
   *  // any options specific to the fx sprite class are valid options in this object
   *  // the fx sprite class's "create" method will check for and set them
   *
   *  // the following options are specific to this method
   *
   *  // the type of fx sprite to create, defaults to FXSprite
   *  // note that each fx sprite class has a "type" property
   *  // and this should match that value
   *  // this method may also do some specific setup
   *  // based on the type of fx sprite class
   *  type: "Explosion",
   *
   *  // offset the start/end points individually in absolute pixels
   *  targetOffset: { x: 20.0, y: 0.0 },
   *  sourceOffset: { x: 0.0, y: 20.0 },
   *
   *  // offset both start/end points in absolute pixels
   *  offset: { x: 0.0, y: 0.0 },
   *
   *  // add impact fx that will automatically be created when fx impacts
   *  // impact fx is recursive, so it may have all the same options listed here
   *  // note that this only works with fx sprites of a class that calls the impact
   *  // such as projectile, energy beam, and chain
   *  impactFX: { spriteIdentifier: "texture_or_animation_name", type: "Explosion", fx: (sub-fx for light) },
   *
   *  // the following options are also specific to this method
   *  // but are rarely needed (if ever)
   *  // whether fx should start at source and end at to (defaults to start and end at to)
   *  sourceToTarget: true,
   *  // or whether fx should start at to and end at source (defaults to start and end at to)
   *  targetToSource: true
   *  // or whether fx should start and end at source (defaults to start and end at to)
   *  source: true
   *
   *  // for sprites destined for the game layer, you can also pass the name of the layer to add the fx to
   *  // each type of sprite has a default, so usually you won't need this
   *  layerName: "middlegroundLayer",
   *
   *  // the name of the layer to add the fx to when it finishes animating
   *  destinationLayerName: "backgroundLayer",
   * }
   *
   * The options object is structured as follows:
   * options = {
   *  // start position of options in board coordinates
   *  // optional, as long as targetBoardPosition is provided
   *  sourceBoardPosition: { x: 0, y: 0 },
   *
   *  // end position of options in board coordinates
   *  // optional, as long as sourceBoardPosition is provided
   *  targetBoardPosition: { x: 0, y: 0 },
   *
   *  // whether to allow max num fx created limit to be exceeded
   *  noLimit: false
   *
   *  // single object or array of objects
   *  // where each object corresponds to options for an individual fx
   *  // note that these objects can be nested to create sub-fx
   *  // ex: explosions should have a nested light fx
   *  fx: {...} or [ {...}, {...}, ... ],
   * }
   */
  createFX(fx, options) {
    const fxSprites = [];

    if (fx) {
      if (!_.isArray(fx)) { fx = [fx]; }
      const numFX = fx.length;
      if (numFX > 0) {
        options || (options = {});

        // get position data from options
        let sourceBoardPosition = options.absolutePosition || options.sourceBoardPosition;
        let targetBoardPosition = options.absolutePosition || options.targetBoardPosition;
        let needsConversion = true;

        if (!sourceBoardPosition) {
          if (!targetBoardPosition) {
            sourceBoardPosition = this.utilPositionA;
            targetBoardPosition = this.utilPositionB;
            needsConversion = false;
          } else {
            sourceBoardPosition = targetBoardPosition;
          }
        }
        if (!targetBoardPosition) {
          if (!sourceBoardPosition) {
            sourceBoardPosition = this.utilPositionA;
            targetBoardPosition = this.utilPositionB;
            needsConversion = false;
          } else {
            targetBoardPosition = sourceBoardPosition;
          }
        }

        // grid and offset positions
        let sourceScreenPosition;
        let targetScreenPosition;

        if (needsConversion) {
          if (!SDK.GameSession.current().getBoard().isOnBoard(sourceBoardPosition)) { sourceBoardPosition = targetBoardPosition; }
          if (!SDK.GameSession.current().getBoard().isOnBoard(targetBoardPosition)) { targetBoardPosition = sourceBoardPosition; }

          sourceScreenPosition = UtilsEngine.transformBoardToTileMap(sourceBoardPosition);
          targetScreenPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
        } else {
          sourceScreenPosition = sourceBoardPosition;
          targetScreenPosition = targetBoardPosition;
        }

        for (let i = 0; i < numFX; i++) {
          this._createFXSprites(fx[i], options, fxSprites, sourceBoardPosition, targetBoardPosition, sourceScreenPosition, targetScreenPosition, needsConversion);
        }
      }
    }

    return fxSprites;
  },
  _createFXSprites(fx, options, fxSprites, sourceBoardPosition, targetBoardPosition, sourceScreenPosition, targetScreenPosition, needsPositioning) {
    let numSpritesToCreate;

    // when fx is not already created
    if (fx instanceof cc.Node) {
      numSpritesToCreate = 1;

      if (needsPositioning) {
        startScreenPosition = sourceScreenPosition;
        endScreenPosition = targetScreenPosition;
      }
    } else {
      if (fx) {
        if (typeof fx === 'string') {
          // check string for auto typing
          let ext;
          const lastDotIndex = fx.lastIndexOf('.');
          if (lastDotIndex !== -1) {
            ext = fx.slice(lastDotIndex + 1);
          }
          if (ext === 'plist') {
            fx = { plistFile: fx, type: 'Particles' };
          } else {
            fx = { spriteIdentifier: fx };
          }
        } else if (fx.plistFile || fx.plist) {
          // ensure plists are always set to particles
          fx.type || (fx.type = 'Particles');
        }
      }

      numSpritesToCreate = fx.copies || options.copies || 1;

      // override positions with absolute when present
      if (fx.absolutePosition) {
        const absoluteScreenPosition = UtilsEngine.transformBoardToTileMap(fx.absolutePosition);
        sourceScreenPosition = absoluteScreenPosition;
        targetScreenPosition = absoluteScreenPosition;
      } else {
        // base offsets are applied to both source and target
        const fxOffset = fx.offset;
        if (fxOffset) {
          sourceScreenPosition = cc.p(sourceScreenPosition.x + fxOffset.x, sourceScreenPosition.y + fxOffset.y);
          if (targetScreenPosition !== sourceScreenPosition) {
            targetScreenPosition = cc.p(targetScreenPosition.x + fxOffset.x, targetScreenPosition.y + fxOffset.y);
          }
        }
        const optionsOffset = options.offset;
        if (optionsOffset) {
          sourceScreenPosition = cc.p(sourceScreenPosition.x + optionsOffset.x, sourceScreenPosition.y + optionsOffset.y);
          if (targetScreenPosition !== sourceScreenPosition) {
            targetScreenPosition = cc.p(targetScreenPosition.x + optionsOffset.x, targetScreenPosition.y + optionsOffset.y);
          }
        }

        // check source/target offsets
        const dx = targetScreenPosition.x - sourceScreenPosition.x;
        var sourceScreenOffset = fx.sourceOffset;
        if (sourceScreenOffset && dx < 0) {
          sourceScreenOffset = cc.p(sourceScreenOffset.x * -1, sourceScreenOffset.y);
        }
        var targetScreenOffset = fx.targetOffset;
        if (targetScreenOffset && dx > 0) {
          targetScreenOffset = cc.p(targetScreenOffset.x * -1, targetScreenOffset.y);
        }
      }

      // source/target direction
      const { atSource } = fx;
      const { targetToSource } = fx;
      let { sourceToTarget } = fx;

      // basic creation
      const { type } = fx;
      var fxSpriteClass = this.getByType(type) || this.getByType('FXSprite');

      // do any setup specific to the fx type here
      if (type === 'Projectile' || type === 'EnergyBeam') {
        sourceToTarget = true;
      } else if (type === 'Chain') {
        sourceToTarget = true;
      } else if (type === 'Flocking') {
        sourceToTarget = true;
      }

      // set positions
      var startBoardPosition;
      var endBoardPosition;
      var startScreenPosition;
      var endScreenPosition;
      var startScreenOffset;
      var endScreenOffset;
      if (sourceToTarget) {
        startBoardPosition = sourceBoardPosition;
        endBoardPosition = targetBoardPosition;
        startScreenPosition = sourceScreenPosition;
        endScreenPosition = targetScreenPosition;
        startScreenOffset = sourceScreenOffset;
        endScreenOffset = targetScreenOffset;
      } else if (targetToSource) {
        startBoardPosition = targetBoardPosition;
        endBoardPosition = sourceBoardPosition;
        startScreenPosition = targetScreenPosition;
        endScreenPosition = sourceScreenPosition;
        startScreenOffset = targetScreenOffset;
        endScreenOffset = sourceScreenOffset;
      } else if (atSource) {
        startBoardPosition = endBoardPosition = sourceBoardPosition;
        startScreenPosition = endScreenPosition = sourceScreenPosition;
        startScreenOffset = endScreenOffset = sourceScreenOffset;
      } else {
        startBoardPosition = endBoardPosition = targetBoardPosition;
        startScreenPosition = endScreenPosition = targetScreenPosition;
        startScreenOffset = endScreenOffset = targetScreenOffset;
      }
    }

    // create sprites
    for (let i = 0; i < numSpritesToCreate; i++) {
      this._createFXSprite(fxSpriteClass, fx, options, fxSprites, startBoardPosition, endBoardPosition, startScreenPosition, endScreenPosition, startScreenOffset, endScreenOffset);
    }
  },
  _createFXSprite(fxSpriteClass, fx, options, fxSprites, startBoardPosition, endBoardPosition, startScreenPosition, endScreenPosition, startScreenOffset, endScreenOffset) {
    let fxSprite;

    if (fx instanceof cc.Node) {
      fxSprite = fx;
    } else if (fxSpriteClass) {
      fxSprite = (fxSpriteClass).create(fx);

      // set z order
      // this does not do anything unless the code adding the sprite respects the preset zOrder
      // normally, you'd want to set the zOrder after adding the sprite to a parent node
      if (typeof fx.zOrder === 'number') {
        fxSprite.setLocalZOrder(fx.zOrder);
      } else if (typeof options.zOrder === 'number') {
        fxSprite.setLocalZOrder(options.zOrder);
      }

      // set layer names
      // this only affects fx sprites being added to battle layer
      fxSprite.layerName = fx.layerName || options.layerName;
      fxSprite.destinationLayerName = fx.destinationLayerName || options.destinationLayerName;
      if (startScreenOffset) {
        fxSprite.setPosition(startScreenPosition.x + startScreenOffset.x * (endScreenPosition.x - startScreenPosition.x > 0 ? -1 : 1), startScreenPosition.y + startScreenOffset.y);
      } else {
        fxSprite.setPosition(startScreenPosition);
      }
      if (_.isFunction(fxSprite.setSourceBoardPosition)) { fxSprite.setSourceBoardPosition(startBoardPosition); }
      if (_.isFunction(fxSprite.setTargetBoardPosition)) { fxSprite.setTargetBoardPosition(endBoardPosition); }
      if (_.isFunction(fxSprite.setSourceScreenPosition)) { fxSprite.setSourceScreenPosition(startScreenPosition, startScreenOffset); }
      if (_.isFunction(fxSprite.setTargetScreenPosition)) { fxSprite.setTargetScreenPosition(endScreenPosition, endScreenOffset); }
    }

    fxSprites.push(fxSprite);
  },
};

module.exports = NodeFactory;
