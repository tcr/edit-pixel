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

	// create a renderer instance
	var renderer = new PIXI.WebGLRenderer(600, 600, {
	  transparent: true
	});
	document.body.insertBefore(renderer.view, document.body.firstChild);

	renderer.view.style.height = '600px';
	renderer.view.style.width = '600px';

	var RADIUS_STATE = 8;
	var ALIAS_STATE = false;
	var ROT_BY = 0;

	var CIRC_DRAW = false;

	// var bg = new PIXI.CanvasRenderer(100, 100, {
	//   transparent: true,
	// });

	var background = new PIXI.Graphics();
	background.beginFill(0xccffff);
	background.drawRect(0, 0, 100, 100);

	var bgcache = new PIXI.RenderTexture(renderer, 100, 100, PIXI.SCALE_MODES.NEAREST);
	bgcache.render(background);

	var bgsprite = new PIXI.Sprite(bgcache);

	var centerdot = new PIXI.Graphics();
	centerdot.beginFill(0xff0000);
	centerdot.drawRect(100 / 2 - 1, 100 / 2 - 1, 3, 3);

	var container = new PIXI.Container();
	container.scale.x = 6.0;
	container.scale.y = 6.0;
	container.addChild(bgsprite);
	// container.addChild(centerdot);

	var gridGraphics = new PIXI.Graphics();
	gridGraphics.beginFill(0xFFFF00);
	gridGraphics.drawRect(0, 0, 600, 600);

	var grid = new _meshes.GridFilter();
	grid.uniforms.radius.value = 6.0;
	gridGraphics.filters = [grid];

	var realContainer = new PIXI.Container();
	realContainer.addChild(container);
	realContainer.addChild(gridGraphics);

	function render() {
	  // DRAW DAT CENTER DOT
	  if (CIRC_DRAW) {
	    _shapes2.default.update(ALIAS_STATE, Math.max(RADIUS_STATE, 1), ROT_BY);
	  }
	  renderer.render(realContainer);
	}

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

	bgsprite.interactive = true;

	function mouseRedraw(item) {
	  if (CIRC_DRAW) {
	    var coords = item.data.getLocalPosition(bgsprite);
	    var size = { x: 100, y: 100 };
	    RADIUS_STATE = Math.sqrt(Math.pow(coords.x - _shapes2.default.sprite.x, 2) + Math.pow(coords.y - _shapes2.default.sprite.y, 2));
	    ROT_BY = Math.atan2(coords.y - size.y / 2, coords.x - size.x / 2);
	  }
	}

	bgsprite.mousedown = function (item) {
	  CIRC_DRAW = true;
	  container.addChild(_shapes2.default.sprite);
	  var coords = item.data.getLocalPosition(bgsprite);
	  _shapes2.default.sprite.x = coords.x;
	  _shapes2.default.sprite.y = coords.y;
	  mouseRedraw(item);
	  render();
	};

	window.onmouseup = function () {
	  CIRC_DRAW = false;
	  container.removeChild(_shapes2.default.sprite);

	  var temptex = PIXI.Texture.fromCanvas(bgcache.getCanvas());
	  var c = new PIXI.Container();
	  c.addChild(new PIXI.Sprite(temptex));
	  c.addChild(_shapes2.default.sprite);
	  bgcache.render(c);

	  temptex.destroy();

	  render();
	};

	bgsprite.mousemove = function (item) {
	  mouseRedraw(item);
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

	var CAN_graphics = new PIXI.CanvasRenderer(1, 1, {
	  transparent: true
	});
	var CAN_texture = PIXI.Texture.fromCanvas(CAN_graphics.view, PIXI.SCALE_MODES.NEAREST);
	var CAN_sprite = new PIXI.Sprite(CAN_texture);

	var bgrenderer = new PIXI.WebGLRenderer(1, 1, {
	  transparent: true
	});

	var lastTexture = PIXI.Texture.fromCanvas(bgrenderer.view, PIXI.SCALE_MODES.NEAREST);
	var out = new PIXI.Sprite(lastTexture);

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

	function drawCanvasCircle(alias, radius, rot, thickness) {
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
	  // ctx.rotate(rot);
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

	function circleSprite(alias, radius, rot, fill) {
	  // radius = 6;
	  var CAN_len = drawCanvasCircle(alias, radius, rot, 1);

	  // sprite.anchor = new PIXI.Point(-can.width / 2, -can.height / 2);
	  // console.log(Math.floor((100 / 2) - (can.width / 2)))
	  // console.log(Math.floor((100 / 2) - (can.height / 2)))
	  // sprite.x = 20;
	  // sprite.y = 10;
	  // sprite.anchor = new PIXI.Point(50,50);
	  // console.log(sprite.anchor);

	  if (alias) {
	    CAN_sprite.filters = [new _meshes.OutlineMesh()];
	  } else {
	    CAN_sprite.filters = null;
	  }

	  CAN_texture.update();

	  bgrenderer.resize(CAN_len, CAN_len);
	  bgrenderer.render(CAN_sprite);
	  lastTexture.update();

	  out.height = CAN_len;
	  out.width = CAN_len;
	  out.anchor.x = 0.5;
	  out.anchor.y = 0.5;
	}

	exports.default = {
	  sprite: out,
	  update: circleSprite
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

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

	var GridFilter = exports.GridFilter = (function (_PIXI$AbstractFilter2) {
	  _inherits(GridFilter, _PIXI$AbstractFilter2);

	  function GridFilter() {
	    _classCallCheck(this, GridFilter);

	    var vertexShader = null;
	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec4 dimensions;\nuniform float radius;\n\nvoid main(void) {\n  vec2 trueCoords = (vTextureCoord * dimensions.xy) + vec2(1.0, 1.0);\n  vec4 cur = texture2D(texture, vTextureCoord);\n  if (step(1.0, mod(trueCoords.x, radius)) == 0.0 || step(1.0, mod(trueCoords.y, radius)) == 0.0) {\n    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);\n  } else {\n    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n  }\n}\n\n    ';

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