'use strict';

const merge = require('merge-objects');

let allFiles = [];
let queueIndex = -1;

const reset = function () {
  queueIndex = -1;
}

const run = function (processor, opts, before, after) {
  queueIndex++;

  if (queueIndex >= allFiles.length) {
    queueIndex--;
    return;
  }

  processor(allFiles[queueIndex], opts, before, after);
  run(processor, opts, before, after);
};

const getByPath = function (path) {
  return allFiles.find(function (item) {
    return item.path == path;
  });
};

const add = function (path) {
  let svgObj = {
    id: allFiles.length,
    path: path,
  };
  let prevSvgObj = getByPath(path);

  if (prevSvgObj) return prevSvgObj;

  allFiles.push(svgObj);

  return svgObj;
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
