// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

uniform float u_time;
uniform float u_frequency;
uniform float u_pulseMax;
uniform float u_pulseMin;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_pulseModifier;

void main() {
  v_texCoord = a_texCoord;
	v_fragmentColor = a_color;
	v_pulseModifier = u_pulseMin + u_time * (u_pulseMax - u_pulseMin);
	gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;
}
