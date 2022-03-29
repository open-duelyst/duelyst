// glslify blows up unless first line is comment or empty
// CC_Texture0 is noise texture
uniform float u_time;
uniform vec2 u_texResolution;
uniform vec2 u_origin;
uniform float u_rampThreshold;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

// musk's lense flare, modified by eanticev.
// See the original at: https://www.shadertoy.com/view/4sX3Rs

float noise(in float t) {
	return texture2D(CC_Texture0, vec2(t, 0.0) / u_texResolution.xy).x;
}
float noise(in vec2 t) {
	return texture2D(CC_Texture0, (t + vec2(u_time)) / u_texResolution.xy).x;
}

vec3 lensflare(in vec2 uv, in vec2 pos, in float dist) {
	vec2 diff = uv - pos;
	vec2 uvd = uv*(length(uv));

	float ang = atan(diff.y, diff.x);
	dist = pow(dist,.1);
	float n = noise(vec2((ang+u_time/6.0)*16.0,dist*32.0));

	float f0 = 2.0/(length(uv-pos)*24.0+2.0);
	f0 = f0+f0*(sin((ang-u_time/12.0 + noise(abs(ang)+n/2.0)*2.0)*12.0)*.2+dist*.1+.6);

	vec3 c = vec3(0.0);
	c+=vec3(f0);

	return c;
}

// color modifier
vec3 cc(in vec3 color, in float factor, in float factor2) {
	float w = color.x+color.y+color.z;
	return mix(color,vec3(w)*factor,w*factor2);
}

void main(void) {
	vec2 uv = v_texCoord;
	float dist = distance(u_origin, uv);// * 2.0;

	vec3 color = vec3(1.1,1.4,1.0) * lensflare(uv, u_origin, dist);
	color = cc(color, 0.5, 0.1);

	float ramp = pow(min(dist, u_rampThreshold) / u_rampThreshold, 2.0);
	gl_FragColor = v_fragmentColor * vec4(color * (1.0 - pow(dist * 2.0, 2.0)) * ramp, 1.0);
}
