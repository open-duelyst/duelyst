// glslify blows up unless first line is comment or empty
uniform vec4 u_color;
uniform float u_threshold;
uniform float u_intensity;
uniform float u_brightness;
uniform float u_inBlack;
uniform float u_inWhite;
uniform float u_inGamma;
uniform float u_outBlack;
uniform float u_outWhite;
uniform float u_verticalFadeFromTop;
uniform float u_verticalFadeSpeed;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_pulseModifier;

float adjustLevels (in float inChannel, in float inBlack, in float inWhite, in float inGamma, in float outBlack, in float outWhite) {
	return pow((inChannel - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack;
}

void main() {
	vec4 color = texture2D(CC_Texture0, v_texCoord);

	// adjust levels
	color.r = adjustLevels(color.r, u_inBlack, u_inWhite, u_inGamma, u_outBlack, u_outWhite);
	color.g = adjustLevels(color.g, u_inBlack, u_inWhite, u_inGamma, u_outBlack, u_outWhite);
	color.b = adjustLevels(color.b, u_inBlack, u_inWhite, u_inGamma, u_outBlack, u_outWhite);

	// highpass to get only fragments that meet threshold
	color.rgb = max(((step(u_threshold, color.rgb) * color.rgb) - vec3(u_threshold)) * u_intensity, 0.0);

	// adjust alpha channel by perceived brightness
	color.a *= smoothstep(0.0, 1.0, ((1.0 - u_brightness) + u_brightness * (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b)) * 1.25);

	// fade/falloff from top
	float verticalFade = min(pow(1.0 - v_texCoord.y + u_verticalFadeFromTop, u_verticalFadeSpeed), 1.0);

	// these next lines of code just set the baseColor rgb to 1

	//vec4 baseColor = v_fragmentColor * color;
	//float alphaColor = pow(baseColor.a, 3.0);
	//baseColor.rgb = vec3(alphaColor) + (1.0 - alphaColor);

	// so for now we'll skip the above lines
	vec4 baseColor = vec4(vec3(1.0), v_fragmentColor.a * color.a);

	// mix in the uniform color based on the uniform alpha
	baseColor.rgb = mix(baseColor.rgb, u_color.rgb, u_color.a);

	baseColor.a *= verticalFade * v_pulseModifier;
	gl_FragColor = baseColor;
}
