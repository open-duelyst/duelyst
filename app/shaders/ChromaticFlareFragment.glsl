// glslify blows up unless first line is comment or empty
#define PI 3.1415926535897932384626433832795

uniform float u_phase;
uniform float u_time;
uniform vec2 u_size;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_smoothstepMin;
uniform float u_smoothstepMax;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: SeededRandom = require(./helpers/SeededRandom.glsl)

float getNoiseAbsFBMOctaves4(in vec2 v, in float frequency, in float amplitude) {
	float res = 0.0;
	for(int i=0; i<4; i++) {
		res += texture2D(CC_Texture0, v).x * amplitude;
		v.x = mod(v.x + frequency, 1.0);
		amplitude *= 0.5;
		frequency *= 2.0;
	}
	return res;
}

void main() {
	// params
	float tighten = 0.0;
	float intensity = 1.0;
	float inWhite = 1.0;
	float gamma = 1.0;
	float inBlack = 0.0;

	float colorPhase = 1.25 + u_phase * 0.1;
	float aspect = u_size.x / u_size.y;
	vec2 uv = vec2(v_texCoord);
	vec2 p = v_texCoord - 0.5;
	float len = length(p);

	// calculate color
	vec3 color;
	for(int i = 0; i < 3; i++) {
		colorPhase += 0.1;
		uv += p / len * (sin(colorPhase) + 1.0) * abs(sin(len * 1.0 - colorPhase * 2.0));
		color[i] = 0.1 / length(abs(mod(uv, 1.0) - 0.5)) * 0.6;
	}
	color /= len;

	// polar noise
	float radians = atan(p.y, p.x) * u_frequency;
	float polarAngle = abs(radians) / PI;
	vec2 polar = vec2(u_time, polarAngle);
	float noise = getNoiseAbsFBMOctaves4(polar, u_frequency, u_amplitude);

	// random depth
	float randStepMin = 10.0;
	float randStepMax = 25.0;
	float randStep = randStepMin + (randStepMax - randStepMin) * u_frequency;
	float randDepth = SeededRandom(1.0, floor((radians + u_time) * randStep + 0.5) / randStep);

	// vignette
  float invPhase = u_phase - 1.0;
  float vignetteEase = -(invPhase * invPhase * invPhase * invPhase - 1.0);
	float invVignette = pow(len * 3.0, 2.0) - vignetteEase;
	float retract = 1.0 - max(0.0, u_phase - 0.8) / 0.2;
	float overbloom = pow(1.0 - min(u_amplitude, len), 4.0);

	// ray
	float ray = smoothstep(u_smoothstepMin, u_smoothstepMax, noise);
	ray = clamp((ray * randDepth - invVignette + overbloom) * retract, 0.0, 1.0);

	gl_FragColor = v_fragmentColor * vec4(color, ray);
}
