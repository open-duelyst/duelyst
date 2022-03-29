// glslify blows up unless first line is comment or empty
uniform float u_inBlack;
uniform float u_inWhite;
uniform float u_inGamma;
uniform float u_outBlack;
uniform float u_outWhite;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

float adjustLevels (in float inChannel, in float inBlack, in float inWhite, in float inGamma, in float outBlack, in float outWhite) {
	return pow((inChannel - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack;
}

void main() {
	vec4 color = texture2D(CC_Texture0, v_texCoord);

	// adjust levels
	color.r = adjustLevels(color.r, u_inBlack, u_inWhite, u_inGamma, u_outBlack, u_outWhite);
	color.g = adjustLevels(color.g, u_inBlack, u_inWhite, u_inGamma, u_outBlack, u_outWhite);
	color.b = adjustLevels(color.b, u_inBlack, u_inWhite, u_inGamma, u_outBlack, u_outWhite);

	gl_FragColor = color.rgba;
}
