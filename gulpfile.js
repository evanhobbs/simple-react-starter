var browserify  = require('browserify');
var watchify 	= require('watchify');
var gulp 		= require('gulp');
var connect 	= require('gulp-connect');
var sass 		= require('gulp-sass');
var jshint 		= require('gulp-jshint');
var source 		= require('vinyl-source-stream');

//**************** Server ***************************
gulp.task('server', function(){
	connect.server({
		livereload: true
	});
});

//**************** Build/Watch SASS *****************************
function buildSass() {
	return gulp.src('scss/*.scss')
		.pipe(sass({errLogToConsole: true}))
		.pipe(gulp.dest('css'))
		.pipe(connect.reload());
}

gulp.task('build:sass', buildSass);
gulp.task('watch:sass', function(){
	buildSass();
	gulp.watch('scss/**/*.scss', buildSass);
});

//**************** Lint JS ******************************************
//disabled at the moment since it doesn't respect jsx
// function lintJS() {
//   return gulp.src(['./js/**/*.js', '!./js/**/build.js'])
//     .pipe(jshint())
//     .pipe(jshint.reporter(require('jshint-stylish')));	
// }
// gulp.task('lint:js', lintJS);

// //**************** Build/Watch JS *******************************
//browserify bundler is wrapped in watchify so that it can do fast rebuilds from cache
var buildBundler = watchify(browserify('./js/main.js', {
	// Required watchify args
	cache: {},
	packageCache: {},
	fullPaths: true,
})); 


function buildJS() {
	return buildBundler
		.bundle()
		.on('error', function(err){
			console.log(err.message);
			this.end();
		})
		.pipe(source('build.js'))
		// .pipe(jshint.reporter(require('jshint-stylish')))
		.pipe(gulp.dest('./js'))
		.pipe(connect.reload()); 
}
gulp.task('build:js', ['lint:js'], buildJS);
gulp.task('watch:js', function() {
	// lintJS();
	buildJS();
	buildBundler.on('update', function(){
		console.log('Rebuilding JS (from cache)')
		// lintJS();
		buildJS();
	})
}); 

// //**************** HTML *****************************
gulp.task('watch:html', function(){
	gulp.watch('./index.html', function(){
		connect.reload();
	});
})

//**************** Main Dev Tasks ***********************
gulp.task('dev', ['server', 'watch:sass', 'watch:js', 'watch:html'])
