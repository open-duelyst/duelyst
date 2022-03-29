vec3 getRefractionColor(in sampler2D refractMap, in vec2 screenCoord, in vec3 refractNormal, in float refractFactor, in float refractBias, in float expandOffset) {

	// refract with fake chromatic aberration

	float expandFactor = (1.0 - refractFactor - abs(expandOffset));
	vec2 refractCoord = refractNormal.xy * expandFactor * refractBias;

	float abberation = refractFactor * 2.0;
	vec2 abberationR = vec2(1.0 + abberation);
	vec2 abberationB = vec2(1.0 - abberation);
  float refractR = texture2D(refractMap, screenCoord + refractCoord * abberationR).r;
  float refractG = texture2D(refractMap, screenCoord + refractCoord).g;
  float refractB = texture2D(refractMap, screenCoord + refractCoord * abberationB).b;
  return vec3(refractR, refractG, refractB);
}

#pragma glslify: export(getRefractionColor)
