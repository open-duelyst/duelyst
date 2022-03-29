#pragma glslify: getFresnel = require(./Fresnel.glsl)
#pragma glslify: getRefractionColor = require(./Refraction.glsl)
#pragma glslify: getReflectionColor = require(./Reflection.glsl)

#define EYE normalize(vec3(0.5))

vec4 getDistortionColor(in sampler2D refractMap, in vec2 screenCoord, in float distortionAlpha, in vec3 refractNormal, in vec3 reflectNormal, in float fresnelBias, in float refractFactor, in float reflectFactor, in float noiseFactor, in float expandOffset) {

	// factors
	refractFactor *= noiseFactor;
  reflectFactor *= noiseFactor;

	// intensity

  float intensity = distortionAlpha * 0.2 + noiseFactor * ceil(distortionAlpha) * 0.05;
  //float intensity = pow(normalPacked.a, 3.0) * 0.35;

	// fresnel

	float NdotI = dot(refractNormal, EYE);
  float fresnel = getFresnel(NdotI, fresnelBias, 5.0);
	float reflectBias = fresnel;
	float refractBias = 1.0 - fresnel;

  // refraction

  vec3 refractionColor = getRefractionColor(refractMap, screenCoord, refractNormal, refractFactor, refractBias, expandOffset);

  // reflection

  vec3 reflectionColor = getReflectionColor(refractMap, reflectNormal, EYE, NdotI);

  // blend reflection and refraction

	return vec4(refractionColor * refractBias + reflectionColor * reflectBias + vec3(intensity, intensity, intensity), distortionAlpha);
}

#pragma glslify: export(getDistortionColor)
