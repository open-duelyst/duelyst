// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
attribute vec4 a_originRadius;

uniform float u_depthRange;

varying vec4 v_mvPosition;
varying vec4 v_originRadius;
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
  v_texCoord = a_texCoord;
  v_fragmentColor = a_color;
  // vertices and properties are already in modelview space
	gl_Position = CC_PMatrix * a_position;
	// swap yz (y -> depth, z -> altitude)
	v_mvPosition = a_position.xzyw;
	v_originRadius = a_originRadius;
	// offset verts and center depth by half of depth range to transform into depth space
  v_mvPosition.z += u_depthRange * 0.5;
  v_originRadius.z += u_depthRange * 0.5;
}
