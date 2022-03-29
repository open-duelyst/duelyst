// glslify blows up unless first line is comment or empty
// Copyright (C) 2015 Matthew Ready
// Licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Australia license.
// http://creativecommons.org/licenses/by-nc-sa/3.0/au

#define INNER_RADIUS 0.75
#define OUTER_RADIUS 0.9
#define SHEET_THICKNESS 0.012

#define INNER_COLOR vec4(0.0, 30.0, 30.0, 1.0)
#define OUTER_COLOR vec4(20.0, 20.0, 30.0, 1.0)

#define NUM_STEPS 20

// CC_Texture0 is noise texture
uniform float u_time;
uniform float u_timeScale; // default = 5.0
uniform float u_noiseLevel; // default = 10.0
uniform vec2 u_texResolution;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

float trapezium(in float x) {
	return min(1.0, max(0.0, 1.0 - abs(-mod(x, 1.0) * 3.0 + 1.0)) * 2.0);
}

vec3 colFromHue(in float hue) {
    // https://en.wikipedia.org/wiki/Hue#/media/File:HSV-RGB-comparison.svg
	return vec3(trapezium(hue - 1.0/3.0), trapezium(hue), trapezium(hue + 1.0/3.0));
}

// Cheap noise functions. I just messed around with sin functions until
// I got something I liked. The important thing was to make sure the periods
// of the sin functions weren't constant and varied over space.
float cnoise3(in float pos) {
	return (cos(pos / 2.0) * 0.2 + 1.0);
}

float cnoise2(in float pos) {
	return (sin(pos * cnoise3(pos) / 2.0) * 0.2 + 1.0);
}

float cnoise(in vec4 pos) {
  // These values are all very carefully chosen using
  // lots of very complex mathematics. In other news,
  // bashing my head on my keyboard is now complex
  // mathematics
  float x = pos.x * cnoise2(pos.y) + pos.w * 0.87123 + 82.52;
  float y = pos.y * cnoise2(pos.z) + pos.w * 0.78725 + 12.76;
  float z = pos.z * cnoise2(pos.x) + pos.w * 0.68201 + 42.03;
  return (sin(x) + sin(y) + sin(z)) / 3.0;
}

vec4 merge_colours(in vec4 apply_this, in vec4 on_top_of_this) {
  // Very basic colour merging
  return on_top_of_this * (1.0 - apply_this.a) + apply_this * apply_this.a;
}

vec4 getdensity(in vec3 pos) {
  // This function get's the "density" of fog at a position in space (pos)

  // First, let's make a variable we can reuse for scaled time.
  float time = u_time * u_timeScale;

  // The next thing to do is decide where to sample the noise functions.
  // We want the radius of the bubble to be constant along any ray from
  // the center of the bubble. So, to ensure that we always sample the same
  // position in the noise function for any ray, we normalize the position
  // vector (since the origin of the bubble is at 0)
  vec3 samplePos = normalize(pos);

  // // The inner colour of the buble is just a random colour sampled from the cheap noise function.
  vec4 inner_color = vec4(colFromHue(cnoise(vec4(samplePos / 5.0, time / 15.0))) * 25.0, 1.0);
  // static inner color
  // vec4 inner_color = vec4(1.0, 0.25, 0.0, 1.0);
  // The outer colour of the buble is a big whiter than the inside. This helps make the bubble
  // look more natural.
  vec4 outer_color = merge_colours(vec4(25.0,25.0,25.0,0.5), inner_color);

  // Now we're going to sample the noise function to get the radius of the bubble along this ray
  float sample = (cnoise(vec4(samplePos * u_noiseLevel, time)) + 1.0) / 2.0;
  // Clamp the noise in case using a different noise function (perlin for example)
  sample = clamp(sample, 0.0, 1.0);
  // Calculate the inner and outer most radius boundaries
  float innerIncBorder = INNER_RADIUS + SHEET_THICKNESS;
  float outerIncBorder = OUTER_RADIUS - SHEET_THICKNESS;
  // Calculate the radius of the bubble by linearly interpolating
  // the noise sample between inner and outer boundaries.
  float radius = innerIncBorder + (outerIncBorder - innerIncBorder) * sample;

  // Calculate the distance between the volume sample position and the center of the bubble
  float dist = distance(pos, vec3(0.0, 0.0, 0.0));
  // Calculate the density of the fog. We use a very "strongly peaking" function here.
  // It's almost 0 everywhere except at radius, where it peaks to 1 and then falls to 0 very quickly.
  // Take a look at it in wolframalpha.
  float density = exp(-pow(dist - radius, 2.0) * 05000.0);

  // Calculate final color here. Lerp the inner and outer colours depending on the radius and scale by density
  return (inner_color + (outer_color - inner_color) * (radius - innerIncBorder) / (outerIncBorder - innerIncBorder)) * density;
}

