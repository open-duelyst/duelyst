// glslify blows up unless first line is comment or empty
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform vec2 u_direction;
uniform float u_ramp;
uniform float u_rampMin;
uniform float u_rampMax;
uniform float u_decay;
uniform float u_spread;
uniform float u_speed;
uniform float u_frequency;
uniform float u_time;

float getHash (in vec2 coord) {
	return fract(sin(dot(coord, vec2(90.1235, 125.752))) * 12454.0);
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

void main() {
	// sample modifier is 1.0 / number of iterations
	float sampleModifier = 1.0 / 150.0;

	// fake angle of incidence (horizontal gradient ramp with 0 in the middle)
	// we're just multiplying the alpha by the absolute of the difference to the origin
	float incidence = clamp(pow(abs(v_texCoord.x - 0.5), u_ramp), u_rampMin, u_rampMax) * 2.0;
	vec2 texCoordStep = u_direction * sampleModifier * u_spread;
	vec2 texCoordOffset = vec2(cos(u_time * 0.3 + u_speed), sin(u_time * 0.3 + u_speed)) * (u_speed * 0.1);

	vec4 blurColor = vec4(0.0);
	float weight = 1.0;
	vec2 texCoord = v_texCoord;
	for (int i = 0; i < 150; i++) {
		texCoord -= texCoordStep;
		vec4 texel = texture2D(CC_Texture0, texCoord);
		float noise = getNoise(texCoord * u_frequency + texCoordOffset);
		texel *= noise * weight;
		blurColor += texel;
		weight *= u_decay;
	}

	gl_FragColor = v_fragmentColor * min(blurColor, vec4(1.0)) * incidence;
}
