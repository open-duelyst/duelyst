// glslify blows up unless first line is comment or empty
// CC_Texture0 is density map
uniform sampler2D u_depthMap; // depth map for z sorting
uniform sampler2D u_refractMap; // environment map for refraction and reflection

uniform vec2 u_resolution;
uniform float u_refraction;
uniform float u_reflection;
uniform float u_fresnelBias;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_time;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_resolutionRatio;
varying float v_depthRange;

#pragma glslify: getDepthTestFailed = require(./helpers/DepthTest.glsl)
#pragma glslify: getUnpackedDepth = require(./helpers/DepthUnpack.glsl)
#pragma glslify: getNoiseFBM = require(./helpers/NoiseFBM.glsl)
#pragma glslify: getDistortionColorFromNormalMap = require(./helpers/DistortionFromNormalMap.glsl)

void main() {
	vec2 screenTexCoord = gl_FragCoord.xy / u_resolution;

	// check depth and discard when test failed
  float depth = (gl_FragCoord.y - v_depthRange) / u_resolution.y;
	if (getDepthTestFailed(u_depthMap, screenTexCoord, depth)) {
		discard;
	}

  // noise

	float noise = getNoiseFBM(screenTexCoord, u_time, u_frequency, u_amplitude);

  // distortion

  vec4 distortionColor = getDistortionColorFromNormalMap(CC_Texture0, v_texCoord, u_refractMap, screenTexCoord, v_resolutionRatio, u_fresnelBias, u_refraction, u_reflection, noise);

 	gl_FragColor = v_fragmentColor * distortionColor;
}
