// glslify blows up unless first line is comment or empty
// CC_Texture0 is diffuse map
uniform sampler2D u_depthMap; // depth map for z sorting

uniform vec2 u_resolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying float v_depthRange;

#pragma glslify: getDepthTestFailed = require(./helpers/DepthTest.glsl)

void main() {
	vec2 screenCoord = gl_FragCoord.xy / u_resolution;

	// check depth and discard when test failed

	if (getDepthTestFailed(u_depthMap, screenCoord, v_depthRange)) {
		discard;
	}

	vec4 diffuseColor = texture2D(CC_Texture0, v_texCoord);
	gl_FragColor = v_fragmentColor * diffuseColor;
}
