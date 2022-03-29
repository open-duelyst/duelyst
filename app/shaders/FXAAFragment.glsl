// glslify blows up unless first line is comment or empty
// screen space FXAA
#pragma glslify: fxaa = require(glsl-fxaa)

varying vec2 v_texCoord;

uniform vec2 u_resolution;

void main() {
    vec2 fragCoord = v_texCoord * u_resolution;
    gl_FragColor = fxaa(CC_Texture0, fragCoord, u_resolution);
}
