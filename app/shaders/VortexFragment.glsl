// glslify blows up unless first line is comment or empty
// CC_Texture0 is depth map for z sorting
uniform sampler2D u_refractMap; // depth map for z sorting

uniform float u_radius;
uniform vec2 u_resolution;
uniform float u_refraction;
uniform float u_reflection;
uniform float u_fresnelBias;
uniform float u_amplitude;
uniform float u_time;
uniform float u_frequency;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_resolutionRatio;
varying float v_depthRange;

#pragma glslify: getDepthTestFailed = require(./helpers/DepthTest.glsl)
#pragma glslify: getNoiseFBM = require(./helpers/NoiseFBM.glsl)
#pragma glslify: getDistortionColor = require(./helpers/Distortion.glsl)

void main() {
	vec2 screenTexCoord = gl_FragCoord.xy / u_resolution;

	// check depth and discard when test failed
  float depth = (gl_FragCoord.y - v_depthRange) / u_resolution.y;
	if (getDepthTestFailed(CC_Texture0, screenTexCoord, depth)) {
		discard;
	}

	// factors

	float refractionFactor = u_refraction;
	float reflectionFactor = u_reflection;

	// normals

	screenTexCoord.x *= v_resolutionRatio;
	vec2 coordDiff = vec2(0.5) - v_texCoord;
	float coordDist = length(coordDiff);
	float expCoordDist = pow(coordDist * 2.0, 2.0);
  float distortionAlpha = 1.0 - expCoordDist;
  float normalZ = distortionAlpha * 0.5;
  float intensity = max(1.0, 1.0 / max(expCoordDist * 5.0, 0.1));

	vec2 distortionDir = -(coordDiff / expCoordDist);
  vec3 refractNormal = normalize(vec3(distortionDir.x * refractionFactor, distortionDir.y * refractionFactor, normalZ));
  vec3 reflectNormal = normalize(vec3(distortionDir.x * reflectionFactor, distortionDir.y * reflectionFactor, normalZ));

	// generate spin
	float angle = atan(coordDiff.y, coordDiff.x) / 3.141592653589793;
	vec2 spinA = vec2(cos(3.141592653589793 * 2.0 * (coordDist + angle + u_time * 0.1)), sin(3.141592653589793 * 2.0 * (coordDist * 0.5 + angle - u_time * 0.1)));
	vec2 spinB = vec2(cos(3.141592653589793 * 2.0 * (coordDist + angle + u_time * 0.15)), sin(3.141592653589793 * 2.0 * (coordDist * 0.5 + angle - u_time * 0.15)));

	// noise

	float noiseDust = getNoiseFBM(screenTexCoord, -u_time * 0.5, u_frequency * (1.0 - coordDist * 0.5), u_amplitude);
	noiseDust = 1.0 - noiseDust;

	float noiseParticlesA = getNoiseFBM(spinA, 0.0, u_frequency * 3.0, u_amplitude * 2.0);
	noiseParticlesA = 1.0 - smoothstep(0.2, 0.4, noiseParticlesA);

	float noiseParticlesB = getNoiseFBM(spinB, 0.0, u_frequency * 4.0, u_amplitude * 3.0);
	noiseParticlesB = 1.0 - smoothstep(0.2, 0.4, noiseParticlesB);

	float noiseParticles = noiseParticlesA + noiseParticlesB;
  float noise = noiseDust + noiseParticles;

	// distortion
	vec2 distortionCoord = screenTexCoord + spinA * 0.5 * u_amplitude;
  vec4 distortionColor = getDistortionColor(u_refractMap, distortionCoord, distortionAlpha, refractNormal, reflectNormal, u_fresnelBias, refractionFactor, reflectionFactor, noise, normalZ);

  // composite

	gl_FragColor = v_fragmentColor * vec4(distortionColor.rgb * intensity, noise * distortionAlpha * intensity);
}
