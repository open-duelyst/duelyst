// glslify blows up unless first line is comment or empty
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

void main() {

  float t = u_time * 0.1;
  vec2 uv =  v_texCoord;
  vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);

  vec2 p = uv * aspect;
  float dist = 1.0 - p.y;

  vec2 dom = vec2(p.x, p.y);

  float complexity1 = 3.0;
  float complexity2 = 2.0;
  float turb1 = 0.5 * getNoiseAbsFBMOctaves4(vec3(dom * complexity1, t)) - dist; //for full length use -dist/2.0 at the end
  float turb2 = 0.5 * getNoiseAbsFBMOctaves1(vec3(dom * complexity2, t*2.)) - dist; //for full length use -dist/2.0 at the end

  float noiseValue = 0.5*(1.-dist) + (turb2 + turb1);

  vec4 texColor = texture2D(CC_Texture0,uv);
  vec3 texColorRgb = texColor.rgb;

	gl_FragColor = v_fragmentColor * texColor * vec4(vec3(1.0), noiseValue);
}
