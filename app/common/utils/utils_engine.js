/** **************************************************************************
UtilsEngine - engine utility methods (don't forget to rebuild before using).
*************************************************************************** */
const _ = require('underscore');

const UtilsEngine = {};
module.exports = UtilsEngine;

const CONFIG = require('../config');
const Logger = require('../logger.coffee');

/**
 * Returns the origin of the static reference window used for layout calculations.
 * @returns {Vec2}
 */
UtilsEngine.getRefWindowOrigin = function () {
  return cc.p(UtilsEngine._refWindowOrigin.x, UtilsEngine._refWindowOrigin.y);
};

/**
 * Returns the size of the static reference window used for layout calculations.
 * @returns {Vec2}
 */
UtilsEngine.getRefWindowSize = function () {
  return cc.size(CONFIG.REF_WINDOW_SIZE.width, CONFIG.REF_WINDOW_SIZE.height);
};

/**
 * Returns the origin of the board in screen space.
 * @returns {Vec2}
 */
UtilsEngine.getScreenBoardOrigin = function () {
  return cc.p(UtilsEngine._screenBoardOrigin.x, UtilsEngine._screenBoardOrigin.y);
};

/**
 * Returns the size of the board in screen space.
 * @returns {cc.Size}
 */
UtilsEngine.getScreenBoardSize = function () {
  return cc.size(UtilsEngine._screenBoardSize.width, UtilsEngine._screenBoardSize.height);
};

/**
 * Returns size of the screen inverted to account for the global scale.
 * @returns {Size}
 */
UtilsEngine.getGSIWinSize = function () {
  return cc.size(UtilsEngine._globalScaleInvertedWinRect.width, UtilsEngine._globalScaleInvertedWinRect.height);
};
/**
 * Returns rect of the screen inverted to account for the global scale.
 * @returns {Rect}
 */
UtilsEngine.getGSIWinRect = function () {
  return cc.rect(UtilsEngine._globalScaleInvertedWinRect);
};

/**
 * Returns width of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinWidth = function () {
  return UtilsEngine._globalScaleInvertedWinRect.width;
};

/**
 * Returns height of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinHeight = function () {
  return UtilsEngine._globalScaleInvertedWinRect.height;
};

/**
 * Returns top side of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinTop = function () {
  return UtilsEngine._globalScaleInvertedWinRect.y + UtilsEngine._globalScaleInvertedWinRect.height;
};

/**
 * Returns bottom side of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinBottom = function () {
  return UtilsEngine._globalScaleInvertedWinRect.y;
};

/**
 * Returns left side of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinLeft = function () {
  return UtilsEngine._globalScaleInvertedWinRect.x;
};

/**
 * Returns right side of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinRight = function () {
  return UtilsEngine._globalScaleInvertedWinRect.x + UtilsEngine._globalScaleInvertedWinRect.width;
};

/**
 * Returns horizontal center of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinCenterX = function () {
  return UtilsEngine._globalScaleInvertedWinRect.x + UtilsEngine._globalScaleInvertedWinRect.width * 0.5;
};

/**
 * Returns vertical center of the screen inverted to account for the global scale.
 * @returns {Number}
 */
UtilsEngine.getGSIWinCenterY = function () {
  return UtilsEngine._globalScaleInvertedWinRect.y + UtilsEngine._globalScaleInvertedWinRect.height * 0.5;
};

/**
 * Returns center position of the screen inverted to account for the global scale.
 * @returns {Vec2}
 */
UtilsEngine.getGSIWinCenterPosition = function () {
  return cc.p(
    UtilsEngine._globalScaleInvertedWinRect.x + UtilsEngine._globalScaleInvertedWinRect.width * 0.5,
    UtilsEngine._globalScaleInvertedWinRect.y + UtilsEngine._globalScaleInvertedWinRect.height * 0.5,
  );
};

/**
 * Returns the starting position of cards in hand relative to the center of the screen and the size of the board.
 * @returns {Vec2}
 */
UtilsEngine.getCardsInHandStartPosition = function () {
  return cc.p(UtilsEngine._cardsInHandStartPosition.x, UtilsEngine._cardsInHandStartPosition.y);
};

/**
 * Returns the css starting position of cards in hand relative to the center of the screen and the size of the board.
 * @returns {Vec2}
 */
UtilsEngine.getCardsInHandStartPositionForCSS = function () {
  return cc.p(UtilsEngine._cardsInHandStartPositionForCSS.x, UtilsEngine._cardsInHandStartPositionForCSS.y);
};

/**
 * Returns the ending position of cards in hand relative to the center of the screen and the size of the board.
 * @returns {Vec2}
 */
UtilsEngine.getCardsInHandEndPosition = function () {
  return cc.p(UtilsEngine._cardsInHandEndPosition.x, UtilsEngine._cardsInHandEndPosition.y);
};

/**
 * Returns the css ending position of cards in hand relative to the center of the screen and the size of the board.
 * @returns {Vec2}
 */
UtilsEngine.getCardsInHandEndPositionForCSS = function () {
  return cc.p(UtilsEngine._cardsInHandEndPositionForCSS.x, UtilsEngine._cardsInHandEndPositionForCSS.y);
};

