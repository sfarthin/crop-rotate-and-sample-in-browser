var ImageMethods = require("../src/methods.js"),
	resemble = require("resemblejs").resemble,
	async = require("async"),
	_ = require("lodash");

/**
* Lets have one array with all the parsed test data in it
* i.e. files.IMG_0086.canvas or files.IMG_0086.blob
**/
var imagesToDownload = [ "IMG_0032", "IMG_0086" ],
	files = {},
	basePath;
	

if(window.__karma__) {
	// Karma has the annoying root path of /base
	basePath = "base/test/";
} else {
	// Otherwise with something like Testling
	basePath = "test/";
}


jasmine.getEnv().defaultTimeoutInterval = 60 * 1000;

beforeEach(function(done) {
	
	// Lets just do this once
	if(_.size(files)) {
		done();
		return;
	}
	
	/**
	* Helper method
	**/
	var parseCanvas = function(name, callback) {
		ImageMethods.getCanvasFromUrl(basePath + name + ".jpg", function(canvas, blob) {
			callback(null, {
				blob: blob,
				canvas: canvas,
				name: name
			})
		});
	};
	
	async.map(imagesToDownload, parseCanvas, function(err, _files) {
					
		_files.forEach(function(file) {
			files[file.name] = file;
		});

		done();
	});

});

/**
* Unit Tests
**/
describe("methods", function() {

	describe("rotate", function() {

		it("should resemble original image 1x1 when rotate 360 degrees", function(done) {

			resemble(files.IMG_0086.blob)
				.compareTo(
					(new ImageMethods(files.IMG_0086.canvas)).rotate(360).toBlob()
				)
				.onComplete(function(diff){
					
					expect(diff.misMatchPercentage).toBe('0.00');
					expect(diff.dimensionDifference.width).toBe(0);
					expect(diff.dimensionDifference.height).toBe(0);
					done();
					
				});
		});


	});

	describe("crop", function() {

		it("should resemble original image 1x1 except cropped out areas", function(done) {

			resemble(files.IMG_0086.blob)
				.compareTo(
					ImageMethods.toBlob(
						ImageMethods.crop(files.IMG_0086.canvas, 0, 0, files.IMG_0086.canvas.width, files.IMG_0086.canvas.height/2)
					)
				)
				.onComplete(function(diff){
					
					expect(diff.misMatchPercentage).toBe('50.00');
					expect(diff.dimensionDifference.width).toBe(0);
					expect(diff.dimensionDifference.height).toBe(files.IMG_0086.canvas.height/2);
					done();
						
				});

		});


	});

	describe("resize", function() {

		it("should still resemble file after resized and blew up", function(done) {

			var smallVersion = ImageMethods.resize(files.IMG_0086.canvas, files.IMG_0086.canvas.width/2, files.IMG_0086.canvas.height/2),
				blewUpVersion = ImageMethods.resize(smallVersion, smallVersion.width*2, smallVersion.height*2);
			
			resemble(files.IMG_0086.blob)
				.compareTo(
					ImageMethods.toBlob(blewUpVersion)
				)
				.onComplete(function(diff){

					// We expect the size of the resized images to be correct
					expect(smallVersion.width).toBe(files.IMG_0086.canvas.width/2);
					expect(smallVersion.height).toBe(files.IMG_0086.canvas.height/2);
					expect(blewUpVersion.width).toBe(files.IMG_0086.canvas.width);
					expect(blewUpVersion.height).toBe(files.IMG_0086.canvas.height);

					// Expect images to be similar, but not the same
					expect(Number(diff.misMatchPercentage) > 0).toBe(true);
					expect(Number(diff.misMatchPercentage) < 10).toBe(true);
					
					done();
				});

		});


	});

	describe("toBlob", function() {

		it("should not change how the file resembles", function(done) {
				
			resemble(files.IMG_0086.blob)
				.compareTo(
					ImageMethods.toBlob(files.IMG_0086.canvas)
				)
				.onComplete(function(diff) {
					expect(diff.misMatchPercentage).toBe('0.00');
					done();
				});

		});


	});

	describe("getOrientationFromFile", function() {

		it("identifies photos rotated via EXIF orientation", function(done) {
			ImageMethods.getOrientationFromFile(files.IMG_0032.blob, function(rotate) {
				expect(rotate).toBe(90);
				done();
			});
		});

		it("identifies photos not rotated via EXIF orientation", function(done) {
			ImageMethods.getOrientationFromFile(files.IMG_0086.blob, function(rotate) {
				expect(rotate).toBe(0);
				done();
			});
		});

	});
	
});

	
// });