// glslify blows up unless first line is comment or empty
// CC_Texture0 is diffuse
uniform sampler2D u_lightMap;
uniform vec3 u_ambientColor;

varying vec2 v_texCoord;

void main() {
	vec4 diffuseColor = texture2D(CC_Texture0, v_texCoord);
	vec4 lightColor = texture2D(u_lightMap, v_texCoord);
	gl_FragColor = vec4(diffuseColor.rgb * max(u_ambientColor + lightColor.rgb, 0.0), diffuseColor.a);
}
