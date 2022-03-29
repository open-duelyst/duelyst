// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
	v_texCoord = a_texCoord;
	gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;
}
