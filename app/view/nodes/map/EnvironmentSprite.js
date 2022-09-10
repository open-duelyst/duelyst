const BaseSprite = require('../BaseSprite');

/** **************************************************************************
EnvironmentSprite
var EnvironmentSprite = BaseSprite
EnvironmentSprite.create()
 *************************************************************************** */

const EnvironmentSprite = BaseSprite.extend({
  occludes: true,
  castsShadows: false,
});

EnvironmentSprite.create = function (options, sprite) {
  return BaseSprite.create(options, sprite || new EnvironmentSprite(options));
};

module.exports = EnvironmentSprite;
