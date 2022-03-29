//pragma PKGS: game
var SDK = require('app/sdk');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var UtilsPosition = require('app/common/utils/utils_position');
var UtilsEngine = require('app/common/utils/utils_engine');
var RSX = require('app/data/resources');
var BaseLayer = require('app/view/layers/BaseLayer');
var BaseSprite = require('app/view/nodes/BaseSprite');
var TileMapMergedLarge0Sprite = require('app/view/nodes/map/TileMapMergedLarge0Sprite');
var TileMapMergedLarge01Sprite = require('app/view/nodes/map/TileMapMergedLarge01Sprite');
var TileMapMergedLarge0123Sprite = require('app/view/nodes/map/TileMapMergedLarge0123Sprite');
var TileMapMergedLarge013Sprite = require('app/view/nodes/map/TileMapMergedLarge013Sprite');
var TileMapMergedLarge03Sprite = require('app/view/nodes/map/TileMapMergedLarge03Sprite');
var TileMapMergedLarge0SeamSprite = require('app/view/nodes/map/TileMapMergedLarge0SeamSprite');
var TileMapMergedHover0Sprite = require('app/view/nodes/map/TileMapMergedHover0Sprite');
var TileMapMergedHover01Sprite = require('app/view/nodes/map/TileMapMergedHover01Sprite');
var TileMapMergedHover0123Sprite = require('app/view/nodes/map/TileMapMergedHover0123Sprite');
var TileMapMergedHover013Sprite = require('app/view/nodes/map/TileMapMergedHover013Sprite');
var TileMapMergedHover03Sprite = require('app/view/nodes/map/TileMapMergedHover03Sprite');
var TileMapMergedHover0SeamSprite = require('app/view/nodes/map/TileMapMergedHover0SeamSprite');
var RenderPass = require('app/view/fx/RenderPass');

/****************************************************************************
 TileLayer
 ****************************************************************************/

