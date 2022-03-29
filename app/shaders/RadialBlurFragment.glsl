// glslify blows up unless first line is comment or empty
varying vec2 v_texCoord;

uniform vec2 u_origin;
uniform float u_strength;
uniform float u_deadZone;
uniform float u_ramp;
uniform float u_decay;
uniform float u_spread;

void main() {
	// sample modifier is 1.0 / number of iterations
	float sampleModifier = 1.0 / 10.0;

	vec2 texCoord = v_texCoord;
	vec2 deltaTexCoord = vec2(texCoord - u_origin);
	float coordDist = length(deltaTexCoord);
	float startModifier = min(max(coordDist - u_deadZone, 0.0) * 4.0, 1.0);
	vec2 texCoordStep = deltaTexCoord * startModifier;
	texCoordStep *= sampleModifier * u_spread;
	float ramp = coordDist * u_ramp;
  texCoordStep *= ramp;

	vec4 blurColor = vec4(0.0);
	float weight = sampleModifier;

	for (int i = 0; i < 10; i++) {
		texCoord -= texCoordStep;
		vec4 texel = texture2D(CC_Texture0, texCoord);
		texel *= weight;
		blurColor += texel;
		weight *= u_decay;
	}

	vec4 baseColor = texture2D(CC_Texture0, v_texCoord);
	gl_FragColor = mix(baseColor, blurColor, u_strength);
}
