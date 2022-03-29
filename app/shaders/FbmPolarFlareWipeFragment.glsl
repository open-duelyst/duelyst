// glslify blows up unless first line is comment or empty
uniform float u_phase;
uniform float u_time;
uniform vec2  u_size;

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

vec4 disc(vec2 p, float radius, vec2 center) {
  // Offset uv with the center of the circle.
  vec2 uv = p - center;
  float dist = sqrt(dot(uv, uv));
  float t = smoothstep(radius+radius/0.75, radius-radius/0.75, dist);
  return mix(vec4(0.0), vec4(1.0), t);
}

float adjustLevels (in float inChannel, in float inBlack, in float inWhite, in float inGamma, in float outBlack, in float outWhite) {
	return pow((inChannel - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack;
}

void main()
{
	// params
	float t = u_time / 100.0;
	// shader blows up at phase 0, so clamp
	float in_phase = abs(3.0 * sin(max(0.001, u_phase)*1.));
	float phase = min(1.0,in_phase*1.0);//0.5 + sin(iGlobalTime*1.)*0.5;
	float wispSize = phase * 0.1;
	float flareSize = phase * 0.4;
	float flareIntensity = 3.0;
	float flareComplexity = 1.0;

	// level params
	float tighten = 0.0;
	float intensity = 1.0;
	float inWhite = 0.7;
	float gamma = 1.5;
	float inBlack = 0.0;

	// polar coordinates
	vec2 uv = v_texCoord;
	vec2 p = uv - 0.5;
	float len = length(p);
	float falloff = max(0.0, 1.0 - pow(len * 2.0, 2.0));
	vec2 polar = vec2(atan(p.x, p.y), (len + 0.1));

	float vignetteValue = (0.025)+disc(uv,flareSize,vec2(0.5)).a;

	// turbulence
	vec2 dom = vec2(cos(polar.x + t), sin(polar.x + t)) * flareComplexity;
	float turb = getNoiseAbsFBMOctaves4(vec3(dom, t*12.)) / flareIntensity;
	turb -= (1.0 - vignetteValue);
	turb += vignetteValue * 1.0;
	turb = turb * falloff;

	// color
	vec4 finalColor = vec4(vec3(turb), 1.0);

	float t2 = 5.0 / 15.0;
	float phase2 = max(0.00001,in_phase*0.5 - 0.15); // phase from 0.001 to 2.0 to wipe out the flare
	float flareSize2 = phase2 * 0.2;
	float flareIntensity2 = 3.0;
	float flareComplexity2 = 1.0;
	float vignetteValue2 = (1.5)*disc(uv,flareSize2,vec2(0.5)).a;

	// turbulence
	vec2 dom2 = vec2(cos(polar.x * 2.0 + t), sin(polar.x * 2.0 + t)) * flareComplexity;
	float turb2 = getNoiseAbsFBMOctaves4(vec3(dom2, t2*12.)) / flareIntensity;
	turb2 += vignetteValue2 * 1.0;
	turb2 = turb2 * falloff;

	float final = max(0.0,turb-turb2);
	final = adjustLevels(final, inBlack, inWhite, gamma, 0.0, 1.0);

	// vec4 nextColor = vec4(vec3(final), 1.0);
	finalColor = mix(vec4(1.0), v_fragmentColor, smoothstep(1.0, 0.5, final));
	finalColor = mix(finalColor, vec4(0.0), smoothstep(0.5, 0.0, final));

	gl_FragColor = finalColor;
}
