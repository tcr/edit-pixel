export function calculateLine (A, B) {
  var x0 = Math.floor(A.x);
  var x1 = Math.floor(B.x);
  var y0 = Math.floor(A.y);
  var y1 = Math.floor(B.y);

  var ret = [];

   var dx = Math.abs(x1 - x0);
   var dy = Math.abs(y1 - y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx - dy;

   while (true) {
     ret.push({ x: x0, y: y0 });

     if ((x0==x1) && (y0==y1)) {
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
