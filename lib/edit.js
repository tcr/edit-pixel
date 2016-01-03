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

	var _filters = __webpack_require__(2);

	var _util = __webpack_require__(3);

	var _tinycolor = __webpack_require__(4);

	var _tinycolor2 = _interopRequireDefault(_tinycolor);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var size = { x: 50, y: 50 };
	var frameSize = { x: 300, y: 300 };

	// create a renderer instance
	var renderer = _shapes2.default.renderer;
	renderer.backgroundColor = 0xaaaaaa;
	$('#panel-graphics').append(renderer.view);

	var state;
	if (localStorage.state) {
	  try {
	    state = JSON.parse(localStorage.state);
	  } catch (e) {}
	}
	if (!state) {
	  state = {
	    brushSize: 0,
	    alias: false,
	    rotation: 0,
	    brushPainting: false,
	    brushColor: '#000000',
	    zoom: 4.0,
	    gridVisible: false,
	    cursorX: 0,
	    cursorY: 0,
	    image: null
	  };
	}

	console.log('Initial state:', state);

	function saveGraphic() {
	  _shapes2.default.sprite.visible = false;
	  render();
	  state.image = bgcache.getBase64();
	  _shapes2.default.sprite.visible = true;
	  render();
	}

	function alterState(mod) {
	  for (var k in mod) {
	    if (!state.hasOwnProperty(k)) {
	      throw new Error('Key "' + k + '" missing');
	    }
	    state[k] = mod[k];
	  }
	  localStorage.state = JSON.stringify(state);
	}

	var background = new PIXI.Graphics();
	background.beginFill(0xffffff);
	background.drawRect(0, 0, size.x, size.y);

	var container = new PIXI.Container();

	if (state.image) {
	  try {
	    var tex = PIXI.Texture.fromImage(state.image);
	    tex.on('update', function () {
	      start();
	    });
	    background = new PIXI.Sprite(tex);
	  } catch (e) {
	    console.error(e.stack);
	    state.image = null;
	  }
	}
	if (!state.image) {
	  setTimeout(start);
	}
	container.addChild(background);

	var bgcache = new PIXI.RenderTexture(renderer, size.x, size.y, PIXI.SCALE_MODES.NEAREST);
	bgcache.render(container);

	var bgcacheSprite = new PIXI.Sprite(bgcache);
	bgcacheSprite.interactive = true;

	var gridGraphics = new PIXI.Graphics();
	gridGraphics.beginFill(0xFFFF00);
	gridGraphics.drawRect(0, 0, size.x, size.y);
	gridGraphics.visible = false;

	var grid = new _filters.GridFilter();
	grid.uniforms.radius.value = 1.0;
	gridGraphics.filters = [grid];

	var realContainer = new PIXI.Container();
	realContainer.addChild(bgcacheSprite);
	realContainer.scale.x = 1.0;
	realContainer.scale.y = 1.0;
	realContainer.position.x = frameSize.x / 2 + -size.x / 2;
	realContainer.position.y = frameSize.y / 2 + -size.y / 2;

	var lastCoords = null;

	function setZoom(value) {
	  alterState({ zoom: value });
	  realContainer.scale.x = value;
	  realContainer.scale.y = value;
	  realContainer.position.x = frameSize.x / 2 + -(size.x * value / 2);
	  realContainer.position.y = frameSize.y / 2 + -(size.y * value / 2);
	  grid.uniforms.radius.value = value;
	  gridGraphics.visible = value >= 4.0;
	  $('#toolconf-zoom').val(value);
	  $('#toolconf-zoom-readout').text(value);
	  // $('toolconf-brush-grid').prop('enabled', value >= 4.0);
	  render();
	}

	function resize() {
	  setZoom(state.zoom);
	}

	function setBrushSize(value) {
	  alterState({ brushSize: value });
	  $('#toolconf-brush-size').val(value);
	  $('#toolconf-brush-size-readout').text(value);
	  render();
	}

	function render() {
	  // if (state.brushPainting) {
	  _shapes2.default.update(state.alias, state.brushSize, state.rotation, state.brushColor);
	  _shapes2.default.sprite.x = state.cursorX - _shapes2.default.sprite.width / 2;
	  _shapes2.default.sprite.y = state.cursorY - _shapes2.default.sprite.height / 2;
	  // }
	  bgcache.render(container);
	  renderer.render(realContainer);
	}

	function setBrushRotation(rotate) {
	  alterState({ rotation: rotate });
	}

	function updateShape(coords) {
	  alterState({ cursorX: coords.x - .5 });
	  alterState({ cursorY: coords.y - .5 });
	  if (state.brushPainting) {
	    // RADIUS_STATE = Math.sqrt(Math.pow(coords.x - CIRC_CENTER.x, 2) + Math.pow(coords.y - CIRC_CENTER.y, 2));
	    setBrushRotation(Math.atan2(coords.y - size.y / 2, coords.x - size.x / 2));
	  }
	}

	function addShape() {
	  container.addChild(_shapes2.default.sprite);
	}

	function commitShape() {
	  container.removeChild(_shapes2.default.sprite);
	  container.removeChild(background);

	  try {
	    background.destroy(true, true);
	  } catch (e) {}

	  background = new PIXI.Sprite(PIXI.Texture.fromCanvas(bgcache.getCanvas()));
	  container.addChild(background);

	  // When re-displaying
	  container.addChild(_shapes2.default.sprite);
	}

	function brush(coords) {
	  addShape();
	  updateShape(coords);
	  render();
	  commitShape();
	}

	function getCoords(from, item) {
	  //TODO why is this so gross
	  var coords = item.data.getLocalPosition(from);
	  // coords.x -= .4;
	  // coords.y -= .4;
	  return coords;
	}

	/**
	 * Event handlers
	 */

	$('#toolconf-zoom').on('change mousedown mouseup mousemove', function () {
	  var checkbox = this;
	  setTimeout(function () {
	    var value = $(checkbox).val();
	    setZoom(value);
	  }, 0);
	});

	$('#toolconf-brush-size').on('change mousedown mouseup mousemove', function () {
	  var checkbox = this;
	  setTimeout(function () {
	    var value = $(checkbox).val();
	    setBrushSize(value);
	  }, 0);
	});

	function setGrid(value) {
	  alterState({ gridVisible: value });
	  if (value) {
	    realContainer.addChild(gridGraphics);
	  } else {
	    realContainer.removeChild(gridGraphics);
	  }
	  $('#toolconf-brush-grid').prop('checked', value);
	}

	function setAlias(value) {
	  alterState({ alias: value });
	  $('#toolconf-brush-alias').prop('checked', value);
	}

	function setBrushColor(color) {
	  alterState({ brushColor: color });
	}

	function triggerResize() {
	  requestAnimationFrame(function () {
	    frameSize = {
	      x: $(renderer.view).parent().width(),
	      y: $(renderer.view).parent().height()
	    };
	    renderer.resize(frameSize.x, frameSize.y);
	    console.log(frameSize.x, frameSize.y);
	    resize();
	  });
	}

	function attachListeners() {
	  $('#toolconf-brush-grid').on('change', function () {
	    if ($(this).prop('checked')) {
	      setGrid(true);
	      render();
	    } else {
	      setGrid(false);
	      render();
	    }
	  });

	  $('#toolconf-brush-alias').on('change', function () {
	    if ($(this).prop('checked')) {
	      setAlias(true);
	    } else {
	      setAlias(false);
	    }
	  });

	  $('#panel-graphics').on('mousewheel', function (event) {
	    if (event.deltaY > 0) {
	      if (event.altKey) {
	        setBrushSize(Math.min(Math.max(state.brushSize - 1, 1), 10));
	      } else {
	        setZoom(Math.min(state.zoom + 1, 10));
	      }
	    } else if (event.deltaY < 0) {
	      if (event.altKey) {
	        setBrushSize(Math.min(Math.max(state.brushSize + 1, 1), 10));
	      } else {
	        setZoom(Math.max(state.zoom - 1, 1));
	      }
	    }
	  });

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

	  bgcacheSprite.mousedown = function (item) {
	    alterState({ brushPainting: true });

	    var coords = getCoords(bgcacheSprite, item);

	    // addShape(coords);
	    // updateShape(coords);

	    brush(coords);
	    lastCoords = coords;

	    render();
	  };

	  window.onmouseup = function (item) {
	    alterState({ brushPainting: false });
	    // commitShape();
	    lastCoords = null;
	    // render();
	    saveGraphic();
	  };

	  bgcacheSprite.mousemove = function (item) {
	    var coords = getCoords(bgcacheSprite, item);

	    if (item.data.originalEvent.shiftKey && lastCoords) {
	      coords.y = lastCoords.y;
	    }

	    updateShape(coords);

	    if (lastCoords) {
	      var points = (0, _util.calculateLine)(lastCoords, coords);
	      lastCoords = coords;
	      points.forEach(function (p) {
	        brush(p);
	      });
	    }

	    render();
	  };

	  $(window).on('resize', triggerResize);
	}

	/**
	 * Start
	 */

	function start() {
	  state.brushPainting = false;
	  setGrid(state.gridVisible);
	  setAlias(state.alias);
	  setZoom(state.zoom);
	  setBrushSize(state.brushSize);
	  addShape();
	  triggerResize();
	  attachListeners();
	}

	function colorPicker(filter) {
	  var OHNO = new PIXI.WebGLRenderer(32, 256);
	  $(OHNO.view).width(32).height(256);
	  var graphics = new PIXI.Graphics();
	  graphics.beginFill(0xFFFF00);
	  graphics.drawRect(0, 0, 32, 256);
	  graphics.filters = [filter];
	  graphics.interactive = true;

	  var container = new PIXI.Container();
	  container.addChild(graphics);

	  var marker = new PIXI.Graphics();
	  marker.beginFill(0x000000);
	  marker.drawRect(0, -3, 16, 6);
	  container.addChild(marker);
	  marker.x = 0;

	  function render() {
	    OHNO.render(container);
	  };

	  return {
	    view: OHNO.view,
	    render: render,
	    filter: filter,
	    target: graphics,
	    height: 256,
	    marker: marker
	  };
	}

	;(function () {
	  var h = colorPicker(new _filters.HFilter());
	  var s = colorPicker(new _filters.SFilter());
	  var b = colorPicker(new _filters.BFilter());

	  function getVal(c, event) {
	    return getCoords(c.target, event).y / c.height;
	  }

	  var hval = 1.0;
	  var sval = 1.0;
	  var bval = 1.0;

	  function updateColor() {
	    s.filter.uniforms.h.value = hval;
	    s.filter.uniforms.b.value = bval;
	    b.filter.uniforms.h.value = hval;
	    b.filter.uniforms.s.value = sval;

	    h.marker.y = hval * h.height;
	    s.marker.y = sval * s.height;
	    b.marker.y = bval * b.height;

	    var color = _tinycolor2.default.fromRatio({ h: hval, s: sval, v: bval }).toRgb();
	    // console.log(hval, sval, bval);
	    var brushColor = '#' + ('000000' + ((color.r << 16) + (color.g << 8) + color.b).toString(16)).slice(-6);
	    alterState({ brushColor: brushColor });

	    $('#ohno').css('backgroundColor', brushColor);

	    h.render();
	    s.render();
	    b.render();
	  }

	  $(h.view).on('mousewheel', function (event) {
	    var measure = 2 / 255;
	    event.preventDefault();
	    if (event.deltaY > 0) {
	      hval = Math.min(hval + measure, 1.0);
	    } else if (event.deltaY < 0) {
	      hval = Math.max(hval - measure, 0.0);
	    }
	    updateColor();
	  });

	  $(s.view).on('mousewheel', function (event) {
	    var measure = 2 / 255;
	    event.preventDefault();
	    if (event.deltaY > 0) {
	      sval = Math.min(sval + measure, 1.0);
	    } else if (event.deltaY < 0) {
	      sval = Math.max(sval - measure, 0.0);
	    }
	    updateColor();
	  });

	  $(b.view).on('mousewheel', function (event) {
	    var measure = 2 / 255;
	    event.preventDefault();
	    if (event.deltaY > 0) {
	      bval = Math.min(bval + measure, 1.0);
	    } else if (event.deltaY < 0) {
	      bval = Math.max(bval - measure, 0.0);
	    }
	    updateColor();
	  });

	  h.target.mouseup = function (event) {
	    hval = getVal(h, event);
	    updateColor();
	  };

	  s.target.mouseup = function (event) {
	    sval = getVal(s, event);
	    updateColor();
	  };

	  b.target.mouseup = function (event) {
	    bval = getVal(b, event);
	    updateColor();
	  };

	  $('#ohno').append(h.view).append(s.view).append(b.view);

	  updateColor();
	})();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _filters = __webpack_require__(2);

	var bgrenderer = new PIXI.WebGLRenderer(600, 600);

	var lastTexture = new PIXI.RenderTexture(bgrenderer, 100, 100, PIXI.SCALE_MODES.NEAREST);
	var out = new PIXI.Sprite(lastTexture);

	var CAN_graphics = new PIXI.Graphics();

	var CAN_sprite = new PIXI.Container();
	CAN_sprite.addChild(CAN_graphics);

	var outline = new _filters.OutlineFilter();

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

	function drawCanvasCircle(alias, radius, rot, stroke, thickness, dofill) {
	  radius -= 1;
	  if (alias) {
	    radius = Math.max(Math.floor(radius) + .3, .3);
	  } else {
	    radius = Math.max(radius, .5);
	  }

	  var len = Math.floor(radius * 2) + 10;

	  CAN_graphics.clear();
	  if (alias && !dofill) {
	    CAN_graphics.beginFill(0xffffff, 1.0);
	    CAN_graphics.drawRect(0, 0, len, len);
	    CAN_graphics.endFill();
	    CAN_graphics.beginFill(0x000000);
	  } else {
	    CAN_graphics.beginFill(0x000000, 0.0);
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
	  var dofill = true;
	  var len = drawCanvasCircle(alias, radius, rot, stroke, 1, dofill);

	  if (alias && !dofill) {
	    outline.setColor(parseInt(stroke.substr(1).substr(0, 2), 16) / 255.0, parseInt(stroke.substr(1).substr(2, 2), 16) / 255.0, parseInt(stroke.substr(1).substr(4, 2), 16) / 255.0, 1.0);
	    CAN_sprite.filters = [outline];
	  } else {
	    CAN_sprite.filters = null;
	  }

	  CAN_graphics.x = 100 / 2 - len / 2;
	  CAN_graphics.y = 100 / 2 - len / 2;

	  if (alias) {
	    lastTexture.clear();
	    lastTexture.render(CAN_sprite);
	    out.texture = lastTexture;
	  } else {
	    out.texture = CAN_graphics.generateTexture();
	  }
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

	// Outline filter

	var OutlineFilter = exports.OutlineFilter = (function (_PIXI$AbstractFilter) {
	  _inherits(OutlineFilter, _PIXI$AbstractFilter);

	  function OutlineFilter() {
	    _classCallCheck(this, OutlineFilter);

	    var vertexShader = null;
	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec4 dimensions;\nuniform vec4 newcolor;\n\n#define THRESH 32.0\n#define linewidth 1.0\n\n#define downsample(X) step(THRESH/255.0, X)\n#define is_black(X) (X.rgb == vec3(0.0) && X.a == 1.0)\n#define is_white(X) (!is_black(X))\n\nvoid main(void) {\n  vec4 cur = downsample(texture2D(texture, vTextureCoord));\n  vec4 up = downsample(texture2D(texture, vTextureCoord + vec2(0.0, -linewidth)/dimensions.xy));\n  vec4 down = downsample(texture2D(texture, vTextureCoord + vec2(0.0, linewidth)/dimensions.xy));\n  vec4 left = downsample(texture2D(texture, vTextureCoord + vec2(-linewidth, 0.0)/dimensions.xy));\n  vec4 right = downsample(texture2D(texture, vTextureCoord + vec2(linewidth, 0.0)/dimensions.xy));\n\n  // vec4 ul = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, -linewidthless)/dimensions.xy));\n  // vec4 dl = downsample(texture2D(texture, vTextureCoord + vec2(-linewidthless, +linewidthless)/dimensions.xy));\n  // vec4 ur = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, -linewidthless)/dimensions.xy));\n  // vec4 dr = downsample(texture2D(texture, vTextureCoord + vec2(+linewidthless, +linewidthless)/dimensions.xy));\n\n  if (is_black(cur) && (is_white(up) || is_white(down) || is_white(left) || is_white(right))) { //} || is_white(ul) || is_white(dl) || is_white(ur) || is_white(dr))) {\n    gl_FragColor = newcolor;\n  } else {\n    gl_FragColor = vec4(0.0);\n  }\n}\n\n    ';

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(OutlineFilter).call(this, vertexShader, fragmentShader, {
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

	  _createClass(OutlineFilter, [{
	    key: 'setColor',
	    value: function setColor(r, g, b, a) {
	      this.uniforms.newcolor.value = new Float32Array([r, g, b, a]);
	    }
	  }]);

	  return OutlineFilter;
	})(PIXI.AbstractFilter);

	// Grid filter

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

	// HSB filter

	var HFilter = exports.HFilter = (function (_PIXI$AbstractFilter3) {
	  _inherits(HFilter, _PIXI$AbstractFilter3);

	  function HFilter() {
	    _classCallCheck(this, HFilter);

	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform vec4 dimensions;\n\n// http://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness\n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nfloat roundto (float v, float by) {\n  return floor(by*v)/by;\n}\n\nvoid main(void) {\n  gl_FragColor = vec4(hsv2rgb(vec3(roundto(vTextureCoord.y, 16.0), 1.0, 1.0)), 1.0);\n}\n\n    ';

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(HFilter).call(this, null, fragmentShader, {
	      dimensions: {
	        type: '4fv',
	        value: new Float32Array([0, 0, 0, 0])
	      }
	    }));
	  }

	  return HFilter;
	})(PIXI.AbstractFilter);

	var SFilter = exports.SFilter = (function (_PIXI$AbstractFilter4) {
	  _inherits(SFilter, _PIXI$AbstractFilter4);

	  function SFilter() {
	    _classCallCheck(this, SFilter);

	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform vec4 dimensions;\nuniform float h;\nuniform float b;\n\n// http://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness\n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec4 roundto (vec4 v, float by) {\n  return floor(by*v)/by;\n}\n\nvoid main(void) {\n  // gl_FragColor = vec4(hsv2rgb(vec3(h, roundto(vTextureCoord.y, 16.0), b)), 1.0);\n  gl_FragColor = vec4(hsv2rgb(vec3(h, vTextureCoord.y, 0.5 + (vTextureCoord.y*.5))), 1.0);\n  // gl_FragColor = roundto(gl_FragColor, 16.0);\n}\n\n    ';

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(SFilter).call(this, null, fragmentShader, {
	      dimensions: {
	        type: '4fv',
	        value: new Float32Array([0, 0, 0, 0])
	      },
	      h: {
	        type: 'f',
	        value: 0.0
	      },
	      b: {
	        type: 'f',
	        value: 1.0
	      }
	    }));
	  }

	  return SFilter;
	})(PIXI.AbstractFilter);

	var BFilter = exports.BFilter = (function (_PIXI$AbstractFilter5) {
	  _inherits(BFilter, _PIXI$AbstractFilter5);

	  function BFilter() {
	    _classCallCheck(this, BFilter);

	    var fragmentShader = '\n\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform vec4 dimensions;\nuniform float h;\nuniform float s;\n\n// http://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness\n\nvec3 rgb2hsv(vec3 c) {\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    float e = 1.0e-10;\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nfloat roundto (float v, float by) {\n  return floor(by*v)/by;\n}\n\nvoid main(void) {\n  gl_FragColor = vec4(hsv2rgb(vec3(h, s, roundto(vTextureCoord.y, 16.0))), 1.0);\n}\n\n    ';

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(BFilter).call(this, null, fragmentShader, {
	      dimensions: {
	        type: '4fv',
	        value: new Float32Array([0, 0, 0, 0])
	      },
	      h: {
	        type: 'f',
	        value: 0.0
	      },
	      s: {
	        type: 'f',
	        value: 1.0
	      }
	    }));
	  }

	  return BFilter;
	})(PIXI.AbstractFilter);

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.calculateLine = calculateLine;
	function calculateLine(A, B) {
	  var x0 = A.x;
	  var x1 = B.x;
	  var y0 = A.y;
	  var y1 = B.y;

	  var ret = [];

	  var dx = Math.abs(x1 - x0);
	  var dy = Math.abs(y1 - y0);
	  var sx = x0 < x1 ? 1 : -1;
	  var sy = y0 < y1 ? 1 : -1;
	  var err = dx - dy;

	  while (true) {
	    ret.push({ x: x0, y: y0 });

	    if ((sx > 0 ? x0 >= x1 - 1 : x0 <= x1 + 1) && (sy > 0 ? y0 >= y1 - 1 : y0 <= y1 + 1)) {
	      break;
	    }
	    var e2 = 2 * err;
	    if (e2 > -dy) {
	      err -= dy;
	      x0 += sx;
	    }
	    if (e2 < dx) {
	      err += dx;
	      y0 += sy;
	    }
	  }

	  return ret;
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;"use strict";

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	// TinyColor v1.3.0
	// https://github.com/bgrins/TinyColor
	// Brian Grinstead, MIT License

	(function () {

	    var trimLeft = /^\s+/,
	        trimRight = /\s+$/,
	        tinyCounter = 0,
	        math = Math,
	        mathRound = math.round,
	        mathMin = math.min,
	        mathMax = math.max,
	        mathRandom = math.random;

	    function tinycolor(color, opts) {

	        color = color ? color : '';
	        opts = opts || {};

	        // If input is already a tinycolor, return itself
	        if (color instanceof tinycolor) {
	            return color;
	        }
	        // If we are called as a function, call using new instead
	        if (!(this instanceof tinycolor)) {
	            return new tinycolor(color, opts);
	        }

	        var rgb = inputToRGB(color);
	        this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = mathRound(100 * this._a) / 100, this._format = opts.format || rgb.format;
	        this._gradientType = opts.gradientType;

	        // Don't let the range of [0,255] come back in [0,1].
	        // Potentially lose a little bit of precision here, but will fix issues where
	        // .5 gets interpreted as half of the total, instead of half of 1
	        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
	        if (this._r < 1) {
	            this._r = mathRound(this._r);
	        }
	        if (this._g < 1) {
	            this._g = mathRound(this._g);
	        }
	        if (this._b < 1) {
	            this._b = mathRound(this._b);
	        }

	        this._ok = rgb.ok;
	        this._tc_id = tinyCounter++;
	    }

	    tinycolor.prototype = {
	        isDark: function isDark() {
	            return this.getBrightness() < 128;
	        },
	        isLight: function isLight() {
	            return !this.isDark();
	        },
	        isValid: function isValid() {
	            return this._ok;
	        },
	        getOriginalInput: function getOriginalInput() {
	            return this._originalInput;
	        },
	        getFormat: function getFormat() {
	            return this._format;
	        },
	        getAlpha: function getAlpha() {
	            return this._a;
	        },
	        getBrightness: function getBrightness() {
	            //http://www.w3.org/TR/AERT#color-contrast
	            var rgb = this.toRgb();
	            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
	        },
	        getLuminance: function getLuminance() {
	            //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	            var rgb = this.toRgb();
	            var RsRGB, GsRGB, BsRGB, R, G, B;
	            RsRGB = rgb.r / 255;
	            GsRGB = rgb.g / 255;
	            BsRGB = rgb.b / 255;

	            if (RsRGB <= 0.03928) {
	                R = RsRGB / 12.92;
	            } else {
	                R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
	            }
	            if (GsRGB <= 0.03928) {
	                G = GsRGB / 12.92;
	            } else {
	                G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
	            }
	            if (BsRGB <= 0.03928) {
	                B = BsRGB / 12.92;
	            } else {
	                B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
	            }
	            return 0.2126 * R + 0.7152 * G + 0.0722 * B;
	        },
	        setAlpha: function setAlpha(value) {
	            this._a = boundAlpha(value);
	            this._roundA = mathRound(100 * this._a) / 100;
	            return this;
	        },
	        toHsv: function toHsv() {
	            var hsv = rgbToHsv(this._r, this._g, this._b);
	            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
	        },
	        toHsvString: function toHsvString() {
	            var hsv = rgbToHsv(this._r, this._g, this._b);
	            var h = mathRound(hsv.h * 360),
	                s = mathRound(hsv.s * 100),
	                v = mathRound(hsv.v * 100);
	            return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
	        },
	        toHsl: function toHsl() {
	            var hsl = rgbToHsl(this._r, this._g, this._b);
	            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
	        },
	        toHslString: function toHslString() {
	            var hsl = rgbToHsl(this._r, this._g, this._b);
	            var h = mathRound(hsl.h * 360),
	                s = mathRound(hsl.s * 100),
	                l = mathRound(hsl.l * 100);
	            return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
	        },
	        toHex: function toHex(allow3Char) {
	            return rgbToHex(this._r, this._g, this._b, allow3Char);
	        },
	        toHexString: function toHexString(allow3Char) {
	            return '#' + this.toHex(allow3Char);
	        },
	        toHex8: function toHex8() {
	            return rgbaToHex(this._r, this._g, this._b, this._a);
	        },
	        toHex8String: function toHex8String() {
	            return '#' + this.toHex8();
	        },
	        toRgb: function toRgb() {
	            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
	        },
	        toRgbString: function toRgbString() {
	            return this._a == 1 ? "rgb(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" : "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
	        },
	        toPercentageRgb: function toPercentageRgb() {
	            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
	        },
	        toPercentageRgbString: function toPercentageRgbString() {
	            return this._a == 1 ? "rgb(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" : "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
	        },
	        toName: function toName() {
	            if (this._a === 0) {
	                return "transparent";
	            }

	            if (this._a < 1) {
	                return false;
	            }

	            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
	        },
	        toFilter: function toFilter(secondColor) {
	            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
	            var secondHex8String = hex8String;
	            var gradientType = this._gradientType ? "GradientType = 1, " : "";

	            if (secondColor) {
	                var s = tinycolor(secondColor);
	                secondHex8String = s.toHex8String();
	            }

	            return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
	        },
	        toString: function toString(format) {
	            var formatSet = !!format;
	            format = format || this._format;

	            var formattedString = false;
	            var hasAlpha = this._a < 1 && this._a >= 0;
	            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

	            if (needsAlphaFormat) {
	                // Special case for "transparent", all other non-alpha formats
	                // will return rgba when there is transparency.
	                if (format === "name" && this._a === 0) {
	                    return this.toName();
	                }
	                return this.toRgbString();
	            }
	            if (format === "rgb") {
	                formattedString = this.toRgbString();
	            }
	            if (format === "prgb") {
	                formattedString = this.toPercentageRgbString();
	            }
	            if (format === "hex" || format === "hex6") {
	                formattedString = this.toHexString();
	            }
	            if (format === "hex3") {
	                formattedString = this.toHexString(true);
	            }
	            if (format === "hex8") {
	                formattedString = this.toHex8String();
	            }
	            if (format === "name") {
	                formattedString = this.toName();
	            }
	            if (format === "hsl") {
	                formattedString = this.toHslString();
	            }
	            if (format === "hsv") {
	                formattedString = this.toHsvString();
	            }

	            return formattedString || this.toHexString();
	        },
	        clone: function clone() {
	            return tinycolor(this.toString());
	        },

	        _applyModification: function _applyModification(fn, args) {
	            var color = fn.apply(null, [this].concat([].slice.call(args)));
	            this._r = color._r;
	            this._g = color._g;
	            this._b = color._b;
	            this.setAlpha(color._a);
	            return this;
	        },
	        lighten: function lighten() {
	            return this._applyModification(_lighten, arguments);
	        },
	        brighten: function brighten() {
	            return this._applyModification(_brighten, arguments);
	        },
	        darken: function darken() {
	            return this._applyModification(_darken, arguments);
	        },
	        desaturate: function desaturate() {
	            return this._applyModification(_desaturate, arguments);
	        },
	        saturate: function saturate() {
	            return this._applyModification(_saturate, arguments);
	        },
	        greyscale: function greyscale() {
	            return this._applyModification(_greyscale, arguments);
	        },
	        spin: function spin() {
	            return this._applyModification(_spin, arguments);
	        },

	        _applyCombination: function _applyCombination(fn, args) {
	            return fn.apply(null, [this].concat([].slice.call(args)));
	        },
	        analogous: function analogous() {
	            return this._applyCombination(_analogous, arguments);
	        },
	        complement: function complement() {
	            return this._applyCombination(_complement, arguments);
	        },
	        monochromatic: function monochromatic() {
	            return this._applyCombination(_monochromatic, arguments);
	        },
	        splitcomplement: function splitcomplement() {
	            return this._applyCombination(_splitcomplement, arguments);
	        },
	        triad: function triad() {
	            return this._applyCombination(_triad, arguments);
	        },
	        tetrad: function tetrad() {
	            return this._applyCombination(_tetrad, arguments);
	        }
	    };

	    // If input is an object, force 1 into "1.0" to handle ratios properly
	    // String input requires "1.0" as input, so 1 will be treated as 1
	    tinycolor.fromRatio = function (color, opts) {
	        if ((typeof color === "undefined" ? "undefined" : _typeof(color)) == "object") {
	            var newColor = {};
	            for (var i in color) {
	                if (color.hasOwnProperty(i)) {
	                    if (i === "a") {
	                        newColor[i] = color[i];
	                    } else {
	                        newColor[i] = convertToPercentage(color[i]);
	                    }
	                }
	            }
	            color = newColor;
	        }

	        return tinycolor(color, opts);
	    };

	    // Given a string or object, convert that input to RGB
	    // Possible string inputs:
	    //
	    //     "red"
	    //     "#f00" or "f00"
	    //     "#ff0000" or "ff0000"
	    //     "#ff000000" or "ff000000"
	    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
	    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
	    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
	    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
	    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
	    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
	    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
	    //
	    function inputToRGB(color) {

	        var rgb = { r: 0, g: 0, b: 0 };
	        var a = 1;
	        var ok = false;
	        var format = false;

	        if (typeof color == "string") {
	            color = stringInputToObject(color);
	        }

	        if ((typeof color === "undefined" ? "undefined" : _typeof(color)) == "object") {
	            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
	                rgb = rgbToRgb(color.r, color.g, color.b);
	                ok = true;
	                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
	            } else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
	                color.s = convertToPercentage(color.s);
	                color.v = convertToPercentage(color.v);
	                rgb = hsvToRgb(color.h, color.s, color.v);
	                ok = true;
	                format = "hsv";
	            } else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
	                color.s = convertToPercentage(color.s);
	                color.l = convertToPercentage(color.l);
	                rgb = hslToRgb(color.h, color.s, color.l);
	                ok = true;
	                format = "hsl";
	            }

	            if (color.hasOwnProperty("a")) {
	                a = color.a;
	            }
	        }

	        a = boundAlpha(a);

	        return {
	            ok: ok,
	            format: color.format || format,
	            r: mathMin(255, mathMax(rgb.r, 0)),
	            g: mathMin(255, mathMax(rgb.g, 0)),
	            b: mathMin(255, mathMax(rgb.b, 0)),
	            a: a
	        };
	    }

	    // Conversion Functions
	    // --------------------

	    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
	    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

	    // `rgbToRgb`
	    // Handle bounds / percentage checking to conform to CSS color spec
	    // <http://www.w3.org/TR/css3-color/>
	    // *Assumes:* r, g, b in [0, 255] or [0, 1]
	    // *Returns:* { r, g, b } in [0, 255]
	    function rgbToRgb(r, g, b) {
	        return {
	            r: bound01(r, 255) * 255,
	            g: bound01(g, 255) * 255,
	            b: bound01(b, 255) * 255
	        };
	    }

	    // `rgbToHsl`
	    // Converts an RGB color value to HSL.
	    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
	    // *Returns:* { h, s, l } in [0,1]
	    function rgbToHsl(r, g, b) {

	        r = bound01(r, 255);
	        g = bound01(g, 255);
	        b = bound01(b, 255);

	        var max = mathMax(r, g, b),
	            min = mathMin(r, g, b);
	        var h,
	            s,
	            l = (max + min) / 2;

	        if (max == min) {
	            h = s = 0; // achromatic
	        } else {
	                var d = max - min;
	                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	                switch (max) {
	                    case r:
	                        h = (g - b) / d + (g < b ? 6 : 0);break;
	                    case g:
	                        h = (b - r) / d + 2;break;
	                    case b:
	                        h = (r - g) / d + 4;break;
	                }

	                h /= 6;
	            }

	        return { h: h, s: s, l: l };
	    }

	    // `hslToRgb`
	    // Converts an HSL color value to RGB.
	    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
	    // *Returns:* { r, g, b } in the set [0, 255]
	    function hslToRgb(h, s, l) {
	        var r, g, b;

	        h = bound01(h, 360);
	        s = bound01(s, 100);
	        l = bound01(l, 100);

	        function hue2rgb(p, q, t) {
	            if (t < 0) t += 1;
	            if (t > 1) t -= 1;
	            if (t < 1 / 6) return p + (q - p) * 6 * t;
	            if (t < 1 / 2) return q;
	            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	            return p;
	        }

	        if (s === 0) {
	            r = g = b = l; // achromatic
	        } else {
	                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	                var p = 2 * l - q;
	                r = hue2rgb(p, q, h + 1 / 3);
	                g = hue2rgb(p, q, h);
	                b = hue2rgb(p, q, h - 1 / 3);
	            }

	        return { r: r * 255, g: g * 255, b: b * 255 };
	    }

	    // `rgbToHsv`
	    // Converts an RGB color value to HSV
	    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
	    // *Returns:* { h, s, v } in [0,1]
	    function rgbToHsv(r, g, b) {

	        r = bound01(r, 255);
	        g = bound01(g, 255);
	        b = bound01(b, 255);

	        var max = mathMax(r, g, b),
	            min = mathMin(r, g, b);
	        var h,
	            s,
	            v = max;

	        var d = max - min;
	        s = max === 0 ? 0 : d / max;

	        if (max == min) {
	            h = 0; // achromatic
	        } else {
	                switch (max) {
	                    case r:
	                        h = (g - b) / d + (g < b ? 6 : 0);break;
	                    case g:
	                        h = (b - r) / d + 2;break;
	                    case b:
	                        h = (r - g) / d + 4;break;
	                }
	                h /= 6;
	            }
	        return { h: h, s: s, v: v };
	    }

	    // `hsvToRgb`
	    // Converts an HSV color value to RGB.
	    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
	    // *Returns:* { r, g, b } in the set [0, 255]
	    function hsvToRgb(h, s, v) {

	        h = bound01(h, 360) * 6;
	        s = bound01(s, 100);
	        v = bound01(v, 100);

	        var i = math.floor(h),
	            f = h - i,
	            p = v * (1 - s),
	            q = v * (1 - f * s),
	            t = v * (1 - (1 - f) * s),
	            mod = i % 6,
	            r = [v, q, p, p, t, v][mod],
	            g = [t, v, v, q, p, p][mod],
	            b = [p, p, t, v, v, q][mod];

	        return { r: r * 255, g: g * 255, b: b * 255 };
	    }

	    // `rgbToHex`
	    // Converts an RGB color to hex
	    // Assumes r, g, and b are contained in the set [0, 255]
	    // Returns a 3 or 6 character hex
	    function rgbToHex(r, g, b, allow3Char) {

	        var hex = [pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

	        // Return a 3 character hex if possible
	        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
	            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
	        }

	        return hex.join("");
	    }

	    // `rgbaToHex`
	    // Converts an RGBA color plus alpha transparency to hex
	    // Assumes r, g, b and a are contained in the set [0, 255]
	    // Returns an 8 character hex
	    function rgbaToHex(r, g, b, a) {

	        var hex = [pad2(convertDecimalToHex(a)), pad2(mathRound(r).toString(16)), pad2(mathRound(g).toString(16)), pad2(mathRound(b).toString(16))];

	        return hex.join("");
	    }

	    // `equals`
	    // Can be called with any tinycolor input
	    tinycolor.equals = function (color1, color2) {
	        if (!color1 || !color2) {
	            return false;
	        }
	        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
	    };

	    tinycolor.random = function () {
	        return tinycolor.fromRatio({
	            r: mathRandom(),
	            g: mathRandom(),
	            b: mathRandom()
	        });
	    };

	    // Modification Functions
	    // ----------------------
	    // Thanks to less.js for some of the basics here
	    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

	    function _desaturate(color, amount) {
	        amount = amount === 0 ? 0 : amount || 10;
	        var hsl = tinycolor(color).toHsl();
	        hsl.s -= amount / 100;
	        hsl.s = clamp01(hsl.s);
	        return tinycolor(hsl);
	    }

	    function _saturate(color, amount) {
	        amount = amount === 0 ? 0 : amount || 10;
	        var hsl = tinycolor(color).toHsl();
	        hsl.s += amount / 100;
	        hsl.s = clamp01(hsl.s);
	        return tinycolor(hsl);
	    }

	    function _greyscale(color) {
	        return tinycolor(color).desaturate(100);
	    }

	    function _lighten(color, amount) {
	        amount = amount === 0 ? 0 : amount || 10;
	        var hsl = tinycolor(color).toHsl();
	        hsl.l += amount / 100;
	        hsl.l = clamp01(hsl.l);
	        return tinycolor(hsl);
	    }

	    function _brighten(color, amount) {
	        amount = amount === 0 ? 0 : amount || 10;
	        var rgb = tinycolor(color).toRgb();
	        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * -(amount / 100))));
	        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * -(amount / 100))));
	        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * -(amount / 100))));
	        return tinycolor(rgb);
	    }

	    function _darken(color, amount) {
	        amount = amount === 0 ? 0 : amount || 10;
	        var hsl = tinycolor(color).toHsl();
	        hsl.l -= amount / 100;
	        hsl.l = clamp01(hsl.l);
	        return tinycolor(hsl);
	    }

	    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
	    // Values outside of this range will be wrapped into this range.
	    function _spin(color, amount) {
	        var hsl = tinycolor(color).toHsl();
	        var hue = (mathRound(hsl.h) + amount) % 360;
	        hsl.h = hue < 0 ? 360 + hue : hue;
	        return tinycolor(hsl);
	    }

	    // Combination Functions
	    // ---------------------
	    // Thanks to jQuery xColor for some of the ideas behind these
	    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

	    function _complement(color) {
	        var hsl = tinycolor(color).toHsl();
	        hsl.h = (hsl.h + 180) % 360;
	        return tinycolor(hsl);
	    }

	    function _triad(color) {
	        var hsl = tinycolor(color).toHsl();
	        var h = hsl.h;
	        return [tinycolor(color), tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })];
	    }

	    function _tetrad(color) {
	        var hsl = tinycolor(color).toHsl();
	        var h = hsl.h;
	        return [tinycolor(color), tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })];
	    }

	    function _splitcomplement(color) {
	        var hsl = tinycolor(color).toHsl();
	        var h = hsl.h;
	        return [tinycolor(color), tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }), tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l })];
	    }

	    function _analogous(color, results, slices) {
	        results = results || 6;
	        slices = slices || 30;

	        var hsl = tinycolor(color).toHsl();
	        var part = 360 / slices;
	        var ret = [tinycolor(color)];

	        for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results;) {
	            hsl.h = (hsl.h + part) % 360;
	            ret.push(tinycolor(hsl));
	        }
	        return ret;
	    }

	    function _monochromatic(color, results) {
	        results = results || 6;
	        var hsv = tinycolor(color).toHsv();
	        var h = hsv.h,
	            s = hsv.s,
	            v = hsv.v;
	        var ret = [];
	        var modification = 1 / results;

	        while (results--) {
	            ret.push(tinycolor({ h: h, s: s, v: v }));
	            v = (v + modification) % 1;
	        }

	        return ret;
	    }

	    // Utility Functions
	    // ---------------------

	    tinycolor.mix = function (color1, color2, amount) {
	        amount = amount === 0 ? 0 : amount || 50;

	        var rgb1 = tinycolor(color1).toRgb();
	        var rgb2 = tinycolor(color2).toRgb();

	        var p = amount / 100;
	        var w = p * 2 - 1;
	        var a = rgb2.a - rgb1.a;

	        var w1;

	        if (w * a == -1) {
	            w1 = w;
	        } else {
	            w1 = (w + a) / (1 + w * a);
	        }

	        w1 = (w1 + 1) / 2;

	        var w2 = 1 - w1;

	        var rgba = {
	            r: rgb2.r * w1 + rgb1.r * w2,
	            g: rgb2.g * w1 + rgb1.g * w2,
	            b: rgb2.b * w1 + rgb1.b * w2,
	            a: rgb2.a * p + rgb1.a * (1 - p)
	        };

	        return tinycolor(rgba);
	    };

	    // Readability Functions
	    // ---------------------
	    // <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

	    // `contrast`
	    // Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
	    tinycolor.readability = function (color1, color2) {
	        var c1 = tinycolor(color1);
	        var c2 = tinycolor(color2);
	        return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
	    };

	    // `isReadable`
	    // Ensure that foreground and background color combinations meet WCAG2 guidelines.
	    // The third argument is an optional Object.
	    //      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
	    //      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
	    // If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

	    // *Example*
	    //    tinycolor.isReadable("#000", "#111") => false
	    //    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
	    tinycolor.isReadable = function (color1, color2, wcag2) {
	        var readability = tinycolor.readability(color1, color2);
	        var wcag2Parms, out;

	        out = false;

	        wcag2Parms = validateWCAG2Parms(wcag2);
	        switch (wcag2Parms.level + wcag2Parms.size) {
	            case "AAsmall":
	            case "AAAlarge":
	                out = readability >= 4.5;
	                break;
	            case "AAlarge":
	                out = readability >= 3;
	                break;
	            case "AAAsmall":
	                out = readability >= 7;
	                break;
	        }
	        return out;
	    };

	    // `mostReadable`
	    // Given a base color and a list of possible foreground or background
	    // colors for that base, returns the most readable color.
	    // Optionally returns Black or White if the most readable color is unreadable.
	    // *Example*
	    //    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
	    //    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
	    //    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
	    //    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
	    tinycolor.mostReadable = function (baseColor, colorList, args) {
	        var bestColor = null;
	        var bestScore = 0;
	        var readability;
	        var includeFallbackColors, level, size;
	        args = args || {};
	        includeFallbackColors = args.includeFallbackColors;
	        level = args.level;
	        size = args.size;

	        for (var i = 0; i < colorList.length; i++) {
	            readability = tinycolor.readability(baseColor, colorList[i]);
	            if (readability > bestScore) {
	                bestScore = readability;
	                bestColor = tinycolor(colorList[i]);
	            }
	        }

	        if (tinycolor.isReadable(baseColor, bestColor, { "level": level, "size": size }) || !includeFallbackColors) {
	            return bestColor;
	        } else {
	            args.includeFallbackColors = false;
	            return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
	        }
	    };

	    // Big List of Colors
	    // ------------------
	    // <http://www.w3.org/TR/css3-color/#svg-color>
	    var names = tinycolor.names = {
	        aliceblue: "f0f8ff",
	        antiquewhite: "faebd7",
	        aqua: "0ff",
	        aquamarine: "7fffd4",
	        azure: "f0ffff",
	        beige: "f5f5dc",
	        bisque: "ffe4c4",
	        black: "000",
	        blanchedalmond: "ffebcd",
	        blue: "00f",
	        blueviolet: "8a2be2",
	        brown: "a52a2a",
	        burlywood: "deb887",
	        burntsienna: "ea7e5d",
	        cadetblue: "5f9ea0",
	        chartreuse: "7fff00",
	        chocolate: "d2691e",
	        coral: "ff7f50",
	        cornflowerblue: "6495ed",
	        cornsilk: "fff8dc",
	        crimson: "dc143c",
	        cyan: "0ff",
	        darkblue: "00008b",
	        darkcyan: "008b8b",
	        darkgoldenrod: "b8860b",
	        darkgray: "a9a9a9",
	        darkgreen: "006400",
	        darkgrey: "a9a9a9",
	        darkkhaki: "bdb76b",
	        darkmagenta: "8b008b",
	        darkolivegreen: "556b2f",
	        darkorange: "ff8c00",
	        darkorchid: "9932cc",
	        darkred: "8b0000",
	        darksalmon: "e9967a",
	        darkseagreen: "8fbc8f",
	        darkslateblue: "483d8b",
	        darkslategray: "2f4f4f",
	        darkslategrey: "2f4f4f",
	        darkturquoise: "00ced1",
	        darkviolet: "9400d3",
	        deeppink: "ff1493",
	        deepskyblue: "00bfff",
	        dimgray: "696969",
	        dimgrey: "696969",
	        dodgerblue: "1e90ff",
	        firebrick: "b22222",
	        floralwhite: "fffaf0",
	        forestgreen: "228b22",
	        fuchsia: "f0f",
	        gainsboro: "dcdcdc",
	        ghostwhite: "f8f8ff",
	        gold: "ffd700",
	        goldenrod: "daa520",
	        gray: "808080",
	        green: "008000",
	        greenyellow: "adff2f",
	        grey: "808080",
	        honeydew: "f0fff0",
	        hotpink: "ff69b4",
	        indianred: "cd5c5c",
	        indigo: "4b0082",
	        ivory: "fffff0",
	        khaki: "f0e68c",
	        lavender: "e6e6fa",
	        lavenderblush: "fff0f5",
	        lawngreen: "7cfc00",
	        lemonchiffon: "fffacd",
	        lightblue: "add8e6",
	        lightcoral: "f08080",
	        lightcyan: "e0ffff",
	        lightgoldenrodyellow: "fafad2",
	        lightgray: "d3d3d3",
	        lightgreen: "90ee90",
	        lightgrey: "d3d3d3",
	        lightpink: "ffb6c1",
	        lightsalmon: "ffa07a",
	        lightseagreen: "20b2aa",
	        lightskyblue: "87cefa",
	        lightslategray: "789",
	        lightslategrey: "789",
	        lightsteelblue: "b0c4de",
	        lightyellow: "ffffe0",
	        lime: "0f0",
	        limegreen: "32cd32",
	        linen: "faf0e6",
	        magenta: "f0f",
	        maroon: "800000",
	        mediumaquamarine: "66cdaa",
	        mediumblue: "0000cd",
	        mediumorchid: "ba55d3",
	        mediumpurple: "9370db",
	        mediumseagreen: "3cb371",
	        mediumslateblue: "7b68ee",
	        mediumspringgreen: "00fa9a",
	        mediumturquoise: "48d1cc",
	        mediumvioletred: "c71585",
	        midnightblue: "191970",
	        mintcream: "f5fffa",
	        mistyrose: "ffe4e1",
	        moccasin: "ffe4b5",
	        navajowhite: "ffdead",
	        navy: "000080",
	        oldlace: "fdf5e6",
	        olive: "808000",
	        olivedrab: "6b8e23",
	        orange: "ffa500",
	        orangered: "ff4500",
	        orchid: "da70d6",
	        palegoldenrod: "eee8aa",
	        palegreen: "98fb98",
	        paleturquoise: "afeeee",
	        palevioletred: "db7093",
	        papayawhip: "ffefd5",
	        peachpuff: "ffdab9",
	        peru: "cd853f",
	        pink: "ffc0cb",
	        plum: "dda0dd",
	        powderblue: "b0e0e6",
	        purple: "800080",
	        rebeccapurple: "663399",
	        red: "f00",
	        rosybrown: "bc8f8f",
	        royalblue: "4169e1",
	        saddlebrown: "8b4513",
	        salmon: "fa8072",
	        sandybrown: "f4a460",
	        seagreen: "2e8b57",
	        seashell: "fff5ee",
	        sienna: "a0522d",
	        silver: "c0c0c0",
	        skyblue: "87ceeb",
	        slateblue: "6a5acd",
	        slategray: "708090",
	        slategrey: "708090",
	        snow: "fffafa",
	        springgreen: "00ff7f",
	        steelblue: "4682b4",
	        tan: "d2b48c",
	        teal: "008080",
	        thistle: "d8bfd8",
	        tomato: "ff6347",
	        turquoise: "40e0d0",
	        violet: "ee82ee",
	        wheat: "f5deb3",
	        white: "fff",
	        whitesmoke: "f5f5f5",
	        yellow: "ff0",
	        yellowgreen: "9acd32"
	    };

	    // Make it easy to access colors via `hexNames[hex]`
	    var hexNames = tinycolor.hexNames = flip(names);

	    // Utilities
	    // ---------

	    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
	    function flip(o) {
	        var flipped = {};
	        for (var i in o) {
	            if (o.hasOwnProperty(i)) {
	                flipped[o[i]] = i;
	            }
	        }
	        return flipped;
	    }

	    // Return a valid alpha value [0,1] with all invalid values being set to 1
	    function boundAlpha(a) {
	        a = parseFloat(a);

	        if (isNaN(a) || a < 0 || a > 1) {
	            a = 1;
	        }

	        return a;
	    }

	    // Take input from [0, n] and return it as [0, 1]
	    function bound01(n, max) {
	        if (isOnePointZero(n)) {
	            n = "100%";
	        }

	        var processPercent = isPercentage(n);
	        n = mathMin(max, mathMax(0, parseFloat(n)));

	        // Automatically convert percentage into number
	        if (processPercent) {
	            n = parseInt(n * max, 10) / 100;
	        }

	        // Handle floating point rounding errors
	        if (math.abs(n - max) < 0.000001) {
	            return 1;
	        }

	        // Convert into [0, 1] range if it isn't already
	        return n % max / parseFloat(max);
	    }

	    // Force a number between 0 and 1
	    function clamp01(val) {
	        return mathMin(1, mathMax(0, val));
	    }

	    // Parse a base-16 hex value into a base-10 integer
	    function parseIntFromHex(val) {
	        return parseInt(val, 16);
	    }

	    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
	    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
	    function isOnePointZero(n) {
	        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
	    }

	    // Check to see if string passed in is a percentage
	    function isPercentage(n) {
	        return typeof n === "string" && n.indexOf('%') != -1;
	    }

	    // Force a hex value to have 2 characters
	    function pad2(c) {
	        return c.length == 1 ? '0' + c : '' + c;
	    }

	    // Replace a decimal with it's percentage value
	    function convertToPercentage(n) {
	        if (n <= 1) {
	            n = n * 100 + "%";
	        }

	        return n;
	    }

	    // Converts a decimal to a hex value
	    function convertDecimalToHex(d) {
	        return Math.round(parseFloat(d) * 255).toString(16);
	    }
	    // Converts a hex value to a decimal
	    function convertHexToDecimal(h) {
	        return parseIntFromHex(h) / 255;
	    }

	    var matchers = (function () {

	        // <http://www.w3.org/TR/css3-values/#integers>
	        var CSS_INTEGER = "[-\\+]?\\d+%?";

	        // <http://www.w3.org/TR/css3-values/#number-value>
	        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

	        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
	        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

	        // Actual matching.
	        // Parentheses and commas are optional, but not required.
	        // Whitespace can take the place of commas or opening paren
	        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
	        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

	        return {
	            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
	            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
	            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
	            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
	            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
	            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
	            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
	            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
	        };
	    })();

	    // `stringInputToObject`
	    // Permissive string parsing.  Take in a number of formats, and output an object
	    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
	    function stringInputToObject(color) {

	        color = color.replace(trimLeft, '').replace(trimRight, '').toLowerCase();
	        var named = false;
	        if (names[color]) {
	            color = names[color];
	            named = true;
	        } else if (color == 'transparent') {
	            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
	        }

	        // Try to match string input using regular expressions.
	        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
	        // Just return an object and let the conversion functions handle that.
	        // This way the result will be the same whether the tinycolor is initialized with string or object.
	        var match;
	        if (match = matchers.rgb.exec(color)) {
	            return { r: match[1], g: match[2], b: match[3] };
	        }
	        if (match = matchers.rgba.exec(color)) {
	            return { r: match[1], g: match[2], b: match[3], a: match[4] };
	        }
	        if (match = matchers.hsl.exec(color)) {
	            return { h: match[1], s: match[2], l: match[3] };
	        }
	        if (match = matchers.hsla.exec(color)) {
	            return { h: match[1], s: match[2], l: match[3], a: match[4] };
	        }
	        if (match = matchers.hsv.exec(color)) {
	            return { h: match[1], s: match[2], v: match[3] };
	        }
	        if (match = matchers.hsva.exec(color)) {
	            return { h: match[1], s: match[2], v: match[3], a: match[4] };
	        }
	        if (match = matchers.hex8.exec(color)) {
	            return {
	                a: convertHexToDecimal(match[1]),
	                r: parseIntFromHex(match[2]),
	                g: parseIntFromHex(match[3]),
	                b: parseIntFromHex(match[4]),
	                format: named ? "name" : "hex8"
	            };
	        }
	        if (match = matchers.hex6.exec(color)) {
	            return {
	                r: parseIntFromHex(match[1]),
	                g: parseIntFromHex(match[2]),
	                b: parseIntFromHex(match[3]),
	                format: named ? "name" : "hex"
	            };
	        }
	        if (match = matchers.hex3.exec(color)) {
	            return {
	                r: parseIntFromHex(match[1] + '' + match[1]),
	                g: parseIntFromHex(match[2] + '' + match[2]),
	                b: parseIntFromHex(match[3] + '' + match[3]),
	                format: named ? "name" : "hex"
	            };
	        }

	        return false;
	    }

	    function validateWCAG2Parms(parms) {
	        // return valid WCAG2 parms for isReadable.
	        // If input parms are invalid, return {"level":"AA", "size":"small"}
	        var level, size;
	        parms = parms || { "level": "AA", "size": "small" };
	        level = (parms.level || "AA").toUpperCase();
	        size = (parms.size || "small").toLowerCase();
	        if (level !== "AA" && level !== "AAA") {
	            level = "AA";
	        }
	        if (size !== "small" && size !== "large") {
	            size = "small";
	        }
	        return { "level": level, "size": size };
	    }

	    // Node: Export function
	    if (typeof module !== "undefined" && module.exports) {
	        module.exports = tinycolor;
	    }
	    // AMD/requirejs: Define the module
	    else if (true) {
	            !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	                return tinycolor;
	            }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        }
	        // Browser: Expose to window
	        else {
	                window.tinycolor = tinycolor;
	            }
	})();

/***/ }
/******/ ]);