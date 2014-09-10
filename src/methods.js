var EXIF = require("./exif"),
	BinaryFile = require("./binaryFile"),
	toBlob = require("./canvas-to-blob"),
	async = require("async"),
	_ = require("underscore");


var staticMethods = {
	
	rotate: function(src_canvas, degrees) {

		// We only allow the canvas to be rotated by 90,180,270 so that it continues to be a rectangle.
		if(degrees % 90 != 0) {
			throw "Rotate by 90, 180, 270 degrees only";
		}
		
		var canvas = document.createElement("canvas"),
			context = canvas.getContext("2d");
		
		// If image is rotate by 90 or 270, the canvas width and height will reverse.
		if(degrees == 90 || degrees == 270) {
			canvas.width = src_canvas.height;
			canvas.height = src_canvas.width;
		} else {
			canvas.width = src_canvas.width;
			canvas.height = src_canvas.height;
		}

	    // save the unrotated context of the canvas so we can restore it later
	    // the alternative is to untranslate & unrotate after drawing
		// The translate method could potentially affect other methods if not.
	    context.save();

	    // move to the center of the canvas
		if(degrees == 90 || degrees == 270)
			context.translate(src_canvas.height/2,src_canvas.width/2);
		else
			context.translate(src_canvas.width/2,src_canvas.height/2);
			

	    // rotate the canvas using radians, so we convert degrees to radians
		// degrees/360 = radians/(2*PI) so...
		// radians = degrees * PI/180
	    context.rotate(degrees * Math.PI/180 );

	    // draw the image
	    // since the context is rotated, the image will be rotated also
		context.drawImage(src_canvas,-src_canvas.width/2,-src_canvas.height/2);

	    // we’re done with the rotating so restore the unrotated context
	    context.restore();
		
		return canvas;
		
	},
	
	crop: function(canvas, x, y, w, h) {
		
		if(w == 0 && h == 0) {
			return canvas;
		}
		
		var outputCanvas = document.createElement("canvas");
	    outputCanvas.width = w;
	    outputCanvas.height = h;

		var img = canvas.getContext("2d").getImageData(x, y, w, h);
		
		// Cropping is straightforward copy of a portion of the image data.
		outputCanvas.getContext("2d").putImageData(img, 0, 0);
		
		return outputCanvas;
		
	},

	/**
	* NOTE: the resize method is not my own, but taken from stackoverflow
	* http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality/19223362#19223362
	**/
	resize: function(canvas, W2, H2) {
		
		var W = canvas.width,
			H = canvas.height;
		
		// if no height/width is given lets jsut make it proportional
		if(!H2) H2 =  Math.floor((W2 / W) * H)
		if(!W2) W2 =  Math.floor((H2 / H) * W)
		
		var outputCanvas = document.createElement("canvas");
	    outputCanvas.width = W2;
	    outputCanvas.height = H2;
		
		var time1 = Date.now();
		var img = canvas.getContext("2d").getImageData(0, 0, W, H);
		var img2 = outputCanvas.getContext("2d").getImageData(0, 0, W2, H2);
		var data = img.data;
		var data2 = img2.data;
	    var ratio_w = W / W2;
	    var ratio_h = H / H2;
	    var ratio_w_half = Math.ceil(ratio_w/2);
	    var ratio_h_half = Math.ceil(ratio_h/2);

		for(var j = 0; j < H2; j++){
			for(var i = 0; i < W2; i++){
				var x2 = (i + j*W2) * 4;
				var weight = 0;
				var weights = 0;
				var weights_alpha = 0;
				var gx_r = gx_g = gx_b = gx_a = 0;
				var center_y = (j + 0.5) * ratio_h;
				for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
					var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
					var center_x = (i + 0.5) * ratio_w;
					var w0 = dy*dy //pre-calc part of w
					for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
						var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
						var w = Math.sqrt(w0 + dx*dx);
						if(w >= -1 && w <= 1){
							//hermite filter
							weight = 2 * w*w*w - 3*w*w + 1;
							if(weight > 0){
								dx = 4*(xx + yy*W);
								//alpha
								gx_a += weight * data[dx + 3];
								weights_alpha += weight;
								//colors
								if(data[dx + 3] < 255)
									weight = weight * data[dx + 3] / 250;
								gx_r += weight * data[dx];
								gx_g += weight * data[dx + 1];
								gx_b += weight * data[dx + 2];
								weights += weight;
								}
							}
						}		
					}
				data2[x2]     = gx_r / weights;
				data2[x2 + 1] = gx_g / weights;
				data2[x2 + 2] = gx_b / weights;
				data2[x2 + 3] = gx_a / weights_alpha;
				}
			}

		outputCanvas.getContext("2d").putImageData(img2, 0, 0);
		return outputCanvas;

	},
	
	/**
	*
	* Non-chainable methods below
	*
	**/
	
	// Convert our canvas to a blob so it can be transferred or reread
	toBlob: function(canvas) {
		return toBlob(canvas.toDataURL());
	},
	
	// This method determines if an image should be rotated based on EXIF meta data
	getOrientationFromFile: function(file, callback) {
		
		var reader = new FileReader();

		reader.readAsBinaryString(file);
		
		reader.onload = function(evt) {
			var rotate,
				
				// Use our third party libraries to read EXIF data
				b = new BinaryFile(evt.target.result),
				exif = EXIF.readFromBinaryFile(b);
		
			// Inspired by http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
			// Lets handle the orientation tag, but lets ignore the horizontal/vertical flipping.
			if(exif.Orientation == 7 || exif.Orientation == 8) {
				rotate = 270;
			} else if(exif.Orientation == 3 || exif.Orientation == 4) {
				rotate = 180;
			} else if(exif.Orientation == 6 || exif.Orientation == 5) {
				rotate = 90;
			} else {
				rotate = 0;
			}
		
			callback(rotate);
		
		}

		
	},
	
	// Paints an image onto a new canvas
	getCanvasFromImage: function(img) {
		var canvas = document.createElement("canvas");
	    canvas.width = img.width;
	    canvas.height = img.height;
	    canvas.getContext("2d").drawImage(img, 0, 0);
		
		return canvas;
	},
	
	// Uses xhr to pull a BLOB form a url and gets file and orientation from it
	getCanvasFromUrl: function(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
			staticMethods.getCanvasFromFile(xhr.response, callback);
		};

		xhr.send();
	},
	
	// Gets the orientation and canvas from a image BLOB
	getCanvasFromFile: function(file, fn) {
		if(!fn) fn = function() {};
		
		async.parallel([
		    function(callback) { staticMethods.getOrientationFromFile(file, function(rotate) { callback(null, rotate) }); },
		    function(callback) { 
				
				// Lets convert File to an Image first
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function(e) {
					var img = document.createElement("img");
					img.onload = function() { 
						callback(null, staticMethods.getCanvasFromImage(img));
					};
					img.src = e.target.result;					
				}

			}
		],
		function(err, results){
			var rotate = results[0],
				canvas = results[1];
			
			if(rotate)
				canvas = staticMethods.rotate(canvas, rotate);
			
			
			fn(canvas, file);
		});
		
	}
	
};

/**
* Lets make it chainable
**/
function ImageMethodConstructor(canvas) {
	this.canvas = canvas;
	return this;
}

// Make our static methods Chainable
delete ImageMethodConstructor.prototype.getCanvasFromUrl;
_.each(staticMethods, function(func, key) {
	ImageMethodConstructor.prototype[key] = function() {
		this.canvas = func.apply(this, [this.canvas].concat(_.values(arguments)));
		return this;
	};
});

// Lets overwrite these non chainable methods
ImageMethodConstructor.prototype.toBlob = function() {
	return staticMethods.toBlob.apply(this, _.union([this.canvas], arguments));
};

// TODO Lets add a wrapper for Camanjs (http://camanjs.com/) methods.


module.exports = window.ImageMethods = _.extend(ImageMethodConstructor, staticMethods);