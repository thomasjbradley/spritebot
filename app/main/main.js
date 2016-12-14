'use strict';

const os = require('os');
const path = require('path');
const {ipcRenderer} = require('electron');

const classify = require(__dirname + '/../lib/classify');
const fileHandler = require(__dirname + '/../lib/file-handler');
const sizeHelper = require(__dirname + '/../lib/file-size-helper');
const templateHelper = require(__dirname + '/../lib/template-helper');

const $body = document.body;
const $header = document.getElementById('header');
const $main = document.getElementById('main');
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

const addRow = function (svgObj, opts) {
  let renderedRow = templateHelper.render('row.html', {
    id: classify(svgObj.path),
    filename: path.parse(svgObj.path).base,
    bytesIn: '…',
    bytesOut: '…',
    savings: '…',
  });

  $resultsTable.innerHTML += renderedRow;
};

const updateRow = function (svgObj, opts) {
  const id = classify(svgObj.path);
  const elem = document.getElementById(id);

  if (opts && opts.status && opts.status == 'computing') {
    elem.querySelector('.status-progress').value = 1;
  }

  if (svgObj.bytesIn) {
    elem.querySelector('.size-bytesin').innerText = sizeHelper.bytesToKilobytes(svgObj.bytesIn);
  }

  if (svgObj.bytesOut) {
    elem.querySelector('.size-bytesout').innerText = sizeHelper.bytesToKilobytes(svgObj.bytesOut);
    elem.querySelector('.savings-value').innerText = sizeHelper.diffBytesInKilobytes(svgObj.bytesIn, svgObj.bytesOut);
    elem.querySelector('.status-progress').value = 2;
  }
};

const render = function (svgObj, opts) {
  const id = classify(svgObj.path);
  const elem = document.getElementById(id);

  if (elem) {
    updateRow(svgObj, opts);
  } else {
    addRow(svgObj, opts);
  }
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

  $header.setAttribute('hidden', true);
  fileHandler.filesDropped(e.dataTransfer.files, render, getInterfaceOpts());
  $main.removeAttribute('hidden');
  $saveSpriteSheet.removeAttribute('disabled');

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

ipcRenderer.on('app:blur', function (e) {
  $body.classList.add('window-blurred');
});

ipcRenderer.on('app:focus', function (e) {
  $body.classList.remove('window-blurred');
});
