//pragma PKGS: alwaysloaded

var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var FXSprite = require('./FXSprite');

/****************************************************************************
FXFbmPolarFlareWipeSprite
 - use sprite.setTextureRect(cc.rect(x, y, w, h)) to define the size of the sprite
 ****************************************************************************/

var FXFbmPolarFlareWipeSprite = FXSprite.extend({
	shaderKey: "FbmPolarFlareWipe",

	antiAlias: true,
	autoZOrder: false,
	removeOnEnd: false,
	timeScale:1.0,

	// uniforms
	phase: 0.0, // between 0.0 and 1.0

	_createRenderCmd: function(){
		if(cc._renderType === cc._RENDER_TYPE_CANVAS) {
			return this._super();
		} else {
			return new FXFbmPolarFlareWipeSprite.WebGLRenderCmd(this);
		}
	},

	setDefaultOptions: function () {
		this._super();

		// procedural fx should usually have a scale of 1
		this.setScale(1.0);
	},

	setOptions: function (options) {
		this._super(options);
		if (options.phase != null) { this.phase = options.phase; }
	},

	updateTweenAction:function(value, key){
		switch (key) {
			case "phase":
				this.phase = value;
				break;
			default:
				FXSprite.prototype.updateTweenAction.call(this, value, key);
				break;
		}
	}
});

FXFbmPolarFlareWipeSprite.WebGLRenderCmd = function(renderable){
	FXSprite.WebGLRenderCmd.call(this, renderable);
};
var proto = FXFbmPolarFlareWipeSprite.WebGLRenderCmd.prototype = Object.create(FXSprite.WebGLRenderCmd.prototype);
proto.constructor = FXFbmPolarFlareWipeSprite.WebGLRenderCmd;

proto.rendering = function () {
	var node = this._node;

	this.updateMatricesForRender();

	var gl = cc._renderContext;
	var shaderProgram = this._shaderProgram;
	shaderProgram.use();
	shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
	shaderProgram.setUniformLocationWith2f(shaderProgram.loc_size, node._rect.width, node._rect.height);
	shaderProgram.setUniformLocationWith1f(shaderProgram.loc_time, node.getFX().getTime() * node.timeScale);
	shaderProgram.setUniformLocationWith1f(shaderProgram.loc_phase, node.phase);
	cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

	cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
	gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
	if(this._quadDirty) {
		this._quadDirty = false;
		gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
	}
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
	gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	this.updateMatricesAfterRender();
};

FXFbmPolarFlareWipeSprite.create = function(options, sprite) {
	return FXSprite.create.call(this, options, sprite || new FXFbmPolarFlareWipeSprite(options));
};

module.exports = FXFbmPolarFlareWipeSprite;
