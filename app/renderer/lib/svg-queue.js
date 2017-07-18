'use strict';

const path = require('path');
const merge = require('merge-objects');

const classify = require(__dirname + '/../../shared/classify');

let svgs = [];
let queue = [];

const findIndex = function (id) {
  return svgs.findIndex(function (item) {
    return item.id == id;
  });
};

const getByPath = function (filepath) {
  return svgs.find(function (item) {
    return item.path == filepath;
  });
};

const restart = function () {
  queue = [...svgs.keys()];
};

const reset = function () {
  restart();
  svgs = [];
};

const run = function (processor, opts, before, after) {
  if (queue.length <= 0) return;

  processor(svgs[queue.shift()], opts, before, after);
  run(processor, opts, before, after);
};

const add = function (filepath) {
  let svgObj;
  let prevSvgObj = getByPath(filepath);

  if (prevSvgObj) {
    prevSvgObj.original = false;
    prevSvgObj.optimized = false;
    queue.push(findIndex(prevSvgObj.id));
    svgObj = prevSvgObj;
  } else {
    svgObj = {
      id: classify(filepath),
      path: filepath,
      filename: path.parse(filepath).base,
      filenamePretty: classify(path.parse(filepath).base.replace(/\.svg$/, '')),
    };

    svgs.push(svgObj);
    queue.push(svgs.length - 1);
  }

  return svgObj;
};

const get = function (id) {
  let index = findIndex(id);

  if (index > -1) return svgs[index];

  return false;
};

const update = function (svgObj) {
  let index = findIndex(svgObj.id);

  svgs[index] = merge(svgs[index], svgObj);
};

const remove = function (id) {
  let index = findIndex(id);

  if (index > -1) svgs.splice(index, 1);
};

module.exports = {
  restart: restart,
  reset: reset,
  run: run,
  add: add,
  get: get,
  update: update,
  remove: remove,
};
