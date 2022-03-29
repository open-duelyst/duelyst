// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform vec2 u_size;
uniform float u_thickness;
uniform float u_time;
uniform float u_pulseMax;
uniform float u_pulseMin;

varying vec2 v_texCoord;
varying float v_stepX;
varying float v_stepY;
varying float v_pulseModifier;

void main() {
  v_texCoord = a_texCoord;
  v_stepX = 1.0 / u_size.x * u_thickness;
  v_stepY = 1.0 / u_size.y * u_thickness;
	float pulseModifierBase = (sin(2.0 * 3.141592653589793 * u_time) + 1.0) * 0.5;
	v_pulseModifier = u_pulseMin + pulseModifierBase * (u_pulseMax - u_pulseMin);
	gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;
}