var TileLayer = BaseLayer.extend({

	_boardBatchNode: null,
	_boardNonBatchNode: null,
	_renderPass: null,
	_renderPassStackId: null,
	_tileMapMergedSpriteClassesByName: null,

	/* region INITIALIZATION */

	ctor:function () {
		this._tileMapMergedSpriteClassesByName = {};

		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_large_0.frame] = TileMapMergedLarge0Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_large_01.frame] = TileMapMergedLarge01Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_large_0123.frame] = TileMapMergedLarge0123Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_large_013.frame] = TileMapMergedLarge013Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_large_03.frame] = TileMapMergedLarge03Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_large_0_seam.frame] = TileMapMergedLarge0SeamSprite;

		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_hover_0.frame] = TileMapMergedHover0Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_hover_01.frame] = TileMapMergedHover01Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_hover_0123.frame] = TileMapMergedHover0123Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_hover_013.frame] = TileMapMergedHover013Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_hover_03.frame] = TileMapMergedHover03Sprite;
		this._tileMapMergedSpriteClassesByName[RSX.tile_merged_hover_0_seam.frame] = TileMapMergedHover0SeamSprite;

		// create node for non-batched board tiles
		this._boardNonBatchNode = new cc.Node();
		this._boardNonBatchNode.setAnchorPoint(0.5, 0.5);
		// 3D rotate non-batched board tiles to simulate depth
		// batched board tiles will be handled separately
		this._boardNonBatchNode.setXYZRotation(CONFIG.XYZ_ROTATION);

		// create batch for board tiles
		this._boardBatchNode = new cc.SpriteBatchNode(RSX.tile_board.img);

		// do super ctor
		this._super();

		// add non-batched board tiles
		this.addChild(this._boardNonBatchNode, -1);
	},

	_createRenderCmd: function(){
		if (cc._renderType === cc._RENDER_TYPE_CANVAS)
			return this._super();
		else {
			return new TileLayer.WebGLRenderCmd(this);
		}
	},

	/* endregion INITIALIZATION */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		// set content size to win size and not global scale inverted win size
		// this ensures correct 3D rotation for layers and any nodes on those layers
		// otherwise the 3D rotation anchor point correction will be off
		this._boardNonBatchNode.setContentSize(cc.winSize);
		this._boardNonBatchNode.setPosition(UtilsEngine.getGSIWinCenterPosition());

		this.updateBoardQuality();
	},

	updateBoardQuality: function () {
		if (CONFIG.boardQuality === CONFIG.BOARD_QUALITY_HIGH) {
			if (this._boardBatchNode.getParent() != null) {
				// remove from parent without calling removeChild
				// this way we don't trigger onExit or stop actions
				// and don't remove any children of the batch node
				var parent = this._boardBatchNode.getParent();
				this._boardBatchNode.setParent(null);
				var children = parent.getChildren();
				if (children && children.length > 0) {
					var index = _.indexOf(children, this._boardBatchNode);
					if (index != -1) {
						cc.renderer.childrenOrderDirty = parent._reorderChildDirty = true;
						children.splice(index, 1);
					}
				}

				// reset transforms
				this._boardBatchNode.setContentSize(0, 0);
				this._boardBatchNode.setAnchorPoint(0, 0);
				this._boardBatchNode.setPosition(0, 0);
				this._boardBatchNode.setXYZRotation({x: 0.0, y: 0.0, z: 0.0});
			}

			// flag board batch node as entered the scene but don't actually add it to the scene
			// this ensures that the batch node and all children run actions
			if (!this._boardBatchNode.isRunning()) {
				this._boardBatchNode.onEnter();
			}

			// build render pass for aliasing board tiles
			if (this._renderPass == null) {
				this._renderPassStackId = RenderPass.get_new_reset_stack_id();
				this._renderPass = new RenderPass(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, true);
			} else {
				this._renderPass.rebuild(cc.Texture2D.PIXEL_FORMAT_RGBA8888, cc.winSize.width, cc.winSize.height, 1, true);
			}

			// flag render cmd as needing draw
			this._renderCmd._needDraw = true;
		} else {
			// add batch node to scene as needed
			if (this._boardBatchNode.getParent() == null) {
				// add to parent
				if (!this._boardBatchNode.isRunning()) {
					this.addChild(this._boardBatchNode);//, -9999);
				} else {
					this._boardBatchNode.setParent(this);
					this._insertChild(this._boardBatchNode);//, -9999);
				}

				// update transforms
				this._boardBatchNode.setContentSize(cc.winSize);
				this._boardBatchNode.setAnchorPoint(0.5, 0.5);
				this._boardBatchNode.setPosition(UtilsEngine.getGSIWinCenterPosition());
				this._boardBatchNode.setXYZRotation(CONFIG.XYZ_ROTATION);
			}

			// destroy render pass as needed
			if (this._renderPass != null) {
				this._renderPass.release();
				this._renderPass = null;
			}

			// flag render cmd as not needing draw
			this._renderCmd._needDraw = false;
		}
	},

	/* endregion LAYOUT */

	/* region TILES */

	addTiles: function (tiles, zOrder, opacity, fadeDuration) {
		if (_.isArray(tiles)) {
			for(var i = 0, il = tiles.length; i < il; i++) {
				var tileSprite = tiles[i];
				this.addTile(tileSprite, zOrder, opacity, fadeDuration);
			}
		} else {
			this.addTile(tiles, zOrder, opacity, fadeDuration);
		}
	},
	addTile: function (tileSprite, zOrder, opacity, fadeDuration) {
		this._boardNonBatchNode.addChild(tileSprite, zOrder);
		this.showTile(tileSprite, opacity, fadeDuration);
	},
	addBoardBatchedTiles: function (tiles, zOrder, opacity, fadeDuration ) {
		if (_.isArray(tiles)) {
			for(var i = 0, il = tiles.length; i < il; i++) {
				var tileSprite = tiles[i];
				this.addBoardBatchedTile(tileSprite, zOrder, opacity, fadeDuration);
			}
		} else {
			this.addBoardBatchedTile(tiles, zOrder, opacity, fadeDuration);
		}
	},
	addBoardBatchedTile: function (tileSprite, zOrder, opacity, fadeDuration) {
		this._boardBatchNode.addChild(tileSprite, zOrder);
		this.showTile(tileSprite, opacity, fadeDuration);
	},
	showTile: function (tileSprite, opacity, fadeDuration) {
		if (opacity != null) {
			tileSprite._tileOpacity = opacity;
			tileSprite.setOpacity(0.0);
			if (opacity !== 0.0) {
				tileSprite.fadeTo(fadeDuration, opacity);
			}
		}
	},

	/**
	 * Returns an object containing the merged tile part identifiers for all 4 parts of a merged tile.
	 * @param mapNode
	 * @param map
	 * @param altMap
	 * @returns {{tl: string, tr: string, br: string, bl: string}}
	 * @private
	 */
	_getMergedTileCornerValues: function (mapNode, map, altMap) {
		var ntl, nt, ntr, nr, nbr, nb, nbl, nl;
		var values = { tl: "", tr: "", br: "", bl: "" };

		if (mapNode) {
			var board = SDK.GameSession.getInstance().getBoard();
			var x = parseInt(mapNode.x);
			var y = parseInt(mapNode.y);
			var vl = x > 0;
			var vr = x < CONFIG.BOARDCOL - 1;
			var vb = y > 0;
			var vt = y < CONFIG.BOARDROW - 1;
			var il = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x - 1, y);
			var ir = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x + 1, y);
			var it = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x, y + 1);
			var ib = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x, y - 1);
			var itl = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x - 1, y + 1);
			var itr = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x + 1, y + 1);
			var ibl = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x - 1, y - 1);
			var ibr = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x + 1, y - 1);

			nl = vl && map[il];
			nr = vr && map[ir];
			nt = vt && map[it];
			ntl = nt && nl && map[itl];
			ntr = nt && nr && map[itr];
			nb = vb && map[ib];
			nbl = nb && nl && map[ibl];
			nbr = nb && nr && map[ibr];

			values.tl = (nl ? "1" : "") + (ntl ? "2" : "") + (nt ? "3" : "");
			values.tr = (nt ? "1" : "") + (ntr ? "2" : "") + (nr ? "3" : "");
			values.br = (nr ? "1" : "") + (nbr ? "2" : "") + (nb ? "3" : "");
			values.bl = (nb ? "1" : "") + (nbl ? "2" : "") + (nl ? "3" : "");

			// alt map used to create corner seams
			if (altMap) {
				if (vl) {
					if (!values.tl && altMap[il]) { values.tl = "_seam"; }
					if (!values.bl && altMap[il]) { values.bl = "_seam"; }
					if (!values.tl && altMap[itl]) { values.tl = "_seam"; }
					if (!values.bl && altMap[ibl]) { values.bl = "_seam"; }
				}
				if (vr) {
					if (!values.tr && altMap[ir]) { values.tr = "_seam"; }
					if (!values.br && altMap[ir]) { values.br = "_seam"; }
					if (!values.tr && altMap[itr]) { values.tr = "_seam"; }
					if (!values.br && altMap[ibr]) { values.br = "_seam"; }
				}
			}
		}

		return values;
	},

	updateMergedTileTextures: function (filePrefix, map, altMap) {
		var tiles = [];
		// update textures of tiles in map based on map and altMap
		for (var i = 0, il = map.length; i < il; i++) {
			var mapNode = map[i];
			if (mapNode) {
				// destroy all previous
				var tlColor;
				if (mapNode.tlTileSprite != null) {
					tlColor = mapNode.tlTileSprite._merged_color;
					mapNode.tlTileSprite.destroy();
					mapNode.tlTileSprite = null;
				}
				var trColor;
				if (mapNode.trTileSprite != null) {
					trColor = mapNode.trTileSprite._merged_color;
					mapNode.trTileSprite.destroy();
					mapNode.trTileSprite = null;
				}
				var brColor;
				if (mapNode.brTileSprite != null) {
					brColor = mapNode.brTileSprite._merged_color;
					mapNode.brTileSprite.destroy();
					mapNode.brTileSprite = null;
				}
				var blColor;
				if (mapNode.blTileSprite != null) {
					blColor = mapNode.blTileSprite._merged_color;
					mapNode.blTileSprite.destroy();
					mapNode.blTileSprite = null;
				}

				var values = this._getMergedTileCornerValues(mapNode, map, altMap);
				var x = mapNode.x;
				var y = mapNode.y;
				var tlTileSprite = this.displayMergedTile( filePrefix, values.tl, x, y, -1, 1, tlColor, 0);
				var trTileSprite = this.displayMergedTile( filePrefix, values.tr, x, y, 1, 1, trColor, 90);
				var brTileSprite = this.displayMergedTile( filePrefix, values.br, x, y, 1, -1, brColor, 180);
				var blTileSprite = this.displayMergedTile( filePrefix, values.bl, x, y, -1, -1, blColor, 270);
				mapNode.tlTileSprite = tlTileSprite;
				mapNode.trTileSprite = trTileSprite;
				mapNode.brTileSprite = brTileSprite;
				mapNode.blTileSprite = blTileSprite;
				Array.prototype.push.apply(tiles, [tlTileSprite, trTileSprite, brTileSprite, blTileSprite]);
			}
		}

		if (tiles.length > 0) {
			this.addBoardBatchedTiles(tiles);
		}
	},

	/**
	 * Prepares a mapped array of data holders for tile rendering data.
	 * @param positions
	 * @param map
	 * @returns {Array} mapped indices and holders for tile sprites
	 * @private
	 */
	getMapFromBoardPositions: function (positions, map) {
		map || (map = []);

		var baseMap = UtilsPosition.getMapFromPositions(SDK.GameSession.getInstance().getBoard().getColumnCount(), positions);
		for (var i = 0, il = baseMap.length; i < il; i++) {
			var position = baseMap[i];
			if (position) {
				map[i] = {
					x: position.x, y: position.y,
					tlTileSprite: null, trTileSprite: null,
					brTileSprite: null, blTileSprite: null
				};
			}
		}

		return map;

	},

	/**
	 * Displays one part of a merged tile from a tile prefix and merged tile part identifier.
	 * @param {String} tilePrefix
	 * @param {String} mergedTilePartId
	 * @param {Number} boardX
	 * @param {Number} boardY
	 * @param {Number} [offsetX=0]
	 * @param {Number} [offsetY=0]
	 * @param {Object} [color]
	 * @param {Number} [rotation=0]
	 * @returns {cc.Node} tile sprite
	 */
	displayMergedTile: function ( tilePrefix, mergedTilePartId, boardX, boardY, offsetX, offsetY, color, rotation ) {
		// get tile class
		var tileMapMergedSpriteClassName = RSX[tilePrefix + "0" + mergedTilePartId].frame;
		var tileMapMergedSpriteClass = this._tileMapMergedSpriteClassesByName[tileMapMergedSpriteClassName];
		if (tileMapMergedSpriteClass == null) {
			throw new Error("TileLayer.displayMergedTile -> invalid tileMapMergedSpriteClassName " + tileMapMergedSpriteClassName);
		}

		var tileSprite = tileMapMergedSpriteClass.create();
		var tileSize = tileSprite._contentSize.width;
		var offsetSize = tileSize * 0.5;
		var tileScale = (CONFIG.TILESIZE * 0.5) / tileSize;
		var tilePosition = UtilsEngine.transformBoardToScreen(cc.p(boardX, boardY));
		tilePosition.x += (offsetX || 0) * offsetSize * tileScale;
		tilePosition.y += (offsetY || 0) * offsetSize * tileScale;
		tileSprite.setPosition(tilePosition);
		tileSprite.setScale(tileScale);
		tileSprite._merged_rotation = rotation;
		tileSprite.setRotation(rotation || 0);
		if (color) {
			tileSprite._merged_color = color;
			tileSprite.setColor(color);
		}

		return tileSprite;
	},

	/**
	 * Creates 4 sprites per tile to generate the rounded corners on the out corners of tiles displayed
	 * @param {Array} locs tile locations by x-y indicies
	 * @param map
	 * @param altMap
	 * @param filePrefix
	 * @param zOrder
	 * @param opacity
	 * @param fadeDuration
	 * @param color
	 * @param tiles
	 * @returns {Array}
	 */
	displayMergedTiles: function (locs, map, altMap, filePrefix, zOrder, opacity, fadeDuration, color, tiles) {
		if (locs && locs.length > 0) {
			map || (map = this.getMapFromBoardPositions(locs));
			tiles || (tiles = []);
			var board = SDK.GameSession.getInstance().getBoard();

			// check tile neighbors by vertex
			for (var i = 0, il = locs.length; i < il; i++) {
				var location = locs[i];
				var values = this._getMergedTileCornerValues(location, map, altMap);
				var tlTileSprite = this.displayMergedTile( filePrefix, values.tl, location.x, location.y, -1, 1, color, 0);
				var trTileSprite = this.displayMergedTile( filePrefix, values.tr, location.x, location.y, 1, 1, color, 90);
				var brTileSprite = this.displayMergedTile( filePrefix, values.br, location.x, location.y, 1, -1, color, 180);
				var blTileSprite = this.displayMergedTile( filePrefix, values.bl, location.x, location.y, -1, -1, color, 270);

				var mapNode = map[UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), location.x, location.y)];
				mapNode.tlTileSprite = tlTileSprite;
				mapNode.trTileSprite = trTileSprite;
				mapNode.brTileSprite = brTileSprite;
				mapNode.blTileSprite = blTileSprite;
				Array.prototype.push.apply(tiles, [tlTileSprite, trTileSprite, brTileSprite, blTileSprite]);
			}

			this.addBoardBatchedTiles(tiles, zOrder, opacity, fadeDuration);

			return tiles;
		}
	},

	/**
	 * Removes an array of tiles.
	 * @param {Array} tiles - list of tiles to be removed
	 * @param {Number} fadeDuration seconds over which to fade tiles
	 */
	removeTiles: function (tiles, fadeDuration) {
		if (_.isArray(tiles)) {
			for(var i = 0, il = tiles.length; i < il; i++) {
				var tileSprite = tiles[i];
				this.removeTile(tileSprite, fadeDuration);
			}
		} else {
			this.removeTile(tiles, fadeDuration);
		}
	},

	/**
	 * Removes a tile.
	 * @param {cc.Node} tileSprite
	 * @param {Number} fadeDuration seconds over which to fade tile
	 */
	removeTile: function (tileSprite, fadeDuration) {
		tileSprite.stopAllActions();
		tileSprite.destroy(fadeDuration);
	},

	/**
	 * Removes an array of tiles with fade.
	 * @param {Array} tiles
	 * @param {Number} fadeDuration seconds over which to fade tiles
	 */
	removeTilesWithFade: function (tiles, fadeDuration) {
		if(fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }
		if (_.isArray(tiles)) {
			for(var i = 0, il = tiles.length; i < il; i++) {
				var tileSprite = tiles[i];
				this.removeTile(tileSprite, fadeDuration);
			}
		} else {
			this.removeTile(tiles, fadeDuration);
		}
	},
	/**
	 * Removes a tile by fading.
	 * @param {cc.Node} tileSprite
	 * @param {Number} fadeDuration seconds over which to fade tile
	 */
	removeTileWithFade: function (tileSprite, fadeDuration) {
		if(fadeDuration == null) { fadeDuration = CONFIG.FADE_FAST_DURATION; }
		this.removeTile(tileSprite, fadeDuration);
	}

	/* endregion TILES */

});

