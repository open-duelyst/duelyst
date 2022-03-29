float getHash (in vec2 coord) {
	return fract(sin(dot(coord, vec2(234.1235, 123.752))) * 34702.0);
}

float getNoise (in vec2 coord) {
	vec2 coordWhole = floor(coord);
	vec2 coordFraction = fract(coord);
	vec2 smoothFraction = coordFraction * coordFraction * (3.0 - 2.0 * coordFraction);

	float bl = getHash(coordWhole);
	float br = getHash(vec2(coordWhole.x + 1.0, coordWhole.y));
	float tl = getHash(vec2(coordWhole.x, coordWhole.y + 1.0));
	float tr = getHash(vec2(coordWhole.x + 1.0, coordWhole.y + 1.0));
	float b = mix(bl, br, smoothFraction.x);
	float t = mix(tl, tr, smoothFraction.x);

	return mix(b, t, smoothFraction.y);
}

float getNoiseAbsFBM (in vec2 coord, in float time, in float frequency, in float amplitude) {
	float fractalSum = 0.0;

	time = time * 3.141592653589793 * 2.0 + 3.141592653589793;

	// fractional brownian motion
	for (int i = 0; i < 2; i++) {
		vec2 offset = vec2(cos(time + frequency), sin(time + frequency)) * (frequency * 0.1);
		float noise = getNoise(coord * frequency + offset);
		fractalSum += abs(2.0 * noise - 1.0) * amplitude;
		amplitude *= .5;
		frequency *= 2.0;
	}

	return fractalSum;
}

#pragma glslify: export(getNoiseAbsFBM)