/**
 * Returns the position of player 1's frame from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer1FramePosition = function () {
  return cc.p(UtilsEngine._player1FramePosition.x, UtilsEngine._player1FramePosition.y);
};

/**
 * Returns the css position of player 1's frame.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer1FramePositionForCSS = function () {
  return cc.p(UtilsEngine._player1FramePositionForCSS.x, UtilsEngine._player1FramePositionForCSS.y);
};

/**
 * Returns the position of player 2's frame from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer2FramePosition = function () {
  return cc.p(UtilsEngine._player2FramePosition.x, UtilsEngine._player2FramePosition.y);
};

/**
 * Returns the css position of player 2's frame.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer2FramePositionForCSS = function () {
  return cc.p(UtilsEngine._player2FramePositionForCSS.x, UtilsEngine._player2FramePositionForCSS.y);
};

/**
 * Returns the position of player 1's own play card from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer1InspectOffBoardCardPosition = function () {
  return cc.p(UtilsEngine._player1InspectOffBoardCardPosition.x, UtilsEngine._player1InspectOffBoardCardPosition.y);
};

/**
 * Returns the position of player 2's own play card from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer2InspectOffBoardCardPosition = function () {
  return cc.p(UtilsEngine._player2InspectOffBoardCardPosition.x, UtilsEngine._player2InspectOffBoardCardPosition.y);
};

/**
 * Returns the position of player 1's inspect card from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer1InspectCardPosition = function () {
  return cc.p(UtilsEngine._player1InspectCardPosition.x, UtilsEngine._player1InspectCardPosition.y);
};

/**
 * Returns the position of player 2's inspect card from the top right.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer2InspectCardPosition = function () {
  return cc.p(UtilsEngine._player2InspectCardPosition.x, UtilsEngine._player2InspectCardPosition.y);
};

/**
 * Returns a list of positions of player 1's artifacts from the bottom left.
 * @returns {Array}
 */
UtilsEngine.getPlayer1ArtifactsPositions = function () {
  return UtilsEngine._player1ArtifactsPositions;
};

/**
 * Returns a list of positions of player 2's artifacts from the bottom left.
 * @returns {Array}
 */
UtilsEngine.getPlayer2ArtifactsPositions = function () {
  return UtilsEngine._player2ArtifactsPositions;
};

/**
 * Returns the positions of player 1's signature card from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer1SignatureCardPosition = function () {
  return UtilsEngine._player1SignatureCardPosition;
};

/**
 * Returns the positions of player 2's signature card from the bottom left.
 * @returns {Vec2}
 */
UtilsEngine.getPlayer2SignatureCardPosition = function () {
  return UtilsEngine._player2SignatureCardPosition;
};

/**
 * Returns a scale based on the content size of a node vs the window size. Useful for sprites that need to scale to fit the window.
 * @param {cc.Node} node node to get content size from
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowSizeRelativeNodeScale = function (node, min, max) {
  const contentSize = node.getContentSize();
  if (contentSize.width === 0 || contentSize.height === 0) {
    return 1.0;
  }
  return UtilsEngine.getWindowSizeRelativeScale(contentSize.width, contentSize.height, min, max);
};

/**
 * Returns a scale based on width and height vs the window size.
 * @param {Number} width
 * @param {Number} height
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowSizeRelativeScale = function (width, height, min, max) {
  if (min == null) { min = 0.0; }
  if (max == null) { max = CONFIG.INFINITY; }
  return Math.min(max, Math.max(min, cc.winSize.width / width, cc.winSize.height / height)) / CONFIG.globalScale;
};

/**
 * Returns a scale based on the width of a node vs the window width. Useful for sprites that need to scale to fit the window.
 * @param {cc.Node} node node to get width from
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowWidthRelativeNodeScale = function (node, min, max) {
  const contentSize = node.getContentSize();
  if (contentSize.width === 0) {
    return 1.0;
  }
  return UtilsEngine.getWindowWidthRelativeScale(contentSize.width, min, max);
};

/**
 * Returns a scale based on width vs the window width.
 * @param {Number} width
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowWidthRelativeScale = function (width, min, max) {
  if (min == null) { min = 0.0; }
  if (max == null) { max = CONFIG.INFINITY; }
  return Math.min(max, Math.max(min, cc.winSize.width / width)) / CONFIG.globalScale;
};

/**
 * Returns a scale based on the height of a node vs the window height. Useful for sprites that need to scale to fit the window.
 * @param {cc.Node} node node to get height from
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowHeightRelativeNodeScale = function (node, min, max) {
  const contentSize = node.getContentSize();
  if (contentSize.height === 0) {
    return 1.0;
  }
  return UtilsEngine.getWindowHeightRelativeScale(contentSize.height, min, max);
};

/**
 * Returns a scale based on height vs the window height.
 * @param {Number} height
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowHeightRelativeScale = function (height, min, max) {
  if (min == null) { min = 0.0; }
  if (max == null) { max = CONFIG.INFINITY; }
  return Math.min(max, Math.max(min, cc.winSize.height / height)) / CONFIG.globalScale;
};

/**
 * Returns a scale based on the content size of a node vs the window size, where the scale would at least cause the sprite to cover the screen.
 * @param {cc.Node} node node to get content size from
 * @param {Number} [min=0.0] minimum scale
 * @param {Number} [max=Infinity] maximum scale
 * @returns {Number}
 */
