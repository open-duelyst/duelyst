// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

uniform vec2 u_resolution;
uniform float u_depthOffset;
uniform float u_depthModifier;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_resolutionRatio;
varying float v_depthRange;

void main() {
	v_texCoord = a_texCoord;
	v_fragmentColor = a_color;
	v_resolutionRatio = u_resolution.x / u_resolution.y;
	v_depthRange = ((a_position.y * (1.0 - u_depthModifier)) - u_depthOffset) * CC_MVMatrix[1][1];
	gl_Position = CC_PMatrix * CC_MVMatrix * a_position;
}
