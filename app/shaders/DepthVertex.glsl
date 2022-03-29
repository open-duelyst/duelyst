// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform float u_depthOffset;
uniform float u_depthModifier;

varying vec2 v_texCoord;
varying float v_depthRange;

void main() {
	v_texCoord = a_texCoord;
	//v_depthRange = (a_position.y - u_depthOffset) * CC_MVMatrix[1][1] * (1.0 - u_depthModifier);
	v_depthRange = ((a_position.y * (1.0 - u_depthModifier)) - u_depthOffset) * CC_MVMatrix[1][1];

	gl_Position = CC_PMatrix * CC_MVMatrix * a_position;
}