UtilsEngine.getWindowAtLeastCoverNodeScale = function (node, min, max) {
  if (min == null) { min = 0.0; }
  if (max == null) { max = CONFIG.INFINITY; }
  const contentSize = node.getContentSize();
  if (contentSize.width === 0 || contentSize.height === 0) {
    return 1.0;
  }
  return Math.min(max, Math.max(min, 1.0, UtilsEngine.getGSIWinWidth() / contentSize.width, UtilsEngine.getGSIWinHeight() / contentSize.height));
};

/**
 * Returns a value scaled to the global scale.
 * @param {Number} val
 * @returns {Number}
 */
UtilsEngine.transformValueToGlobalScale = function (val) {
  return val * CONFIG.globalScale;
};
/**
 * Returns a position scaled to the global scale.
 * @param {Vec2} position
 * @returns {Vec2}
 */
UtilsEngine.transformPositionToGlobalScale = function (position) {
  return cc.p(position.x * CONFIG.globalScale, position.y * CONFIG.globalScale);
};

/**
 * Returns a size scaled to the global scale.
 * @param {Size} size
 * @returns {Size}
 */
UtilsEngine.transformSizeToGlobalScale = function (size) {
  return cc.size(size.width * CONFIG.globalScale, size.height * CONFIG.globalScale);
};
/**
 * Returns a rect scaled to the global scale.
 * @param {Rect} rect
 * @returns {Rect}
 */
UtilsEngine.transformRectToGlobalScale = function (rect) {
  return cc.rect(
    rect.x * CONFIG.globalScale,
    rect.y * CONFIG.globalScale,
    rect.width * CONFIG.globalScale,
    rect.height * CONFIG.globalScale,
  );
};

/**
 * Returns a horizontal value scaled from the global scale.
 * @param {Number} xVal
 * @returns {Number}
 */
UtilsEngine.transformXValueFromGlobalScale = function (xVal) {
  return (xVal - UtilsEngine._globalScaledScreenOffset.x) / CONFIG.globalScale;
};
/**
 * Returns a vertical value scaled from the global scale.
 * @param {Number} yVal
 * @returns {Number}
 */
UtilsEngine.transformYValueFromGlobalScale = function (yVal) {
  return (yVal - UtilsEngine._globalScaledScreenOffset.y) / CONFIG.globalScale;
};
/**
 * Returns a position scaled from the global scale.
 * @param {Vec2} position
 * @returns {Vec2}
 */
UtilsEngine.transformPositionFromGlobalScale = function (position) {
  return cc.p((position.x - UtilsEngine._globalScaledScreenOffset.x) / CONFIG.globalScale, (position.y - UtilsEngine._globalScaledScreenOffset.y) / CONFIG.globalScale);
};
/**
 * Returns a size scaled from the global scale.
 * @param {Size} size
 * @returns {Size}
 */
UtilsEngine.transformSizeFromGlobalScale = function (size) {
  return cc.size(size.width / CONFIG.globalScale, size.height / CONFIG.globalScale);
};
/**
 * Returns a rect scaled from the global scale.
 * @param {Rect} rect
 * @returns {Rect}
 */
UtilsEngine.transformRectFromGlobalScale = function (rect) {
  return cc.rect(
    (rect.x - UtilsEngine._globalScaledScreenOffset.x) / CONFIG.globalScale,
    (rect.y - UtilsEngine._globalScaledScreenOffset.y) / CONFIG.globalScale,
    rect.width / CONFIG.globalScale,
    rect.height / CONFIG.globalScale,
  );
};

/**
 * Transform a point in board space to screen space.
 * @param {Vec2} boardPoint - tiles x-y indices (e.g. {x:2,y:1}
 * @returns {Vec2}
 */
UtilsEngine.transformBoardToScreen = function (boardPoint) {
  return cc.p(boardPoint.x * CONFIG.TILESIZE + UtilsEngine._screenBoardOrigin.x, boardPoint.y * CONFIG.TILESIZE + UtilsEngine._screenBoardOrigin.y);
};
/**
 * Transform a point in screen space to board space.
 * @param {Vec2} screenPoint
 * @returns {Vec2}
 */
UtilsEngine.transformScreenToBoard = function (screenPoint) {
  return cc.p((screenPoint.x - UtilsEngine._screenBoardOrigin.x) / CONFIG.TILESIZE, (screenPoint.y - UtilsEngine._screenBoardOrigin.y) / CONFIG.TILESIZE);
};

/**
 * Transform a point in screen scale to board scale.
 * @param {Vec2} screenPoint
 * @returns {Vec2}
 */
UtilsEngine.transformScreenScaleToBoardScale = function (screenPoint) {
  return cc.p(screenPoint.x / CONFIG.TILESIZE, screenPoint.y / CONFIG.TILESIZE);
};
/**
 * Transform a point in board scale to screen scale.
 * @param {Vec2} screenPoint
 * @returns {Vec2}
 */
UtilsEngine.transformBoardScaleToScreenScale = function (boardPoint) {
  return cc.p(boardPoint.x * CONFIG.TILESIZE, boardPoint.y * CONFIG.TILESIZE);
};

