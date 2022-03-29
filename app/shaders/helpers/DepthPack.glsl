vec4 getPackedDepth (in float depth) {
  const vec4 BIT_SHIFT = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
  const vec4 BIT_MASK = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);

  // combination of mod and multiplication and division works better than fract
  // see: http://blog.gradientstudios.com/2012/08/23/shadow-map-improvement/
  vec4 packedDepth = mod(depth * BIT_SHIFT * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );
  packedDepth -= packedDepth.xxyz * BIT_MASK;
  return packedDepth;
}

#pragma glslify: export(getPackedDepth)
