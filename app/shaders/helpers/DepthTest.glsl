#pragma glslify: getUnpackedDepth = require(./DepthUnpack.glsl)

bool getDepthTestFailed (in sampler2D depthMap, in vec2 screenTexCoord, in float depth) {
	vec4 packedScreenDepth = texture2D(depthMap, screenTexCoord);
	float screenDepth = getUnpackedDepth(packedScreenDepth);
	return screenDepth < depth;
}

#pragma glslify: export(getDepthTestFailed)
