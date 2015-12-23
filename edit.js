var viewWidth = 10;
var viewHeight = 10;

// Create a pixi renderer
var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);
renderer.view.className = "rendererView";


class CircleMesh extends PIXI.AbstractFilter {
	constructor() {
		var vertexShader = null;
		var fragmentShader = `

/**
 * Convert r, g, b to normalized vec3
 */
vec3 rgb(float r, float g, float b) {
	return vec3(r / 255.0, g / 255.0, b / 255.0);
}

/**
 * Draw a circle at vec2 pos with radius rad and
 * color color.
 */
vec4 circle(vec2 uv, vec2 pos, float rad, vec3 color) {
	float d = length(pos - uv) - rad;
    if (d >= 0.0 && d <= 1.0) d = 0.0;
    else d = 1.0;
	return vec4(color, 1.0 - d);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

	vec2 uv = fragCoord.xy;
	vec2 center = iResolution.xy * 0.5;
	float radius = 0.2 * iResolution.y;

    // Background layer
	vec4 layer1 = vec4(rgb(210.0, 222.0, 228.0), 1.0);
	
	// Circle
	vec3 red = rgb(225.0, 95.0, 60.0);
	vec4 layer2 = circle(uv, center, radius, red);
	
	// Blend the two
	fragColor = mix(layer1, layer2, layer2.a);

}
		`;

		super(vertexShader, fragmentShader, {});
	}
}


// add render view to DOM
document.body.appendChild(renderer.view);

var playpen = new PIXI.Graphics();
playpen.width = 512;
playpen.height = 512;
playpen.interactive = true;
playpen.hitArea = new PIXI.Rectangle(0, 0, 512, 512);

playpen.mousedown = playpen.touchstart = function(item){
  var coords = item.data.getLocalPosition( playpen );
	playpen.beginFill( 0xFFFFFFFF );
	console.log(coords)
	playpen.drawRect(Math.floor(coords.x), Math.floor(coords.y), 1, 1);
	playpen.endFill();
	renderer.render(playpen);	
};

renderer.render(playpen);
// function ShockwaveFilter()
// {
//     core.AbstractFilter.call(this,
//         // vertex shader
//         null,
//         // fragment shader
//         fs.readFileSync(__dirname + '/shockwave.frag', 'utf8'),
//         // custom uniforms
//         {
//             center: { type: 'v2', value: { x: 0.5, y: 0.5 } },
//             params: { type: 'v3', value: { x: 10, y: 0.8, z: 0.1 } },
//             time: { type: '1f', value: 0 }
//         }
//     );
// }

// ShockwaveFilter.prototype = Object.create(core.AbstractFilter.prototype);
// ShockwaveFilter.prototype.constructor = ShockwaveFilter;
// module.exports = ShockwaveFilter;

// Object.defineProperties(ShockwaveFilter.prototype, {
//     /**
//      * Sets the center of the shockwave in normalized screen coords. That is
//      * (0,0) is the top-left and (1,1) is the bottom right.
//      *
//      * @member {object<string, number>}
//      * @memberof PIXI.filters.ShockwaveFilter#
//      */
//     center: {
//         get: function ()
//         {
//             return this.uniforms.center.value;
//         },
//         set: function (value)
//         {
//             this.uniforms.center.value = value;
//         }
//     },
//     /**
//      * Sets the params of the shockwave. These modify the look and behavior of
//      * the shockwave as it ripples out.
//      *
//      * @member {object<string, number>}
//      * @memberof PIXI.filters.ShockwaveFilter#
//      */
//     params: {
//         get: function ()
//         {
//             return this.uniforms.params.value;
//         },
//         set: function (value)
//         {
//             this.uniforms.params.value = value;
//         }
//     },
//     /**
//      * Sets the elapsed time of the shockwave. This controls the speed at which
//      * the shockwave ripples out.
//      *
//      * @member {number}
//      * @memberof PIXI.filters.ShockwaveFilter#
//      */
//     time: {
//         get: function ()
//         {
//             return this.uniforms.time.value;
//         },
//         set: function (value)
//         {
//             this.uniforms.time.value = value;
//         }
//     }
// });