vec4 raymarch(in vec3 start, in vec3 end) {
  // This is the ray marching function. Here, we sample NUM_STEPS points along the vector
  // between start and end. Then, we integrate the resultant densities linearly.
  vec4 retn = vec4(0.0, 0.0, 0.0, 0.0);
	vec3 delta = end - start;
  float stepDistance = length(delta) / float(NUM_STEPS);

  vec4 densityPrevious = getdensity(start);
  for (int i = 1; i < NUM_STEPS; i++)
  {
    vec3 samplePos = start + delta * float(i) / float(NUM_STEPS);
    vec4 density = getdensity(samplePos);
    // Integrate the density using linear interpolation
    // The colours will be the average of the two weighted by their alpha
    vec4 densityIntegrated = (density + densityPrevious) / 2.0;
    // Optimised out to return. densityIntegrated *= stepDistance
    retn += densityIntegrated;

    densityPrevious = density;
  }

  return retn * stepDistance;
}

vec4 raymarch_ball(in vec2 coord) {
	// Now we're going to intersect a ray from the
  // coord along the Z axis onto two spheres, one
  // inside the other (same origin). getdensity
  // is only > 0 between these volumes.
  float d = distance(coord, vec2(0.0, 0.0));
  if (d > OUTER_RADIUS) {
    // No intersection on the spheres.
		return vec4(0.0, 0.0, 0.0, 0.0);
  }
  float dOuterNormalized = d / OUTER_RADIUS;
  float outerStartZ = -sqrt(1.0 - dOuterNormalized*dOuterNormalized) * OUTER_RADIUS; // sqrt(1-x*x) = function of a circle :)
  float outerEndZ = -outerStartZ;
  if (d > INNER_RADIUS) {
    // The ray only intersects the larger sphere,
    // so we need to cast from the front to the back

    // We do it twice so that the number of samples in this branch
    // is identical to the number of samples
    // inside the blob. Otherwise we see artifacts with
    // a lower number of samples.
    vec4 frontPart = raymarch(vec3(coord, outerStartZ), vec3(coord, 0));
    vec4 backPart = raymarch(vec3(coord, 0), vec3(coord, outerEndZ));
    return frontPart + backPart;
  }

  float dInnerNormalized = d / INNER_RADIUS;
  float innerStartZ = -sqrt(1.0 - dInnerNormalized*dInnerNormalized) * INNER_RADIUS; // sqrt(1-x*x) = function of a circle :)
  float innerEndZ = -innerStartZ;
  // The ray intersects both spheres.
  vec4 frontPart = raymarch(vec3(coord, outerStartZ), vec3(coord, innerStartZ));
  vec4 backPart = raymarch(vec3(coord, innerEndZ), vec3(coord, outerEndZ));
  vec4 final = frontPart + backPart;
  return final;
}


void main() {
  // vec2 uv = v_texCoord;
  // vec2 position = uv - vec2(0.5,0.5);

  // vec2 uv = (gl_fragCoord.xy / min(u_texResolution.x, u_texResolution.y)) * 2.0 - vec2(u_texResolution.x / u_texResolution.y, 1.0);

  vec2 uv = v_texCoord * 2.0 - vec2(u_texResolution.x / u_texResolution.y, 1.0);
  vec2 position = uv;

  gl_FragColor = v_fragmentColor * merge_colours(raymarch_ball(position), vec4(0.0, 0.0, 0.0, 1.0));
}
