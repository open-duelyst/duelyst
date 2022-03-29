// glslify blows up unless first line is comment or empty
// CC_Texture0 is depth map for z sorting
varying vec2 v_texCoord;

#pragma glslify: getUnpackedDepth = require(./helpers/DepthUnpack.glsl)

void main() {
	vec4 packedScreenDepth = texture2D(CC_Texture0, v_texCoord);
	float depth = getUnpackedDepth(packedScreenDepth);
	gl_FragColor = vec4(depth, 0.0, 0.0, 1.0);
}
