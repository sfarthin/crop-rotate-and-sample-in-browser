var browserify 	= require('browserify'),
	gulp 		= require('gulp'),
	source 		= require('vinyl-source-stream'),
	
	jade = require('gulp-jade'),
	less = require('gulp-less'),
	path = require('path');

gulp.task('browserify', function() {
    return browserify('./src/methods.js')
		
		// Uglify code
		//.transform({ global: true }, 'uglifyify')
		
		// Bundle code into stream
        .bundle()
		
        // Pass desired output filename to vinyl-source-stream
        .pipe(source('image-manipulation.js'))
		
        // Start piping stream to tasks!
        .pipe(gulp.dest('./example/www/js'));
});

gulp.task('less', function () {
	return gulp.src(['example/**/*.less', '!example/www/**'])
		.pipe(less({
			paths: [ 
				path.join(__dirname, 'example/www/bower_components/bootstrap/less'), 
				path.join(__dirname, 'example/www/bower_components/lesshat/build') ]
		}))
		.pipe(gulp.dest('example/www'));
});

gulp.task('jade', function() {
	return gulp.src(['example/index.jade'])
		.pipe(jade({ locals: {} }))
		.pipe(gulp.dest('./example/www'))
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch(['example/index.jade'], ['jade']);
	gulp.watch('example/**/*.less', ['less']);
	gulp.watch('src/**/*', ['browserify']);
});

gulp.task('app', function() {
	require("./example/app");
});

gulp.task('build', ['browserify', 'less', 'jade']);

gulp.task('default', ['browserify', 'less', 'jade', 'app', 'watch']);