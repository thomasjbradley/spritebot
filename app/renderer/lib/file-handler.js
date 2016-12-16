'use strict';

const RE_START_PROCESSOR = 're-run-processor';

const fs = require('fs');
const dir = require('node-dir');

const svgQueue = require(__dirname + '/svg-queue');
const svgProcessor = require(__dirname + '/svg-processor');
const svgSpriter = require(__dirname + '/svg-spriter');

const reset = function () {
  svgQueue.reset();
  svgSpriter.reset();
};

const processAllFiles = function (renderer, opts, restart) {
  if (restart === RE_START_PROCESSOR) {
    svgQueue.restart();
    svgSpriter.reset();
  }

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

const add = function (files, renderer, opts) {
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

const get = function (id) {
  return svgQueue.get(id);
};

const remove = function (id) {
  svgQueue.remove(id);
  svgSpriter.remove(id);
};

const compile = function (opts, next) {
  opts.sprites = true;

  svgSpriter.compile(svgProcessor.getOptimizer(opts), function (sprites) {
    next(sprites);
  });
};

module.exports = {
  RE_START_PROCESSOR: RE_START_PROCESSOR,
  reset: reset,
  process: processAllFiles,
  add: add,
  get: get,
  remove: remove,
  compile: compile,
};
