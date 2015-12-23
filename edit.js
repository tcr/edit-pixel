var size = { x: 300, y: 100 };

// Create a pixi renderer
var renderer = PIXI.autoDetectRenderer(size.x, size.y);
renderer.view.className = "rendererView";


class CircleMesh extends PIXI.AbstractFilter {
	constructor() {
		var vertexShader = null;
		var fragmentShader = `

precision mediump float;

varying vec2 vTextureCoord;

uniform vec4 dimensions;
uniform float radius;
uniform sampler2D uSampler;

/**
 * Draw a circle at vec2 pos with radius rad and
 * color color.
 */

void main(void) {
	vec2 pos = vTextureCoord*dimensions.xy;
	vec2 center = dimensions.xy*0.5;
	vec3 color = vec3(1.0, 1.0, 0);
	float d = clamp(length(pos - center) - radius, 0.0, 2.0);
    // if (d > 0.0 && d < 1.0)
    // 	gl_FragColor = vec4(color*d, 1.0);
   	// else if (d >= 1.0 && d < 2.0)
    // 	gl_FragColor = vec4(color*(2.0-d), 1.0);
    if (d > 0.0 && d <= 1.0)
    	gl_FragColor = vec4(color, 1.0);
    else
    	gl_FragColor = vec4(0.0);
}

		`;

		super(vertexShader, fragmentShader, {
			dimensions: {
      			type: '4fv',
      			value: new Float32Array([0, 0, 0, 0])
    		},
    		radius: {
    			type: 'f',
    			value: 50.0,
    		}
		});
	}
}


// add render view to DOM
document.body.appendChild(renderer.view);

var playpen = new PIXI.Graphics();
playpen.width = size.x;
playpen.height = size.y;
playpen.interactive = true;
// playpen.hitArea = new PIXI.Rectangle(0, 0, playpen.width, playpen.height);

var circle = new CircleMesh;
playpen.filters = [circle];

playpen.beginFill( 0xFFFFFFFF );
playpen.drawRect(0, 0, size.x, size.y);
playpen.endFill();

playpen.mousedown = playpen.touchstart = function(item){
 //  var coords = item.data.getLocalPosition( playpen );
	// playpen.beginFill( 0xFFFFFFFF );
	// console.log(coords)
	// playpen.drawRect(Math.floor(coords.x), Math.floor(coords.y), 1, 1);
	// playpen.endFill();
	renderer.render(playpen);	
};

playpen.mousemove = playpen.touchstart = function(item){
	var coords = item.data.getLocalPosition( playpen );
	circle.uniforms.radius.value = Math.sqrt(Math.pow(coords.x - size.x/2, 2) + Math.pow(coords.y - size.y/2, 2))
	// playpen.beginFill( 0xFFFFFFFF );
	// console.log(coords)
	// playpen.drawRect(Math.floor(coords.x), Math.floor(coords.y), 1, 1);
	// playpen.endFill();
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
