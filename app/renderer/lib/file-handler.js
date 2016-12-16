'use strict';

const fs = require('fs');
const dir = require('node-dir');

const svgQueue = require(__dirname + '/svg-queue');
const svgProcessor = require(__dirname + '/svg-processor');
const svgSpriter = require(__dirname + '/svg-spriter');

const reset = function () {
  svgQueue.reset();
  svgSpriter.reset();
};

const processAllFiles = function (renderer, opts) {
  svgQueue.run(
    svgProcessor.optimize,
    opts,
    function (svgObj) {
      renderer(svgObj, {
        status: 'computing',
      });
    },
    function (svgObj) {
      svgQueue.update(svgObj);
      svgSpriter.append(svgObj);
      renderer(svgObj);
    }
  );
};

const reProcessAllFiles = function (renderer, opts) {
  reset();
  processAllFiles(renderer, opts);
};

const findAllSvgsInFolder = function (folderPath, renderer, next) {
  dir.files(folderPath, function (err, files) {
    let svgFiles = files.filter(function (item) {
      return (path.parse(item).ext == '.svg');
    });

    svgFiles.forEach(function (file) {
      let svgObj = svgQueue.add(file);
      renderer(svgObj);
    });

    next();
  });
};

const filesDropped = function (files, renderer, opts) {
  for (let fileOrDir of files) {
    let filepath = fileOrDir.path || fileOrDir;

    if (fs.statSync(filepath).isDirectory()) {
      findAllSvgsInFolder(filepath, renderer, function () {
        processAllFiles(renderer, opts);
      });
    } else {
      let svgObj;

      if (path.parse(filepath).ext !== '.svg') continue;

      svgObj = svgQueue.add(filepath);
      renderer(svgObj);
    }
  }

  processAllFiles(renderer, opts);
};

const generateSpriteSheet = function (opts, next) {
  opts.sprites = true;

  svgSpriter.compile(svgProcessor.generateStringOptimizer(opts), function (sprites) {
    next(sprites);
  });
};

const saveSpriteSheet = function (filepath, opts) {
  generateSpriteSheet(opts, function (sprites) {
    fs.writeFile(filepath, sprites);
  });
};

module.exports = {
  reset: reset,
  processAllFiles: reProcessAllFiles,
  filesDropped: filesDropped,
  generateSpriteSheet: generateSpriteSheet,
  saveSpriteSheet: saveSpriteSheet,
};
