'use strict';

const fs = require('fs');
const dir = require('node-dir');

const svgQueue = require(__dirname + '/svg-queue');
const svgProcessor = require(__dirname + '/svg-processor');
const svgSpriter = require(__dirname + '/svg-spriter');

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
  svgQueue.reset();
  svgSpriter.reset();
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
    if (fs.statSync(fileOrDir.path).isDirectory()) {
      findAllSvgsInFolder(fileOrDir.path, renderer, function () {
        processAllFiles(renderer, opts);
      });
    } else {
      let svgObj = svgQueue.add(fileOrDir.path);
      renderer(svgObj);
    }
  }

  processAllFiles(renderer, opts);
};

const saveSpriteSheet = function (filepath, opts) {
  opts.sprites = true;

  svgSpriter.compile(svgProcessor.generateStringOptimizer(opts), function (sprites) {
    fs.writeFile(filepath, sprites);
  });
};

module.exports = {
  processAllFiles: reProcessAllFiles,
  filesDropped: filesDropped,
  saveSpriteSheet: saveSpriteSheet,
};
