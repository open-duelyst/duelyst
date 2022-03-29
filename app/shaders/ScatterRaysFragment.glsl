// glslify blows up unless first line is comment or empty
uniform float u_density;
uniform float u_weight;
uniform float u_decay;
uniform float u_exposure;
uniform float u_clamp;

varying vec2 v_texCoord;
varying vec2 v_mvPosition;
varying vec2 v_center;

void main() {
	vec2 texCoord = v_texCoord;
	// sample modifier is 1.0 / number of iterations
	float sampleModifier = 1.0 / 100.0;
	vec2 delta = v_mvPosition - v_center;
	delta *= sampleModifier * u_density;
	float illuminationDecay = 1.0;
	vec4 fragColor = vec4(0.0);

	for(int i=0; i < 100; i++) {
		texCoord -= delta;
		vec4 texel = texture2D(CC_Texture0, texCoord);
		texel *= illuminationDecay * u_weight;
		fragColor += texel;
		illuminationDecay *= u_decay;
	}

	fragColor *= u_exposure;
	fragColor = clamp(fragColor, 0.0, u_clamp);
	gl_FragColor = fragColor;
	//gl_FragColor = vec4(abs((v_mvPosition - v_center).x * 2.0), 0.0, 0.0, 1.0);
}
