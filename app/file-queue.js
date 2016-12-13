'use strict';

let allFiles = [];
let queueIndex = -1;

const run = function (processor) {
  queueIndex++;

  if (queueIndex >= allFiles.length) {
    queueIndex--;
    return;
  }

  processor(queueIndex);
  run(processor);
};

const add = function (path) {
  allFiles.push({
    path: path,
  });
};

const getInfo = function (fileId) {
  return allFiles[fileId];
};

const setInfo = function (fileId, opts) {
  allFiles[fileId] = merge(allFiles[fileId], opts);
};

module.exports = {
  run: run,
  add: add,
  getInfo: getInfo,
  setInfo: setInfo,
};
