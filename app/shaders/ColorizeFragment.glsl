// glslify blows up unless first line is comment or empty
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
	// original color
	vec4 textureColor = texture2D(CC_Texture0, v_texCoord);

	// color values by sampling the texture
	float perceivedBrightness = max(1.0, 0.2126 * textureColor.r + 0.7152 * textureColor.g + 0.0722 * textureColor.b);
	float desaturated = (textureColor.r + textureColor.g + textureColor.b) / 3.0;
    
	vec4 color = mix(vec4(1.0), v_fragmentColor, smoothstep(1.0, 0.5, desaturated));
	color = mix(color, vec4(0.0), smoothstep(0.5, 0.0, desaturated));

	// output final color
	gl_FragColor = color;
}
