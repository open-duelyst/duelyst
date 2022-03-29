// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;

void main() {
	v_texCoord = a_texCoord;
	v_fragmentColor = a_color;
	gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;
}
