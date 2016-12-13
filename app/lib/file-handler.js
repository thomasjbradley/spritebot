'use strict';

const fs = require('fs');
const dir = require('node-dir');

const svgQueue = require(__dirname + '/svg-queue');
const svgProcessor = require(__dirname + '/svg-processor');

const processAllFiles = function (render, opts) {
  svgQueue.run(svgProcessor.optimize, opts, function (svgObj) {
    svgQueue.update(svgObj);
    render(svgObj);
  });
};

const reProcessAllFiles = function (render, opts) {
  svgQueue.reset();
  processAllFiles(render, opts);
};

const findAllSvgsInFolder = function (folderPath, next) {
  dir.files(folderPath, function (err, files) {
    let svgFiles = files.filter(function (item) {
      return (path.parse(item).ext == '.svg');
    });

    svgFiles.forEach(function (file) {
      svgQueue.add(file);
    });

    next();
  });
};

const filesDropped = function (files, renderer, opts) {
  for (let fileOrDir of files) {
    if (fs.statSync(fileOrDir.path).isDirectory()) {
      findAllSvgsInFolder(fileOrDir.path, function () {
        processAllFiles(render, opts);
      });
    } else {
      svgQueue.add(fileOrDir.path);
    }
  }

  processAllFiles(render, opts);
};

module.exports = {
  processAllFiles: reProcessAllFiles,
  filesDropped: filesDropped,
};
