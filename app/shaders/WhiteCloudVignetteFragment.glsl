// glslify blows up unless first line is comment or empty
#define M_PI      3.14159
#define COMPLEXITY    2.0
#define FBM_STEPS     2
#define COLOR     vec3(46.0, 206.0, 240.0) / vec3(255.0)

uniform float u_time;
uniform vec2  u_texResolution;
uniform float u_vignetteAmount;
uniform float u_noiseAmount;

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

vec3 vignette(vec2 p, float radius, vec2 center) {

  // Offset uv with the center of the circle.
  vec2 uv = p - center;
  float dist = sqrt(dot(uv, uv));

  // float t = smoothstep(radius+0.1, radius-0.1, dist);

  return vec3(1.0 - smoothstep(radius, radius-0.7, dist));
}

void main() {

    float t = u_time * 0.5;
    vec2 uv = v_texCoord;

    // vec4 texColor = texture2D(CC_Texture0,uv);

    // vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);

    // disc
    float vignetteAmount = u_vignetteAmount;
    vec3 discColor = vignette(uv,vignetteAmount,vec2(0.5));

    float falloffVal = (discColor.r + discColor.g + discColor.b) / 3.0;

    // add noise
    vec2 dom = vec2(uv.x, uv.y) * COMPLEXITY;
    float turb = getNoiseAbsFBMOctaves6(vec3(dom, t*0.1));
    vec3 turbColor = 12.0 * pow(turb,3.0) * discColor * vec3(smoothstep(0.0,1.0,falloffVal-0.01));

    vec2 dust = vec2(uv.x+0.25, uv.y*t/200.0) * COMPLEXITY;
    float dustNoise = getNoise3D(vec3(dust*40.,t/3.)) * 2.0;
    dustNoise = max(((step(0.5, dustNoise) * dustNoise) - 1.5) * 5.0, 0.0);
    turbColor += 2.0 * dustNoise * turbColor;

    // // add horizontal flaring
    // vec2 horizontal = vec2(0.0, uv.y) * COMPLEXITY;
    // float turbH = getNoiseAbsFBMOctaves4(vec3(horizontal, t*0.1));
    // turbColor += 2.5*pow(turbH,3.0)*discColor;

    // stronger on top
	  //turbColor += turbColor * (2.0*pow(1.0-uv.y,2.0));

    turbColor = mix(vec3(0.0),turbColor,1.0-uv.y*0.75);
    discColor += turbColor * u_noiseAmount;

    // color
    vec3 color = vec3((discColor.x));

    gl_FragColor = vec4(color,1.0);
}
