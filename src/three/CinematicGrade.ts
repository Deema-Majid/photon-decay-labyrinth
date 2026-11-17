import { BlendFunction, Effect } from 'postprocessing'
import { Uniform, Vector3 } from 'three'

/**
 * Film-style grade applied after tone mapping:
 * teal lift in the shadows, warm push in the highlights, a gentle S-curve
 * and slightly lifted blacks.
 */
const fragment = /* glsl */ `
uniform float uStrength;
uniform vec3 uShadowTint;
uniform vec3 uHighlightTint;
uniform float uContrast;
uniform float uLift;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = max(inputColor.rgb, vec3(0.0));
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float sh = 1.0 - smoothstep(0.0, 0.35, l);
  float hi = smoothstep(0.35, 0.9, l);
  c += uShadowTint * sh * uStrength;
  c += uHighlightTint * hi * uStrength;
  vec3 s = clamp(c, 0.0, 1.0);
  c = mix(c, s * s * (3.0 - 2.0 * s), uContrast);
  c = c * (1.0 - uLift) + uLift;
  outputColor = vec4(c, inputColor.a);
}
`

export class CinematicGradeEffect extends Effect {
  constructor() {
    super('CinematicGradeEffect', fragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uStrength', new Uniform(1)],
        ['uShadowTint', new Uniform(new Vector3(-0.012, 0.008, 0.022))],
        ['uHighlightTint', new Uniform(new Vector3(0.035, 0.012, -0.022))],
        ['uContrast', new Uniform(0.22)],
        ['uLift', new Uniform(0.012)],
      ]),
    })
  }
}
