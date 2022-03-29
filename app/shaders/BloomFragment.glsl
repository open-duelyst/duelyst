// glslify blows up unless first line is comment or empty
#define MIN_TRANSITION_RATE 0.05
#define DECAY_TRANSITION_RATIO 0.1
#define BOOST 0.5

// CC_Texture0 is current bloom
uniform sampler2D u_previousBloom; // bloom map from previous frame

varying vec2 v_texCoord;

uniform float u_transition;

void main() {
	float transition = max(MIN_TRANSITION_RATE, u_transition);
	float decay = transition * DECAY_TRANSITION_RATIO;
	float boost = 1.0 + (DECAY_TRANSITION_RATIO / decay / (1.0 / MIN_TRANSITION_RATE)) * BOOST;

	vec4 color = texture2D(CC_Texture0, v_texCoord);
	vec4 previousColor = texture2D(u_previousBloom, v_texCoord);
	previousColor = max(vec4(0.0), previousColor - vec4(decay));

	gl_FragColor = mix(previousColor, color * boost, transition);
}