TileLayer.WebGLRenderCmd = function(renderable){
	cc.Layer.WebGLRenderCmd.call(this, renderable);
};
var proto = TileLayer.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);
proto.constructor = TileLayer.WebGLRenderCmd;

proto.visit = function (parentCmd) {
	var node = this._node;
	// quick return if not visible
	if (!node._visible)
		return;

	// visit as normal
	cc.Layer.WebGLRenderCmd.prototype.visit.call(this, parentCmd);

	// visit batch node but dont push render command
	var renderPass = node._renderPass;
	var boardBatchNode = node._boardBatchNode;
	var boardBatchNodeRenderCmd = boardBatchNode._renderCmd;
	if (renderPass != null && boardBatchNodeRenderCmd._textureAtlas.totalQuads > 0) {
		var currentStack = cc.current_stack;
		currentStack.stack.push(currentStack.top);

		boardBatchNodeRenderCmd._curLevel = this._curLevel + 1;

		// batchNode's transform must always occur
		if (!(boardBatchNodeRenderCmd._dirtyFlag & cc.Node._dirtyFlags.transformDirty))
			boardBatchNodeRenderCmd.transform(this);
		// batchNode doesn't visit its children
		boardBatchNodeRenderCmd.updateStatus(this);

		currentStack.top = boardBatchNodeRenderCmd._stackMatrix;

		boardBatchNode.sortAllChildren();

		boardBatchNodeRenderCmd._dirtyFlag = 0;
		currentStack.top = currentStack.stack.pop();
	}
};

