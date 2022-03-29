// glslify blows up unless first line is comment or empty
uniform float u_time;
uniform vec2 u_texResolution;
uniform float u_intensity;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise2D = require(./helpers/Noise2D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves4(in vec2 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<4; i++) {
		res += abs(getNoise2D(v)) * scale;
		v *= vec2(2.0);
		scale *= 0.5;
	}
	return res;
}

void main() {
	float t = u_time;
	float aspect = u_texResolution.x / u_texResolution.y;

	vec2 uv = v_texCoord;

	vec2 dom = vec2((uv.x - t) * aspect, uv.y + t) * 0.5;
	float turb = getNoiseAbsFBMOctaves4(dom);

	vec2 uv2 = uv + vec2(turb*.04);
	vec4 mapColor = texture2D(CC_Texture0,uv2);

	gl_FragColor = mapColor;
}
