'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OutlineMesh = (function (_PIXI$AbstractFilter) {
  _inherits(OutlineMesh, _PIXI$AbstractFilter);

  function OutlineMesh() {
    _classCallCheck(this, OutlineMesh);

    var vertexShader = null;
    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec4 dimensions;\n\n/**\n * Draw a circle at vec2 pos with radius rad and\n * color color.\n */\n\n#define THRESH 32.0\n#define downsample(X) step(THRESH/255.0, X)\n#define is_white(X) (X.a == 0.0)\n#define is_black(X) (X.a == 1.0)\n\n#define linewidth 1.0\n// #define linewidthless (linewidth-1.0)\n\nvoid main(void) {\n  vec4 cur = downsample(texture2D(texture, vTextureCoord));\n  vec4 up = downsample(texture2D(texture, vTextureCoord + vec2(0.0, -linewidth)/dimensions.xy));\n  vec4 down = downsample(texture2D(texture, vTextureCoord + vec2(0.0, linewidth)/dimensions.xy));\n  vec4 left = downsample(texture2D(texture, vTextureCoord + vec2(-linewidth, 0.0)/dimensions.xy));\n  vec4 right = downsample(texture2D(texture, vTextureCoord + vec2(linewidth, 0.0)/dimensions.xy));\n\n  // vec4 ul = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, -linewidthless)/dimensions.xy));\n  // vec4 dl = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, +linewidthless)/dimensions.xy));\n  // vec4 ur = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, -linewidthless)/dimensions.xy));\n  // vec4 dr = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, +linewidthless)/dimensions.xy));\n\n  if (is_black(cur) && (is_white(up) || is_white(down) || is_white(left) || is_white(right))) { //} || is_white(ul) || is_white(dl) || is_white(ur) || is_white(dr))) {\n    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n  } else {\n    gl_FragColor = vec4(0.0);\n  }\n  // gl_FragColor = cur;\n}\n\n    ';

    return _possibleConstructorReturn(this, Object.getPrototypeOf(OutlineMesh).call(this, vertexShader, fragmentShader, {
      dimensions: {
        type: '4fv',
        value: new Float32Array([0, 0, 0, 0])
      }
    }));
  }

  return OutlineMesh;
})(PIXI.AbstractFilter);

var CAN_graphics = new PIXI.CanvasRenderer(1, 1, {
  transparent: true
});
var CAN_texture = PIXI.Texture.fromCanvas(CAN_graphics.view, PIXI.SCALE_MODES.NEAREST);
var CAN_sprite = new PIXI.Sprite(CAN_texture);

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  var rot = Math.PI / 2 * 3;
  var x = cx;
  var y = cy;
  var step = Math.PI / spikes;

  // ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (var i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.stroke();
}

function drawCanvasCircle(alias, radius, thickness) {
  var fudge = 10;

  var len = Math.floor(radius) * 2 + fudge;

  if (alias) {
    radius = Math.floor(radius);
    if (radius == 4) {
      radius = 4.2;
    }
    if (radius == 6) {
      radius = 5.9;
    }
    if (radius == 10) {
      radius = 10.1;
    }
  }

  CAN_graphics.resize(len, len);

  var ctx = CAN_graphics.view.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;

  ctx.translate(0.5, 0.5);

  ctx.clearRect(0, 0, len, len);

  ctx.beginPath();
  var cx = Math.floor(len / 2);
  var cy = Math.floor(len / 2);

  ctx.translate(Math.floor(len / 2), Math.floor(len / 2));
  // ctx.rotate(ROT_BY);
  ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
  // drawStar(ctx, 0, 0, 5, radius, radius / 2);

  if (alias) {
    ctx.fillStyle = 'black';
    ctx.fill();
  } else {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  // ctx.beginPath();
  // ctx.strokeStyle = 'green';
  // ctx.rect(Math.floor(len / 2) - 2, Math.floor(len / 2) - 2, 4, 4);
  // ctx.stroke();

  // document.body.appendChild(CAN_graphics.view);
  // CAN_graphics.view.style.width = '100px';
  // CAN_graphics.view.style.height = '100px';

  return len;
}

var thickness = 2;

// create a renderer instance
var renderer = new PIXI.WebGLRenderer(100, 100, {
  transparent: true
});
document.body.insertBefore(renderer.view, document.body.firstChild);

renderer.view.style.height = '400px';
renderer.view.style.width = '400px';

var bgrenderer = new PIXI.WebGLRenderer(1, 1, {
  transparent: true
});

var lastTexture = PIXI.Texture.fromCanvas(bgrenderer.view, PIXI.SCALE_MODES.NEAREST);
console.log('hi');
var out = new PIXI.Sprite(lastTexture);
console.log('oh');

function circleSprite(alias, radius, fill) {
  // radius = 6;
  var CAN_len = drawCanvasCircle(alias, radius, 1);

  // sprite.anchor = new PIXI.Point(-can.width / 2, -can.height / 2);
  // console.log(Math.floor((100 / 2) - (can.width / 2)))
  // console.log(Math.floor((100 / 2) - (can.height / 2)))
  // sprite.x = 20;
  // sprite.y = 10;
  // sprite.anchor = new PIXI.Point(50,50);
  // console.log(sprite.anchor);

  if (alias) {
    CAN_sprite.filters = [new OutlineMesh()];
  } else {
    CAN_sprite.filters = null;
  }

  CAN_texture.update();

  bgrenderer.resize(CAN_len, CAN_len);
  bgrenderer.render(CAN_sprite);
  lastTexture.update();

  out.height = CAN_len;
  out.width = CAN_len;
  out.x = Math.floor(100 / 2 - CAN_len / 2);
  out.y = Math.floor(100 / 2 - CAN_len / 2);
  return out;
}

// var text = new PIXI.Text("OH please render me!");
// renderer.render(text)

var RADIUS_STATE = window.location.search && parseFloat(window.location.search.substr(1)) || 8;
var ALIAS_STATE = false;
var ROT_BY = 0;

var background = new PIXI.Graphics();
background.beginFill(0xccffff);
background.drawRect(0, 0, 100, 100);

var centerdot = new PIXI.Graphics();
centerdot.beginFill(0xff0000);
centerdot.drawRect(100 / 2 - 1, 100 / 2 - 1, 3, 3);

var container = new PIXI.Container();
container.addChild(background);
container.addChild(centerdot);
container.addChild(circleSprite(ALIAS_STATE, RADIUS_STATE));

function render() {
  // DRAW DAT CENTER DOT
  circleSprite(ALIAS_STATE, RADIUS_STATE);
  renderer.render(container);
}

render();

window.onkeydown = function (e) {
  if (e.keyCode == 65) {
    e.preventDefault();
    ALIAS_STATE = true;
  }
  render();
};

window.onkeyup = function (e) {
  if (e.keyCode == 65) {
    e.preventDefault();
    ALIAS_STATE = false;
  }
  render();
};

background.interactive = true;
background.mousemove = function (item) {
  var coords = item.data.getLocalPosition(background);
  var size = { x: 100, y: 100 };
  RADIUS_STATE = Math.sqrt(Math.pow(coords.x - size.x / 2, 2) + Math.pow(coords.y - size.y / 2, 2));
  ROT_BY = Math.atan2(coords.y - size.y / 2, coords.x - size.x / 2);
  render();
};