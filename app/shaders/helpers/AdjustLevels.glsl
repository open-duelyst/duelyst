float AdjustLevels (in float inChannel, in float inBlack, in float inWhite, in float inGamma, in float outBlack, in float outWhite) {
	return pow((inChannel - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack;
}

#pragma glslify: export(AdjustLevels)
