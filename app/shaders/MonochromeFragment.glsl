// glslify blows up unless first line is comment or empty
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
  vec4 color = texture2D(CC_Texture0, v_texCoord);
  float gray = (0.2 * color.r) + (0.7 * color.g) + (0.1 * color.b);
  gl_FragColor = v_fragmentColor * vec4(gray, gray, gray, color.a);
}
