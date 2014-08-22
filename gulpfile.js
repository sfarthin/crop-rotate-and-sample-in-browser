var browserify 	= require('browserify'),
	gulp 		= require('gulp'),
	source 		= require('vinyl-source-stream'),
	
	jade = require('gulp-jade'),
	less = require('gulp-less'),
	path = require('path');

gulp.task('browserify', function() {
    return browserify('./example/scripts.js')
        .bundle({debug: true})
        .pipe(source('scripts.js'))
        .pipe(gulp.dest('./example/www'));
});

// This is for Bower only
gulp.task('build', function() {
    return browserify('./src/methods.js')
		.transform({ global: true }, 'uglifyify')
        .bundle()
        .pipe(source('image-manipulation.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('less', function () {
	return gulp.src(['example/**/*.less', '!example/www/**', '!example/bower_components/**'])
		.pipe(less({
			paths: [ 
				path.join(__dirname, 'bower_components/bootstrap/less'), 
				path.join(__dirname, 'bower_components/lesshat/build'),
				path.join(__dirname, 'bower_components/jcrop/css') 
			]
		}))
		.pipe(gulp.dest('example/www'));
});

gulp.task('jade', function() {
	return gulp.src(['example/index.jade'])
		.pipe(jade({ locals: {} }))
		.pipe(gulp.dest('./example/www'))
});

// Watch file changes for our library and example app
gulp.task('watch', function() {
	gulp.watch(['example/index.jade'], ['jade']);
	gulp.watch(['example/**/*.less'], ['less']);
	gulp.watch(['src/**/*', 'example/**/*.js', '!example/www/**'], ['browserify']);
});

// Run our example app
gulp.task('app', function() {
	require("./example/app");
});

// Browsify for changes and watch for changes, and run our example app
gulp.task('default', ['browserify', 'less', 'jade', 'app', 'watch']);