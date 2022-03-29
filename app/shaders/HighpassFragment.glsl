// glslify blows up unless first line is comment or empty
varying vec2 v_texCoord;

uniform float u_threshold;
uniform float u_intensity;

void main() {
	vec4 color = texture2D(CC_Texture0, v_texCoord);
	color = max(((step(u_threshold, color) * color) - vec4(u_threshold)) * u_intensity, 0.0);
	gl_FragColor = color * color;
}
