precision mediump float;
varying vec2 vUv;
varying float vGrey;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  gl_FragColor = vec4(vec3(vGrey), 1.0);
}
