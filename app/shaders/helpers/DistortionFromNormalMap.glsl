#pragma glslify: getDistortionColor = require(./Distortion.glsl)

vec4 getDistortionColorFromNormalMap(in sampler2D normalMap, in vec2 texCoord, in sampler2D refractMap, in vec2 screenCoord, in float resolutionRatio, in float fresnelBias, in float refractFactor, in float reflectFactor, in float noiseFactor) {

	// normals

  vec4 normalPacked = texture2D(normalMap, texCoord);
  vec3 normalUnpacked = normalPacked.xyz * 2.0 - 1.0;
  float distortionAlpha = pow(max(pow(normalPacked.a, 0.5) - 0.45, 0.0), 0.5);
  vec3 refractNormal = normalize(vec3(normalUnpacked.x * refractFactor * noiseFactor, normalUnpacked.y * refractFactor * noiseFactor * resolutionRatio, normalUnpacked.z));
  vec3 reflectNormal = normalize(vec3(normalUnpacked.x * reflectFactor * noiseFactor, normalUnpacked.y * reflectFactor * noiseFactor * resolutionRatio, normalUnpacked.z));

  // distortion

	return getDistortionColor(refractMap, screenCoord, distortionAlpha, refractNormal, reflectNormal, fresnelBias, refractFactor, reflectFactor, noiseFactor, normalUnpacked.z);
}

#pragma glslify: export(getDistortionColorFromNormalMap)
