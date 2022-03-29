// glslify blows up unless first line is comment or empty
#define M_PI                3.14159
#define COMPLEXITY          4.0
#define FBM_STEPS           1
#define COLOR               vec3(46.0, 206.0, 240.0) / vec3(255.0)

uniform float u_time;
uniform vec2 u_texResolution;
uniform float u_flareAmount;

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

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves6(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<6; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}

//
// DRAW Disc / Cirle
//

vec3 disc(vec2 p, float radius, vec2 center, float border) {

  // Offset uv with the center of the circle.
  vec2 uv = p - center;
  float dist = sqrt(dot(uv, uv));

  // float t = smoothstep(radius+0.1, radius-0.1, dist);

  float t = 1.0 + smoothstep(radius, radius+border, dist) - smoothstep(radius-border, radius, dist);

  return mix(vec3(1.0), vec3(0.0), t);
}

void main() {

  float t = u_time;
  vec2 uv = v_texCoord;

  vec4 texColor = texture2D(CC_Texture0,uv);
  vec3 texColorRgb = texColor.rgb;

  float falloffVal = (texColor.r + texColor.g + texColor.b) / 3.0;

  // add noise
  vec2 dom = vec2(uv.x, uv.y) * COMPLEXITY;
  float turb = getNoiseAbsFBMOctaves6(vec3(dom, t*0.1));
  vec3 turbColor = 50.0 * pow(turb,3.0) * texColorRgb * vec3(smoothstep(0.0,1.0,falloffVal-0.01));

  // add horizontal flaring
  vec2 horizontal = vec2(0.0, uv.y) * COMPLEXITY;
  float turbH = getNoiseAbsFBMOctaves4(vec3(horizontal, t*0.1));
  turbColor += 6.5 * pow(turbH,3.0)*texColorRgb;

  // flipping the uv.y seems to be needed on cocos
  // by not flipping it the effect looks interesting on sprites with transparent falloff to the bottom
  float uvyFalloff = 1.0 - uv.y;

  // stronger on top
  //turbColor += turbColor * (2.0*pow(uvyFalloff,2.0));

  turbColor = mix(vec3(0.0),turbColor,uvyFalloff*0.5);
  texColorRgb += u_flareAmount * turbColor;

  gl_FragColor = vec4(texColorRgb,v_fragmentColor.a);
}
