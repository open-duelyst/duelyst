// glslify blows up unless first line is comment or empty
// CC_Texture0 is color map
uniform sampler2D u_maskMap; // mask map
uniform vec4 u_maskRect;

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
varying vec2 v_maskPosition;

void main() {
	// base color
	vec4 color = texture2D(CC_Texture0, v_texCoord);

	// mask coords
	float maskX = u_maskRect.x;
	float maskY = u_maskRect.y;
	float maskWidth = u_maskRect.z;
	float maskHeight = u_maskRect.w;
	float vertX = v_maskPosition.x;
	float vertY = v_maskPosition.y;
	if (vertX < maskX || vertX > maskX + maskWidth || vertY < maskY || vertY > maskY + maskHeight) {
		discard;
	}
	vec2 maskCoord = vec2((vertX - maskX) / maskWidth, (vertY - maskY) / maskHeight);

	// mask value
	float mask = texture2D(u_maskMap, maskCoord).a;

	gl_FragColor = v_fragmentColor * vec4(color.rgb, color.a * mask);
}
