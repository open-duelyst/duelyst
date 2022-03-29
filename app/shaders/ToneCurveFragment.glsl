// glslify blows up unless first line is comment or empty
uniform sampler2D u_toneCurveTexture;
uniform float u_amount;

varying vec2 v_texCoord;

void main() {

	// original color
	vec4 textureColor = texture2D(CC_Texture0, v_texCoord);

	// color values by sampling the texture
	float redCurveValue = texture2D(u_toneCurveTexture, vec2(textureColor.r, 0.0)).r;
	float greenCurveValue = texture2D(u_toneCurveTexture, vec2(textureColor.g, 0.0)).g;
	float blueCurveValue = texture2D(u_toneCurveTexture, vec2(textureColor.b, 0.0)).b;

	float texAmount = 1.0 - u_amount;

	redCurveValue = 	textureColor.r * texAmount + redCurveValue * u_amount; // smoothstep(textureColor.r, redCurveValue, u_amount);
	greenCurveValue = 	textureColor.g * texAmount + greenCurveValue * u_amount; // smoothstep(textureColor.g, greenCurveValue, u_amount);
	blueCurveValue = 	textureColor.b * texAmount + blueCurveValue * u_amount; // smoothstep(textureColor.b, blueCurveValue, u_amount);

	// output final color
	gl_FragColor = vec4(redCurveValue, greenCurveValue, blueCurveValue, textureColor.a);
}
