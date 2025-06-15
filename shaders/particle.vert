precision mediump float;
attribute vec3 offset;
attribute float angle;

uniform float uTime;
uniform float uSize;
uniform float uDepth;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;

varying vec2 vUv;
varying float vGrey;

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vec2 uv = offset.xy / uTextureSize;
  vec4 color = texture2D(uTexture, uv);

  float grey = color.r * 0.3 + color.g * 0.59 + color.b * 0.11;

  vec3 displaced = offset;
  displaced.z += grey * uDepth * sin(uTime + angle);

  vUv = uv;
  vGrey = grey;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_PointSize = uSize * vGrey * 2.0;
  gl_Position = projectionMatrix * mvPosition;
}
