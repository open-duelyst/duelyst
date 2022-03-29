float SeededRandom(in float seed, in float val) {
	return mod(sin(seed*363.5346+val*674.2454)*6743.4365, 1.0);
}

#pragma glslify: export(SeededRandom)
