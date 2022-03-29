// glslify blows up unless first line is comment or empty
#define PI 3.1415926535897932384626433832795

uniform float u_phase;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

vec2 rotate(in vec2 p, in float a) {
	return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

float rand(in float n) {
	return fract(sin(n) * 43758.5453123);
}

vec2 rand2(in vec2 p) {
	return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077)));
}

float noise1(in float p) {
	float fl = floor(p);
	float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

// voronoi distance noise, based on iq's articles
float voronoi(in vec2 x) {
	vec2 p = floor(x);
	vec2 f = fract(x);

	vec2 res = vec2(8.0);
	for(int j = -1; j <= 1; j ++) {
		for(int i = -1; i <= 1; i ++) {
			vec2 b = vec2(i, j);
			vec2 r = vec2(b) - f + rand2(p + b);

			// chebyshev distance, one of many ways to do this
			float d = max(abs(r.x), abs(r.y));

			if(d < res.x) {
				res.y = res.x;
				res.x = d;
			} else if (d < res.y) {
				res.y = d;
			}
		}
	}
	return res.y - res.x;
}

void main (){
	// voronoi noise
	vec2 uv = v_texCoord - 0.5;
	float phase = sin(u_phase * PI);
	float phaseSm = u_phase * 0.1;
	float v = 0.0;
	float a = 0.6, f = 2.0;
	vec2 dom = uv * phase;
	for(int i = 1; i < 3; i ++) {
		float motion = phaseSm * float(i);
		float v1 = voronoi(dom * f + 5.0);

		// moving electrons-effect
		float v2 = voronoi(uv * f * 0.75 + 50.0);

		float va = 1.0 - smoothstep(0.0, 0.2, v1);
		float vb = 1.0 - smoothstep(0.0, 0.08, v2);
		v += a * pow(va * (0.0 + vb), 4.0);

		// make sharp edges
		v1 = 1.0 - smoothstep(0.0, 0.2, v1);

		// noise is used as intensity map
		v2 = a * (noise1(1.0 * 5.5 + 0.1));

		v *= 4.0 * phase;

		f *= 2.0;
		a *= 0.5;
	}

	// vignette
	float vignette = max(0.0, 1.0 - length(uv) * 2.0);
	v *= vignette;
	vec3 voronoiColor = vec3(v * 2.0);

	// prismatic color gradient
	vec3 colorShift = vec3(uv, 0.5 + 0.5 * sin(u_phase));

	gl_FragColor = v_fragmentColor * vec4(voronoiColor + voronoiColor * colorShift, 1.0);
}
