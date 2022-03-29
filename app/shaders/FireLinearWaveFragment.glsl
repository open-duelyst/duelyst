// glslify blows up unless first line is comment or empty
#define COMPLEXITY  3.0

// CC_Texture0 is noise texture
uniform float u_phase;
uniform float u_time;
uniform vec2  u_resolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves5(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<5; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}

vec3 calc_pal(in float x) {
  vec3 col = mix(vec3(0.0, 0.9, 0.5), vec3(0.0, 0.2, 0.4), smoothstep(1.2, 1.6, x));
  col = mix(col, vec3(0.0, 0.0, 0.0), smoothstep(1.5, 1.8, x));
  return col;
}

void main() {
  float t = u_time * 0.1;
  float phase = u_phase;
  vec2 uv = gl_FragCoord.xy / vec2(u_resolution.x,u_resolution.y);
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  vec2 p = (uv * 1.5 + 0.75) * aspect;
  p.y = p.y - phase/1.0;

  vec2 polar = p;

  float dist = polar.y;
  vec2 dom = vec2(polar.x, polar.y - t - phase*0.5) * COMPLEXITY;
  float turb = dist + (0.5+0.5*phase) + getNoiseAbsFBMOctaves5(vec3(dom, t)) * (0.35 + phase);
  vec3 color = calc_pal(turb * 0.95);
  color = mix(vec3(0.0), color, smoothstep(0.75*phase, 2.0*phase, dist * turb));

  // fade the color in over first 10% of the phase
  color *= min(1.0,phase * 10.0);

	gl_FragColor = v_fragmentColor * vec4(color, 1.0);
}
