'use strict';

var gulp = require('gulp');
var server = require('browser-sync');
var plumber = require('gulp-plumber');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// var image = require('gulp-image');
var imagemin = require('gulp-imagemin');

// sass & css optimization task
gulp.task('style', function () {
	gulp.src('assets/sass/style.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer({
				browsers: ['last 4 versions']
			})
		]))
		.pipe(gulp.dest('css/'))
		.pipe(rename('style.min.css'))
		.pipe(csso({
			restructure: true,
			sourceMap: false,
			debug: true
		}))
		.pipe(gulp.dest('css/'))
		.pipe(server.reload({
			stream: true
		}));
});

// common js task
// gulp.task('script', function () {
// 	return gulp.src([
// 			'js/snowstorm-min.js',
// 			'js/jquery.2.1.4.js',
// 			'js/simpleLightbox.js',
// 			'js/mail.js',
// 			'js/main.js'
// 		])
// 		.pipe(concat('script.js'))
// 		.pipe(gulp.dest('js/'))
// 		.pipe(rename('script.min.js'))
// 		.pipe(uglify())
// 		.pipe(gulp.dest('dist/'))
// 		.pipe(server.reload({
// 			stream: true
// 		}));
// });

// server
gulp.task('serve', ['style'], function () {
	server.init({
		server: '.',
		notify: false,
		open: true,
		ui: false
	});

	gulp.watch('assets/sass/**/*.{scss,sass}', ['style']);
	// gulp.watch('js/*.js', ['script']);
	gulp.watch('*.html').on('change', server.reload);
});

// img optimization
gulp.task('img-min', function () {
	gulp.src('img/**/*')
		// .pipe(image())
		.pipe(imagemin())
		.pipe(gulp.dest('build/img/'));
});

// compress image task
gulp.task('compress', ['img-min'], function () {});
