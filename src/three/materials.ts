import * as THREE from 'three'

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Frame-rate independent exponential damping. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function dampVec(current: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  const k = 1 - Math.exp(-lambda * dt)
  current.x += (target.x - current.x) * k
  current.y += (target.y - current.y) * k
  current.z += (target.z - current.z) * k
  return current
}

export function dampColor(current: THREE.Color, target: THREE.Color, lambda: number, dt: number) {
  const k = 1 - Math.exp(-lambda * dt)
  current.lerp(target, k)
  return current
}

/** Volumetric-looking additive aura wrapped around a laser core. */
export function createBeamAuraMaterial(color: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uLen: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uLen;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float facing = abs(dot(normalize(vNormal), normalize(vView)));
        float core = pow(facing, 2.2);
        float pulse = 0.72 + 0.28 * sin(vUv.y * uLen * 4.0 - uTime * 16.0);
        float flicker = 0.92 + 0.08 * sin(uTime * 60.0 + vUv.y * 30.0);
        float a = core * pulse * flicker;
        gl_FragColor = vec4(uColor * (1.4 + core * 1.6), a * 0.85);
      }
    `,
  })
}

/** Soft god-ray cone: bright at the top, fading toward the floor and at grazing angles. */
export function createShaftMaterial(color: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uStrength: { value: 0.35 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uStrength;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float facing = abs(dot(normalize(vNormal), normalize(vView)));
        float edge = pow(facing, 1.4);
        float fall = pow(vUv.y, 2.0);
        float dust = 0.85 + 0.15 * sin(vUv.y * 40.0 + uTime * 0.8 + vUv.x * 12.0);
        float a = edge * fall * dust * uStrength;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  })
}
