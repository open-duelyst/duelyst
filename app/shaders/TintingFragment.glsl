// glslify blows up unless first line is comment or empty
uniform vec4 u_tint;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
	vec4 color = texture2D(CC_Texture0, v_texCoord);
	vec4 base = v_fragmentColor * color;
	gl_FragColor = vec4(base.rgb * (1.0 - u_tint.a) + u_tint.rgb * u_tint.a * base.a, base.a);
}
