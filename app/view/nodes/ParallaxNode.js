/****************************************************************************
 ParallaxNode
 ****************************************************************************/

var ParallaxNode = cc.ParallaxNode.extend({
	usesSubPixelPosition: true,
	_cascadeColorEnabled: false,
	_cascadeOpacityEnabled: true,

	_updateParallaxPosition: function(){
		var pos = this.getPosition();
		if (!cc.pointEqualToPoint(pos, this._lastPosition)) {
			var locParallaxArray = this.parallaxArray;
			for (var i = 0, len = locParallaxArray.length; i < len; i++) {
				var point = locParallaxArray[i];
				var child = point.getChild();
				var offset = point.getOffset();
				var ratio = point.getRatio();
				child.setPosition(
					offset.x + pos.x * ratio.x - pos.x,
					offset.y + pos.y * ratio.y - pos.y
				);
			}
			this._lastPosition = pos;
		}
	}
});

ParallaxNode.create = function() {
	return new ParallaxNode();
};

module.exports = ParallaxNode;
