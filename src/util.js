export function calculateLine (A, B) {
  var x0 = A.x;
  var x1 = B.x;
  var y0 = A.y;
  var y1 = B.y;

  var ret = [];

  var dx = Math.abs(x1 - x0);
  var dy = Math.abs(y1 - y0);
  var sx = (x0 < x1) ? 1 : -1;
  var sy = (y0 < y1) ? 1 : -1;
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
