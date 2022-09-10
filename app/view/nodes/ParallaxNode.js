/** **************************************************************************
 ParallaxNode
 *************************************************************************** */

const ParallaxNode = cc.ParallaxNode.extend({
  usesSubPixelPosition: true,
  _cascadeColorEnabled: false,
  _cascadeOpacityEnabled: true,

  _updateParallaxPosition() {
    const pos = this.getPosition();
    if (!cc.pointEqualToPoint(pos, this._lastPosition)) {
      const locParallaxArray = this.parallaxArray;
      for (let i = 0, len = locParallaxArray.length; i < len; i++) {
        const point = locParallaxArray[i];
        const child = point.getChild();
        const offset = point.getOffset();
        const ratio = point.getRatio();
        child.setPosition(
          offset.x + pos.x * ratio.x - pos.x,
          offset.y + pos.y * ratio.y - pos.y,
        );
      }
      this._lastPosition = pos;
    }
  },
});

ParallaxNode.create = function () {
  return new ParallaxNode();
};

module.exports = ParallaxNode;
