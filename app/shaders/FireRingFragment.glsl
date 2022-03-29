// glslify blows up unless first line is comment or empty
#define COMPLEXITY 	2.0

// CC_Texture0 is noise texture
uniform float u_phase;
uniform float u_time;
uniform vec3 u_color;
uniform vec2 u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

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

vec3 calc_pal(in float x) {
	vec3 col = mix(vec3(1.0, 1.0, 1.0), u_color, smoothstep(1.4, 1.6, x));
	col = mix(col,	u_color/5.0, smoothstep(1.5, 1.8, x));
	col = mix(col, vec3(0.0, 0.0, 0.0), smoothstep(1.8, 2.0, x));
	return col;
}

void main() {
	float t = u_time * 0.25;
	float phase = u_phase + 0.5;

	vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);
	vec2 uv = v_texCoord.xy;
	vec2 p = (uv * 4.0 - 2.0) * aspect;

	// makes a ring
	// vec2 polar = vec2(atan(p.x-t, p.y), length(p) * 0.9);

	vec2 polar = vec2(atan(p.x, p.y), (length(p) + 0.1) * phase);
	float dist = polar.y;

	// without rotation:
	// vec2 dom = vec2(polar.x, polar.y - t) * COMPLEXITY;

	// with rotation
	// vec2 dom = vec2(polar.x - t, polar.y - t) * COMPLEXITY;

	vec2 dom = vec2(polar.x, polar.y - t) * COMPLEXITY;
	float turb = dist*phase + 0.67/phase + getNoiseAbsFBMOctaves3(vec3(dom, t)) * (0.35/phase);
	vec3 color = calc_pal(turb * 0.95);
	color = mix(vec3(0.0), color, smoothstep(0.5/phase, 0.7/phase, dist*turb));

	gl_FragColor = v_fragmentColor * vec4(color, 1.0);
}
