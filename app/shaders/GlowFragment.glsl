// glslify blows up unless first line is comment or empty
uniform vec4 u_color;

varying vec2 v_texCoord;
varying float v_stepX;
varying float v_stepY;
varying float v_pulseModifier;

void main() {
	vec4 color = texture2D(CC_Texture0, v_texCoord);

	// sample 3x3 box and accumulate alpha
	// to fake an expanding effect on the sprite
  float alpha = 0.0;

  // row1
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(-1.0 * v_stepX, -1.0 * v_stepY)).a;
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(0.0 * v_stepX, -1.0 * v_stepY)).a;
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(1.0 * v_stepX, -1.0 * v_stepY)).a;

  // row2
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(-1.0 * v_stepX, 0.0 * v_stepY)).a;
  alpha += color.a;
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(1.0 * v_stepX, 0.0 * v_stepY)).a;

  // row3
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(-1.0 * v_stepX, 1.0 * v_stepY)).a;
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(0.0 * v_stepX, 1.0 * v_stepY)).a;
  alpha += texture2D(CC_Texture0, v_texCoord + vec2(1.0 * v_stepX, 1.0 * v_stepY)).a;

	gl_FragColor = vec4(u_color.rgb, min(alpha, 1.0) * u_color.a * v_pulseModifier);
}
