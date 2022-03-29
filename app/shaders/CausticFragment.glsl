// glslify blows up unless first line is comment or empty

// Redefine below to see the tiling...
// #define SHOW_TILING

#define TAU 6.28318530718
#define MAX_ITER 6

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float u_time; // time
uniform vec3 u_color; // time
uniform vec2 u_texResolution; // resolution

vec3 disc(in vec2 p, in float radius, in vec2 center) {
	// Offset uv with the center of the circle.
	vec2 uv = p - center;
	float dist = sqrt(dot(uv, uv));
	float t = smoothstep(radius+0.1, radius-0.1, dist);
	return mix(vec3(0.0), vec3(1.0), t);
}

void main()
{
	float time = u_time * .25;
    // uv should be the 0-1 uv of texture...
	vec2 uv = v_texCoord;

#ifdef SHOW_TILING
	vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
#else
    vec2 p = mod(uv*TAU, TAU)-250.0;
#endif
	vec2 i = vec2(p);
	float c = 1.0;
	float inten = .005;

	for (int n = 0; n < MAX_ITER; n++)
	{
		float t = time * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(MAX_ITER);
	c = 1.17-pow(c, 1.4);
	vec3 colour = vec3(pow(abs(c), 8.0));
    colour = clamp(colour + vec3(0.0, 0.0, 0.0), 0.0, 1.0);


#ifdef SHOW_TILING
	// Flash tile borders...
	vec2 pixel = 2.0 / iResolution.xy;
	uv *= 2.0;

	float f = floor(mod(iGlobalTime*.5, 2.0)); 	// Flash value.
	vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
	uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
	colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line
#endif

	vec3 discColor = disc(uv,0.25,vec2(0.5));

	gl_FragColor = v_fragmentColor * vec4(colour*discColor, 1.0);
}
