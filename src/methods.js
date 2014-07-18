var EXIF = require("./exif"),
	BinaryFile = require("./binaryFile"),
	toBlob = require("./canvas-to-blob");


module.exports = window.ImageMethods = {
	
	xhrUpload: function(url, canvas, filename, fields, callback) {
		
		var blob = toBlob(canvas.toDataURL());

		if(!callback) callback = function() {};

		var formData = new FormData();

		for(var i in fields)
			formData.append(i, fields[i]);

		formData.append("file", blob, filename);

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.onload = function(e) {
			callback();
		};

		xhr.onerror = function(e) {
			callback(e);
		};

		xhr.send(formData);	
		
	},
	
	rotate: function(src_canvas, degrees) {
		
		var canvas = document.createElement("canvas"),
			context = canvas.getContext("2d");
			
		if(degrees == 90 || degrees == 270) {
			canvas.width = src_canvas.height;
			canvas.height = src_canvas.width;
		} else {
			canvas.width = src_canvas.width;
			canvas.height = src_canvas.height;
		}

	    // save the unrotated context of the canvas so we can restore it later
	    // the alternative is to untranslate & unrotate after drawing
	    context.save();

	    // move to the center of the canvas
		if(degrees == 90 || degrees == 270)
			context.translate(src_canvas.height/2,src_canvas.width/2);
		else
			context.translate(src_canvas.width/2,src_canvas.height/2);
			

	    // rotate the canvas to the specified degrees
	    context.rotate(degrees*Math.PI/180);

	    // draw the image
	    // since the context is rotated, the image will be rotated also
		context.drawImage(src_canvas,-src_canvas.width/2,-src_canvas.height/2);

	    // we’re done with the rotating so restore the unrotated context
	    context.restore();	
		
		return canvas;
		
	},
	
	crop: function(canvas, x, y, w, h) {
		var outputCanvas = document.createElement("canvas");
	    outputCanvas.width = w;
	    outputCanvas.height = h;
		
		var img = canvas.getContext("2d").getImageData(x, y, w, h);
		
		outputCanvas.getContext("2d").putImageData(img, 0, 0);
		
		return outputCanvas;
		
	},
	
	// http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality/19223362#19223362
	resize: function(canvas, W2, H2) {
		
		var W = canvas.width,
			H = canvas.height;
		
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
//			canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));

		outputCanvas.getContext("2d").putImageData(img2, 0, 0);
		return outputCanvas;

	},
	
	parseFile: function(file, fn) {
		if(!fn) fn = function() {};
		
		var exif,rotate,img,canvas, num_callbacks = 0;
		
		// After we read
		var readerCallback = function() {
			
			num_callbacks++;
			
			if(num_callbacks < 2) return;

			var canvas = document.createElement("canvas"),
				ctx = canvas.getContext("2d");
		
		    canvas.width = img.width;
		    canvas.height = img.height;
		    ctx.drawImage(img, 0, 0); //draw image
			
			fn(canvas, img, rotate, exif);
			
		};
		
		// Lets read this file so we can throw it in a image tag
		var reader = new FileReader();
		reader.readAsDataURL(file);
		
		// Lets read this file so we can read the EXIF information
		var readerBinary = new FileReader();
		if(readerBinary.readAsBinaryString) {
			readerBinary.readAsBinaryString(file);
			readerBinary.onload = function(evt) {
				var b = new BinaryFile(evt.target.result);
				exif = EXIF.readFromBinaryFile(b);
			
				// http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
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
			
				readerCallback();
			
			}.bind(this);
		} else {
			readerCallback();
		}

        reader.onload = function(e) {
			
			img = document.createElement("img");
			img.onload = function() { 
				
				readerCallback();
			};
			img.src = e.target.result;
			
		};
		
	}
	
};
