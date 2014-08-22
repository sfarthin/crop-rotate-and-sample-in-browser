# Image Methods

This library

## Install
The library is available on bower and npm.

    bower install image-manipulation

OR

    npm install image-manipulation


## Features

- Hermite sampling is used to resize images rather than drawImage. This results in a much better quality photo after resize. See [this stackoverflow](http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality/19223362#19223362).
- The library parses EXIF meta data to always provide the correct orientation. Photos taken with older cameras rely on EXIF meta data. See [this article](http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/).
- Ability to upload directly to Google Cloud Storage with [Signed URLs](https://developers.google.com/storage/docs/accesscontrol#Signed-URLs) using my [gcs-signed-urls](https://github.com/sfarthin/nodejs-google-cloud-storage) NPM module. See full example.


## Examples

#### Manipulators

A canvas can be changed using the manipulator methods: **rotate**, **resize** and **crop**. One can use the static methods.

	var canvas = document.querySelector("canvas");
	
	var resizedCanvas = ImageMethods.resize(canvas, 100, 100);
	
	var rotatedCanvas = ImageMethods.rotate(resizedCanvas, 90);
	
	document.body.append(rotatedCanvas);

or one can also make a manipulator instance and chain these methods.

	var canvas = document.querySelector("canvas");
	
	var manipulator = new ImageMethods(canvas);
	
	manipulator.resize(canvas, 100, 100).rotate(90);
	
	document.body.append(manipulator.canvas);

#### Retrieving images to manipulate

Grab an image from the DOM and flip it upside down

	var img = document.querySelector("img"),
		canvas = ImageMethods.getCanvasFromImage(img);
	
	img.src = ImageMethods.rotate(canvas, 180).toDataURL();



Grab an image from an input element (<input type="file" accept="image/*">), create a thumbnail at 200px width and add it to the screen.

	document.querySelector("input[type=file]").onchange = function(e) {
		ImageMethods.getCanvasFromFile(e.files[0], function(canvas) {
			
			var manipulator = new ImageMethods(canvas);
			
			manipulator.resize(200);
			
			// Add our resized canvas to the screen
			document.body.appendChild(manipulator.canvas)
			
		});
	};



Download an image from the server, cut it into 2 pieces, and upload the pieces back to the server via xhr2

	ImageMethods.getCanvasFromUrl("/path/to/image.jpg", function(canvas, file) {
		
		var manipulator = new ImageMethods(canvas);
		
		var piece1Canvas = ImageMethods.crop(0, 0, canvas.width/2, canvas.height),
			piece2Canvas = ImageMethods.crop(canvas.width/2, 0, canvas.width/2, canvas.height),
		
		// Put together FormData for submission
		var formData = new FormData();
		formData.append("images[]", ImageMethods.toBlob(piece1Canvas), file.name);
		formData.append("images[]", ImageMethods.toBlob(piece2Canvas), file.name);
		
		// Post to server
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/my/upload-handler", true);
		
	});

### Full Example

This example allows 

See Demo: [http://floating-spire-3371.herokuapp.com/](http://floating-spire-3371.herokuapp.com/)

## Reference

### Chainable instance methods

##### rotate(degrees)
##### crop(x, y, width, height)
##### resize(width, height)

### Static methods

##### getOrientationFromFile(file, callback)
##### getCanvasFromImage(img)
##### getCanvasFromUrl(url, callback)
##### getCanvasFromFile(file, callback)
