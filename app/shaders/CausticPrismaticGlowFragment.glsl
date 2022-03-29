// glslify blows up unless first line is comment or empty
#define PI 3.1415926535897932384626433832795
#define RADIUS 0.25
#define SIZE 0.75
#define WHITE vec3(1.0)

uniform float u_time;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main () {
	// red
	vec2 circleRed = v_texCoord - vec2(
			(cos(u_time) + PI * 0.07) / PI * RADIUS + 0.5,
			(sin(u_time) - PI * 0.07) / PI * RADIUS + 0.5
	);
	float lenRed = smoothstep(0.0, SIZE, length(circleRed) * 2.0);
	float effectRed = 1.0 - lenRed;

	// green
	vec2 circleGreen = v_texCoord - vec2(
			(cos(u_time * 1.15)) / PI * RADIUS + 0.5,
			(sin(u_time * 0.9) + PI * 0.1) / PI * RADIUS + 0.5
	);
	float lenGreen = smoothstep(0.0, SIZE, length(circleGreen) * 2.0);
	float effectGreen = 1.0 - lenGreen;

	// blue
	vec2 circleBlue = v_texCoord - vec2(
			(cos(u_time * 0.9) - PI * 0.07) / PI * RADIUS + 0.5,
			(sin(u_time * 1.5) - PI * 0.07) / PI * RADIUS + 0.5
	);
	float lenBlue = smoothstep(0.0, SIZE, length(circleBlue) * 2.0);
	float effectBlue = 1.0 - lenBlue;

	float colorAlpha = max(effectRed, max(effectGreen, effectBlue));
	vec3 color = mix(WHITE, vec3(
			effectRed,
			effectGreen,
			effectBlue
	), colorAlpha);

	// caustics
	float time = u_time * 0.5 + 23.0;
  vec2 p = mod(v_texCoord * PI * 2.0, PI * 2.0) - 250.0;
	vec2 i = vec2(p);
	float caustic = 1.0;
	float inten = 0.005;
	for (int n = 0; n < 6; n++) {
		float t = time * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		caustic += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	caustic /= 6.0;
	caustic = 1.17 - pow(caustic, 1.4);
	caustic = pow(abs(caustic), 8.0);
	/*
	vec3 causticColor = vec3(pow(abs(caustic), 8.0));
	causticColor = clamp(causticColor + vec3(0.0, 0.0, 0.0), 0.0, 1.0);
	causticColor += causticColor * vec3(v_texCoord, 0.5 + 0.5 * sin(u_time));
	*/

	gl_FragColor = v_fragmentColor * vec4(color, clamp(caustic * colorAlpha + colorAlpha, 0.0, 1.0));
}
