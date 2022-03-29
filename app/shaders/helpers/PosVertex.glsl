attribute vec4 a_position;

void main() {
	gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;
}
