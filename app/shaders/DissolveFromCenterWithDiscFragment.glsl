// glslify blows up unless first line is comment or empty
#define COMPLEXITY 	2.0

uniform float u_phase;
uniform float u_time;
uniform vec2  u_texResolution;

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

vec3 disc(in vec2 p, in float radius, in vec2 center) {
	// Offset uv with the center of the circle.
	vec2 uv = p - center;
	float dist = sqrt(dot(uv, uv));
	float t = smoothstep(radius+0.1, radius-0.1, dist);
	return mix(vec3(0.0), vec3(1.0), t);
}

void main() {
	vec4 textureColor = texture2D(CC_Texture0, v_texCoord);

	float t = u_time;
	float phase = u_phase; // 0.5 + sin(t*2.) * 0.5;

	vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);
	vec2 uv = aspect*v_texCoord;

	// disc
	vec3 discColor = disc(uv,phase,vec2(0.5)*aspect);

	vec2 dom = vec2(uv.x, uv.y) * COMPLEXITY;
	float turb = getNoiseAbsFBMOctaves4(vec3(dom, t*0.1));
	discColor += (turb)*disc(uv,phase+0.2,vec2(0.5)*aspect);

	// color
	vec3 color = discColor;

	// threshold
	color = max(((step(0.75, color))) * 1.0, 0.0);

	gl_FragColor = v_fragmentColor * vec4(color,textureColor.a);
}
