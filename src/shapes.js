import { OutlineFilter } from './filters';

var bgrenderer = new PIXI.WebGLRenderer(600, 600);

var lastTexture = new PIXI.RenderTexture(bgrenderer, 100, 100, PIXI.SCALE_MODES.NEAREST);
var out = new PIXI.Sprite(lastTexture);

var CAN_graphics = new PIXI.Graphics();

var CAN_sprite = new PIXI.Container();
CAN_sprite.addChild(CAN_graphics);

var outline = new OutlineFilter();

function drawStar(ctx, cx,cy,spikes,outerRadius,innerRadius){
  var rot=Math.PI/2*3;
  var x=cx;
  var y=cy;
  var step=Math.PI/spikes;

  // ctx.beginPath();
  ctx.moveTo(cx,cy-outerRadius)
  for(var i=0;i<spikes;i++){
    x=cx+Math.cos(rot)*outerRadius;
    y=cy+Math.sin(rot)*outerRadius;
    ctx.lineTo(x,y)
    rot+=step

    x=cx+Math.cos(rot)*innerRadius;
    y=cy+Math.sin(rot)*innerRadius;
    ctx.lineTo(x,y)
    rot+=step
  }
  ctx.lineTo(cx,cy-outerRadius)
  ctx.stroke();
}

function drawCanvasCircle (alias, radius, rot, stroke, thickness, dofill) {
  radius -= 1;
  if (alias) {
    radius = Math.max(Math.floor(radius) + .3, .3);
  } else {
    radius = Math.max(radius, .5);
  }

  var len = Math.floor(radius*2) + 10;

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
    CAN_graphics.drawCircle(len/2 + .5, len/2 + .5, radius);
  } else {
    CAN_graphics.drawCircle(len/2 + .75, len/2, radius);
  }
  CAN_graphics.endFill();

  return len;
}


function circleSprite (alias, radius, rot, stroke) {
  var dofill = true;
  var len = drawCanvasCircle(alias, radius, rot, stroke, 1, dofill);

  if (alias && !dofill) {
    outline.setColor(
      parseInt(stroke.substr(1).substr(0, 2), 16)/255.0,
      parseInt(stroke.substr(1).substr(2, 2), 16)/255.0,
      parseInt(stroke.substr(1).substr(4, 2), 16)/255.0,
      1.0
    );
    CAN_sprite.filters = [outline];
  } else {
    CAN_sprite.filters = null;
  }

  CAN_graphics.x = (100/2) - (len / 2);
  CAN_graphics.y = (100/2) - (len / 2);

  if (alias) {
    lastTexture.clear();
    lastTexture.render(CAN_sprite);
    out.texture = lastTexture;
  } else {
    out.texture = CAN_graphics.generateTexture();
  }
}

export default {
  sprite: out,
  update: circleSprite,
  renderer: bgrenderer,
}
