// glslify blows up unless first line is comment or empty
#define COMPLEXITY    	4.0

uniform float u_phase;
uniform float u_time;
uniform vec2  u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves2(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<2; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves3(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<3; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}

//
// DRAW Disc / Cirle
//

vec3 vignette(in vec2 p, in float radius, in vec2 center) {
  // Offset uv with the center of the circle.
  vec2 uv = p - center;
  float dist = sqrt(dot(uv, uv));
  return vec3(smoothstep(radius, radius-1.0, dist));
}

void main() {
  float t = u_time;
  float phase = 0.5*u_phase;

  vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);
  vec2 uv = v_texCoord;

  // disc
  vec3 discColor = vignette(uv,phase,vec2(0.5)*aspect);

  float falloffVal = (discColor.r + discColor.g + discColor.b) / 3.0;

  // add noise
  vec2 dom = vec2(uv.x, uv.y) * COMPLEXITY;
  float turb = getNoiseAbsFBMOctaves2(vec3(dom, t*0.1));
  vec3 turbColor = 6.0 * pow(turb,3.0) * discColor * vec3(smoothstep(0.0,1.0,falloffVal-0.01));

  // add horizontal flaring
  vec2 horizontal = vec2(0.0, uv.y) * COMPLEXITY;
  float turbH = getNoiseAbsFBMOctaves3(vec3(horizontal, t*0.1));
  turbColor += 2.5*pow(turbH,3.0)*discColor;

  // stronger on top
  //turbColor += turbColor * (2.0*pow(uv.y,2.0));

  turbColor = mix(vec3(0.0),turbColor,uv.y*0.75);
  discColor += turbColor;

  // color
  vec4 color = mix(vec4(vec3(1.0),v_fragmentColor.a), v_fragmentColor, smoothstep(1.0, 0.0, discColor.x));
  color = mix(color, vec4(0.0), smoothstep(0.5, 0.0, discColor.x));

	gl_FragColor = color;
}
