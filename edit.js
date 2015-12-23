var size = { x: 300, y: 100 };

// Create a pixi renderer
var renderer = PIXI.autoDetectRenderer(size.x, size.y);
renderer.view.className = "rendererView";

class CircleMesh extends PIXI.AbstractFilter {
  constructor() {
    var vertexShader = null;
    var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;

uniform vec4 dimensions;
uniform float radius;
uniform float xlen;
uniform float ylen;
uniform float docircle;
uniform sampler2D uSampler;

/**
 * Draw a circle at vec2 pos with radius rad and
 * color color.
 */

void main(void) {
  vec2 pos = vTextureCoord*dimensions.xy;
  vec2 center = dimensions.xy*0.5;
  vec3 color = vec3(1.0, 1.0, 0);

  if (docircle > 0.0) {
    float d = clamp(length(pos - center) - radius, 0.0, 2.0);
    
    // Antialias
    /*
    if (d > 0.0 && d < 1.0)
      gl_FragColor = vec4(color*d, 1.0);
    else if (d >= 1.0 && d < 2.0)
      gl_FragColor = vec4(color*(2.0-d), 1.0);
    */

    // Alias
    if (d > 0.0 && d <= 1.0)
      gl_FragColor = vec4(color, 1.0);
    else
      gl_FragColor = vec4(0.0);
  
  } else {
    vec2 tl = vec2(center.x - xlen, center.y - ylen);
    vec2 br = vec2(center.x + xlen, center.y + ylen);

    float lx = pos.x - tl.x;
    float rx = pos.x - br.x;

    float ty = pos.y - tl.y;
    float by = pos.y - br.y;

    float dx = min(abs(lx), abs(rx));
    float dy = min(abs(ty), abs(by));

    float pixelbound = 1.0 - (step(1.0, dx) * step(1.0, dy));
    float xbound = (1.0 - step(0.0, rx)) * step(0.0, lx);
    float ybound = (1.0 - step(0.0, by)) * step(0.0, ty);

    gl_FragColor = vec4(color*pixelbound*xbound*ybound, 1.0);
  }
}

    `;

    super(vertexShader, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
      xlen: {
        type: 'f',
        value: 50.0,
      },
      ylen: {
        type: 'f',
        value: 50.0,
      },
      radius: {
        type: 'f',
        value: 50.0,
      },
      docircle: {
        type: 'f',
        value: 0.0,
      },
    });
  }
}


// add render view to DOM
document.body.appendChild(renderer.view);

var playpen = new PIXI.Graphics();
playpen.width = size.x;
playpen.height = size.y;
playpen.interactive = true;
// playpen.hitArea = new PIXI.Rectangle(0, 0, playpen.width, playpen.height);

var circle = new CircleMesh;
playpen.filters = [circle];

playpen.beginFill(0xffffffff);
playpen.drawRect(0, 0, size.x, size.y);
playpen.endFill();

var DOCIRC = false;

window.onkeydown = function (e) {
  if (e.keyCode == 16) {
    DOCIRC = true;
  }
  update();
};

function update () {
  circle.uniforms.docircle.value = DOCIRC ? 1.0 : 0.0;
  requestAnimationFrame(function () {
    renderer.render(playpen); 
  });
}

window.onkeyup = function (e) {
  if (e.keyCode == 16) {
    DOCIRC = false;
  }
  update();
};

playpen.mousedown = playpen.touchstart = function (item){
  var coords = item.data.getLocalPosition(playpen);
  update();
};

playpen.mousemove = playpen.touchstart = function (item){
  var coords = item.data.getLocalPosition(playpen);
  circle.uniforms.radius.value = Math.sqrt(Math.pow(coords.x - size.x/2, 2) + Math.pow(coords.y - size.y/2, 2));
  circle.uniforms.xlen.value = Math.floor(Math.abs(coords.x - (size.x / 2)));
  circle.uniforms.ylen.value = Math.floor(Math.abs(coords.y - (size.y / 2)));
  update();
};

renderer.render(playpen);
