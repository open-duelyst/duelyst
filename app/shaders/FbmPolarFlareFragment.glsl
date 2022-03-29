// glslify blows up unless first line is comment or empty
#define PI 3.1415926535897932384626433832795

uniform float u_phase;
uniform float u_time;
uniform vec2 u_size;
uniform vec3 u_flareColor;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves4(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<4; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= 2.0;
		scale *= 0.5;
	}
	return res;
}

//
// DISC
//
vec4 disc(vec2 p, float radius, vec2 center) {
  // Offset uv with the center of the circle.
  vec2 uv = p - center;
  float dist = sqrt(dot(uv, uv));
  float t = smoothstep(radius+radius/0.75, radius-radius/0.75, dist);
  return mix(vec4(0.0), vec4(1.0), t);
}

//
// LEVELS
//
float adjustLevels (in float inChannel, in float inBlack, in float inWhite, in float inGamma, in float outBlack, in float outWhite) {
	return pow((inChannel - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack;
}

void main()
{
	// params
	float t = u_time * 0.1;
	// shader blows up at phase 0, so clamp
	float phase = max(0.001, u_phase);
	float wispSize = phase * 0.1;
	float flareSize = phase * 0.4;
	float flareIntensity = 3.0;
	float flareComplexity = 0.75;

	// level params
	float tighten = 0.0;
	float intensity = 1.0;
	float inWhite = 1.0;
	float gamma = 1.0;
	float inBlack = 0.0;
	vec3 color = u_flareColor; // vec3(1.0,0.75,0.0);

	// polar coordinates
	vec2 uv = v_texCoord;
	vec2 p = uv - 0.5;
	float len = length(p);
	float falloff = max(0.0, 1.0 - pow(len * 2.0, 2.0));
	vec2 polar = vec2(atan(p.y, p.x), (len + 0.1));

	float vignetteValue = (0.1)+disc(uv,flareSize,vec2(0.5)).a;

	// turbulence
	vec2 dom = vec2(cos(polar.x + t), sin(polar.x + t)) * flareComplexity;
	float turb = getNoiseAbsFBMOctaves4(vec3(dom, t*12.)) / flareIntensity;
	turb -= (1.0 - vignetteValue);
	turb = adjustLevels(turb,inBlack,inWhite, gamma, 0.0,1.0);
	turb += vignetteValue * 1.0;
	turb = turb * falloff;

	// color
	vec4 finalColor = vec4(vec3(turb), 1.0);
	finalColor = mix(finalColor, finalColor*vec4(color,1.0), smoothstep(1.0, 0.75, turb));
	finalColor = mix(finalColor, vec4(0.0), smoothstep(1.0, 0.0, turb));

	gl_FragColor = v_fragmentColor * finalColor;
}
