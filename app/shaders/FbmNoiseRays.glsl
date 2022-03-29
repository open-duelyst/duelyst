// glslify blows up unless first line is comment or empty
// CC_Texture0 is noise texture
uniform float u_time;
uniform vec2  u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves1(in vec3 v) {
	return abs(getNoise3D(v));
}

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

void main() {

  float t = u_time * 0.1;
  vec2 uv =  v_texCoord; // gl_FragCoord.xy / vec2(u_texResolution.x,u_texResolution.y);
  vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);

  vec2 p = uv * aspect;
  float dist = p.y - 0.4;

  vec2 dom = vec2(p.x, 0.0);

  float complexity1 = 5.0;
  float complexity2 = 1.0;
  float turb1 = 0.4 * getNoiseAbsFBMOctaves5(vec3(dom * complexity1, t)) - dist;
  float turb2 = getNoiseAbsFBMOctaves1(vec3(dom * complexity2, t*2.)) - dist;
  float turb3 = getNoiseAbsFBMOctaves1(vec3(dom * complexity2, 100.+t*2.)) - dist;
  float turb1Mask = 2.0 * getNoiseAbsFBMOctaves1(vec3(dom * complexity2, t*4.)) - dist/2.;
  turb1 *= turb1Mask;

  vec3 color = vec3(0.3*(turb3 + turb2) + turb1/4.);

	gl_FragColor = v_fragmentColor * vec4(color, 1.0);

}
