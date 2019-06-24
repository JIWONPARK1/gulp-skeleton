const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync =  require('browser-sync').create();
const includer = require('gulp-html-ssi');
const babel = require('gulp-babel');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const spritesmith = require('gulp.spritesmith');
const merge = require('merge-stream');


const paths = {
    style : {
        src : 'public/scss/**/style.scss',
        wholeSrc :'public/scss/**/*.scss',
        dist : 'public/css'
    },
    html : {
        src :'public/**/**/**/*.html',
        dist : 'dist/'
    },
    js : {
        src :'public/js/es6/**/*.js',
        dist : 'public/js'
    },
    sprite : {
        src :'public/images/sprite/**/*.png',
        dist :'public/images' ,
        distScss : 'public/scss'
    }

};

// html include
function htmlSSI(){
    return gulp.src(paths.html.src)
    .pipe(includer())
    .pipe(gulp.dest(paths.html.dist))
    .pipe(browserSync.stream())
}

// sass > css / minify / sourcemap
function style(){
    return gulp.src(paths.style.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error',sass.logError))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(paths.style.dist))
    .pipe(browserSync.stream())
}

// es6 문법 변환
function jsBabel() {
    return gulp.src(paths.js.src)
    .pipe(babel({
        presets : ['@babel/env']
    }))
    .pipe(gulp.dest(paths.js.dist))
    .pipe(browserSync.stream())
}

// imagesprite
function sprite(){
    const spriteData = gulp.src(paths.sprite.src)
    .pipe(spritesmith({
        imgName: 'sprite.png',
        padding: 4,
        cssName: 'sprite.scss',
        imgPath: '../images/sprite.png'
    }));
    const imgStream = spriteData.img
    .pipe(gulp.dest(paths.sprite.dist));

    const cssStream = spriteData.css
    .pipe(gulp.dest(paths.sprite.distScss));

    return merge (imgStream, cssStream)
    .pipe(browserSync.stream())
}

// 정리

function clean(){
    return del(['dist'])
}

//watch
function watch() {
    browserSync.init({
        server : {
            baseDir: "./",
            index : 'dist/html/main/index.html'
        },
    });

    gulp.watch(paths.style.wholeSrc, style);
    gulp.watch(paths.html.src).on('change', htmlSSI , browserSync.reload  );
    gulp.watch(paths.html.src, htmlSSI); 
    gulp.watch(paths.js.src, jsBabel);
    gulp.watch(paths.sprite.src, sprite);
}


const build  = gulp.series(clean, gulp.parallel(htmlSSI,style,jsBabel,sprite,watch));

exports.style = style;
exports.htmlSSI = htmlSSI;
exports.jsBabel = jsBabel;
exports.watch = watch;
exports.sprite = sprite;

exports.default = build;