/**
 * Transform a point in integer board space to screen space.
 * @param {Vec2} boardPoint
 * @returns {Vec2}
 */
UtilsEngine.transformBoardIndexToScreen = function (boardPoint) {
  return cc.p(Math.floor(boardPoint.x) * CONFIG.TILESIZE + UtilsEngine._screenBoardOrigin.x, Math.floor(boardPoint.y) * CONFIG.TILESIZE + UtilsEngine._screenBoardOrigin.y);
};
/**
 * Transform a point in screen space to board space, floored.
 * @param {Vec2} screenPoint
 * @returns {Vec2}
 */
UtilsEngine.transformScreenToBoardIndex = function (screenPoint) {
  return cc.p(Math.floor((screenPoint.x - UtilsEngine._screenBoardOrigin.x + CONFIG.TILESIZE * 0.5) / CONFIG.TILESIZE), Math.floor((screenPoint.y - UtilsEngine._screenBoardOrigin.y + CONFIG.TILESIZE * 0.5) / CONFIG.TILESIZE));
};
/**
 * Transform a point in screen space to tile map space.
 * @param {Vec2} screenPoint
 * @returns {Vec2}
 */
UtilsEngine.transformScreenToTileMap = function (screenPoint) {
  return UtilsEngine.projectPoint(screenPoint, UtilsEngine._tileMapProjectionMatrix);
};
/**
 * Transform a point in tile map space to screen space.
 * @param {Vec2} boardPoint
 * @returns {Vec2}
 */
UtilsEngine.transformTileMapToScreen = function (tileMapPoint) {
  return UtilsEngine.projectPoint(tileMapPoint, UtilsEngine._tileMapProjectionMatrixInv, UtilsEngine._tileMapProjectionMatrix);
};
/**
 * Transform a point in board space to tile map space.
 * @param {Vec2} boardPoint - tiles x-y indices (e.g. {x:2,y:1}
 * @returns {Vec2}
 */
UtilsEngine.transformBoardToTileMap = function (boardPoint) {
  const screenPoint = UtilsEngine.transformBoardToScreen(boardPoint);
  return this.transformScreenToTileMap(screenPoint);
};
/**
 * Transform a point in tile map space to board space rounded.
 * @param {Vec2} boardPoint
 * @returns {Vec2}
 */
UtilsEngine.transformTileMapToBoardIndex = function (tileMapPoint) {
  return UtilsEngine.transformScreenToBoardIndex(this.transformTileMapToScreen(tileMapPoint));
};
/**
 * Transform a point in tile map space to board space unrounded.
 * @param {Vec2} boardPoint
 * @returns {Vec2}
 */
UtilsEngine.transformTileMapToBoard = function (tileMapPoint) {
  return UtilsEngine.transformScreenToBoard(this.transformTileMapToScreen(tileMapPoint));
};
/**
 * Project a point based on a projection matrix
 * @param {Vec2} point
 * @param {Matrix4} projectionMatrix
 * @param {Matrix4} [zMatrix] optional projection matrix for estimating z
 * @returns {Vec2}
 */
UtilsEngine.projectPoint = function (point, projectionMatrix, zMatrix) {
  const { mat } = projectionMatrix;
  const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

  // FIXME: this is still pretty hacky
  const x = point.x - winCenterPosition.x;
  const y = point.y - winCenterPosition.y;
  const d = 1.0 / (mat[3] * x + mat[7] * y + mat[15]);
  let xp;
  let yp;
  if (zMatrix) {
    const zMat = zMatrix.mat;
    const z = zMat[2] * x + zMat[6] * y + zMat[14] - zMat[15];
    xp = (mat[0] * x + mat[4] * y + mat[8] * z) * d;
    yp = (mat[1] * x + mat[5] * y - mat[9] * z) * d;
  } else {
    xp = (mat[0] * x + mat[4] * y) * d;
    yp = (mat[1] * x + mat[5] * y) * d;
  }
  // scale
  const xs = xp * winCenterPosition.x + winCenterPosition.x;
  const ys = yp * winCenterPosition.y + winCenterPosition.y;
  return cc.p(xs, ys);
};

/**
 * Uses a sprite identifier / resource to find a sprite frame.
 * @param {Array|String} identifier
 */
UtilsEngine.getSpriteFrameFromIdentifier = function (identifier) {
  let spriteFrame;
  // check for array and choose random
  if (_.isArray(identifier)) {
    identifier = identifier[_.random(0, identifier.length - 1)];
  }
  if (identifier) {
    const animation = cc.animationCache.getAnimation(identifier);
    if (animation && animation.getFrames().length > 0) {
      spriteFrame = animation.getFrames()[0].getSpriteFrame();
    } else {
      spriteFrame = cc.spriteFrameCache.getSpriteFrame(identifier);
    }
  }
  return spriteFrame;
};
/**
 * Returns max delays for a set of fx sprites.
 * @param {Array} fxSprites array of fx sprites
 * @returns {Object} delays
 */
