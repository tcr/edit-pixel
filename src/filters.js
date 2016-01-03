// Outline filter

export class OutlineFilter extends PIXI.AbstractFilter {
  constructor() {
    var vertexShader = null;
    var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform vec4 dimensions;
uniform vec4 newcolor;

#define THRESH 32.0
#define linewidth 1.0

#define downsample(X) step(THRESH/255.0, X)
#define is_black(X) (X.rgb == vec3(0.0) && X.a == 1.0)
#define is_white(X) (!is_black(X))

void main(void) {
  vec4 cur = downsample(texture2D(texture, vTextureCoord));
  vec4 up = downsample(texture2D(texture, vTextureCoord + vec2(0.0, -linewidth)/dimensions.xy));
  vec4 down = downsample(texture2D(texture, vTextureCoord + vec2(0.0, linewidth)/dimensions.xy));
  vec4 left = downsample(texture2D(texture, vTextureCoord + vec2(-linewidth, 0.0)/dimensions.xy));
  vec4 right = downsample(texture2D(texture, vTextureCoord + vec2(linewidth, 0.0)/dimensions.xy));

  // vec4 ul = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, -linewidthless)/dimensions.xy));
  // vec4 dl = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, +linewidthless)/dimensions.xy));
  // vec4 ur = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, -linewidthless)/dimensions.xy));
  // vec4 dr = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, +linewidthless)/dimensions.xy));

  if (is_black(cur) && (is_white(up) || is_white(down) || is_white(left) || is_white(right))) { //} || is_white(ul) || is_white(dl) || is_white(ur) || is_white(dr))) {
    gl_FragColor = newcolor;
  } else {
    gl_FragColor = vec4(0.0);
  }
}

    `;

    super(vertexShader, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
      newcolor: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0]),
      },
    });
  }

  setColor (r, g, b, a) {
    this.uniforms.newcolor.value = new Float32Array([r, g, b, a]);
  }
}


// Grid filter

export class GridFilter extends PIXI.AbstractFilter {
  constructor() {
    var vertexShader = null;
    var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform vec4 dimensions;
uniform float radius;

void main(void) {
  vec2 trueCoords = (vTextureCoord * dimensions.xy) + vec2(1.0, 1.0);
  vec4 cur = texture2D(texture, vTextureCoord);
  if (step(1.0, mod(trueCoords.x, radius)) == 0.0 || step(1.0, mod(trueCoords.y, radius)) == 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.25);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}

    `;

    super(vertexShader, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
      radius: {
        type: 'f',
        value: 1.0,
      }
    });
  }
}


// HSB filter

export class HFilter extends PIXI.AbstractFilter {
  constructor() {
    var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;
uniform vec4 dimensions;

// http://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
  gl_FragColor = vec4(hsv2rgb(vec3(vTextureCoord.y, 1.0, 1.0)), 1.0);
}

    `;

    super(null, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
    });
  }
}

export class SFilter extends PIXI.AbstractFilter {
  constructor() {
    var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;
uniform vec4 dimensions;

// http://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
  gl_FragColor = vec4(hsv2rgb(vec3(0.0, vTextureCoord.y, 0.75)), 1.0);
}

    `;

    super(null, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
    });
  }
}

export class BFilter extends PIXI.AbstractFilter {
  constructor() {
    var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;
uniform vec4 dimensions;

// http://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
  gl_FragColor = vec4(hsv2rgb(vec3(1.0, 1.0, vTextureCoord.y)), 1.0);
}

    `;

    super(null, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
    });
  }
}
