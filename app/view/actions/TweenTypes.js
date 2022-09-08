/**
 * Tween string constants used by cocos action tween. Not all sprite classes account for each type.
 */
const TweenTypes = {
  // use to fade tint alpha for any BaseSprite
  TINT_FADE: 'tintFade',
  // use to dissolve for any BaseSprite
  DISSOLVE: 'dissolve',
  // use to fade glow alpha for any GlowSprite
  GLOW_FADE: 'glowFade',
  // use to change glow thickness for any GlowSprite
  GLOW_THICKNESS: 'glowThichness',
  // use to fade highlight alpha for any GlowSprite
  HIGHLIGHT_FADE: 'highlightFade',
  // use to control bloom intensity
  BLOOM_INTENSITY: 'bloomIntensity',
};

module.exports = TweenTypes;