UtilsEngine.getDelaysFromFXSprites = function (fxSprites) {
  let lifeDuration = 0;
  let showDelay = 0;
  let impactDelay = 0;

  if (fxSprites) {
    if (!_.isArray(fxSprites)) {
      fxSprites = [fxSprites];
    }

    for (let i = 0, il = fxSprites.length; i < il; i++) {
      const fxSprite = fxSprites[i];
      if (fxSprite.getLifeDuration) {
        lifeDuration = Math.max(lifeDuration, fxSprite.getLifeDuration());
      }
      if (fxSprite.getShowDelay) {
        showDelay = Math.max(showDelay, fxSprite.getShowDelay());
      }
      if (fxSprite.getImpactDelay) {
        impactDelay = Math.max(impactDelay, fxSprite.getImpactDelay());
      }
    }
  }

  return {
    lifeDuration,
    showDelay,
    impactDelay,
  };
};
/**
 * Returns the gl blend function flag from a string name, or the blend name passed in if none found.
 * @param {String} blendName blend function name
 * @returns {Number} actual gl canvas blend flag
 */
UtilsEngine.getBlendFuncByName = function (blendName) {
  let blendFunc;
  if (blendName && gl) {
    blendFunc = gl[blendName.toUpperCase()];
  }
  return blendFunc || blendName;
};
/**
 * Returns an animation action for a sprite identifier.
 * @param {String} spriteIdentifier sprite/animation name
 * @returns {cc.Animate|cc.CallFunc} an action that animates or sets the sprite frame
 */
UtilsEngine.getAnimationAction = function (spriteIdentifier, looping) {
  let animateAction;

  if (spriteIdentifier != null) {
    const animation = cc.animationCache.getAnimation(spriteIdentifier);
    if (animation instanceof cc.Animation) {
      animateAction = cc.animate(animation);
      if (looping) {
        animateAction = animateAction.repeatForever();
      }
    } else {
      const spriteFrame = cc.spriteFrameCache.getSpriteFrame(spriteIdentifier);
      if (spriteFrame instanceof cc.SpriteFrame) {
        animateAction = cc.callFunc((target) => {
          target.setSpriteFrame(spriteFrame);
        });
      }
    }
  }

  return animateAction;
};

/**
 * Return if a node with a content size is under mouse. Attempts to use node's getNodeUnderMouse method if exists.
 * NOTE: this method accounts for the node's world's position and size but NOT rotation, and is far faster than node.getBoundingBoxToWorld()
 * @param  {cc.Node} node
 * @param  {Number} screenX
 * @param  {Number} screenY
 * @returns {boolean}
 */
UtilsEngine.getNodeUnderMouse = function (node, screenX, screenY) {
  if (node.getNodeUnderMouse != null) {
    return node.getNodeUnderMouse(screenX, screenY);
  }
  const renderCmd = node._renderCmd;
  const stackMat = renderCmd._stackMatrix.mat;
  let x = stackMat[12] + node.centerOffset.x * 0.5;
  let y = stackMat[13] + node.centerOffset.y * 0.5;
  if (renderCmd.getNeedsPerspectiveProjection()) {
    x += cc.winSize.width * 0.5;
    y += cc.winSize.height * 0.5;
  }
  const width = node._contentSize.width * stackMat[0];
  const height = node._contentSize.height * stackMat[5];
  return screenX >= x && screenX <= x + width && screenY >= y && screenY <= y + height;
};

/**
 * Return the screen position of a node.
 * NOTE: this method is faster than calculating the world transform, but does not account for rotation.
 * @param  {cc.Node} node
 * @returns {cc.Point}
 */
UtilsEngine.getNodeScreenPosition = function (node) {
  const renderCmd = node._renderCmd;
  const stackMat = renderCmd._stackMatrix.mat;
  let x = stackMat[12] + node.centerOffset.x * 0.5;
  let y = stackMat[13] + node.centerOffset.y * 0.5;
  if (renderCmd.getNeedsPerspectiveProjection()) {
    x += cc.winSize.width * 0.5;
    y += cc.winSize.height * 0.5;
  }
  return cc.p(x, y);
};

/**
 * Return the screen position of a node, accounting for global scale.
 * NOTE: this method is faster than calculating the world transform, but does not account for rotation.
 * @param  {cc.Node} node
 * @returns {cc.Point}
 */
UtilsEngine.getGSINodeScreenPosition = function (node) {
  return UtilsEngine.transformPositionFromGlobalScale(UtilsEngine.getNodeScreenPosition(node));
};

/**
 * Return the screen position of a node.
 * NOTE: this method is faster than calculating the world transform, but does not account for rotation.
 * @param  {cc.Node} node
 * @returns {cc.Point}
 */
UtilsEngine.getNodeCenterScreenPosition = function (node) {
  const worldPosition = UtilsEngine.getNodeScreenPosition(node);
  const stackMat = node._renderCmd._stackMatrix.mat;
  worldPosition.x += node._contentSize.width * stackMat[0] * 0.5;
  worldPosition.y += node._contentSize.height * stackMat[5] * 0.5;
  return worldPosition;
};

/**
 * Return the screen position of a node, accounting for global scale.
 * NOTE: this method is faster than calculating the world transform, but does not account for rotation.
 * @param  {cc.Node} node
 * @returns {cc.Point}
 */
