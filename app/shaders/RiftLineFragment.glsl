// glslify blows up unless first line is comment or empty
// CC_Texture0 is noise texture
uniform float u_time;
uniform vec2  u_texResolution;
uniform float u_progress;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoiseFBM = require(./helpers/NoiseFBM.glsl)

vec3 vignette(vec2 p, float radius, vec2 center) {
  // Offset uv with the center of the circle.
  vec2 uv = p - center;
  float dist = sqrt(dot(uv, uv));
  return vec3(1.0 - smoothstep(radius, radius-0.7, dist));
}

void main() {

	vec2 aspect = vec2(u_texResolution.x / u_texResolution.y, 1.0);
	vec2 uv = v_texCoord;

	vec4 c1 = mix(
		vec4(0.0,0.65,1.0,1.0),
        vec4(1.0,0.45,0.0,1.0),
        step(u_progress,uv.x)
    );
    vec4 c2 = mix(
		vec4(0.0,0.0,1.0,1.0),
        vec4(1.0,0.0,0.0,1.0),
        step(u_progress,uv.x)
    );

    float u_phase = 0.2;
	float u_seed = 0.5;
	float u_frequency = 12.0;
	float u_amplitude = 0.05;
	float u_vignetteStrength = 1.0;
	float u_edgeFalloff = 0.3;

    float circle_radius = u_phase;
    float border = u_edgeFalloff;

    // vignette disc
    vec3 discColor = vignette(uv,u_vignetteStrength,vec2(0.5));
    float falloffVal = (discColor.r + discColor.g + discColor.b) * 2.0;

   	// Offset uv with the center of the circle.
  	float noise = getNoiseFBM(vec2(u_seed) + uv, u_time/10.0, u_frequency, u_amplitude);
    uv += vec2(noise);
    uv += vec2(.25);

  	float dist = 1.0 - uv.y;

  	float t = 1.0  	+ smoothstep(circle_radius, circle_radius+border, dist)
                	- smoothstep(circle_radius-border, circle_radius, dist);

    t = t + 2.0*u_phase*noise;

    vec4 c;
    c = mix(vec4(1.0),c1,smoothstep(0.0,0.025,t));
    c = mix(c,c2,smoothstep(0.0,0.5,t));
    //c = mix(vec4(0.0),c,smoothstep(1.0,0.0,t));

    vec4 finalColor = mix(c, vec4(0.0), t) - vec4(falloffVal);

    gl_FragColor = finalColor; // vec4(discColor,1.0); //
}
