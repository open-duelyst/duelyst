// glslify blows up unless first line is comment or empty
// CC_Texture0 is texture to dissolve

uniform float u_seed;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_vignetteStrength;
uniform float u_edgeFalloff;
uniform float u_time;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoiseFBM = require(./helpers/NoiseFBM.glsl)

void main () {
	vec4 color = texture2D(CC_Texture0, v_texCoord);

	// vignette
	vec2 noiseCenterDiff = v_texCoord - vec2(0.5);
  float noiseCenterOffset = u_time + 0.25;
  noiseCenterOffset = (noiseCenterOffset * noiseCenterOffset * noiseCenterOffset * noiseCenterOffset) + 0.25;
	float noiseCenterDist = length(noiseCenterDiff) * 5.0 * noiseCenterOffset + noiseCenterOffset;
  noiseCenterDist = noiseCenterDist * noiseCenterDist * noiseCenterDist * noiseCenterDist * noiseCenterDist * noiseCenterDist;
	float noiseVignette = max(0.0, 1.0 - noiseCenterDist) * u_vignetteStrength;

	// noise
	float noise = getNoiseFBM(vec2(u_seed) + v_texCoord, 0.0, u_frequency, max(0.0, u_amplitude + u_time - noiseVignette));
	float noiseRangeMin = 0.99 - u_time;
	float noiseRangeMax = 1.0 - u_time;
	float noiseSmooth = 1.0 - smoothstep(noiseRangeMin, noiseRangeMax, noise);
	float noiseEdge = fract(1.0 - smoothstep(noiseRangeMin, noiseRangeMax + u_edgeFalloff, noise));

	gl_FragColor = v_fragmentColor * vec4(max(color.rgb, ceil(noiseEdge)), color.a * (noiseSmooth + noiseEdge));
}
