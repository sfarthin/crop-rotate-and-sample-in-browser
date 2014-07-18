define(["jquery", "js/image-manipulation", "jcrop"], function($, ImageMethods) {
	
	return function($scope, $http) {
		
		/**
		*
		* File is selected from input element
		*
		**/
		$scope.selectFile = function(file) {
		
			/**
			*
			* Parse File and get img
			*
			**/
			ImageMethods.parseFile(file, function(_canvas, _img, _rotate, _exif) {
				$scope.$apply(function() {
					$scope.canvas = _canvas;
					$scope.img = _img;
					$scope.rotate = _rotate;
					$scope.exif = _exif;
					$scope.filename = file.name;
			
					$scope.photoSelected = true;
					$scope.generateCropArea();
				});

			});
		};
		
		// Handle File Input (hack)
		window.photoSelection = function(input) {
			
			$scope.selectFile(input.files[0]);
			
			// This allows the change event to be triggered in the future
			$(input).replaceWith( $(input).val('').clone( true ) );
		};
		
		/**
		*
		* Allow user to rotate image
		*
		**/		
		$scope.rotateMore = function() {
			$scope.rotate = ($scope.rotate + 90) % 360
			$scope.generateCropArea();
		};
		
		/**
		*
		* When a user clicks Finish on crop dialog
		*
		**/
		$scope.acceptCrop = function() {

			$scope.loading = true;

			var selection = $scope.jcrop.tellSelect();
		
			// Lets apply the filters
		    var portraitCanvas = ImageMethods.rotate($scope.canvas, $scope.rotate);
			portraitCanvas = ImageMethods.crop(portraitCanvas, selection.x, selection.y, selection.w, selection.h);
		    portraitCanvas = ImageMethods.resize(portraitCanvas, 200, 240);

			$http.post("/upload", {
				filename: $scope.filename
			}).success(function(fields) {
				
				ImageMethods.xhrUpload("https://"+fields.bucket+".storage.googleapis.com/", portraitCanvas, $scope.filename, fields, function() {
					$scope.$apply(function() {
						
						// Lets set our url
						$scope.loading = false;
						$scope.uploaded = true;
						$scope.photo = "https://"+fields.bucket+".storage.googleapis.com/" + fields.key;
						
					});
				});
				
			}).error(function() {
				$scope.loading = false;
				alert("Error Uploading Image");
			});

		}
		
		/**
		*
		* Create Thumbnail
		*
		**/
		// TODO Resize Event Handler so photo matches modal
		$scope.generateCropArea = function() {
			
			$scope.loading = true;

			var MAX_HEIGHT = $(window).height() - 250;
			console.log(MAX_HEIGHT);
			//$scope.modal.find(".modal-body").css({"min-height": MAX_HEIGHT + 50});
			
			if($scope.jcrop) $scope.jcrop.destroy();
			
			// Create a thumb
			var H = (MAX_HEIGHT < $scope.canvas.height ? MAX_HEIGHT : $scope.canvas.height),
				W = Math.floor((H / $scope.canvas.height) * $scope.canvas.width);

			var thumbnail;
			if($scope.rotate) {
				thumbnail = ImageMethods.rotate(ImageMethods.resize($scope.canvas, W, H), $scope.rotate);
			} else {
				thumbnail = ImageMethods.resize($scope.canvas, W, H);
			}

			/**
			*
			* Start jCrop
			*
			**/
			var aspectRatio = 5 / 6, 
				thumbnail_aspect_ratio = $scope.canvas.width / $scope.canvas.height, 
				original_height, original_width, box_width, box_height;
		
			//Rotate image if need be
			if($scope.rotate == 90 || $scope.rotate == 270) {
				original_height = $scope.img.width;
				original_width  = $scope.img.height;
			} else {
				original_height = $scope.img.height;
				original_width  = $scope.img.width;
			}
		
			// calculate bounding box
			if(thumbnail_aspect_ratio > aspectRatio) {
				box_height = original_height;
				box_width  = box_height * aspectRatio; 
			} else {
				box_width = original_width;
				box_height = box_width * aspectRatio;
			}
			
			$scope.loading = false;
	
			setTimeout(function() {
				
			
				$(".cropWrapper").html("").append(thumbnail);
	
				/**
				*
				* Setting up our cropping stuff.
				*
				**/
				$(thumbnail).Jcrop({
					aspectRatio: aspectRatio,
					minSize: [100, 120],
					trueSize: [original_width, original_height],
					bgOpacity: 0.3,
					// Lets place that largest bounding box in the middle of the submitted photo.
					setSelect: [
						original_width/2  - box_width/2,
						original_height/2 - box_height/2,
						original_width/2  + box_width/2,
						original_height/2 + box_height/2,
					]
		        }, function(){ 
			        $scope.jcrop = this; 
			    });				
				
			}, 0);
			
		}
		
	};
	
});