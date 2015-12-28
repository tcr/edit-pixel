import shapes from './shapes';
import { GridFilter } from './meshes';

var size = {x: 50, y: 50};

// create a renderer instance
var renderer = new PIXI.WebGLRenderer(600, 600);
renderer.backgroundColor = 0xaaaaaa;
$('#panel-graphics').append(renderer.view);

renderer.view.style.height = '600px';
renderer.view.style.width = '600px';

var RADIUS_STATE = 8;
var ALIAS_STATE = false;
var ROT_BY = 0;
var CIRC_DRAW = false;
var CIRC_CENTER = {x: 0, y: 0}
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

var grid = new GridFilter();
grid.uniforms.radius.value = 1.0;
gridGraphics.filters = [ grid ];

var realContainer = new PIXI.Container();
realContainer.addChild(bgcacheSprite);
realContainer.scale.x = 1.0;
realContainer.scale.y = 1.0;
// realContainer.anchor.x = 0.5;
// realContainer.anchor.y = 0.5;
realContainer.position.x = 300 + -50;
realContainer.position.y = 300 + -50;

function setZoom (value) {
  ZOOM_VALUE = value;
  realContainer.scale.x = value;
  realContainer.scale.y = value;
  realContainer.position.x = 300 + -((size.x * value) / 2);
  realContainer.position.y = 300 + -((size.y * value) / 2);
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

function render() {
  if (CIRC_DRAW) {
    shapes.update(ALIAS_STATE, Math.max(RADIUS_STATE, 0.15), ROT_BY, CIRC_COLOR);
    shapes.sprite.x = CIRC_CENTER.x - (shapes.sprite.width / 2);
    shapes.sprite.y = CIRC_CENTER.y - (shapes.sprite.height / 2);
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

function updateShape (coords) {
  if (CIRC_DRAW) {
    RADIUS_STATE = Math.sqrt(Math.pow(coords.x - CIRC_CENTER.x, 2) + Math.pow(coords.y - CIRC_CENTER.y, 2));
    ROT_BY = Math.atan2(coords.y - size.y/2, coords.x - size.x/2);
  }
}

function addShape (coords) {
  container.addChild(shapes.sprite);
  CIRC_CENTER.x = coords.x;
  CIRC_CENTER.y = coords.y;
}

function commitShape () {
  container.removeChild(shapes.sprite);
  container.removeChild(background);

  try {
    background.destroy(true, true);
  } catch (e) { }

  background = new PIXI.Sprite(PIXI.Texture.fromCanvas(bgcache.getCanvas()));
  container.addChild(background);
}

function brush (coords) {
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

function line(A, B){
  var x0 = Math.floor(A.x);
  var x1 = Math.floor(B.x);
  var y0 = Math.floor(A.y);
  var y1 = Math.floor(B.y);

var ret = [];

   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;

   while(true){
     ret.push({x: x0, y: y0});  // Do what you need to for this

     if ((x0==x1) && (y0==y1)) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
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
