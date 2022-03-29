// glslify blows up unless first line is comment or empty
uniform float u_falloffModifier;
uniform float u_intensityModifier;

varying vec4 v_mvPosition;
varying vec4 v_originRadius;
varying vec4 v_fragmentColor;
varying vec3 v_normal;
varying float v_depth;
varying float v_normalOffset;

void main() {
  float radius = v_originRadius.w;
  vec3 diff = v_originRadius.xyz - vec3(v_mvPosition.x, v_mvPosition.y - (v_depth - v_mvPosition.z), v_depth);
  diff.z += v_normalOffset;
  float dist = length(diff);
  vec3 dir = diff / dist;

  float falloff = 1.0 - pow(min(dist / radius, 1.0), u_falloffModifier);
  float angle = dot(v_normal, dir);
	float intensity = clamp(angle * u_intensityModifier, 0.0, 1.0);

	gl_FragColor = vec4(v_fragmentColor.rgb * intensity, v_fragmentColor.a * falloff);
}
