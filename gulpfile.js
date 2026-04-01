const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();
const del = require('del');

// Paths
const paths = {
  src: {
    html: 'src/*.html',
    scss: 'src/scss/main.scss',
    js: 'src/js/**/*.js',
    img: 'src/img/**/*.{jpg,jpeg,png,gif,webp,svg}',
    svg: 'src/svg/**/*.svg',
    fonts: 'src/fonts/**/*',
    assets: 'src/assets/**/*'
  },
  watch: {
    html: 'src/**/*.html',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js',
    img: 'src/img/**/*.{jpg,jpeg,png,gif,webp,svg}',
    svg: 'src/svg/**/*.svg'
  },
  dist: {
    html: 'dist/',
    css: 'dist/css/',
    js: 'dist/js/',
    img: 'dist/img/',
    svg: 'dist/img/',
    fonts: 'dist/fonts/',
    assets: 'dist/assets/'
  },
  clean: 'dist/'
};

// Production mode flag
let isProd = false;

// Error handler
const handleError = (title) => {
  return plumber({
    errorHandler: notify.onError({
      title: title,
      message: 'Error: <%= error.message %>'
    })
  });
};

// Clean dist folder
const clean = () => {
  return del([paths.clean]);
};

// HTML task
const html = () => {
  return gulp.src(paths.src.html)
    .pipe(handleError('HTML'))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.dist.html))
    .pipe(browserSync.stream());
};

// SCSS task
const styles = () => {
  return gulp.src(paths.src.scss, { sourcemaps: !isProd })
    .pipe(handleError('SCSS'))
    .pipe(sass({
      includePaths: ['node_modules']
    }))
    .pipe(autoprefixer({
      cascade: false,
      grid: true
    }))
    .pipe(gulpif(isProd, cleanCSS({
      level: 2
    })))
    .pipe(rename({
      basename: 'style',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist.css, { sourcemaps: !isProd ? '.' : false }))
    .pipe(browserSync.stream());
};

// JavaScript task
const scripts = () => {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/owl.carousel/dist/owl.carousel.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    paths.src.js
  ], { sourcemaps: !isProd })
    .pipe(handleError('JS'))
    .pipe(concat('main.min.js'))
    .pipe(gulpif(isProd, uglify()))
    .pipe(gulp.dest(paths.dist.js, { sourcemaps: !isProd ? '.' : false }))
    .pipe(browserSync.stream());
};

// Images task - simple copy without processing
const images = () => {
  return gulp.src(paths.src.img, { encoding: false })
    .pipe(newer(paths.dist.img))
    .pipe(gulp.dest(paths.dist.img))
    .pipe(browserSync.stream());
};

// SVG Sprite task
const svg = () => {
  return gulp.src(paths.src.svg)
    .pipe(handleError('SVG'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg',
          example: !isProd
        }
      },
      shape: {
        transform: [
          {
            svgo: {
              plugins: [
                { name: 'removeViewBox', active: false },
                { name: 'removeUnusedNS', active: false },
                { name: 'removeUselessStrokeAndFill', active: true },
                { name: 'cleanupIDs', active: false },
                { name: 'removeComments', active: true },
                { name: 'removeEmptyAttrs', active: true },
                { name: 'removeEmptyText', active: true },
                { name: 'collapseGroups', active: true }
              ]
            }
          }
        ]
      }
    }))
    .pipe(gulp.dest(paths.dist.svg))
    .pipe(browserSync.stream());
};

// Fonts task
const fonts = () => {
  return gulp.src(paths.src.fonts, { allowEmpty: true })
    .pipe(gulp.dest(paths.dist.fonts));
};

// Assets task (copy as-is)
const assets = () => {
  return gulp.src(paths.src.assets, { allowEmpty: true })
    .pipe(gulp.dest(paths.dist.assets));
};

// BrowserSync server
const server = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    port: 3000,
    notify: false,
    open: true
  });
};

// Watch files
const watchFiles = () => {
  gulp.watch(paths.watch.html, html);
  gulp.watch(paths.watch.scss, styles);
  gulp.watch(paths.watch.js, scripts);
  gulp.watch(paths.watch.img, images);
  gulp.watch(paths.watch.svg, svg);
};

// Set production mode
const setProd = (done) => {
  isProd = true;
  done();
};

// Tasks
const dev = gulp.series(
  clean,
  gulp.parallel(html, styles, scripts, images, svg, fonts, assets),
  gulp.parallel(watchFiles, server)
);

const build = gulp.series(
  setProd,
  clean,
  gulp.parallel(html, styles, scripts, images, svg, fonts, assets)
);

// Export tasks
exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.svg = svg;
exports.fonts = fonts;
exports.assets = assets;
exports.build = build;
exports.default = dev;
