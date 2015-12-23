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
uniform sampler2D uSampler;

/**
 * Draw a circle at vec2 pos with radius rad and
 * color color.
 */

void main(void) {
  vec2 pos = vTextureCoord*dimensions.xy;
  vec2 center = dimensions.xy*0.5;
  vec3 color = vec3(1.0, 1.0, 0);
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
}

    `;

    super(vertexShader, fragmentShader, {
      dimensions: {
          type: '4fv',
          value: new Float32Array([0, 0, 0, 0])
        },
        radius: {
          type: 'f',
          value: 50.0,
        }
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

playpen.mousedown = playpen.touchstart = function (item){
  var coords = item.data.getLocalPosition(playpen);
  renderer.render(playpen); 
};

playpen.mousemove = playpen.touchstart = function (item){
  var coords = item.data.getLocalPosition(playpen);
  circle.uniforms.radius.value = Math.sqrt(Math.pow(coords.x - size.x/2, 2) + Math.pow(coords.y - size.y/2, 2))
  renderer.render(playpen); 
};

renderer.render(playpen);
