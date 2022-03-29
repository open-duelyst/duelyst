#pragma glslify: getNoise3D = require(./Noise3D.glsl)

float getNoiseAbsFBMOctaves1(in vec3 v) {
	return abs(getNoise3D(v));
}

#pragma glslify: export(getNoiseAbsFBMOctaves1)
