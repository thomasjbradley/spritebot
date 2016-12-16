'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const {ipcRenderer, clipboard, shell} = require('electron');

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

const resetInterface = function () {
  reset();
  $header.removeAttribute('hidden');
  $main.setAttribute('hidden', true);
  $saveSpriteSheet.setAttribute('disabled', true);
  ipcRenderer.send('menu:disable-file-items');
  ipcRenderer.send('menu:disable-focused-file-items');
  fileHandler.reset();
};

const addRow = function (svgObj, opts) {
  let renderedRow = templateHelper.render('row.html', {
    id: svgObj.id,
    filename: path.parse(svgObj.path).base,
    bytesIn: '…',
    bytesOut: '…',
    savings: '…',
  });

  $resultsTable.innerHTML += renderedRow;
};

const updateRow = function (svgObj, opts) {
  const elem = document.getElementById(svgObj.id);

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

const getFocusedFile = function () {
  return $resultsTable.querySelector('[data-state="focused"]');
};

const addFiles = function (files) {
  $header.setAttribute('hidden', true);
  fileHandler.add(files, render, getInterfaceOpts());
  $main.removeAttribute('hidden');
  $saveSpriteSheet.removeAttribute('disabled');
  ipcRenderer.send('menu:enable-file-items');
};

const removeFile = function (tr) {
  fileHandler.remove(tr.id);
  tr.parentNode.removeChild(tr);
  checkIfLastFile();
};

const removeAllFiles = function () {
  resetInterface();
}

const checkIfLastFile = function () {
  let $trTags = $resultsTable.querySelector('tr');

  if (!$trTags || $trTags.length <= 0) resetInterface();
}

const togglePrettyOutput = function () {
  ipcRenderer.send('menu:set-pretty-output', getInterfaceOpts().pretty);
  reset();
  fileHandler.process(render, getInterfaceOpts(), fileHandler.RE_START_PROCESSOR);
};

const moveFocus = function (direction) {
  const current = getFocusedFile();
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

  getFocusedFile().scrollIntoViewIfNeeded(false);
};

const revealInFinder = function (tr) {
  const svg = fileHandler.get(tr.id);

  if (svg) shell.showItemInFolder(svg.path);
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

$body.addEventListener('click', function (e) {
  if (e.target.matches('.btn-remove-file')) {
    removeFile(e.target.closest('tr'));
    return;
  }

  if (e.target.matches('.btn-reveal-in-finder')) {
    revealInFinder(e.target.closest('tr'));
    return;
  }
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
  const current = getFocusedFile();
  let tr;

  if (current) {
    current.dataset.state = '';
    current.setAttribute('aria-selected', false);
  }

  tr = e.target.closest('tr');
  tr.dataset.state = 'focused';
  tr.setAttribute('aria-selected', true);
  ipcRenderer.send('menu:enable-focused-file-items');
});

ipcRenderer.on('app:save-sprite-sheet', function (e, filepath) {
  fileHandler.compile(getInterfaceOpts(), function (sprites) {
    fs.writeFile(filepath, sprites);
  });
});

ipcRenderer.on('app:copy-svg-sprite-sheet', function (e) {
  fileHandler.compile(getInterfaceOpts(), function (sprites) {
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

ipcRenderer.on('app:remove-file', function (e) {
  removeFile(getFocusedFile());
});

ipcRenderer.on('app:reveal-in-finder', function (e) {
  revealInFinder(getFocusedFile());
});
