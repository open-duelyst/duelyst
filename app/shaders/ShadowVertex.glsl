// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;
attribute vec4 a_originRadius;

uniform vec2 u_size;
uniform vec2 u_anchor;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying vec3 v_mv_lightPosition;
varying float v_mv_lightRadius;
varying vec2 v_position;
varying vec3 v_mv_castedAnchorPosition;

void main() {
	v_texCoord = a_texCoord;
	v_fragmentColor = a_color;

	// light properties are in modelview space
	v_mv_lightPosition = a_originRadius.xyz;
	v_mv_lightRadius = a_originRadius.w;
	vec3 mv_anchorPosition = (CC_MVMatrix * vec4(u_anchor.x, 0.0, 0.0, 1.0)).xzy;
	mv_anchorPosition.z += u_anchor.y;

  // compare depth to get shadow flip
	float mv_depth = mv_anchorPosition.z;
  float mv_depthDifference = mv_depth - v_mv_lightPosition.z;
	float flip = mv_depthDifference + u_anchor.y < 0.0 ? -1.0 : 1.0;

	// compare anchor to light to get skew
  vec3 mv_depthAnchorPosition = vec3(mv_anchorPosition.x, mv_anchorPosition.y, mv_depth + u_anchor.y);
	vec3 mv_anchorDifference = mv_depthAnchorPosition - v_mv_lightPosition;
	float mv_anchorDistance = length(mv_anchorDifference);
	vec3 mv_anchorDir = mv_anchorDifference / mv_anchorDistance;
	float skew = tan(atan(mv_anchorDir.x, mv_anchorDir.z) * flip) * 0.5;

	// 45 degree shadow flip
	mat4 castMatrix = mat4(
		1.0, 0.0, 0.0, 0.0,
		skew, 0.7071067811865475 * flip, -0.7071067811865475 * flip, 0.0,
    0.0, 0.7071067811865475 * flip, 0.7071067811865475 * flip, 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	// compare distance to light and counter skew to get stretch
	// (closer to light or larger skew = shorter shadow)
	// double abs appears to be necessary for some platforms (osx)
	float altitudeModifier = pow(1.0 / abs(tan(abs(atan(mv_anchorDir.y, mv_anchorDir.z)))), 0.35) * 1.25;
	float skewAbs = max(abs(skew), 0.1);
	float skewModifier = min(pow(skewAbs, 0.1) / skewAbs, 1.0);
	float mv_stretch = min(skewModifier * altitudeModifier, 1.6);

	// cast vertex
	vec4 castedPosition = a_position;
	castedPosition.y = (castedPosition.y - u_anchor.y) * mv_stretch;
	castedPosition = castMatrix * castedPosition;
	// shift casted position slightly based on direction of cast
	// this mostly fixes issues with shadows not casting exactly from feet
	float flipped = min(flip, 0.0);
	castedPosition.x += skew + flipped * -mv_anchorDir.x * 2.0;
	castedPosition.y += u_anchor.y + flipped * (mv_stretch * 2.0 + mv_anchorDir.x);
	vec4 mv_castedPosition = CC_MVMatrix * castedPosition;
	gl_Position = CC_PMatrix * mv_castedPosition;

	// extra varyings for blur and fade
	v_mv_castedAnchorPosition = vec3(mv_castedPosition.x, mv_castedPosition.z, mv_castedPosition.y - u_anchor.y);
	v_position = a_position.xy;
}
