import { OutlineMesh } from './meshes';

var CAN_graphics = new PIXI.CanvasRenderer(1, 1, {
  transparent: true
})
var CAN_texture = PIXI.Texture.fromCanvas(CAN_graphics.view, PIXI.SCALE_MODES.NEAREST);
var CAN_sprite = new PIXI.Sprite(CAN_texture);

var bgrenderer = new PIXI.WebGLRenderer(1, 1, {
  transparent: true,
});

var lastTexture = PIXI.Texture.fromCanvas(bgrenderer.view, PIXI.SCALE_MODES.NEAREST);
var out = new PIXI.Sprite(lastTexture);

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

function drawCanvasCircle (alias, radius, rot, thickness) {
  var fudge = 10;

  var len = (Math.floor(radius) * 2) + fudge;

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

  // Shortcut for single dot.
  if (alias && radius <= 1) {
    ctx.fillStyle = 'black';
    ctx.rect(cx - .5, cy - .5, 1, 1);
    ctx.fill();
    return len;
  }

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

function circleSprite (alias, radius, rot, fill) {
  // radius = 6;
  var CAN_len = drawCanvasCircle(alias, radius, rot, 1);

  // sprite.anchor = new PIXI.Point(-can.width / 2, -can.height / 2);
  // console.log(Math.floor((100 / 2) - (can.width / 2)))
  // console.log(Math.floor((100 / 2) - (can.height / 2)))
  // sprite.x = 20;
  // sprite.y = 10;
  // sprite.anchor = new PIXI.Point(50,50);
  // console.log(sprite.anchor);

  if (alias && radius > 1) {
    CAN_sprite.filters = [new OutlineMesh];
  } else {
    CAN_sprite.filters = null;
  }

  CAN_texture.update();

  bgrenderer.resize(CAN_len, CAN_len);
  bgrenderer.render(CAN_sprite);
  lastTexture.update();

  out.height = CAN_len;
  out.width = CAN_len;
}

export default {
  sprite: out,
  update: circleSprite,
}
