'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const dir = require('node-dir');
const merge = require('merge-objects');
const electron = require('electron');
const shell = electron.shell;
const listener = electron.ipcRenderer;

const svgomin = new SVGO(require('./svgo-min.json'));
const svgQueue = require('./app/file-queue');
const svgHelper = require('./app/svg-helper');
const sizeHelper = require('./app/file-size-helper');

const $body = document.body;

const render = function (filePath, bytesIn, bytesOut) {
  console.log(path.parse(filePath).base, sizeHelper.bytesToKilobytes(bytesIn), sizeHelper.bytesToKilobytes(bytesOut), sizeHelper.diffBytesInKilobytes(bytesIn, bytesOut));
};

const optimzeSvg = function (fileId) {
  fs.readFile(svgQueue.getInfo(fileId).path, 'utf8', function (err, data) {
    svgomin.optimize(data, function (svg) {
      svg = svgHelper.process(svg.data);

      svgQueue.setInfo(fileId, {
        original: data,
        optimized: svg,
        bytesIn: Buffer.byteLength(data),
        bytesOut: Buffer.byteLength(svg),
      });

      fs.writeFile(svgQueue.getInfo(fileId).path, svg);
      render(svgQueue.getInfo(fileId));
    });
  });
};

const findAllSvgsInFolder = function (folderPath) {
  dir.files(folderPath, function (err, files) {
    let svgFiles = files.filter(function (item) {
      return (path.parse(item).ext == '.svg');
    });

    svgFiles.forEach(function (file) {
      svgQueue.add(file);
    });

    svgQueue.run(optimzeSvg);
  });
};

const filesDropped = function (files) {
  for (let fileOrDir of files) {
    if (fs.statSync(fileOrDir.path).isDirectory()) {
      findAllSvgsInFolder(fileOrDir.path);
    } else {
      svgQueue.add(fileOrDir.path);
    }
  }

  svgQueue.run(optimzeSvg);
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

  filesDropped(e.dataTransfer.files);

  return false;
};

window.addEventListener('will-navigate', function (e) {
  e.preventDefault();
});
