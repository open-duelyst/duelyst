// glslify blows up unless first line is comment or empty
uniform vec2 u_resolution;
uniform vec4 u_color;
uniform vec4 u_rampFrom;
uniform vec4 u_rampTransition;
uniform float u_frequency;
uniform float u_amplitude;
uniform vec2 u_range;
uniform float u_time;
uniform float u_expandModifier;
uniform float u_verticalFadeFromTop;
uniform float u_verticalFadeSpeed;

varying vec2 v_texCoord;

#pragma glslify: getNoiseFBM = require(./helpers/NoiseFBM.glsl)

void main () {
	vec4 color = texture2D(CC_Texture0, v_texCoord);
	vec2 screenCoord = gl_FragCoord.xy / u_resolution;

	float noise = getNoiseFBM(screenCoord, u_time, u_frequency, u_amplitude);
	noise = smoothstep(u_range.x, u_range.y, noise);

	// allow fractal within a certain distance from the center
	vec2 originDir = v_texCoord - vec2(0.5, 0.5);
	vec2 expandCoord = originDir * u_expandModifier;
	float falloff = max(pow(texture2D(CC_Texture0, v_texCoord - expandCoord).a, 0.5), 0.0);
	vec4 noiseColor = u_color * noise * falloff;

	float verticalFade = min(pow(v_texCoord.y + u_verticalFadeFromTop, u_verticalFadeSpeed), 1.0);
	float a = (color.a + noiseColor.a + (u_rampFrom.a + u_rampTransition.a) * falloff) * verticalFade;
	vec3 rgb = mix(u_rampTransition.rgb, u_rampFrom.rgb, smoothstep(0.66, 1.0, falloff));
	rgb = mix(color.rgb, rgb, smoothstep(0.0, 0.66, falloff));

	gl_FragColor = vec4(rgb + noiseColor.rgb, a);
}
