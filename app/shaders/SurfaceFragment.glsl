// glslify blows up unless first line is comment or empty
// CC_Texture0 is diffuse map
uniform sampler2D u_bloom; // bloom map

varying vec2 v_texCoord;

void main() {
	vec4 color = texture2D(CC_Texture0, v_texCoord);
	vec4 bloom = texture2D(u_bloom, v_texCoord);
	gl_FragColor = color + bloom;
}