proto.rendering = function (ctx) {
	var gl = cc._renderContext;
	var shaderCache = cc.shaderCache;
	var node = this._node;
	var renderPass = node._renderPass;
	var boardBatchNode = node._boardBatchNode;
	var boardBatchNodeRenderCmd = boardBatchNode._renderCmd;

	if (renderPass != null && boardBatchNodeRenderCmd._textureAtlas.totalQuads > 0) {
		// redirect drawing to render pass
		renderPass.beginWithResetClear(node._renderPassStackId);

		// prepare board batch node for draw
		var boardBatchNodeShaderProgram = boardBatchNodeRenderCmd._shaderProgram;
		boardBatchNodeShaderProgram.use();
		boardBatchNodeShaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
		boardBatchNode._arrayMakeObjectsPerformSelector(boardBatchNode._children, cc.Node._stateCallbackType.updateTransform);

		// separate blend function to account for rendering to offscreen texture
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA, gl.ONE);

		// draw board batch node
		boardBatchNodeRenderCmd._textureAtlas.drawQuads();

		// stop redirecting drawing
		renderPass.endWithReset(node._renderPassStackId);

		// use non batch node's transform to render batch node
		var boardNonBatchNode = node._boardNonBatchNode;
		var boardNonBatchNodeRenderCmd = boardNonBatchNode._renderCmd;
		boardNonBatchNodeRenderCmd.updateMatricesForRender();

		// render pass rotated to screen
		var shaderProgram = shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
		//var shaderProgram = shaderCache.programForKey("FXAA");
		shaderProgram.use();
		shaderProgram._setUniformForMVPMatrixWithMat4(boardNonBatchNodeRenderCmd._stackMatrix);
		// set blend function to account for rendering to offscreen texture
		cc.glBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		cc.glBindTexture2DN(0, renderPass.getTexture());
		renderPass.render();

		boardNonBatchNodeRenderCmd.updateMatricesAfterRender();
	}
};

TileLayer.create = function(layer) {
	return BaseLayer.create(layer || new TileLayer());
};

module.exports = TileLayer;
