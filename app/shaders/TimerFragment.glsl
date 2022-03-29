// glslify blows up unless first line is comment or empty
const float PI = 3.14159265358979323846;
const float TWOPI = 6.28318530717958647692;
const float INNER_RADIUS = 0.0;
const float OUTER_RADIUS = 1.0;

uniform float u_progress;
uniform float u_startingAngle;
uniform float u_edgeGradientFactor;
uniform vec2 u_texResolution;
uniform vec4 u_bgColor;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
	float progress = u_progress + u_progress * u_edgeGradientFactor * 0.1;
	float endAngle = TWOPI - progress * TWOPI;
	vec2 uv = v_texCoord * 2.0 - 1.0;
	float d = length(uv);

	// adaptive anti-aliasing
	float dfdx = length(vec2(v_texCoord.x + 1.0 / u_texResolution.x, v_texCoord.y) * 2.0 - 1.0) - d;
	float dfdy = length(vec2(v_texCoord.x, v_texCoord.y + 1.0 / u_texResolution.y) * 2.0 - 1.0) - d;
	float f = abs(dfdx) + abs(dfdy);
	float c = smoothstep(OUTER_RADIUS + f, OUTER_RADIUS - f, d) - smoothstep(INNER_RADIUS + f, INNER_RADIUS - f, d);

	// limit to active progress
	float angle = atan(uv.y, uv.x) + u_startingAngle;
	if(angle < 0.0) {
		angle += PI * 2.0;
	}

	// find edge
	float edge;
	if (angle > endAngle) {
		edge = smoothstep(max(u_edgeGradientFactor, 0.05), -f * 2.0, angle - endAngle);
	} else {
		edge = 1.0;
	}

	// set colors
	vec4 color = v_fragmentColor * c;
	vec4 bgColor = u_bgColor * c;
	gl_FragColor = color * edge + bgColor * (1.0 - edge);
}
