import shapes from './shapes';
import { GridFilter } from './filters';
import { calculateLine } from './util';

var size = {x: 50, y: 50};
var frameSize = {x: 300, y: 300};

// create a renderer instance
var renderer = shapes.renderer;
renderer.backgroundColor = 0xaaaaaa;
$('#panel-graphics').append(renderer.view);

renderer.view.style.height = '100%';
renderer.view.style.width = '100%';

var RADIUS_STATE = 0;
var ALIAS_STATE = false;
var ROT_BY = 0;
var CIRC_DRAW = false;
var CIRC_CENTER = {x: 0, y: 0};
var CIRC_COLOR = '#000000';
var ZOOM_VALUE = 4.0;

var background = new PIXI.Graphics();
background.beginFill(0xffffff);
background.drawRect(0, 0, size.x, size.y);

var container = new PIXI.Container();
container.addChild(background);

var bgcache = new PIXI.RenderTexture(renderer, size.x, size.y, PIXI.SCALE_MODES.NEAREST);
bgcache.render(container);

var bgcacheSprite = new PIXI.Sprite(bgcache);
bgcacheSprite.interactive = true;

var gridGraphics = new PIXI.Graphics();
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
realContainer.position.x = 300 + -50;
realContainer.position.y = 300 + -50;

var lastCoords = null;

function setZoom (value) {
  ZOOM_VALUE = value;
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
  setZoom(ZOOM_VALUE);
}

function setBrushSize(value) {
  RADIUS_STATE = value;
  $('#toolconf-brush-size').val(value);
  $('#toolconf-brush-size-readout').text(value);
  render();
}

function render() {
  // if (CIRC_DRAW) {
    shapes.update(ALIAS_STATE, RADIUS_STATE, ROT_BY, CIRC_COLOR);
    shapes.sprite.x = CIRC_CENTER.x - (shapes.sprite.width / 2);
    shapes.sprite.y = CIRC_CENTER.y - (shapes.sprite.height / 2);
  // }
  bgcache.render(container);
  renderer.render(realContainer);
}

function updateShape (coords) {
  CIRC_CENTER.x = coords.x - .5;
  CIRC_CENTER.y = coords.y - .5;
  if (CIRC_DRAW) {
    // RADIUS_STATE = Math.sqrt(Math.pow(coords.x - CIRC_CENTER.x, 2) + Math.pow(coords.y - CIRC_CENTER.y, 2));
    ROT_BY = Math.atan2(coords.y - size.y/2, coords.x - size.x/2);
  }
}

function addShape () {
  container.addChild(shapes.sprite);
  // CIRC_CENTER.x = coords.x;
  // CIRC_CENTER.y = coords.y;
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
})
$('#toolconf-color-red').on('click', function () {
  CIRC_COLOR = '#ff0000';
})
$('#toolconf-color-blue').on('click', function () {
  CIRC_COLOR = '#0000ff';
})
$('#toolconf-color-green').on('click', function () {
  CIRC_COLOR = '#00ff00';
})
$('#toolconf-color-yellow').on('click', function () {
  CIRC_COLOR = '#ffff00';
})
$('#toolconf-color-white').on('click', function () {
  CIRC_COLOR = '#ffffff';
})

$('#panel-graphics').on('mousewheel', function(event) {
  if (event.deltaY > 0) {
    setZoom(Math.min(ZOOM_VALUE + 1, 10));
  } else if (event.deltaY < 0) {
    setZoom(Math.max(ZOOM_VALUE - 1, 1));
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
  CIRC_DRAW = true;

  var coords = getCoords(bgcacheSprite, item);
  
  // addShape(coords);
  // updateShape(coords);

  brush(coords);
  lastCoords = coords;

  render();
};

window.onmouseup = function (item) {
  CIRC_DRAW = false;
  // commitShape();
  lastCoords = null;
  render();
};

bgcacheSprite.mousemove = function (item) {
  var coords = getCoords(bgcacheSprite, item);

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

$(window).on('resize', triggerResize)


/**
 * Start
 */

setZoom(ZOOM_VALUE);
addShape();
triggerResize();
