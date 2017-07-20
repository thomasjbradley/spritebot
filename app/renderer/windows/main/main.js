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
const $addSvgs = document.getElementById('add-svgs');
const $saveSpriteSheet = document.getElementById('save-sprite-sheet');

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
    filename: svgObj.filename,
    bytesIn: '…',
    bytesOut: '…',
    savings: '…',
  });

  $resultsTable.innerHTML += renderedRow;
};

const deleteOldSymbolRows = function (svgObj) {
  let oldRows = document.querySelectorAll(`[data-parent-id^="${svgObj.id}"]`);

  [].forEach.call(oldRows, function (row) {
    row.remove();
  });
};

const addSymbolRows = function (svgObj) {
  const parent = document.getElementById(svgObj.id);

  deleteOldSymbolRows(svgObj);

  for (let symbol of Object.values(svgObj.symbols)) {
    let tempTable = document.createElement('table');
    let renderedRow = templateHelper.render('symbol-row.html', {
      id: symbol.id,
      filename: symbol.filename,
      parentId: svgObj.id,
    });

    tempTable.innerHTML += renderedRow;

    parent.after(tempTable.querySelector('tr:first-child'));
  };
};

const updateRow = function (svgObj, opts) {
  const elem = document.getElementById(svgObj.id);

  if (svgObj.symbols) {
    addSymbolRows(svgObj);
  }

  if (!opts && !svgObj.bytesOut) elem.querySelector('.status-progress').value = 0;
  if (opts && opts.status && opts.status == 'computing') elem.querySelector('.status-progress').value = 1;

  if (svgObj.bytesIn) {
    elem.querySelector('.size-bytesin').innerText = sizeHelper.bytesToKilobytes(svgObj.bytesIn);
  }

  if (svgObj.bytesOut) {
    elem.querySelector('.status-progress').value = 2;

    if (svgObj.reverted) {
      elem.querySelector('.size-bytesout').innerText = sizeHelper.bytesToKilobytes(svgObj.bytesIn);
      elem.querySelector('.savings-value').innerText = '0';
    } else {
      elem.querySelector('.size-bytesout').innerText = sizeHelper.bytesToKilobytes(svgObj.bytesOut);
      elem.querySelector('.savings-value').innerText = sizeHelper.diffBytesInKilobytes(svgObj.bytesIn, svgObj.bytesOut);
    }
  }

  if (svgObj.reverted) {
    elem.dataset.reverted = true;
  } else {
    elem.dataset.reverted = false;
  }
};

const render = function (svgObj, opts) {
  const elem = document.getElementById(svgObj.id);

  if (elem) {
    updateRow(svgObj, opts);
  } else {
    addRow(svgObj, opts);
  }
};

const svgWhole = function (id, next) {
  const svgObj = fileHandler.get(id);

  fileHandler.minify(id, { pretty: true }, function (svg) {
    svg = svg
      .replace(/\<svg([^>])\s*id="[^"]+"/, '<svg$1')
      .replace(/\<svg/, `<svg id="${svgObj.filenamePretty}"`)
      .replace(/ +/g, ' ')
    ;

    next(svg);
  });
};

const svgUseStatement = function (id, next) {
  const svgObj = fileHandler.get(id);

  next(`<svg><use xlink:href="#${svgObj.filenamePretty}" /></svg>`);
};

const svgSymbol = function (id, next) {
  const svgObj = fileHandler.get(id);

  fileHandler.minify(id, { pretty: true }, function (svg) {
    svg = svg
      .replace(/\<svg([^>])\s*id="[^"]+"/, '<svg$1')
      .replace(/\<svg/, `<symbol id="${svgObj.filenamePretty}"`)
      .replace(/\<\/svg/, '</symbol')
      .replace(/ (width|height)="\d+"/g, '')
      .replace(/ +/g, ' ')
    ;

    next(svg);
  });
};

const svgToDataUri = function (id, next) {
  const prefix = 'data:image/svg+xml,';

  fileHandler.minify(id, { pretty: false }, function (svg) {
    svg = svg
      .replace(/"/g, '\'')
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/{/g, '%7B')
      .replace(/}/g, '%7D')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/\s+/g,' ')
    ;

    next(prefix + svg);
  });
};

const getFocusedFile = function () {
  return $resultsTable.querySelector('[data-state="focused"]');
};

const addFiles = function (files) {
  $header.setAttribute('hidden', true);
  fileHandler.add(files, render, { pretty: false });
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

const toggleRevertOptimizeMenus = function () {
  if (getFocusedFile().dataset.reverted === 'true') {
    ipcRenderer.send('menu:enable-re-optimize');
  } else {
    ipcRenderer.send('menu:enable-revert-to-original');
  }
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
  toggleRevertOptimizeMenus();
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

$saveSpriteSheet.addEventListener('click', function (e) {
  ipcRenderer.send('app:show-save-dialog');
});

$addSvgs.addEventListener('click', function (e) {
  ipcRenderer.send('app:show-add-dialog');
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
  toggleRevertOptimizeMenus();
});

ipcRenderer.on('app:save-sprite-sheet', function (e, filepath) {
  fileHandler.compile({ pretty: false }, function (sprites) {
    fs.writeFile(filepath, sprites);
  });
});

ipcRenderer.on('app:copy-svg-sprite-sheet', function (e) {
  fileHandler.compile({ pretty: true }, function (sprites) {
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
  ipcRenderer.send('app:clear-file-list');
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

ipcRenderer.on('app:copy-svg', function (e) {
  svgWhole(getFocusedFile().id, function (svg) {
    clipboard.writeText(svg);
  });
});

ipcRenderer.on('app:copy-svg-use', function (e) {
  svgUseStatement(getFocusedFile().id, function (svg) {
    clipboard.writeText(svg);
  });
});

ipcRenderer.on('app:copy-svg-symbol', function (e) {
  svgSymbol(getFocusedFile().id, function (svg) {
    clipboard.writeText(svg);
  });
});

ipcRenderer.on('app:copy-svg-datauri', function (e) {
  svgToDataUri(getFocusedFile().id, function (svg) {
    clipboard.writeText(svg);
  });
});

ipcRenderer.on('app:revert-to-original', function () {
  updateRow(fileHandler.revert(getFocusedFile().id));
  toggleRevertOptimizeMenus();
});

ipcRenderer.on('app:re-optimize', function () {
  updateRow(fileHandler.optimize(getFocusedFile().id));
  toggleRevertOptimizeMenus();
});
