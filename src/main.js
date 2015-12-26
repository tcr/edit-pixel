import shapes from './shapes';

// create a renderer instance
var renderer = new PIXI.WebGLRenderer(100, 100, {
  transparent: true,
});
document.body.insertBefore(renderer.view, document.body.firstChild);

renderer.view.style.height = '200px';
renderer.view.style.width = '200px';

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

var bgcache = new PIXI.RenderTexture(renderer, 100, 100);
bgcache.render(background);

var bgsprite = new PIXI.Sprite(bgcache);

var centerdot = new PIXI.Graphics();
centerdot.beginFill(0xff0000);
centerdot.drawRect(100/2 - 1, 100/2 - 1, 3, 3);

var container = new PIXI.Container();
container.addChild(bgsprite);
container.addChild(centerdot);

function render() {
  // DRAW DAT CENTER DOT
  if (CIRC_DRAW) {
    shapes.update(ALIAS_STATE, Math.max(RADIUS_STATE, 1), ROT_BY);
  }
  renderer.render(container);
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

function mouseRedraw (item) {
  if (CIRC_DRAW) {
    var coords = item.data.getLocalPosition(bgsprite);
    var size = {x: 100, y: 100};
    RADIUS_STATE = Math.sqrt(Math.pow(coords.x - shapes.sprite.x, 2) + Math.pow(coords.y - shapes.sprite.y, 2));
    ROT_BY = Math.atan2(coords.y - size.y/2, coords.x - size.x/2);
  }
}

bgsprite.mousedown = function (item) {
  CIRC_DRAW = true;
  container.addChild(shapes.sprite);
  var coords = item.data.getLocalPosition(bgsprite);
  shapes.sprite.x = coords.x;
  shapes.sprite.y = coords.y;
  mouseRedraw(item);
  render();
};

bgsprite.mouseup = function (item) {
  CIRC_DRAW = false;
  container.removeChild(shapes.sprite);

  var temptex = PIXI.Texture.fromCanvas(bgcache.getCanvas());
  var c = new PIXI.Container();
  c.addChild(new PIXI.Sprite(temptex));
  c.addChild(shapes.sprite);
  bgcache.render(c);

  temptex.destroy();

  render();
};

bgsprite.mousemove = function (item) {
  mouseRedraw(item);
  render();
};

render();
