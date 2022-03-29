// glslify blows up unless first line is comment or empty
uniform vec2 u_size;
uniform vec2 u_anchor;
uniform float u_intensity;
uniform float u_blurShiftModifier;
uniform float u_blurIntensityModifier;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
varying vec3 v_mv_lightPosition;
varying float v_mv_lightRadius;
varying vec2 v_position;
varying vec3 v_mv_castedAnchorPosition;

void main() {

  // diminish shadow by distance from light
	vec3 lightDiff = v_mv_lightPosition - v_mv_castedAnchorPosition;
	float lightDist = length(lightDiff);
	float lightDistPct = pow(lightDist / v_mv_lightRadius, 2.0);
	float lightDistPctInv = 1.0 - lightDistPct;

	// blur by distance from vertex position anchor point
	vec2 anchorDiff = v_position - u_anchor;
	float anchorDist = length(anchorDiff);
	float sizeRadius = (length(u_size) * 0.5);
	float anchorDistPct = anchorDist / sizeRadius;
	float occluderDistPctX = min(abs(anchorDiff.x) / sizeRadius, 1.0);
	float occluderDistPctY = min(max(anchorDiff.y, 0.0) / u_size.x, 1.0);
	float occluderDistPctBlurModifier = pow(occluderDistPctY, u_blurShiftModifier);
  float blurX = (1.0/u_size.x * u_blurIntensityModifier) * occluderDistPctBlurModifier;
  float blurY = (1.0/u_size.y * u_blurIntensityModifier) * occluderDistPctBlurModifier;

  // get intensity by distance from anchor and uniform
  float intensityFadeX = pow(1.0 - occluderDistPctX, 1.25);
  float intensityFadeY = pow(1.0 - occluderDistPctY, 1.5);
  float intensity = intensityFadeX * intensityFadeY * u_intensity;

	// blur in a single pass so we don't have to render to multiple FBOs and recalculate the shadow again
	// we're making a lot of dependent texture reads, but we need too many varyings to precalculate all coords in vertex shader
	float alpha = 0.0;

	// row offsets x
	float xn1 = -1.0 * blurX;
	float x = 0.0;
	float xp1 = 1.0 * blurX;

	// row offsets y
	float yn1 = -1.0 * blurY;
	float y = 0.0;
	float yp1 = 1.0 * blurY;

	// calculate blur where box weight is 1.0 / number of samples
	float boxWeight = 1.0 / 9.0;

  // 3x3 blur
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(xn1, yn1)).a * boxWeight;
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(x, yn1)).a * boxWeight;
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(xp1, yn1)).a * boxWeight;

	alpha += texture2D(CC_Texture0, v_texCoord + vec2(xn1, y)).a * boxWeight;
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(x, y)).a * boxWeight;
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(xp1, y)).a * boxWeight;

	alpha += texture2D(CC_Texture0, v_texCoord + vec2(xn1, yp1)).a * boxWeight;
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(x, yp1)).a * boxWeight;
	alpha += texture2D(CC_Texture0, v_texCoord + vec2(xp1, yp1)).a * boxWeight;

	gl_FragColor = vec4(0.0, 0.0, 0.0, min(1.0, lightDistPctInv * alpha * intensity * v_fragmentColor.a));
}
