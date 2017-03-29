'use strict';

const path = require('path');
const merge = require('merge-objects');

const classify = require(__dirname + '/../../shared/classify');

let svgs = [];
let queueIndex = -1;

const findIndex = function (id) {
  return svgs.findIndex(function (item) {
    return item.id == id;
  });
};

const restart = function () {
  queueIndex = -1;
};

const reset = function () {
  restart();
  svgs = [];
};

const run = function (processor, opts, before, after) {
  queueIndex++;

  if (queueIndex >= svgs.length) {
    queueIndex--;
    return;
  }

  processor(svgs[queueIndex], opts, before, after);
  run(processor, opts, before, after);
};

const getByPath = function (filepath) {
  return svgs.find(function (item) {
    return item.path == filepath;
  });
};

const add = function (filepath) {
  let svgObj = {
    id: classify(filepath),
    path: filepath,
    filename: path.parse(filepath).base,
    filenamePretty: classify(path.parse(filepath).base.replace(/\.svg$/, '')),
  };
  let prevSvgObj = getByPath(filepath);

  if (prevSvgObj) return prevSvgObj;

  svgs.push(svgObj);

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
