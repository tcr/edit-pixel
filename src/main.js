import shapes from './shapes';
import { GridFilter, HFilter, SFilter, BFilter } from './filters';
import { calculateLine } from './util';

import tinycolor from 'tinycolor2';

var size = {x: 50, y: 50};
var frameSize = {x: 300, y: 300};

// create a renderer instance
var renderer = shapes.renderer;
renderer.backgroundColor = 0xaaaaaa;
$('#panel-graphics').append(renderer.view);


var state;
if (localStorage.state) {
  try {
    state = JSON.parse(localStorage.state);
  } catch (e) { }
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
    image: null,
  };
}

console.log('Initial state:', state);

function saveGraphic () {
  shapes.sprite.visible = false;
  render();
  state.image = bgcache.getBase64();
  shapes.sprite.visible = true;
  render();
}

function alterState (mod) {
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
    })
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
// gridGraphics.beginFill(0xFFFF00);
gridGraphics.beginFill(0xFFFF00);
gridGraphics.drawRect(0, 0, size.x, size.y);
gridGraphics.visible = false;

var grid = new GridFilter();
grid.uniforms.radius.value = 1.0;
gridGraphics.filters = [ grid ];

var realContainer = new PIXI.Container();
realContainer.addChild(bgcacheSprite);
realContainer.scale.x = 1.0;
realContainer.scale.y = 1.0;
realContainer.position.x = frameSize.x/2 + -size.x/2;
realContainer.position.y = frameSize.y/2 + -size.y/2;

var lastCoords = null;

function setZoom (value) {
  alterState({ zoom: value });
  realContainer.scale.x = value;
  realContainer.scale.y = value;
  realContainer.position.x = frameSize.x/2 + -((size.x * value) / 2);
  realContainer.position.y = frameSize.y/2 + -((size.y * value) / 2);
  grid.uniforms.radius.value = value;
  gridGraphics.visible = value >= 4.0;
  $('#toolconf-zoom').val(value);
  $('#toolconf-zoom-readout').text(value);
  // $('toolconf-brush-grid').prop('enabled', value >= 4.0);
  render();
}

function resize () {
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
    shapes.update(state.alias, state.brushSize, state.rotation, state.brushColor);
    shapes.sprite.x = state.cursorX - (shapes.sprite.width / 2);
    shapes.sprite.y = state.cursorY - (shapes.sprite.height / 2);
  // }
  bgcache.render(container);
  renderer.render(realContainer);
}

function setBrushRotation (rotate) {
  alterState({ rotation: rotate });
}

function updateShape (coords) {
  alterState({ cursorX: coords.x - .5 });
  alterState({ cursorY: coords.y - .5 });
  if (state.brushPainting) {
    // RADIUS_STATE = Math.sqrt(Math.pow(coords.x - CIRC_CENTER.x, 2) + Math.pow(coords.y - CIRC_CENTER.y, 2));
    setBrushRotation(Math.atan2(coords.y - size.y/2, coords.x - size.x/2));
  }
}

function addShape () {
  container.addChild(shapes.sprite);
}

function commitShape () {
  container.removeChild(shapes.sprite);
  container.removeChild(background);

  try {
    background.destroy(true, true);
  } catch (e) { }

  background = new PIXI.Sprite(PIXI.Texture.fromCanvas(bgcache.getCanvas()));
  container.addChild(background);

  // When re-displaying
  container.addChild(shapes.sprite);
}

function brush (coords) {
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
})

$('#toolconf-brush-size').on('change mousedown mouseup mousemove', function () {
  var checkbox = this;
  setTimeout(function () {
    var value = $(checkbox).val();
    setBrushSize(value);
  }, 0);
})

function setGrid (value) {
  alterState({ gridVisible: value });
  if (value) {
    realContainer.addChild(gridGraphics);
  } else {
    realContainer.removeChild(gridGraphics);
  }
  $('#toolconf-brush-grid').prop('checked', value);
}

function setAlias (value) {
  alterState({ alias: value });
  $('#toolconf-brush-alias').prop('checked', value);  
}

function setBrushColor (color) {
  alterState({ brushColor: color });
}

function triggerResize () {
  requestAnimationFrame(function () {
    frameSize = {
      x: $(renderer.view).parent().width(),
      y: $(renderer.view).parent().height(),
    };
    renderer.resize(frameSize.x, frameSize.y);
    console.log(frameSize.x, frameSize.y);
    resize();
  });
}

function attachListeners () {
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
      var points = calculateLine(lastCoords, coords);
      lastCoords = coords;
      points.forEach(function (p) {
        brush(p);
      });
    }

    render();
  };

  $(window).on('resize', triggerResize)
}


/**
 * Start
 */

function start () {
  state.brushPainting = false;
  setGrid(state.gridVisible);
  setAlias(state.alias);
  setZoom(state.zoom);
  setBrushSize(state.brushSize);
  addShape();
  triggerResize();
  attachListeners();
}


function colorPicker (filter) {
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

  function render () {
    OHNO.render(container);
  };

  return {
    view: OHNO.view,
    render: render,
    filter: filter,
    target: graphics,
    height: 256,
    marker: marker,
  };
}

;(function () {
  var h = colorPicker(new HFilter);
  var s = colorPicker(new SFilter);
  var b = colorPicker(new BFilter);

  function getVal (c, event) {
    return getCoords(c.target, event).y / c.height;
  }

  var hval = 1.0;
  var sval = 1.0;
  var bval = 1.0;

  function updateColor () {
    s.filter.uniforms.h.value = hval;
    s.filter.uniforms.b.value = bval;
    b.filter.uniforms.h.value = hval;
    b.filter.uniforms.s.value = sval;

    h.marker.y = hval * h.height;
    s.marker.y = sval * s.height;
    b.marker.y = bval * b.height;

    var color = tinycolor.fromRatio({ h: hval, s: sval, v: bval }).toRgb();
    // console.log(hval, sval, bval);
    var brushColor = '#' + ('000000' + ((color.r << 16) + (color.g << 8) + color.b).toString(16)).slice(-6);
    alterState({ brushColor: brushColor });

    $('#ohno').css('backgroundColor', brushColor);

    h.render();
    s.render();
    b.render();
  }

  $(h.view).on('mousewheel', function (event) {
    var measure = (2/255);
    event.preventDefault();
    if (event.deltaY > 0) {
      hval = Math.min(hval + measure, 1.0);
    } else if (event.deltaY < 0) {
      hval = Math.max(hval - measure, 0.0);
    }
    updateColor();
  });

  $(s.view).on('mousewheel', function (event) {
    var measure = (2/255);
    event.preventDefault();
    if (event.deltaY > 0) {
      sval = Math.min(sval + measure, 1.0);
    } else if (event.deltaY < 0) {
      sval = Math.max(sval - measure, 0.0);
    }
    updateColor();
  });

  $(b.view).on('mousewheel', function (event) {
    var measure = (2/255);
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
  }

  s.target.mouseup = function (event) {
    sval = getVal(s, event);
    updateColor();
  }

  b.target.mouseup = function (event) {
    bval = getVal(b, event);
    updateColor();
  }

  $('#ohno')
    .append(h.view)
    .append(s.view)
    .append(b.view);

  updateColor();
})();


