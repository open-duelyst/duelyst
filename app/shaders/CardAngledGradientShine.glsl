// glslify blows up unless first line is comment or empty
uniform float u_phase;
uniform float u_time;
uniform float u_intensity;
uniform vec2  u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
    vec2 uv = v_texCoord;
    float phase = u_phase;
    
    vec3 top = vec3(0.0, 0.0, 0.0);
    vec3 middle = vec3(1.0, 1.0, 1.0);
    vec3 bottom = vec3(0.0, 0.0, 0.0);
    vec3 tint = vec3(0.0, 0.0, 0.5);
    float gradient = phase + abs(uv.x + uv.y)/(2.);
    
    vec3 color = vec3(0.0);
    color = mix(top,tint,smoothstep(1.0,0.75,gradient));
    color = mix(color,middle,smoothstep(0.75,0.5,gradient));
    color = mix(color,tint,smoothstep(0.5,0.25,gradient));
    color = mix(color,bottom,smoothstep(0.25,0.0,gradient));

    vec4 texColor = vec4(0.0);
    texColor = texture2D(CC_Texture0, uv);

    texColor.rgb += (1.0-abs(u_phase))*color*u_intensity;

    gl_FragColor = v_fragmentColor * texColor;
}