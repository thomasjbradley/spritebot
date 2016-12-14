'use strict';

const merge = require('merge-objects');

let allFiles = [];
let queueIndex = -1;

const reset = function () {
  queueIndex = -1;
}

const run = function (processor, opts, next) {
  queueIndex++;

  if (queueIndex >= allFiles.length) {
    queueIndex--;
    return;
  }

  processor(allFiles[queueIndex], opts, next);
  run(processor, opts, next);
};

const alreadyExists = function (path) {
  let isFound = allFiles.find(function (item) {
    return item.path == path;
  });

  return !!isFound;
};

const add = function (path) {
  if (alreadyExists(path)) return;

  allFiles.push({
    id: allFiles.length,
    path: path,
  });
};

const update = function (svgObj) {
  allFiles[svgObj.id] = merge(allFiles[svgObj.id], svgObj);
};

module.exports = {
  reset: reset,
  run: run,
  add: add,
  update: update,
};
