// glslify blows up unless first line is comment or empty
// original: https://www.shadertoy.com/view/Xdf3zM

// see also: https://www.shadertoy.com/view/Msf3DH
// see also: https://www.shadertoy.com/view/ldB3RR
// see also: https://www.shadertoy.com/view/Xtl3W2

const float eps = 0.01;
const float texelSize = 1.0 / 24.0;
const int numPlanes = 24;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float u_time; // time
uniform vec2 u_texResolution; // resolution
uniform samplerCube u_cubeMap; // cube environment map
uniform float u_gemSeed; // seed for generating gem shape

// transforms
vec3 rotateX(vec3 p, float a)
{
	float sa = sin(a);
	float ca = cos(a);
	return vec3(p.x, ca*p.y - sa*p.z, sa*p.y + ca*p.z);
}

vec3 rotateY(vec3 p, float a)
{
	float sa = sin(a);
	float ca = cos(a);
	return vec3(ca*p.x + sa*p.z, p.y, -sa*p.x + ca*p.z);
}

bool intersectConvex(vec3 ro, vec3 rd,
					 out vec3 p1, out vec3 p2,
					 out vec3 n1, out vec3 n2)
{
	bool hit = true;
	float t1 = 0.0;
	float t2 = 1e10;

	// intersect ray with convex polyhedron
	for(int i=0; i<numPlanes; i++) {
		// read plane from texture
		float j = u_gemSeed; // 0.2;	// static planes
		// float j = texelSize*u_time;	// animate planes
		vec3 s = texture2D(CC_Texture0, vec2(float(i)*texelSize, j/12.)).xyz*2.0-1.0;
		vec3 n = normalize(s);
		float d = 0.5;	// try this if you don't have WebAudio

		// intersect ray against plane
		// http://www.cs.princeton.edu/courses/archive/fall00/cs426/lectures/raycast/sld017.htm

		float denom = dot(n, rd);
		float dist = d - dot(n, ro);
		float t = dist / denom;
		if (denom < 0.0) {
			// entering halfspace
			if (t > t1) {
				t1 = t;
				n1 = n;
			}
		} else	{
			// leaving halfspace
			if (t < t2) {
				t2 = t;
				n2 = n;
			}
		}
		if (t1 > t2) {
		 hit = false;
		}
	}

	// intersection points
	p1 = ro + t1*rd;
	p2 = ro + t2*rd;
	return hit;
}

float fresnel(vec3 n, vec3 v, float minr)
{
	return minr + (1.0-minr)*pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.0);
}

// lighting
vec3 shade(vec3 pos, vec3 n, vec3 eyePos)
{
	//const float shininess = 20.0;
	//const vec3 l = vec3(0.577, 0.577, -0.577);
	vec3 v = normalize(eyePos - pos);
	//vec3 h = normalize(v + l);

	//float diff = dot(n, l);
	//float spec = pow(max(0.0, dot(n, h)), shininess) * float(diff > 0.0);
	//diff = max(0.0, diff);
	//diff = 0.5+0.5*diff;

	// reflection
	vec3 R = reflect(-v, n);
	vec3 Rcol = textureCube(u_cubeMap, R).xyz;

	// refraction
	//const float eta = 1.0 / 1.4;	// air-glass
	const float eta = 1.0 / 1.1;	// air-glass

#if 0
	vec3 T = normalize(-v + n*0.1);
	//vec3 T = refract(-v, n, eta);
	vec3 Tcol = textureCube(u_cubeMap, T).xyz;
#else
	// dispersion
	vec3 T = refract(-v, n, eta);
	vec3 Tcol;
	Tcol.r = textureCube(u_cubeMap, T).r;
	T = refract(-v, n, eta + 0.01);
	Tcol.g = textureCube(u_cubeMap, T).g;
	T = refract(-v, n, eta + 0.02);
	Tcol.b = textureCube(u_cubeMap, T).b;
#endif

	float f = fresnel(n, v, 0.4);

	//return diff*c + vec3(spec);
	//return c;
	//return Rcol;
	//return Tcol;
	//return vec3(diff*ao)*c + vec3(spec);
	//return n*0.5+0.5;
	//return vec3(f);
	return Rcol*f*2.;
	//return mix(Tcol, Rcol, f);
}

// lighting
vec3 shade2(vec3 p, vec3 p2, vec3 n, vec3 n2, vec3 eyePos)
{
	vec3 c;
	vec3 v = normalize(eyePos - p);

	// exponential absorption
	float dist = length(p2 - p)*2.0;
	vec3 absorp = exp(-dist*vec3(1.0, 0.2, 0.0));

	// reflection
	vec3 R = reflect(-v, n);
	vec3 Rcol = textureCube(u_cubeMap, R).xyz;
	float f = fresnel(n, v, 0.2) *2.;

	// 2nd hit
	v = normalize(eyePos - p2);

	// refraction
	const float eta = 1.0 / 1.1;	// air-glass
	//vec3 T = normalize(-v + n*0.1);
#if 0
	vec3 T = refract(-v, -n2, eta);
	vec3 Tcol = textureCube(u_cubeMap, T).xyz;
#else
	// dispersion
	vec3 T = refract(-v, -n2, eta);
	vec3 Tcol;
	Tcol.r = textureCube(u_cubeMap, T).r;
	T = refract(-v, -n2, eta + 0.01);
	Tcol.g = textureCube(u_cubeMap, T).g;
	T = refract(-v, -n2, eta + 0.02);
	Tcol.b = textureCube(u_cubeMap, T).b;
#endif

	Tcol *= absorp;
	c = mix(Tcol, Rcol, f);

	//c = Tcol;
	//c = Rcol;
	//c = vec3(dist);
	//c = vec3(absorp);
	//c = vec3(f);
	return c;
}


vec4 background(vec3 rd)
{
	//return mix(vec3(1.0), vec3(0.0, 0.25, 1.0), rd.y);
	return vec4(0.0);
	// return textureCube(u_cubeMap, rd).xyz;
}

void main()
{
	vec2 pixel = v_texCoord*2.0-1.0;

	// compute ray origin and direction
	float asp = u_texResolution.x / u_texResolution.y;
	vec3 rd = normalize(vec3(asp*pixel.x, pixel.y, -2.0));
	vec3 ro = vec3(0.0, 0.0, 3.0);

	float roty = u_time*2.0;
	float rotx = u_time/2.0;

	rd = rotateX(rd, rotx);
	ro = rotateX(ro, rotx);

	rd = rotateY(rd, roty);
	ro = rotateY(ro, roty);

	// trace ray
	vec3 p, p2;
	vec3 n, n2;
	bool hit =	intersectConvex(ro, rd, p, p2, n, n2);

	vec3 rgb;
	vec4 finalColor;

	if(hit)
	{
		// shade
		// rgb = shade(p, n, ro);
		rgb = shade2(p, p2, n, n2, ro);
		finalColor = vec4(rgb,1.0);

	} else {

		finalColor = background(rd);
	}

	// vignetting
	// rgb *= 0.5+0.5*smoothstep(2.0, 0.5, dot(pixel, pixel));

	gl_FragColor = finalColor + finalColor;

	// gl_FragColor = texture2D(CC_Texture0, v_texCoord);
}
