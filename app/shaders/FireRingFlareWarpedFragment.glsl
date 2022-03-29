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
float getNoiseAbsFBMOctaves4(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<4; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}
float getNoiseAbsFBMOctaves1(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	res += abs(getNoise3D(v)) * scale;
	v *= vec3(2.0);
	scale *= 0.5;
	return res;
}

vec3 calc_pal(float x) {
	vec3 col = mix(vec3(1.0, 0.9, 0.2), vec3(0.8, 0.2, 0.1), smoothstep(1.0, 0.5, x));
	col = mix(col, vec3(0.0, 0.0, 0.0), smoothstep(0.5, 0.0, x));
	return col;
}


void main() {
	float t = u_time * 0.25;
	float phase = u_phase + 0.5;

	vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);
	vec2 uv = v_texCoord.xy;
	vec2 p = (uv * 2.0 - 1.0) * aspect;

	vec2 polar = vec2(atan(p.x, p.y), (length(p) + 0.025) * phase);

	float dist = polar.y;
	vec2 dom = vec2(polar.x, polar.y - t) * COMPLEXITY;

	vec3 fbmInput = vec3(dom,t);
	vec3 fbmInput2 = 1.0 * vec3(dom,2.) + phase;
	float fbmVal = getNoiseAbsFBMOctaves1(fbmInput2 - 0.75 * getNoiseAbsFBMOctaves4(fbmInput));
	float turb = fbmVal; //dist + 0.67 + fbmVal * 0.5;

	turb += mix(1.0,turb,smoothstep(0.0, 1.0, dist));
	turb = mix(0.0,turb,smoothstep(0.4/phase, 0.9/phase, dist*turb));
	turb = mix(turb,0.0,smoothstep(0.4, 1.0, dist/phase));

	//turb = 1.0-mix(0.0,turb,smoothstep(0.4/phase, 0.6/phase, dist*turb));

	vec3 color = calc_pal(turb * 0.95);
	//color = mix(vec3(0.8, 0.2, 0.1), color, smoothstep(0.5/phase, 0.8/phase, dist*turb));
	//color = mix(vec3(0.0), color, smoothstep(0.4/phase, 0.6/phase, dist*turb));

	gl_FragColor = v_fragmentColor * vec4(color, 1.0);
}
