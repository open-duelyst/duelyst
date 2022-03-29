#pragma glslify: getNoise2D = require(./Noise2D.glsl)

float fbm(in vec2 coord, in float frequency, in float amplitude)
{
	float fractalSum = 0.0;
	for (int i = 0; i < 2; i++) {
		fractalSum += abs((getNoise2D(coord * frequency) - 0.5) * 2.0) * amplitude;
		frequency *= 2.0;
		amplitude *= 0.5;
		coord *= 2.0;
	}
	return fractalSum;
}

float getNoiseRotatedFBM (in vec2 coord, in float time, in float frequency, in float amplitude) {
	vec2 basis = vec2(fbm(coord - time * 1.6, frequency, amplitude), fbm(coord + time * 1.7, frequency, amplitude));
	basis = (basis - 0.5) * 0.2;
	coord += basis;
	float c = cos(time * 0.2);
	float s = sin(time * 0.2);
	mat2 timeMat = mat2(c, -s, s, c);
	return fbm(coord * timeMat, frequency, amplitude);
}

#pragma glslify: export(getNoiseRotatedFBM)
