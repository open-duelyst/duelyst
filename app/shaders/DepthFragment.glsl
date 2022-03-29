// glslify blows up unless first line is comment or empty
uniform vec2 u_resolution;

varying vec2 v_texCoord;
varying float v_depthRange;

#pragma glslify: getPackedDepth = require(./helpers/DepthPack.glsl)

void main() {
	float alpha = texture2D(CC_Texture0, v_texCoord).a;
	if (alpha < 0.1) {
		discard;
	}
  float depth = (gl_FragCoord.y - v_depthRange) / u_resolution.y;
	gl_FragColor = getPackedDepth(depth);
}
