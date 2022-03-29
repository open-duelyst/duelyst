// glslify blows up unless first line is comment or empty
#define RAY_COUNT 30
// larger HARDNESS = tighter rays
#define HARDNESS 1.0

// CC_Texture0 is noise texture
uniform float u_time;
uniform float u_pulseRate; // controls if flare pulsates: true/false
uniform float u_armLength; // good default: 0.3
uniform float u_wispSize; // controls size of wisp in the middle. good default: 0.05. larger SIZE = smaller
uniform float u_flareSize; // controls flare size. good default: 0.1  larger flareSize = smaller flare
uniform vec2 u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

float rand(in int seed, in float ray) {
	return mod(sin(float(seed)*363.5346+ray*674.2454)*6743.4365, 1.0);
}

void main( void ) {
	float pi = 3.14159265359;
	vec2 uv = v_texCoord;
	vec2 position = uv - vec2(0.5,0.5);

	float arm_length = u_armLength;
	float wisp_size = u_wispSize;

	if (u_pulseRate > 0.0) {
		arm_length = arm_length / 2.0 + sin(u_time*u_pulseRate) * arm_length / 2.0;
		wisp_size = wisp_size + sin(u_time*u_pulseRate) * wisp_size / 2.0;
	}

	// fix aspect to square
	position.y *= u_texResolution.y/u_texResolution.x;

	float ang = atan(position.y, position.x);
	float dist = length(position);
	vec3 color = vec3(0.3, 0.5, 0.7) * (pow(dist, -1.0) * wisp_size);
	for (int i = 0; i < RAY_COUNT; i++) {
		float ray = float(i);
		float rayang = rand(5234, ray)*6.2+(u_time*0.05)*10.0*(rand(2546, ray)-rand(5785, ray))-(rand(3545, ray)-rand(5467, ray));
		rayang = mod(rayang, pi*2.0);
		if (rayang < ang - pi) {rayang += pi*2.0;}
		if (rayang > ang + pi) {rayang -= pi*2.0;}
		float brite = arm_length - abs(ang - rayang);
		brite -= dist * u_flareSize;
		if (brite > 0.0) {
			color += vec3(0.2+0.4*rand(8644, ray), 0.4+0.4*rand(4567, ray), 0.5+0.4*rand(7354, ray)) * brite;
		}
	}

	vec2 m = vec2(0.5, 0.5);
	float d = distance(m, uv) * 2.0;

	// super intense
	// color -= distance(m, uv) * 1.0;

	gl_FragColor = v_fragmentColor * vec4(color.rgb, (1.0 - d) * pow(color.r + color.g + color.b, HARDNESS));
}
