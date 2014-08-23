var angular = require("angular"),
	$ = require("jquery"),
	ImageMethods = require("../src/methods");
	
require("jcrop");

angular.module("PhotoUploadApp",[])

	.controller("PhotoController", function($scope, $http) {
	
		// This method is called when an input element changes using the hack below
		$scope.selectFile = function(file) {
	
			// Lets get a canvas from the file and orientation according to EXIF data 
			// and setup the interface for the user to crop
			ImageMethods.getCanvasFromFile(file, function(canvas) {
				$scope.$apply(function() {
					$scope.canvas = canvas;
					$scope.rotate = 0;
					$scope.filename = file.name;
		
					$scope.photoSelected = true;
					$scope.generateCropArea();
				});

			});
		};
	
		// Handle File Input (hack)...
		// By adding onchange="photoSelection(this);" we can ensure the input element 
		// is bound even if it is replaced (see below)
		window.photoSelection = function(input) {
		
			// Let angular know a file was selected
			$scope.selectFile(input.files[0]);
		
			// By replacing the input element with an empty input element, we removed whatever file is selected.
			// This allows the change event to be triggered in the future.
			$(input).replaceWith( $(input).val('').clone( true ) );
		};
	
		// This method allows users to rotate the canvas
		$scope.rotateMore = function() {
			// use modulus to limit values to 0,90,180,270
			$scope.rotate = ($scope.rotate + 90) % 360;
			
			// Update jCrop if the user rotates the canvas
			$scope.generateCropArea();
		};
	
		// This method uploads our canvas to GCS as an image
		$scope.xhrUpload = function(filename, canvas, fields, callback) {
			var blob = ImageMethods.toBlob(canvas);

			if(!callback) callback = function() {};

			var formData = new FormData();

			for(var i in fields)
				formData.append(i, fields[i]);

			formData.append("file", blob, filename);

			var xhr = new XMLHttpRequest();
			xhr.open('POST', "https://"+fields.bucket+".storage.googleapis.com/", true);
			xhr.onload = function(e) {
				$scope.$apply(function() {
					callback();	
				});
			};

			xhr.onerror = function(e) {
				callback(e);
			};

			xhr.send(formData);
		};
	
		// This is when a user clicks Finish on crop dialog
		// It will do the final thumbnail generation and
		// upload to GCS
		$scope.acceptCrop = function() {
			
			// Lets show a loading screen
			$scope.loading = true;

			// Lets grab the selected area from jCrop
			var selection = $scope.jcrop.tellSelect();
			
			console.log(selection);
	
			// Lets make our thumbnail
			var portraitCanvas = (new ImageMethods($scope.canvas))
				
				// First rotate
				.rotate($scope.rotate)
				
				// Then crop
				.crop(selection.x, selection.y, selection.w, selection.h)
				
				// Lastly make our small thumbnail
				.resize(200, 240)
				
				// Lets return the canvas
				.canvas;

			// Lets first ask permission from our node.js server to upload to GCS
			$http.post("/upload", {
				filename: $scope.filename
			}).success(function(fields) {
			
				// Lets use our helper method to upload to GCS
				$scope.xhrUpload($scope.filename, portraitCanvas, fields, function() {
					// Lets update our UI when the upload finishes
					$scope.loading = false;
					$scope.uploaded = true;
					$scope.photo = "https://"+fields.bucket+".storage.googleapis.com/" + fields.key;
				});
			
			}).error(function() {
				$scope.loading = false;
				alert("Error Uploading Image");
			});

		}
	
		/**
		* Create Thumbnail to match size of screen and allow user to crop a portrait
		* TODO Resize Event Handler so photo fits screen upon resize.
		**/
		$scope.generateCropArea = function() {
		
			// Lets remove any exisiting jcrop interfaces
			if($scope.jcrop) $scope.jcrop.destroy();
		
			// Lets Show the user a loading screen
			$scope.loading = true;

			// Lets get our working canvas and rotate it before continuing, Its rotation will affect the thumbnail size
			var canvas = (new ImageMethods($scope.canvas)).rotate($scope.rotate).canvas,
				
				// Determine the max height our thumbnail can be to fit the user's screen
				MAX_HEIGHT = $(window).height() - 250;
		
			// Determine the max size for our thumbnail
			var H = (MAX_HEIGHT < canvas.height ? MAX_HEIGHT : canvas.height),
				W = Math.floor((H / canvas.height) * canvas.width);
			
			// Resize our thumbnail
			var thumbnail = ImageMethods.resize(canvas, W, H);

			// We only accept photos at 5 / 6
			var aspectRatio = 5 / 6, 
				thumbnail_aspect_ratio = canvas.width / canvas.height, 
				box_width, box_height;
	
			// Lets make a 5/6 bounding box inside our image
			// e.g. If photos is wider than 5/6 then the left and right sides will be chopped
			if(thumbnail_aspect_ratio > aspectRatio) {
				box_height = canvas.height;
				box_width  = box_height * aspectRatio; 
			} else {
				box_width = canvas.width;
				box_height = box_width * (1/aspectRatio);
			}
		
			// We are done stealing the UI
			$scope.loading = false;

			/**
			* Setting up our jCrop stuff.
			**/
			// setTimeout hack for jCrop
			setTimeout(function() {
					
				$(".cropWrapper").html("").append(thumbnail);
				
				$(thumbnail).Jcrop({
					aspectRatio: aspectRatio,
					minSize: [100, 120],
					trueSize: [canvas.width, canvas.height],
					bgOpacity: 0.3,

					// This is where we define our 5/6 preselected bounding box.
					setSelect: [
						canvas.width/2  - box_width/2,
						canvas.height/2 - box_height/2,
						canvas.width/2  + box_width/2,
						canvas.height/2 + box_height/2,
					]
		        }, function(){ 
			        $scope.jcrop = this; 
			    });				
			
			}, 0);
		
		}
	
	});
