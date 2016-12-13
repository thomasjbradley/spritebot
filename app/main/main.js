'use strict';

const os = require('os');
const path = require('path');
// const electron = require('electron');
// const shell = electron.shell;
// const listener = electron.ipcRenderer;

const fileHandler = require(__dirname + '/../lib/file-handler');
const sizeHelper = require(__dirname + '/../lib/file-size-helper');
const templateHelper = require(__dirname + '/../lib/template-helper');

const $body = document.body;
const $resultsTable = document.getElementById('results-table');
const $prettyOutput = document.getElementById('pretty-output');
const $saveSpriteSheet = document.getElementById('save-sprite-sheet');

const reset = function () {
  $resultsTable.innerHTML = '';
};

const render = function (svgObj) {
  let renderedRow = templateHelper.render('row', {
    filename: path.parse(svgObj.path).base,
    bytesIn: sizeHelper.bytesToKilobytes(svgObj.bytesIn),
    bytesOut: sizeHelper.bytesToKilobytes(svgObj.bytesOut),
    savings: sizeHelper.diffBytesInKilobytes(svgObj.bytesIn, svgObj.bytesOut),
  });

  $resultsTable.innerHTML += renderedRow;
};

$body.classList.add(`os-${os.platform()}`);

$body.ondragover = function (e) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';

  return false;
};

$body.ondragleave = function (e) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();

  return false;
};

$body.ondrop = function (e) {
  e.preventDefault();

  fileHandler.filesDropped(e.dataTransfer.files, render, {
    pretty: $prettyOutput.checked,
  });

  return false;
};

window.addEventListener('will-navigate', function (e) {
  e.preventDefault();
});

$prettyOutput.addEventListener('change', function (e) {
  reset();

  fileHandler.processAllFiles(render, {
    pretty: $prettyOutput.checked,
  });
});
