requirejs.config({
    shim: {
		angular: { exports: 'angular' },
		jquery:  { exports: '$' },
		underscore: { exports: '_'},
		jcrop: { deps: ["jquery", "css!bower_components/jcrop/css/jquery.Jcrop.css"] },
		"js/image-manipulation": { exports: 'ImageMethods' },
	},
	
	map: {
	  '*': {
	    'css': 'css', // or whatever the path to require-css is
		'less': 'less' // path to less
	  }
	},
	
	paths: {
		angular: 	"bower_components/angular/angular",
		underscore: "bower_components/underscore/underscore",
		jquery: 	"bower_components/jquery/dist/jquery",
		jcrop: 		"bower_components/jcrop/js/jquery.Jcrop",
        css: 		"bower_components/require-css/css"
	}
});

require(["angular", "js/photoController"], function(angular, photoController) {
	angular.module("PhotoUpload",[])
		.controller("PhotoController", photoController);
	
	angular.bootstrap(document, ['PhotoUpload']);
});