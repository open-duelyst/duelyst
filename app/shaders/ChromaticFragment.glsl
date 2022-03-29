// glslify blows up unless first line is comment or empty
// uncomment if using noise map based chromatic shader
//uniform sampler2D u_noiseMap;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_smoothstepMin;
uniform float u_smoothstepMax;

varying vec2 v_texCoord;
varying vec3 v_aberration;
varying vec2 v_rCoord;
varying vec2 v_gCoord;
varying vec2 v_bCoord;

#pragma glslify: getNoiseRotatedFBM = require(./helpers/NoiseRotatedFBM.glsl)
// uncomment if using noise map based chromatic shader
//#pragma glslify: getNoiseRotatedFBMFromTexture = require(./helpers/NoiseRotatedFBMFromTexture.glsl)

void main() {
	vec2 screenTexCoord = gl_FragCoord.xy / u_resolution - 0.5;
	screenTexCoord.x *= u_resolution.x / u_resolution.y;
  vec4 color = texture2D(CC_Texture0, v_texCoord);

  // fbm noise
  float noise = getNoiseRotatedFBM(screenTexCoord, u_time, u_frequency, u_amplitude);
	// uncomment if using noise map based chromatic shader
  //float noise = getNoiseRotatedFBMFromTexture(screenTexCoord, u_time, u_frequency, u_amplitude, u_noiseMap);
  float invNoise = 1.0 - smoothstep(u_smoothstepMin, u_smoothstepMax, noise);

  // fake aberration
  vec3 chromatic;
  float modifier = (1.0 - v_aberration.x * 0.5);
  chromatic.r = texture2D(CC_Texture0, v_rCoord).r * modifier;
  chromatic.g = texture2D(CC_Texture0, v_gCoord).g * modifier;
  chromatic.b = texture2D(CC_Texture0, v_bCoord).b * modifier;

	gl_FragColor = vec4(chromatic, color.a * invNoise);
}
