// glslify blows up unless first line is comment or empty
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
uniform vec2 u_texResolution;

float threshold(in float thr1, in float thr2 , in float val) {
	if (val < thr1) {return 0.0;}
	if (val > thr2) {return 1.0;}
	return val;
}

// averaged pixel difference from 3 color channels
float diff(in vec4 pix1, in vec4 pix2) {
  return (
    abs(pix1.r - pix2.r) +
    abs(pix1.g - pix2.g) +
    abs(pix1.b - pix2.b)
  ) / 3.0;
}

// returns pixel color
float IsEdge(in vec2 coords){
	float dx = 1.0 / u_texResolution.x /*image width*/;
	float dy = 1.0 / u_texResolution.y /*image height*/;
	vec4 pix[9];

	pix[0] = texture2D(CC_Texture0, coords + vec2( -1.0 * dx,  -1.0 * dy));
	pix[1] = texture2D(CC_Texture0, coords + vec2( -1.0 * dx ,  0.0 * dy));
	pix[2] = texture2D(CC_Texture0, coords + vec2( -1.0 * dx ,  1.0 * dy));
	pix[3] = texture2D(CC_Texture0, coords + vec2(  0.0 * dx , -1.0 * dy));
	pix[4] = texture2D(CC_Texture0, coords + vec2(  0.0 * dx ,  0.0 * dy));
	pix[5] = texture2D(CC_Texture0, coords + vec2(  0.0 * dx ,  1.0 * dy));
	pix[6] = texture2D(CC_Texture0, coords + vec2(  1.0 * dx , -1.0 * dy));
	pix[7] = texture2D(CC_Texture0, coords + vec2(  1.0 * dx ,  0.0 * dy));
	pix[8] = texture2D(CC_Texture0, coords + vec2(  1.0 * dx ,  1.0 * dy));

	// average color differences around neighboring pixels
	float delta = (
		diff(pix[1],pix[7]) +
		diff(pix[5],pix[3]) +
		diff(pix[0],pix[8]) +
		diff(pix[2],pix[6])
	)/4.0;

	return delta; // threshold(0.25,0.4,clamp(3.0*delta,0.0,1.0));
}

void main() {
	// original color
	vec4 textureColor = texture2D(CC_Texture0, v_texCoord);

	// edge detection
	vec4 edgeColor = vec4(0.0,0.0,0.0,textureColor.a);
    edgeColor.rgb = vec3(IsEdge(v_texCoord));

	// output final color
	gl_FragColor = textureColor + edgeColor;
}
