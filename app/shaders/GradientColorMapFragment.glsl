// glslify blows up unless first line is comment or empty
uniform vec4 u_fromColorBlack;
uniform vec4 u_fromColorMid;
uniform vec4 u_fromColorWhite;
uniform vec4 u_toColorBlack;
uniform vec4 u_toColorMid;
uniform vec4 u_toColorWhite;
uniform float u_phase;

varying vec2 v_texCoord;

void main() {
	// original color
	vec4 textureColor = texture2D(CC_Texture0, v_texCoord);

	// color values by sampling the texture
	// float perceivedBrightness = max(1.0, 0.2126 * textureColor.r + 0.7152 * textureColor.g + 0.0722 * textureColor.b);
	float desaturated = (textureColor.r + textureColor.g + textureColor.b) / 3.0;

	//
	vec3 colorFrom = mix(u_fromColorBlack.rgb, u_fromColorMid.rgb, smoothstep(0.0, 0.5, desaturated));
	colorFrom = mix(colorFrom, u_fromColorWhite.rgb, smoothstep(0.5, 1.0, desaturated));
	//
	vec3 colorTo = mix(u_toColorBlack.rgb, u_toColorMid.rgb, smoothstep(0.0, 0.5, desaturated));
	colorTo = mix(colorTo, u_toColorWhite.rgb, smoothstep(0.5, 1.0, desaturated));

	// use white gradient point alpha value to fade between texture color and final color
	colorFrom = mix(textureColor.rgb, colorFrom, smoothstep(0.0, 1.0, u_fromColorWhite.a));
	colorTo = mix(textureColor.rgb, colorTo, smoothstep(0.0, 1.0, u_toColorWhite.a));

	vec3 color = mix(colorFrom, colorTo, smoothstep(0.0, 1.0, u_phase));

	// output final color
	gl_FragColor = vec4(color, textureColor.a);
}
