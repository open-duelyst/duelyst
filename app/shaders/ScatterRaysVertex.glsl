// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_originRadius;

varying vec2 v_texCoord;
varying vec2 v_mvPosition;
varying vec2 v_center;

void main() {
  v_texCoord = a_texCoord;
  // vertices and properties are already in modelview space
	// but the properties have swapped yz (y -> depth, z -> altitude)
	float u_widthRange = 1280.0;
  float u_depthRange = 768.0;
	v_mvPosition = vec2(a_position.x / u_widthRange, a_position.y / u_depthRange);
	v_center = vec2(a_originRadius.x / u_widthRange, a_originRadius.z / u_depthRange);
	gl_Position = CC_PMatrix * a_position;
}
