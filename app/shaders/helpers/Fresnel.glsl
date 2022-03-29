float getFresnel (in float NdotI, in float fresnelBias, in float fresnelPow) {
  return max(fresnelBias + (1.0 - fresnelBias) * pow((1.0 - NdotI), fresnelPow), 0.0);
}

#pragma glslify: export(getFresnel)
