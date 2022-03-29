// glslify blows up unless first line is comment or empty
uniform float u_depthRange;

varying vec4 v_mvPosition;
varying vec4 v_originRadius;
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
	vec4 gdata = texture2D(CC_Texture0, v_texCoord);
	vec3 gNormal = gdata.rgb * 2.0 - 1.0;
	float gDepth = gdata.a;
	float gDepthUnpacked = gDepth * u_depthRange;
	// need to make actual depth less precise because gDepth is only accurate to 255 values
	// we also need to shift slightly and clamp to remove some of the edge noise
	// FIXME: I doubt this is the best idea and is making a lot of unnecessary ops
	float fuzzyDepth = floor(((v_originRadius.z + 1.29) / u_depthRange) * 255.0) / 255.0 * u_depthRange;
	float fuzzyDepthDiff = max(0.0, fuzzyDepth - gDepthUnpacked - 3.0);
  float radius = v_originRadius.w;
  // either only allow scattering for occluders between camera and light
  //float occlusion = clamp(fuzzyDepthDiff, 0.0, 1.0) * -gNormal.z;
  // or allow scattering for all occluders that face camera (not correct, but cool!)
  float occlusion = -gNormal.z;

  vec3 diff = v_originRadius.xyz - v_mvPosition.xyz;
  float distSq = diff.x * diff.x + diff.y * diff.y + diff.z * diff.z;

	float falloff = 1.0 - min(distSq / (radius * radius), 1.0);//ceil(min(distSq / (radius * radius), 1.0) - 0.5);

	gl_FragColor = vec4(v_fragmentColor.rgb - occlusion, falloff * v_fragmentColor.a);
}
