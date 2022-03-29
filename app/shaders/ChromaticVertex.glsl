// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_aberrationScale;

varying vec2 v_texCoord;
varying vec3 v_aberration;
varying vec2 v_rCoord;
varying vec2 v_gCoord;
varying vec2 v_bCoord;

void main() {
  v_texCoord = a_texCoord;
  float aberrationTime = u_time;
	v_aberration = vec3(
		sin(aberrationTime) * (1.0 + sin(aberrationTime * 3.0) * 0.5) * 0.05 * u_aberrationScale.x,
		cos(aberrationTime * 1.5) * (1.0 + cos(aberrationTime * 2.0) * 0.5) * 0.05 * u_aberrationScale.y,
		0.0
	);
	v_rCoord = vec2(v_texCoord.x + v_aberration.x, v_texCoord.y + v_aberration.y);
	v_gCoord = vec2(v_texCoord.x + v_aberration.z, v_texCoord.y - v_aberration.z);
	v_bCoord = vec2(v_texCoord.x - v_aberration.x, v_texCoord.y - v_aberration.y);
	gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;
}
