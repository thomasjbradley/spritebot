'use strict';

const os = require('os');
const path = require('path');
const {ipcRenderer, clipboard} = require('electron');

const classify = require(__dirname + '/../../../shared/classify');
const fileHandler = require(__dirname + '/../../lib/file-handler');
const sizeHelper = require(__dirname + '/../../lib/file-size-helper');
const templateHelper = require(__dirname + '/../../lib/template-helper');

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

const addFiles = function (files) {
  $header.setAttribute('hidden', true);
  fileHandler.filesDropped(files, render, getInterfaceOpts());
  $main.removeAttribute('hidden');
  $saveSpriteSheet.removeAttribute('disabled');
  ipcRenderer.send('menu:enable-file-items');
};

const removeAllFiles = function () {
  reset();
  $header.removeAttribute('hidden');
  $main.setAttribute('hidden', true);
  $saveSpriteSheet.setAttribute('disabled', true);
  ipcRenderer.send('menu:disable-file-items');
  ipcRenderer.send('menu:disable-focused-file-items');
  fileHandler.reset();
}

const togglePrettyOutput = function () {
  ipcRenderer.send('menu:set-pretty-output', getInterfaceOpts().pretty);
  reset();
  fileHandler.processAllFiles(render, getInterfaceOpts());
};

const moveFocus = function (direction) {
  const current = $resultsTable.querySelector('[data-state="focused"]');
  const directionSibling = (direction === 'up') ? 'previousElementSibling' : 'nextElementSibling';

  ipcRenderer.send('menu:enable-focused-file-items');

  if (!current) {
    $resultsTable.querySelector('tr:first-child').dataset.state = 'focused';
  } else {
    if (!current[directionSibling]) return;

    current.dataset.state = '';
    current.setAttribute('aria-selected', false);
    current[directionSibling].dataset.state = 'focused';
    current[directionSibling].setAttribute('aria-selected', true);
  }

  $resultsTable.querySelector('[data-state="focused"]').scrollIntoViewIfNeeded(false);
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

  addFiles(e.dataTransfer.files);

  return false;
}, true);

$body.addEventListener('keydown', function (e) {
  $resultsTable.dataset.state = 'not-scrollable';

  switch (e.key) {
    case 'ArrowDown':
      moveFocus('down');
      break;
    case 'ArrowUp':
      moveFocus('up');
      break;
  }
}, true);

$body.addEventListener('keyup', function (e) {
  $resultsTable.dataset.state = 'scrollable';
});

$body.addEventListener('mousemove', function (e) {
  $resultsTable.dataset.state = 'scrollable';
});

window.addEventListener('will-navigate', function (e) {
  e.preventDefault();
});

$prettyOutput.addEventListener('change', function (e) {
  togglePrettyOutput();
});

ipcRenderer.on('app:toggle-pretty-output', function () {
  $prettyOutput.checked = !$prettyOutput.checked;
  togglePrettyOutput();
});

$saveSpriteSheet.addEventListener('click', function (e) {
  ipcRenderer.send('app:show-save-dialog');
});

$resultsTable.addEventListener('mousedown', function (e) {
  const current = $resultsTable.querySelector('[data-state="focused"]');
  let tr;

  if (current) {
    current.dataset.state = '';
    current.setAttribute('aria-selected', false);
  }

  tr = e.target.closest('tr');
  tr.dataset.state = 'focused';
  tr.setAttribute('aria-selected', true);
});

ipcRenderer.on('app:save-sprite-sheet', function (e, filepath) {
  fileHandler.saveSpriteSheet(filepath, getInterfaceOpts());
});

ipcRenderer.on('app:copy-svg-sprite-sheet', function (e) {
  fileHandler.generateSpriteSheet(getInterfaceOpts(), function (sprites) {
    clipboard.writeText(sprites);
  });
});

ipcRenderer.on('app:blur', function (e) {
  $body.classList.add('window-blurred');
});

ipcRenderer.on('app:focus', function (e) {
  $body.classList.remove('window-blurred');
});

ipcRenderer.on('app:add-files', function (e, files) {
  addFiles(files);
});

ipcRenderer.on('app:remove-all-files', function (e) {
  removeAllFiles();
});
