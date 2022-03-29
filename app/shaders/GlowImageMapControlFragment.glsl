// glslify blows up unless first line is comment or empty
// CC_Texture0 is noise texture
uniform float u_time;
uniform vec2 u_texResolution;
uniform vec3 u_color;
uniform float u_intensity;
uniform float u_gamma;
uniform float u_levelsInWhite;
uniform float u_levelsInBlack;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

#pragma glslify: getNoise3D = require(./helpers/Noise3D.glsl)

// TODO: replace with helper abs fbm octaves module when glslify fixes: https://github.com/stackgl/glslify/issues/44
float getNoiseAbsFBMOctaves4(in vec3 v) {
	float res = 0.0;
	float scale = 1.0;
	for(int i=0; i<4; i++) {
		res += abs(getNoise3D(v)) * scale;
		v *= vec3(2.0);
		scale *= 0.5;
	}
	return res;
}

float adjustLevels (in float inChannel, in float inBlack, in float inWhite, in float inGamma, in float outBlack, in float outWhite) {
	return pow((inChannel - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack;
}

void main() {
    float t = u_time;
    float aspect = u_texResolution.x / u_texResolution.y;

    float intensity = u_intensity;
    float inWhite = u_levelsInWhite;
    float gamma = u_gamma;
    float inBlack = u_levelsInBlack;
    vec3 color = u_color;

    vec2 uv = v_texCoord;
    vec4 mapColor = texture2D(CC_Texture0,uv);

    // use alpha chanel as the glow amount input value
    float value = mapColor.a;

    // apply levels
    value = max(0.0,adjustLevels(value,inBlack,inWhite, gamma, 0.0,1.0));

    // calculate and add noise
    vec2 dom = vec2(uv.x * aspect, uv.y) * 2.0;
    float turb = getNoiseAbsFBMOctaves4(vec3(dom, t)) / 1.;
    value += value / pow(turb,1.0);

    // modulate color based on glow value and intensity
    vec4 finalColor = vec4(color * vec3(value),1.0) * intensity;

    // interpolate color opacity based on the value of the glow map + noise (value is from 0.0 to 2.0 due to potential noise) ... treat anything above 1 as a FULL opacity color
    finalColor = mix(finalColor, vec4(finalColor.rgb, 0), smoothstep(1.0, 0.0, value));
    // make higher values (above 1.5) map to white
    finalColor = mix(vec4(1.0), finalColor, smoothstep(2.0, 1.5, value));

    gl_FragColor = v_fragmentColor * finalColor;
}