UtilsEngine.getGSINodeCenterScreenPosition = function (node) {
  return UtilsEngine.transformPositionFromGlobalScale(UtilsEngine.getNodeCenterScreenPosition(node));
};

/**
 * Returns a modifier between 1.0 (slowest) and 0.0 (fastest)
 * some things will not show or be sped up based on this modifier
 * for ex: instructional arrows will only show when the speed is slowest
 * @returns {Number}
 */
UtilsEngine.getGameSpeed = function () {
  let gameSpeed = parseFloat(CONFIG.gameSpeed);
  if (Number.isNaN(gameSpeed)) { gameSpeed = 1.0; }
  return Math.max(0.0, Math.min(1.0, 1.0 - gameSpeed));
};

UtilsEngine.rebuild = function () {
  Logger.module('ENGINE').log('UtilsEngine.rebuild');
  // helper objects
  UtilsEngine._utilVec31 = new cc.kmVec3();
  UtilsEngine._utilVec32 = new cc.kmVec3();
  const zeye = cc.director.getZEye();

  // create identity matrix for use in cases where a reset is needed
  UtilsEngine.MAT4_IDENTITY = cc.kmMat4Identity(new cc.kmMat4());

  // create global scale matrix for use in cases where global scale is needed
  UtilsEngine.MAT4_GLOBAL_SCALE = cc.kmMat4Scaling(new cc.kmMat4(), CONFIG.globalScale, CONFIG.globalScale, CONFIG.globalScale);
  UtilsEngine._globalScaledScreenOffset = new cc.kmVec3(
    -Math.round(cc.winSize.width * (CONFIG.globalScale - 1.0) * 0.5),
    -Math.round(cc.winSize.height * (CONFIG.globalScale - 1.0) * 0.5),
    0.0,
  );
  UtilsEngine._globalScaleInvertedWinRect = UtilsEngine.transformRectFromGlobalScale(cc.rect(0, 0, cc.winSize.width, cc.winSize.height));
  UtilsEngine._globalScaleInvertedWinRect.x = Math.round(UtilsEngine._globalScaleInvertedWinRect.x);
  UtilsEngine._globalScaleInvertedWinRect.y = Math.round(UtilsEngine._globalScaleInvertedWinRect.y);
  UtilsEngine._globalScaleInvertedWinRect.width = Math.round(UtilsEngine._globalScaleInvertedWinRect.width);
  UtilsEngine._globalScaleInvertedWinRect.height = Math.round(UtilsEngine._globalScaleInvertedWinRect.height);
  UtilsEngine.MAT4_GLOBAL_OFFSET = cc.kmMat4Translation(new cc.kmMat4(), UtilsEngine._globalScaledScreenOffset.x, UtilsEngine._globalScaledScreenOffset.y, UtilsEngine._globalScaledScreenOffset.z);
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET = cc.kmMat4Identity(new cc.kmMat4());
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET.mat[0] = UtilsEngine.MAT4_GLOBAL_SCALE.mat[0];
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET.mat[5] = UtilsEngine.MAT4_GLOBAL_SCALE.mat[5];
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET.mat[10] = UtilsEngine.MAT4_GLOBAL_SCALE.mat[10];
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET.mat[12] = UtilsEngine.MAT4_GLOBAL_OFFSET.mat[12];
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET.mat[13] = UtilsEngine.MAT4_GLOBAL_OFFSET.mat[13];
  UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET.mat[14] = UtilsEngine.MAT4_GLOBAL_OFFSET.mat[14];

  // create orthographic matrices
  UtilsEngine.MAT4_ORTHOGRAPHIC_PROJECTION = cc.kmMat4Identity(new cc.kmMat4());
  cc.kmMat4OrthographicProjection(UtilsEngine.MAT4_ORTHOGRAPHIC_PROJECTION, 0, cc.winSize.width, 0, cc.winSize.height, -1024, 1024);

  UtilsEngine.MAT4_ORTHOGRAPHIC_STACK = cc.kmMat4Identity(new cc.kmMat4());
  UtilsEngine.MAT4_ORTHOGRAPHIC_STACK_SCALED = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_ORTHOGRAPHIC_STACK, UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET);

  // create perspective matrices
  UtilsEngine.MAT4_PERSPECTIVE_PROJECTION = cc.kmMat4Identity(new cc.kmMat4());
  cc.kmMat4PerspectiveProjection(UtilsEngine.MAT4_PERSPECTIVE_PROJECTION, 60, cc.winSize.width / cc.winSize.height, 0.1, zeye * 2);

  UtilsEngine.MAT4_PERSPECTIVE_STACK = cc.kmMat4Identity(new cc.kmMat4());
  const eye = cc.kmVec3Fill(null, cc.winSize.width / 2, cc.winSize.height / 2, zeye);
  const center = cc.kmVec3Fill(null, cc.winSize.width / 2, cc.winSize.height / 2, 0.0);
  const up = cc.kmVec3Fill(null, 0.0, 1.0, 0.0);
  cc.kmMat4LookAt(UtilsEngine.MAT4_PERSPECTIVE_STACK, eye, center, up);
  UtilsEngine.MAT4_PERSPECTIVE_STACK_SCALED = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_PERSPECTIVE_STACK, UtilsEngine.MAT4_GLOBAL_SCALE_OFFSET);

  // cache layout positions
  const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
  UtilsEngine._refWindowOrigin = cc.p(cc.winSize.width - CONFIG.REF_WINDOW_SIZE.width, cc.winSize.height - CONFIG.REF_WINDOW_SIZE.height);
  UtilsEngine._screenBoardSize = cc.size(
    CONFIG.BOARDCOL * CONFIG.TILESIZE,
    CONFIG.BOARDROW * CONFIG.TILESIZE,
  );
  UtilsEngine._screenBoardOrigin = cc.p(
    Math.round((cc.winSize.width - UtilsEngine._screenBoardSize.width) * 0.5 + CONFIG.TILESIZE * 0.5 + CONFIG.TILEOFFSET_X),
    Math.round((cc.winSize.height - UtilsEngine._screenBoardSize.height) * 0.5 + CONFIG.TILESIZE * 0.5 + CONFIG.TILEOFFSET_Y),
  );

  // hand
  const cardsExpandX = Math.min(100.0, (UtilsEngine.getGSIWinWidth() - CONFIG.REF_WINDOW_SIZE.width) * 0.125);
  const cardsExpandY = Math.min(100.0, (UtilsEngine.getGSIWinHeight() - CONFIG.REF_WINDOW_SIZE.height) * 0.35);
  UtilsEngine._cardsInHandStartPosition = cc.p(
    winCenterPosition.x - (CONFIG.HAND_CARD_SIZE * (CONFIG.MAX_HAND_SIZE - 1)) * 0.5 + CONFIG.HAND_OFFSET_X - cardsExpandX,
    winCenterPosition.y - UtilsEngine._screenBoardSize.height * 0.5 - CONFIG.HAND_CARD_SIZE * 0.4 + CONFIG.HAND_OFFSET_Y - cardsExpandY,
  );
  UtilsEngine._cardsInHandEndPosition = cc.p(
    UtilsEngine._cardsInHandStartPosition.x + (CONFIG.HAND_CARD_SIZE * CONFIG.MAX_HAND_SIZE - CONFIG.HAND_CARD_SIZE * 0.5) + cardsExpandX * 2,
    UtilsEngine._cardsInHandStartPosition.y,
  );
  UtilsEngine._cardsInHandStartPositionForCSS = cc.p(
    UtilsEngine.getGSIWinWidth() * 0.5 - (CONFIG.HAND_CARD_SIZE * (CONFIG.MAX_HAND_SIZE - 1)) * 0.5 + CONFIG.HAND_OFFSET_X - cardsExpandX,
    UtilsEngine.getGSIWinHeight() * 0.5 - UtilsEngine._screenBoardSize.height * 0.5 - CONFIG.HAND_CARD_SIZE * 0.4 + CONFIG.HAND_OFFSET_Y - cardsExpandY,
  );
  UtilsEngine._cardsInHandEndPositionForCSS = cc.p(
    UtilsEngine._cardsInHandStartPositionForCSS.x + (CONFIG.HAND_CARD_SIZE * CONFIG.MAX_HAND_SIZE - CONFIG.HAND_CARD_SIZE * 0.5) + cardsExpandX * 2,
    UtilsEngine._cardsInHandStartPositionForCSS.y,
  );

  // player frames
  const playerFramesExpandX = Math.min(100.0, (UtilsEngine.getGSIWinWidth() - CONFIG.REF_WINDOW_SIZE.width) * 0.25);
  const playerFramesExpandY = Math.min(100.0, (UtilsEngine.getGSIWinHeight() - CONFIG.REF_WINDOW_SIZE.height) * 0.25);
  UtilsEngine._player1FramePosition = cc.p(
    winCenterPosition.x - UtilsEngine._screenBoardSize.width * 0.5 - 200.0 - playerFramesExpandX,
    winCenterPosition.y + UtilsEngine._screenBoardSize.height * 0.5 + 122.0 + playerFramesExpandY,
  );
  UtilsEngine._player2FramePosition = cc.p(
    winCenterPosition.x + UtilsEngine._screenBoardSize.width * 0.5 + 200.0 + playerFramesExpandX,
    UtilsEngine._player1FramePosition.y,
  );
  UtilsEngine._player1FramePositionForCSS = cc.p(
    UtilsEngine.getGSIWinWidth() * 0.5 - UtilsEngine._screenBoardSize.width * 0.5 - 200.0 - playerFramesExpandX,
    UtilsEngine.getGSIWinHeight() * 0.5 - UtilsEngine._screenBoardSize.height * 0.5 - 122.0 - playerFramesExpandY,
  );
  UtilsEngine._player2FramePositionForCSS = cc.p(
    -UtilsEngine._player1FramePositionForCSS.x,
    UtilsEngine._player1FramePositionForCSS.y,
  );

  // inspect cards
  UtilsEngine._player1InspectCardPosition = cc.p(
    UtilsEngine._player1FramePosition.x - 120.0,
    UtilsEngine._player1FramePosition.y - 125.0,
  );
  UtilsEngine._player2InspectCardPosition = cc.p(
    cc.winSize.width - UtilsEngine._player1InspectCardPosition.x,
    UtilsEngine._player1InspectCardPosition.y,
  );

  // player 1 artifacts
  const artifactLayoutSize = CONFIG.ARTIFACT_SIZE * 0.875;
  UtilsEngine._player1ArtifactsPositions = [];
  const player1ArtifactsPosition = cc.p(
    UtilsEngine._player1FramePosition.x + 38.0,
    UtilsEngine._player1FramePosition.y - 195.0,
  );
  if (player1ArtifactsPosition != null) {
    let { x } = player1ArtifactsPosition;
    let { y } = player1ArtifactsPosition;
    for (let i = 0, il = CONFIG.MAX_ARTIFACTS; i < il; i++) {
      UtilsEngine._player1ArtifactsPositions.push(cc.p(Math.round(x), Math.round(y)));
      x = i % 2 !== 0 ? player1ArtifactsPosition.x : (player1ArtifactsPosition.x + artifactLayoutSize * 0.5);
      y -= artifactLayoutSize;
    }
  }

  // player 2 artifacts
  UtilsEngine._player2ArtifactsPositions = [];
  const player2ArtifactsPosition = cc.p(
    cc.winSize.width - player1ArtifactsPosition.x,
    player1ArtifactsPosition.y,
  );
  if (player2ArtifactsPosition != null) {
    let { x } = player2ArtifactsPosition;
    let { y } = player2ArtifactsPosition;
    for (let i = 0, il = CONFIG.MAX_ARTIFACTS; i < il; i++) {
      UtilsEngine._player2ArtifactsPositions.push(cc.p(Math.round(x), Math.round(y)));
      x = i % 2 !== 0 ? player2ArtifactsPosition.x : (player2ArtifactsPosition.x - artifactLayoutSize * 0.5);
      y -= artifactLayoutSize;
    }
  }

  // player 1 signature card
  UtilsEngine._player1SignatureCardPosition = cc.p(
    UtilsEngine._player1FramePosition.x + 170.0,
    UtilsEngine._player1FramePosition.y - 190.0,
  );

  // player 2 signature card
  UtilsEngine._player2SignatureCardPosition = cc.p(
    UtilsEngine._player2FramePosition.x - 170.0,
    UtilsEngine._player2FramePosition.y - 190.0,
  );

  // player 1 played cards
  UtilsEngine._player1InspectOffBoardCardPosition = cc.p(
    UtilsEngine._player1InspectCardPosition.x,
    UtilsEngine._player1InspectCardPosition.y,
  );
  for (let i = 0, il = UtilsEngine._player1ArtifactsPositions.length; i < il; i++) {
    UtilsEngine._player1InspectOffBoardCardPosition.x = Math.max(UtilsEngine._player1InspectOffBoardCardPosition.x, UtilsEngine._player1ArtifactsPositions[i].x);
  }
  UtilsEngine._player1InspectOffBoardCardPosition.x += CONFIG.ARTIFACT_SIZE * 0.25;

  // player 2 played cards
  UtilsEngine._player2InspectOffBoardCardPosition = cc.p(
    UtilsEngine._player2InspectCardPosition.x,
    UtilsEngine._player2InspectCardPosition.y,
  );
  for (let i = 0, il = UtilsEngine._player2ArtifactsPositions.length; i < il; i++) {
    UtilsEngine._player2InspectOffBoardCardPosition.x = Math.min(UtilsEngine._player2InspectOffBoardCardPosition.x, UtilsEngine._player2ArtifactsPositions[i].x);
  }
  UtilsEngine._player2InspectOffBoardCardPosition.x -= CONFIG.ARTIFACT_SIZE * 0.25;

  // tilemap projection matrices
  if (CONFIG.XYZ_ROTATION.x !== 0.0 || CONFIG.XYZ_ROTATION.y !== 0.0 || CONFIG.XYZ_ROTATION.z !== 0.0) {
    // used to rotate points into 3D space
    // TODO: use actual 3D projection/unprojection
    const xyzRotationMatrix = cc.kmMat4RotationPitchYawRoll(
      new cc.kmMat4(),
      cc.degreesToRadians(CONFIG.XYZ_ROTATION.x),
      cc.degreesToRadians(CONFIG.XYZ_ROTATION.y),
      cc.degreesToRadians(CONFIG.XYZ_ROTATION.z),
    );
    const xyzRotationMatrixInv = cc.kmMat4Inverse(new cc.kmMat4(), xyzRotationMatrix) || UtilsEngine.MAT4_IDENTITY;
    const transformMatrix = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_PERSPECTIVE_STACK, xyzRotationMatrix);
    const transformMatrixInv = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_PERSPECTIVE_STACK, xyzRotationMatrixInv);
    UtilsEngine._tileMapProjectionMatrix = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_PERSPECTIVE_PROJECTION, transformMatrix);
    UtilsEngine._tileMapProjectionMatrixInv = cc.kmMat4Multiply(new cc.kmMat4(), UtilsEngine.MAT4_PERSPECTIVE_PROJECTION, transformMatrixInv);
  } else {
    UtilsEngine._tileMapProjectionMatrix = UtilsEngine.MAT4_IDENTITY;
    UtilsEngine._tileMapProjectionMatrixInv = UtilsEngine.MAT4_IDENTITY;
  }
};
