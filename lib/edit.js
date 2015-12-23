'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var size = { x: 300, y: 100 };

// Create a pixi renderer
var renderer = PIXI.autoDetectRenderer(size.x, size.y);
renderer.view.className = "rendererView";

var CircleMesh = (function (_PIXI$AbstractFilter) {
  _inherits(CircleMesh, _PIXI$AbstractFilter);

  function CircleMesh() {
    _classCallCheck(this, CircleMesh);

    var vertexShader = null;
    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 dimensions;\nuniform float radius;\nuniform sampler2D uSampler;\n\n/**\n * Draw a circle at vec2 pos with radius rad and\n * color color.\n */\n\nvoid main(void) {\n  vec2 pos = vTextureCoord*dimensions.xy;\n  vec2 center = dimensions.xy*0.5;\n  vec3 color = vec3(1.0, 1.0, 0);\n  float d = clamp(length(pos - center) - radius, 0.0, 2.0);\n  \n  // Antialias\n  /*\n  if (d > 0.0 && d < 1.0)\n    gl_FragColor = vec4(color*d, 1.0);\n  else if (d >= 1.0 && d < 2.0)\n    gl_FragColor = vec4(color*(2.0-d), 1.0);\n  */\n\n  // Alias\n  if (d > 0.0 && d <= 1.0)\n    gl_FragColor = vec4(color, 1.0);\n  else\n    gl_FragColor = vec4(0.0);\n}\n\n    ';

    return _possibleConstructorReturn(this, Object.getPrototypeOf(CircleMesh).call(this, vertexShader, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      },
      radius: {
        type: 'f',
        value: 50.0
      }
    }));
  }

  return CircleMesh;
})(PIXI.AbstractFilter);

// add render view to DOM

document.body.appendChild(renderer.view);

var playpen = new PIXI.Graphics();
playpen.width = size.x;
playpen.height = size.y;
playpen.interactive = true;
// playpen.hitArea = new PIXI.Rectangle(0, 0, playpen.width, playpen.height);

var circle = new CircleMesh();
playpen.filters = [circle];

playpen.beginFill(0xffffffff);
playpen.drawRect(0, 0, size.x, size.y);
playpen.endFill();

playpen.mousedown = playpen.touchstart = function (item) {
  var coords = item.data.getLocalPosition(playpen);
  renderer.render(playpen);
};

playpen.mousemove = playpen.touchstart = function (item) {
  var coords = item.data.getLocalPosition(playpen);
  circle.uniforms.radius.value = Math.sqrt(Math.pow(coords.x - size.x / 2, 2) + Math.pow(coords.y - size.y / 2, 2));
  renderer.render(playpen);
};

renderer.render(playpen);