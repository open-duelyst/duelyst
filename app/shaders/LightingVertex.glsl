// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec4 a_color;
attribute vec4 a_originRadius;

uniform float u_depthRange;
uniform float u_depthOffset;
uniform float u_lightMapScale;
uniform mat4 u_depthRotationMatrix;
uniform vec3 u_normal;

varying vec4 v_mvPosition;
varying vec4 v_originRadius;
varying vec4 v_fragmentColor;
varying vec3 v_normal;
varying float v_depth;
varying float v_normalOffset;

void main() {
  v_fragmentColor = a_color;

	// as long as lighting is drawn as a part of the composite
	// we know that the composite model view matrix is an identity matrix
	gl_Position = CC_PMatrix * a_position;

	// because lighting is drawn into occluder FBO and cached
	// the actual model view matrix won't be in world space
	vec4 scaledPosition = vec4(a_position.xyz * (1.0 / u_lightMapScale), 1.0);
	vec4 mv_position = CC_MVMatrix * scaledPosition;
	// swap yz (y -> depth, z -> altitude)
	v_mvPosition = mv_position.xzyw;
  // origin and radius are already in modelview space
	v_originRadius = a_originRadius;

	// get depth information
	mat4 dmv_matrix = CC_MVMatrix * u_depthRotationMatrix;
	vec4 dmv_position = dmv_matrix * scaledPosition;
	float mv_yReset = CC_MVMatrix[3][1];
	// y value is used as depth to create a pseudo-3D space
	float dmv_y = (dmv_position.y - mv_yReset);
	float dmv_yFactor = ceil(dmv_y / u_depthRange);
	float mv_scaleY = CC_MVMatrix[1][1];
  float mv_height = scaledPosition.y * mv_scaleY * dmv_yFactor;
  float mv_offset = u_depthOffset * mv_scaleY;
  v_depth = mv_position.y - mv_height + mv_offset;

  // get the sprite plane normal
	v_normal = normalize((dmv_matrix * vec4(u_normal, 0.0)).xyz);

  // force forward facing pixels to be more lit
  v_normalOffset = (mv_height * 0.5) * clamp(floor(v_normal.z + 0.25), -1.0, 0.0);
}
