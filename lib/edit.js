"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var viewWidth = 10;
var viewHeight = 10;

// Create a pixi renderer
var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);
renderer.view.className = "rendererView";

var CircleMesh = (function (_PIXI$AbstractFilter) {
	_inherits(CircleMesh, _PIXI$AbstractFilter);

	function CircleMesh() {
		_classCallCheck(this, CircleMesh);

		var vertexShader = null;
		var fragmentShader = "\n\n/**\n * Convert r, g, b to normalized vec3\n */\nvec3 rgb(float r, float g, float b) {\n\treturn vec3(r / 255.0, g / 255.0, b / 255.0);\n}\n\n/**\n * Draw a circle at vec2 pos with radius rad and\n * color color.\n */\nvec4 circle(vec2 uv, vec2 pos, float rad, vec3 color) {\n\tfloat d = length(pos - uv) - rad;\n    if (d >= 0.0 && d <= 1.0) d = 0.0;\n    else d = 1.0;\n\treturn vec4(color, 1.0 - d);\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord ) {\n\n\tvec2 uv = fragCoord.xy;\n\tvec2 center = iResolution.xy * 0.5;\n\tfloat radius = 0.2 * iResolution.y;\n\n    // Background layer\n\tvec4 layer1 = vec4(rgb(210.0, 222.0, 228.0), 1.0);\n\t\n\t// Circle\n\tvec3 red = rgb(225.0, 95.0, 60.0);\n\tvec4 layer2 = circle(uv, center, radius, red);\n\t\n\t// Blend the two\n\tfragColor = mix(layer1, layer2, layer2.a);\n\n}\n\t\t";

		return _possibleConstructorReturn(this, Object.getPrototypeOf(CircleMesh).call(this, vertexShader, fragmentShader, {}));
	}

	return CircleMesh;
})(PIXI.AbstractFilter);

// add render view to DOM

document.body.appendChild(renderer.view);

var playpen = new PIXI.Graphics();
playpen.width = 512;
playpen.height = 512;
playpen.interactive = true;
playpen.hitArea = new PIXI.Rectangle(0, 0, 512, 512);

playpen.mousedown = playpen.touchstart = function (item) {
	var coords = item.data.getLocalPosition(playpen);
	playpen.beginFill(0xFFFFFFFF);
	console.log(coords);
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