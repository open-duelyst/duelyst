vec3 getReflectionColor(in sampler2D reflectMap, in vec3 reflectNormal, in vec3 eye, in float NdotI) {
	vec3 reflectCoord = 2.0 * NdotI * reflectNormal - eye;
  return texture2D(reflectMap, (reflectCoord.xy + 1.0) * 0.5).rgb;
}

#pragma glslify: export(getReflectionColor)
