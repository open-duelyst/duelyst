float getUnpackedDepth (in vec4 packedDepth) {
    const vec4 BIT_SHIFT = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
    return dot(packedDepth, BIT_SHIFT);
}

#pragma glslify: export(getUnpackedDepth)

