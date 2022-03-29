//pragma PKGS: game

var CONFIG = require('app/common/config');
var GlowSprite = require('./../GlowSprite');

/****************************************************************************
 EntitySprite
 var EntitySprite = GlowSprite
 EntitySprite.create()
 ****************************************************************************/

var EntitySprite = GlowSprite.extend({
	// entity sprites should alias as they are always pixel art
	antiAlias: false,
	// entities need a smaller dissolve frequency
	dissolveFrequency: 15.0,
	// entities need a higher dissolve edge falloff
	dissolveEdgeFalloff: 0.75,
	// entities don't need the dissolve vignette effect
	dissolveVignetteStrength: 0.0
});

EntitySprite.create = function (options, sprite) {
	return GlowSprite.create(options, sprite || new EntitySprite(options));
};

module.exports = EntitySprite;
