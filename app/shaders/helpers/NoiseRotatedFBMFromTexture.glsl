float fbmX(in vec2 coord, in float frequency, in float amplitude, in sampler2D noiseMap)
{
	float fractalSum = 0.0;
	for (int i = 0; i < 2; i++) {
		vec2 texCoord = mod(coord * frequency, 1.0);
		fractalSum += abs((texture2D(noiseMap, texCoord).x - 0.5) * 2.0) * amplitude;
		frequency *= 2.0;
		amplitude *= 0.5;
		coord *= 2.0;
	}
	return fractalSum;
}

float fbmY(in vec2 coord, in float frequency, in float amplitude, in sampler2D noiseMap)
{
	float fractalSum = 0.0;
	for (int i = 0; i < 2; i++) {
		vec2 texCoord = mod(coord * frequency, 1.0);
		fractalSum += abs((texture2D(noiseMap, texCoord).y - 0.5) * 2.0) * amplitude;
		frequency *= 2.0;
		amplitude *= 0.5;
		coord *= 2.0;
	}
	return fractalSum;
}

float getNoiseRotatedFBM (in vec2 coord, in float time, in float frequency, in float amplitude, in sampler2D noiseMap) {
	vec2 basis = vec2(fbmX(coord - time * 1.6, frequency, amplitude, noiseMap), fbmY(coord + time * 1.7, frequency, amplitude, noiseMap));
	basis = (basis - 0.5) * 0.2;
	coord += basis;
	float c = cos(time * 0.2);
	float s = sin(time * 0.2);
	mat2 timeMat = mat2(c, -s, s, c);
	return fbmX(coord * timeMat, frequency, amplitude, noiseMap);
}

#pragma glslify: export(getNoiseRotatedFBM)
