// glslify blows up unless first line is comment or empty
#define SHOCKWAVE_OPACITY 0.65

// CC_Texture0 is depth map for z sorting
uniform sampler2D u_refractMap; // environment map for refraction and reflection

uniform vec2 u_resolution;
uniform float u_refraction;
uniform float u_reflection;
uniform float u_fresnelBias;
uniform float u_amplitude;
uniform float u_time;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_resolutionRatio;
varying float v_depthRange;

#pragma glslify: getDepthTestFailed = require(./helpers/DepthTest.glsl)
#pragma glslify: getDistortionColor = require(./helpers/Distortion.glsl)

void main() {
	vec2 screenTexCoord = gl_FragCoord.xy / u_resolution;

	// check depth and discard when test failed
  float depth = (gl_FragCoord.y - v_depthRange) / u_resolution.y;
	if (getDepthTestFailed(CC_Texture0, screenTexCoord, depth)) {
		discard;
	}

  // ease start and stop independently
  float from = 0.0;
  float delta = 1.0;
  // quad out
  float start = -delta * u_time * (u_time - 2.0) + from;
  // quartic out
  float timePctRev = u_time - 1.0;
  float stop = -delta * (timePctRev * timePctRev * timePctRev * timePctRev - 1.0) + from;

	vec2 coordDiff = vec2(0.5) - v_texCoord;
  float coordDist = length(coordDiff) * 2.0;
  vec2 distortionDir = -(coordDiff / coordDist);

  float startModifier = max(coordDist - start, 0.0);
	float falloff = max(stop - coordDist, 0.0);
	float distortionAlpha = min(ceil(falloff) * startModifier * u_amplitude, SHOCKWAVE_OPACITY);

	// factors

	float refractionFactor = u_refraction;
	float reflectionFactor = u_reflection;

	// normals

	float normalZ = pow(falloff, 0.25);
  vec3 refractNormal = normalize(vec3(distortionDir.x * refractionFactor, distortionDir.y * refractionFactor * v_resolutionRatio, normalZ));
  vec3 reflectNormal = normalize(vec3(distortionDir.x * reflectionFactor, distortionDir.y * reflectionFactor * v_resolutionRatio, normalZ));

	// distortion

  vec4 distortionColor = getDistortionColor(u_refractMap, screenTexCoord, distortionAlpha, refractNormal, reflectNormal, u_fresnelBias, refractionFactor, reflectionFactor, 1.0, normalZ);

	gl_FragColor = v_fragmentColor * distortionColor;
}
