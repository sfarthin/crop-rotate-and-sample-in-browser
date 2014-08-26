var path = require("path");

// Helper Screenshot method
function ScreenShot(name) {
	browser.takeScreenshot().then(function (png) {
	    var stream = require('fs').createWriteStream(path.resolve(__dirname, "../screenshots/"+name+".jpg"));
	    stream.write(new Buffer(png, 'base64'));
	    stream.end();	
	});
}

describe('Demo', function() {

	it("selects, crops, and uploads a photo", function() {
		
		// Open up our app
		browser.get("http://localhost:3001/");
		
		ScreenShot("1-upload-screen");
		
		// Select our IMG_0032.jpg file from the repo for the file input
		$('input[type="file"]').sendKeys(path.resolve(__dirname, "../test/IMG_0032.jpg"));
		
		// Wait for the editing screen to come up
		browser.wait(function() {
			return browser.isElementPresent(by.css(".photo-editor > .edit"));
		}, 1000);
		
		ScreenShot("2-edit-screen");
		
		// Click finish
		$(".edit .btn-primary").click();
		
		ScreenShot("3-loading-screen");
		
		// Let the file upload to Google Cloud Storage (GCS)
		browser.wait(function() {
			return browser.isElementPresent(by.css(".photo-editor > .finish"));
		}, 8000);
		
		// Let the photo load on the page
		browser.sleep(200);
		
		ScreenShot("4-finish-screen");

		// Confirm the right photo got uploaded
		element(by.binding("photo")).getText().then(function(photoUrl) {
			console.log(photoUrl);
			
			// TODO compare images
		});
		
	});

});