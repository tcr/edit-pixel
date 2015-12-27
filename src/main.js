import shapes from './shapes';
import { GridFilter } from './meshes';

// create a renderer instance
var renderer = new PIXI.WebGLRenderer(600, 600, {
  transparent: true,
});
document.body.insertBefore(renderer.view, document.body.firstChild);

renderer.view.style.height = '600px';
renderer.view.style.width = '600px';

var RADIUS_STATE = 8;
var ALIAS_STATE = false;
var ROT_BY = 0;
var CIRC_DRAW = false;
var CIRC_CENTER = {x: 0, y: 0}

// var bg = new PIXI.CanvasRenderer(100, 100, {
//   transparent: true,
// });

var background = new PIXI.Graphics();
background.beginFill(0xccffff);
background.drawRect(0, 0, 100, 100);

// var bgsprite = new PIXI.Sprite(background);
// var centerdot = new PIXI.Graphics();
// centerdot.beginFill(0xff0000);
// centerdot.drawRect(100/2 - 1, 100/2 - 1, 3, 3);

var container = new PIXI.Container();
container.addChild(background);

var bgcache = new PIXI.RenderTexture(renderer, 100, 100, PIXI.SCALE_MODES.NEAREST);
bgcache.render(container);

var bgcacheSprite = new PIXI.Sprite(bgcache);
bgcacheSprite.scale.x = 6.0;
bgcacheSprite.scale.y = 6.0;

var gridGraphics = new PIXI.Graphics();
gridGraphics.beginFill(0xFFFF00);
gridGraphics.drawRect(0, 0, 600, 600);

var grid = new GridFilter();
grid.uniforms.radius.value = 6.0;
gridGraphics.filters = [ grid ];

var realContainer = new PIXI.Container();
realContainer.addChild(bgcacheSprite);
realContainer.addChild(gridGraphics);

function render() {
  // DRAW DAT CENTER DOT
  if (CIRC_DRAW) {
    shapes.update(ALIAS_STATE, Math.max(RADIUS_STATE, 0.5), ROT_BY);
    shapes.sprite.x = CIRC_CENTER.x - (shapes.sprite.width / 2);
    shapes.sprite.y = CIRC_CENTER.y - (shapes.sprite.height / 2);
  }
  bgcache.render(container);
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

bgcacheSprite.interactive = true;

function updateShape (coords) {
  if (CIRC_DRAW) {
    var size = {x: 100, y: 100};
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

bgcacheSprite.mousedown = function (item) {
  CIRC_DRAW = true;
  var coords = item.data.getLocalPosition(bgcacheSprite);
  
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
  var coords = item.data.getLocalPosition(bgcacheSprite);
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
