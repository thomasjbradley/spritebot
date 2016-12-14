'use strict';

const os = require('os');
const path = require('path');
const {ipcRenderer} = require('electron');

const fileHandler = require(__dirname + '/../lib/file-handler');
const sizeHelper = require(__dirname + '/../lib/file-size-helper');
const templateHelper = require(__dirname + '/../lib/template-helper');

const $body = document.body;
const $resultsTable = document.getElementById('results-table');
const $prettyOutput = document.getElementById('pretty-output');
const $saveSpriteSheet = document.getElementById('save-sprite-sheet');

const getInterfaceOpts = function () {
  return {
    pretty: $prettyOutput.checked,
  };
};

const reset = function () {
  $resultsTable.innerHTML = '';
};

const render = function (svgObj) {
  let renderedRow = templateHelper.render('row.html', {
    filename: path.parse(svgObj.path).base,
    bytesIn: sizeHelper.bytesToKilobytes(svgObj.bytesIn),
    bytesOut: sizeHelper.bytesToKilobytes(svgObj.bytesOut),
    savings: sizeHelper.diffBytesInKilobytes(svgObj.bytesIn, svgObj.bytesOut),
  });

  $resultsTable.innerHTML += renderedRow;
};

$body.classList.add(`os-${os.platform()}`);

$body.addEventListener('dragover', function (e) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';

  return false;
}, true);

$body.addEventListener('dragleave', function (e) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();

  return false;
}, true);

$body.addEventListener('drop', function (e) {
  e.preventDefault();

  fileHandler.filesDropped(e.dataTransfer.files, render, getInterfaceOpts());

  return false;
}, true);

window.addEventListener('will-navigate', function (e) {
  e.preventDefault();
});

$prettyOutput.addEventListener('change', function (e) {
  reset();

  fileHandler.processAllFiles(render, getInterfaceOpts());
});

$saveSpriteSheet.addEventListener('click', function (e) {
  ipcRenderer.send('app:show-save-dialog');
});

ipcRenderer.on('app:save-sprite-sheet', function (e, filepath) {
  fileHandler.saveSpriteSheet(filepath, getInterfaceOpts());
});
