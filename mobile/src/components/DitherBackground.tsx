import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';

/* ------------------------------------------------------------------ */
//  Full-screen dither-swirl shader (GLSL ES 1.0 — iOS-safe)
/* ------------------------------------------------------------------ */

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float bayer4x4(vec2 coord) {
  float cx = mod(coord.x, 4.0);
  float cy = mod(coord.y, 4.0);
  float idx = cy * 4.0 + cx;
  float v;
  if      (idx < 0.5)  v = 0.0;
  else if (idx < 1.5)  v = 8.0;
  else if (idx < 2.5)  v = 2.0;
  else if (idx < 3.5)  v = 10.0;
  else if (idx < 4.5)  v = 12.0;
  else if (idx < 5.5)  v = 4.0;
  else if (idx < 6.5)  v = 14.0;
  else if (idx < 7.5)  v = 6.0;
  else if (idx < 8.5)  v = 3.0;
  else if (idx < 9.5)  v = 11.0;
  else if (idx < 10.5) v = 1.0;
  else if (idx < 11.5) v = 9.0;
  else if (idx < 12.5) v = 15.0;
  else if (idx < 13.5) v = 7.0;
  else if (idx < 14.5) v = 13.0;
  else                 v = 5.0;
  return v / 16.0;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float t = u_time * 0.25;

  // Centered coordinates
  vec2 centered = uv - vec2(aspect * 0.5, 0.5);
  float dist = length(centered);
  float angle = atan(centered.y, centered.x);

  // Organic noise field
  float n1 = snoise(centered * 1.8 + vec2(t * 0.2, -t * 0.15));
  float n2 = snoise(centered * 3.2 - vec2(t * 0.15, t * 0.2));
  float noiseVal = n1 * 0.5 + n2 * 0.5;

  // Swirl arms
  float swirl1 = sin(angle * 3.0 + dist * 8.0 - t * 1.2 + noiseVal * 1.5);
  float swirl2 = sin(angle * -2.0 + dist * 5.0 + t * 0.8);
  float swirl = swirl1 * 0.5 + swirl2 * 0.5;
  swirl = swirl * 0.5 + 0.5;

  // Radial falloff
  float radial = smoothstep(1.4, 0.3, dist);

  // Combine
  float value = noiseVal * 0.2 + swirl * radial * 0.8;
  value = value * 0.5 + 0.55;

  // Dither threshold
  vec2 pixel = gl_FragCoord.xy;
  float threshold = bayer4x4(pixel * 0.6);
  float dithered = step(threshold, value);

  // Color palette — deep burgundy base, gold + cyan dots
  vec3 base   = vec3(0.05, 0.02, 0.03);
  vec3 gold   = vec3(0.79, 0.66, 0.30);
  vec3 cyan   = vec3(0.30, 0.75, 0.80);

  // Color variation by swirl arm and noise
  float colorMix = snoise(centered * 2.0 + vec2(t * 0.1, -t * 0.15)) * 0.5 + 0.5;
  float armMix   = sin(angle * 5.0 + t * 0.4) * 0.5 + 0.5;
  vec3 dotColor  = mix(gold, cyan, colorMix * 0.6 + armMix * 0.4);

  vec3 color = mix(base, dotColor, dithered);

  // Vignette
  float vig = 1.0 - smoothstep(0.3, 1.1, dist);
  color *= 0.55 + 0.45 * vig;

  gl_FragColor = vec4(color, 1.0);
}`;

/* ------------------------------------------------------------------ */

export function DitherBackground() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;

    console.log('[DitherBackground] onContextCreate — size:', w, 'x', h);

    try {
      // Vertex shader
      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, VERT);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error('[DitherBackground] VS compile error:', gl.getShaderInfoLog(vs));
        gl.deleteShader(vs);
        return;
      }

      // Fragment shader
      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fs, FRAG);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('[DitherBackground] FS compile error:', gl.getShaderInfoLog(fs));
        gl.deleteShader(fs);
        gl.deleteShader(vs);
        return;
      }

      // Program
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[DitherBackground] Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        gl.deleteShader(fs);
        gl.deleteShader(vs);
        return;
      }

      gl.useProgram(program);

      // Full-screen quad
      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      const uTime = gl.getUniformLocation(program, 'u_time');
      const uRes  = gl.getUniformLocation(program, 'u_resolution');

      let start = Date.now();
      let active = true;
      let raf = 0;
      let frameCount = 0;

      const render = () => {
        if (!active) return;
        const time = (Date.now() - start) / 1000.0;
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, time);
        gl.uniform2f(uRes, w, h);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
        gl.endFrameEXP();

        frameCount++;
        if (frameCount === 1) {
          console.log('[DitherBackground] first frame rendered — time:', time.toFixed(2));
        } else if (frameCount === 60) {
          console.log('[DitherBackground] 60 frames rendered');
        }

        raf = requestAnimationFrame(render);
      };

      render();

      cleanupRef.current = () => {
        active = false;
        cancelAnimationFrame(raf);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (buffer) gl.deleteBuffer(buffer);
      };
    } catch (err) {
      console.error('[DitherBackground] WebGL setup failed:', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  return (
    <GLView
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onContextCreate={onContextCreate}
    />
  );
}
