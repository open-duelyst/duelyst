// glslify blows up unless first line is comment or empty
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

uniform vec2 u_resolution;
uniform float u_depthOffset;
uniform float u_depthModifier;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_depthRange;

void main() {
	v_texCoord = a_texCoord;
	v_fragmentColor = a_color;

	// just to keep things simpler, we'll intercept the vertex z and apply it to the depth
	// note: this disables any 3D perspective, so we may need more attributes to accommodate that
	v_depthRange =(((a_position.y * (1.0 - u_depthModifier)) + a_position.z - u_depthOffset) * CC_MVMatrix[1][1]) / u_resolution.y;
	gl_Position = (CC_PMatrix * CC_MVMatrix) * vec4(a_position.x, a_position.y, 0.0, 1.0);
}
