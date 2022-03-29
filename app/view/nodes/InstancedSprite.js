var BaseSprite = require('./BaseSprite');

/****************************************************************************
 InstancedSprite
 var InstancedSprite = BaseSprite
 InstancedSprite.create()
 - this sprite is pooled, so that it may be reused with better performance
 - this sprite is instanced, so all instances of it will use the same (dynamic) texture but may be different sizes
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 - override this sprite's renderCmd.renderingForInstancing to setup rendering of the instanced texture
 ****************************************************************************/

var InstancedSprite = BaseSprite.extend({

	_instancingId: "InstancingId",

	setDefaultOptions: function () {
		BaseSprite.prototype.setDefaultOptions.call(this);

		// set default shader as pos/tex/color
		// cocos sets default shader to pos/color for sprites without textures
		// but this sprite will always use an instanced texture
		var shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
		this.setShaderProgram(shaderProgram);
	},
	_createRenderCmd: function(){
		if(cc._renderType === cc._RENDER_TYPE_CANVAS) {
			return BaseSprite.prototype._createRenderCmd.call(this);
		} else {
			return new InstancedSprite.WebGLRenderCmd(this);
		}
	},
	onEnter: function () {
		BaseSprite.prototype.onEnter.call(this);
		this.getFX().addInstance(this._instancingId, this);
	},
	onExit: function () {
		BaseSprite.prototype.onExit.call(this);
		this.getFX().removeInstance(this._instancingId, this);
		cc.pool.putInPool(this);
	},
	setVisible: function (val) {
		var isVisible = this.isVisible();
		BaseSprite.prototype.setVisible.call(this, val);
		if (isVisible !== this.isVisible()) {
			this.getFX().setInstancesDirty(this._instancingId);
		}
	},
	onContentSizeChanged: function () {
		BaseSprite.prototype.onContentSizeChanged.call(this);
		this.getFX().setInstancesDirty(this._instancingId);
	},
	getRenderingForInstancing: function () {
		return this._renderCmd.renderingForInstancing;
	}
});

InstancedSprite.WebGLRenderCmd = function(renderable){
	BaseSprite.WebGLRenderCmd.call(this, renderable);
};
var proto = InstancedSprite.WebGLRenderCmd.prototype = Object.create(BaseSprite.WebGLRenderCmd.prototype);
proto.constructor = InstancedSprite.WebGLRenderCmd;

proto.renderingForInstancing = function (fx, instancingId, instancedRenderPass, instances) {
	// override in subclass and render to instanced pass
};

proto._setTextureCoords = function () {
	// instanced sprites should always use 0-1 texture coordinates
	this.setTextureCoordsEdgeToEdge();
};

InstancedSprite.create = function (options, node) {
	if (node == null) {
		node = cc.pool.getFromPool(InstancedSprite, options) || new InstancedSprite(options);
	}
	return node;
};

module.exports = InstancedSprite;
