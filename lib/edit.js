/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _shapes = __webpack_require__(1);

	var _shapes2 = _interopRequireDefault(_shapes);

	var _meshes = __webpack_require__(2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var size = { x: 50, y: 50 };

	// create a renderer instance
	var renderer = _shapes2.default.renderer;
	renderer.backgroundColor = 0xaaaaaa;
	$('#panel-graphics').append(renderer.view);

	renderer.view.style.height = '600px';
	renderer.view.style.width = '600px';

	var RADIUS_STATE = 8;
	var ALIAS_STATE = false;
	var ROT_BY = 0;
	var CIRC_DRAW = false;
	var CIRC_CENTER = { x: 0, y: 0 };
	var CIRC_COLOR = '#000000';
	var ZOOM_VALUE = 4.0;

	// var bg = new PIXI.CanvasRenderer(100, 100, {
	//   transparent: true,
	// });

	var background = new PIXI.Graphics();
	background.beginFill(0xffffff);
	background.drawRect(0, 0, size.x, size.y);

	// var bgsprite = new PIXI.Sprite(background);
	// var centerdot = new PIXI.Graphics();
	// centerdot.beginFill(0xff0000);
	// centerdot.drawRect(100/2 - 1, 100/2 - 1, 3, 3);

	var container = new PIXI.Container();
	container.addChild(background);

	var bgcache = new PIXI.RenderTexture(renderer, size.x, size.y, PIXI.SCALE_MODES.NEAREST);
	bgcache.render(container);

	var bgcacheSprite = new PIXI.Sprite(bgcache);

	var gridGraphics = new PIXI.Graphics();
	gridGraphics.beginFill(0xFFFF00);
	gridGraphics.drawRect(0, 0, size.x, size.y);
	gridGraphics.visible = false;

	var grid = new _meshes.GridFilter();
	grid.uniforms.radius.value = 1.0;
	gridGraphics.filters = [grid];

	var realContainer = new PIXI.Container();
	realContainer.addChild(bgcacheSprite);
	realContainer.scale.x = 1.0;
	realContainer.scale.y = 1.0;
	// realContainer.anchor.x = 0.5;
	// realContainer.anchor.y = 0.5;
	realContainer.position.x = 300 + -50;
	realContainer.position.y = 300 + -50;

	function setZoom(value) {
	  ZOOM_VALUE = value;
	  realContainer.scale.x = value;
	  realContainer.scale.y = value;
	  realContainer.position.x = 300 + -(size.x * value / 2);
	  realContainer.position.y = 300 + -(size.y * value / 2);
	  grid.uniforms.radius.value = value;
	  gridGraphics.visible = value >= 4.0;
	  $('#toolconf-zoom').val(value);
	  $('#toolconf-zoom-readout').text(value);
	  // $('toolconf-brush-grid').prop('enabled', value >= 4.0);
	  render();
	}

	setZoom(ZOOM_VALUE);

	$('#toolconf-zoom').on('change mousedown mouseup mousemove', function () {
	  var checkbox = this;
	  setTimeout(function () {
	    var value = $(checkbox).val();
	    setZoom(value);
	  }, 0);
	});

	$('#toolconf-brush-grid').on('change', function () {
	  if ($(this).prop('checked')) {
	    realContainer.addChild(gridGraphics);
	    render();
	  } else {
	    realContainer.removeChild(gridGraphics);
	    render();
	  }
	});

	$('#toolconf-brush-alias').on('change', function () {
	  if ($(this).prop('checked')) {
	    ALIAS_STATE = true;
	  } else {
	    ALIAS_STATE = false;
	  }
	});

	$('#toolconf-color-black').on('click', function () {
	  CIRC_COLOR = '#000000';
	});
	$('#toolconf-color-red').on('click', function () {
	  CIRC_COLOR = '#ff0000';
	});
	$('#toolconf-color-blue').on('click', function () {
	  CIRC_COLOR = '#0000ff';
	});
	$('#toolconf-color-green').on('click', function () {
	  CIRC_COLOR = '#00ff00';
	});
	$('#toolconf-color-yellow').on('click', function () {
	  CIRC_COLOR = '#ffff00';
	});
	$('#toolconf-color-white').on('click', function () {
	  CIRC_COLOR = '#ffffff';
	});

	$('#panel-graphics').on('mousewheel', function (event) {
	  if (event.deltaY > 0) {
	    setZoom(Math.min(ZOOM_VALUE + 1, 10));
	  } else if (event.deltaY < 0) {
	    setZoom(Math.max(ZOOM_VALUE - 1, 1));
	  }
	});

	function render() {
	  if (CIRC_DRAW) {
	    _shapes2.default.update(ALIAS_STATE, Math.max(RADIUS_STATE, 0.15), ROT_BY, CIRC_COLOR);
	    _shapes2.default.sprite.x = CIRC_CENTER.x - _shapes2.default.sprite.width / 2;
	    _shapes2.default.sprite.y = CIRC_CENTER.y - _shapes2.default.sprite.height / 2;
	  }
	  bgcache.render(container);
	  renderer.render(realContainer);
	}

	window.onkeydown = function (e) {
	  if (e.keyCode == 65) {
	    e.preventDefault();
	    $('#toolconf-brush-alias').prop('checked', !$('#toolconf-brush-alias').prop('checked'));
	    $('#toolconf-brush-alias').trigger('change');
	  }
	  if (e.keyCode == 71) {
	    e.preventDefault();
	    $('#toolconf-brush-grid').prop('checked', !$('#toolconf-brush-grid').prop('checked'));
	    $('#toolconf-brush-grid').trigger('change');
	  }
	  render();
	};

	bgcacheSprite.interactive = true;

	function updateShape(coords) {
	  if (CIRC_DRAW) {
	    RADIUS_STATE = Math.sqrt(Math.pow(coords.x - CIRC_CENTER.x, 2) + Math.pow(coords.y - CIRC_CENTER.y, 2));
	    ROT_BY = Math.atan2(coords.y - size.y / 2, coords.x - size.x / 2);
	  }
	}

	function addShape(coords) {
	  container.addChild(_shapes2.default.sprite);
	  CIRC_CENTER.x = coords.x;
	  CIRC_CENTER.y = coords.y;
	}

	function commitShape() {
	  container.removeChild(_shapes2.default.sprite);
	  container.removeChild(background);

	  try {
	    background.destroy(true, true);
	  } catch (e) {}

	  background = new PIXI.Sprite(PIXI.Texture.fromCanvas(bgcache.getCanvas()));
	  container.addChild(background);
	}

	function brush(coords) {
	  addShape(coords);
	  updateShape(coords);
	  render();
	  commitShape();
	}

	var lastCoords = null;

	function getCoords(from, item) {
	  //TODO why is this so gross
	  var coords = item.data.getLocalPosition(from);
	  coords.x -= .2;
	  coords.y -= .2;
	  return coords;
	}

	bgcacheSprite.mousedown = function (item) {
	  CIRC_DRAW = true;

	  var coords = getCoords(bgcacheSprite, item);

	  // addShape(coords);
	  // updateShape(coords);

	  brush(coords);
	  lastCoords = coords;

	  render();
	};

	function line(A, B) {
	  var x0 = Math.floor(A.x);
	  var x1 = Math.floor(B.x);
	  var y0 = Math.floor(A.y);
	  var y1 = Math.floor(B.y);

	  var ret = [];

	  var dx = Math.abs(x1 - x0);
	  var dy = Math.abs(y1 - y0);
	  var sx = x0 < x1 ? 1 : -1;
	  var sy = y0 < y1 ? 1 : -1;
	  var err = dx - dy;

	  while (true) {
	    ret.push({ x: x0, y: y0 }); // Do what you need to for this

	    if (x0 == x1 && y0 == y1) break;
	    var e2 = 2 * err;
	    if (e2 > -dy) {
	      err -= dy;x0 += sx;
	    }
	    if (e2 < dx) {
	      err += dx;y0 += sy;
	    }
	  }
	  return ret;
	}

	window.onmouseup = function (item) {
	  CIRC_DRAW = false;
	  // commitShape();
	  lastCoords = null;
	  render();
	};

	bgcacheSprite.mousemove = function (item) {
	  var coords = getCoords(bgcacheSprite, item);
	  // updateShape(coords);

	  if (lastCoords) {
	    var points = line(lastCoords, coords);
	    lastCoords = coords;
	    points.forEach(function (p) {
	      brush(p);
	    });
	  }

	  render();
	};

	render();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _meshes = __webpack_require__(2);

	var bgrenderer = new PIXI.WebGLRenderer(600, 600);

	var lastTexture = new PIXI.RenderTexture(bgrenderer, 100, 100, PIXI.SCALE_MODES.NEAREST);
	var out = new PIXI.Sprite(lastTexture);

	var CAN_graphics = new PIXI.Graphics();
	// CAN_graphics.cacheAsBitmap = true;

	var CAN_sprite = new PIXI.Container();
	// CAN_sprite.cacheAsBitmap = true;
	CAN_sprite.addChild(CAN_graphics);

	// var CAN_radius = null;
	// var CAN_alias = null;
	// var CAN_stroke = null;

	var outline = new _meshes.OutlineMesh();

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

	function drawCanvasCircle(alias, radius, rot, stroke, thickness) {
	  // radius = 7;
	  if (alias) {
	    radius = Math.max(Math.floor(radius) + .3, 1);
	  } else {
	    radius = Math.max(radius, .5);
	  }

	  var len = Math.floor(radius * 2) + 10;

	  CAN_graphics.clear();
	  if (alias) {
	    CAN_graphics.beginFill(0xffffff, 1.0);
	    CAN_graphics.drawRect(0, 0, len, len);
	    CAN_graphics.endFill();
	    CAN_graphics.beginFill(0x000000);
	  } else {
	    CAN_graphics.beginFill(stroke, 0.0);
	    CAN_graphics.drawRect(0, 0, len, len);
	    CAN_graphics.endFill();
	    CAN_graphics.beginFill(parseInt(stroke.substr(1), 16));
	  }
	  if (alias) {
	    CAN_graphics.drawCircle(len / 2 + .5, len / 2 + .5, radius);
	  } else {
	    CAN_graphics.drawCircle(len / 2 + .75, len / 2, radius);
	  }
	  CAN_graphics.endFill();

	  return len;
	}

	function circleSprite(alias, radius, rot, stroke) {
	  // if (CAN_radius == radius && CAN_alias == alias && CAN_stroke == stroke) {
	  //   return;
	  // }
	  // CAN_radius = radius;
	  // CAN_alias = alias;
	  // CAN_stroke = stroke;

	  // radius = 6;
	  var len = drawCanvasCircle(alias, radius, rot, stroke, 1);

	  // sprite.anchor = new PIXI.Point(-can.width / 2, -can.height / 2);
	  // console.log(Math.floor((100 / 2) - (can.width / 2)))
	  // console.log(Math.floor((100 / 2) - (can.height / 2)))
	  // sprite.x = 20;
	  // sprite.y = 10;
	  // sprite.anchor = new PIXI.Point(50,50);
	  // console.log(sprite.anchor);

	  if (alias) {
	    outline.setColor(parseInt(stroke.substr(1).substr(0, 2), 16) / 255.0, parseInt(stroke.substr(1).substr(2, 2), 16) / 255.0, parseInt(stroke.substr(1).substr(4, 2), 16) / 255.0, 1.0);
	    CAN_sprite.filters = [outline];
	  } else {
	    CAN_sprite.filters = null;
	  }

	  CAN_graphics.x = 100 / 2 - len / 2;
	  CAN_graphics.y = 100 / 2 - len / 2;

	  if (alias) {
	    lastTexture.render(CAN_sprite);
	    out.texture = lastTexture;
	  } else {
	    out.texture = CAN_graphics.generateTexture();
	  }

	  // bgrenderer.resize(len, len);
	  // bgrenderer.render(CAN_sprite);
	  // lastTexture.update();
	}

	exports.default = {
	  sprite: out,
	  update: circleSprite,
	  renderer: bgrenderer
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var OutlineMesh = exports.OutlineMesh = (function (_PIXI$AbstractFilter) {
	  _inherits(OutlineMesh, _PIXI$AbstractFilter);

	  function OutlineMesh() {
	    _classCallCheck(this, OutlineMesh);

	    var vertexShader = null;
	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec4 dimensions;\nuniform vec4 newcolor;\n\n/**\n * Draw a circle at vec2 pos with radius rad and\n * color color.\n */\n\n#define THRESH 32.0\n#define downsample(X) step(THRESH/255.0, X)\n#define is_black(X) (X.rgb == vec3(0.0) && X.a == 1.0)\n#define is_white(X) (!is_black(X))\n\n#define linewidth 1.0\n// #define linewidthless (linewidth-1.0)\n\nvoid main(void) {\n  vec4 cur = downsample(texture2D(texture, vTextureCoord));\n  vec4 up = downsample(texture2D(texture, vTextureCoord + vec2(0.0, -linewidth)/dimensions.xy));\n  vec4 down = downsample(texture2D(texture, vTextureCoord + vec2(0.0, linewidth)/dimensions.xy));\n  vec4 left = downsample(texture2D(texture, vTextureCoord + vec2(-linewidth, 0.0)/dimensions.xy));\n  vec4 right = downsample(texture2D(texture, vTextureCoord + vec2(linewidth, 0.0)/dimensions.xy));\n\n  // vec4 ul = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, -linewidthless)/dimensions.xy));\n  // vec4 dl = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, +linewidthless)/dimensions.xy));\n  // vec4 ur = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, -linewidthless)/dimensions.xy));\n  // vec4 dr = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, +linewidthless)/dimensions.xy));\n\n  if (is_black(cur) && (is_white(up) || is_white(down) || is_white(left) || is_white(right))) { //} || is_white(ul) || is_white(dl) || is_white(ur) || is_white(dr))) {\n    gl_FragColor = newcolor;\n  } else {\n    gl_FragColor = vec4(0.0);\n  }\n}\n\n    ';

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(OutlineMesh).call(this, vertexShader, fragmentShader, {
	      dimensions: {
	        type: '4fv',
	        value: new Float32Array([0, 0, 0, 0])
	      },
	      newcolor: {
	        type: '4fv',
	        value: new Float32Array([0, 0, 0, 0])
	      }
	    }));
	  }

	  _createClass(OutlineMesh, [{
	    key: 'setColor',
	    value: function setColor(r, g, b, a) {
	      this.uniforms.newcolor.value = new Float32Array([r, g, b, a]);
	    }
	  }]);

	  return OutlineMesh;
	})(PIXI.AbstractFilter);

	var GridFilter = exports.GridFilter = (function (_PIXI$AbstractFilter2) {
	  _inherits(GridFilter, _PIXI$AbstractFilter2);

	  function GridFilter() {
	    _classCallCheck(this, GridFilter);

	    var vertexShader = null;
	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec4 dimensions;\nuniform float radius;\n\nvoid main(void) {\n  vec2 trueCoords = (vTextureCoord * dimensions.xy) + vec2(1.0, 1.0);\n  vec4 cur = texture2D(texture, vTextureCoord);\n  if (step(1.0, mod(trueCoords.x, radius)) == 0.0 || step(1.0, mod(trueCoords.y, radius)) == 0.0) {\n    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.25);\n  } else {\n    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n  }\n}\n\n    ';

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(GridFilter).call(this, vertexShader, fragmentShader, {
	      dimensions: {
	        type: '4fv',
	        value: new Float32Array([0, 0, 0, 0])
	      },
	      radius: {
	        type: 'f',
	        value: 1.0
	      }
	    }));
	  }

	  return GridFilter;
	})(PIXI.AbstractFilter);

/***/ }
/******/ ]);