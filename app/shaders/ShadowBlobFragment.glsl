// glslify blows up unless first line is comment or empty
// CC_Texture0 is noise texture
uniform float u_time;
uniform vec3 u_color;
uniform vec2 u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves2(in vec3 v, int octaves) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<2; i++) {
		if(i >= octaves) break;
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}

void main() {
	float t = u_time * 0.25;

	vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);
	vec2 uv = v_texCoord.xy;
	vec2 p = (uv * 4.0 - 2.0) * aspect;

	vec2 polar = vec2(atan(p.x, p.y), length(p) * 0.9);

	float dist = polar.y;

	vec2 dom = vec2(polar.x, polar.y - t) * 1.0;
	vec3 fbmInput = vec3(dom, t);
	vec3 fbmInput2 = 1.0 * vec3(dom,0.);
	float fbmVal = getNoiseAbsFBMOctaves2(fbmInput2 - 0.5*getNoiseAbsFBMOctaves2(fbmInput, 2),1);
	float turb = dist + 0.67 + fbmVal * 0.5;
	vec3 color = vec3(turb * 0.65);
	color = mix(vec3(0.0), color, smoothstep(0.25, 1.0, dist*turb));

	gl_FragColor = v_fragmentColor * vec4(color, 1.0);
}
