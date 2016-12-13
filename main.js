'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const electron = require('electron');
const shell = electron.shell;
const listener = electron.ipcRenderer;
const SVGO = require('svgo');
const dir = require('node-dir');
const svgomin = new SVGO(require('./svgo-min.json'));

const $body = document.body;
let allFiles = [];

const bytesToKilobytes = function (bytes) {
  return Math.round((bytes / 1024) * 1000) / 1000;
};

const diffBytesInKilobytes = function (bytesIn, bytesOut) {
  return Math.round((100 - bytesOut * 100 / bytesIn) * 10) /  10;
}

const render = function (filePath, bytesIn, bytesOut) {
  console.log(path.parse(filePath).base, bytesToKilobytes(bytesIn), bytesToKilobytes(bytesOut), diffBytesInKilobytes(bytesIn, bytesOut));
};

const getDimensionsFromViewBox = function (vb) {
  let viewBox = vb.split(/(?:,\s*|\s+)/);

  return {
    width: parseFloat(viewBox[2]),
    height: parseFloat(viewBox[3]),
  };
};

const forceWidthHeight = function (svg) {
  let matches = svg.match(/<svg[^>]+>/);
  let svgTag;
  let dimensions;

  if (!matches && !matches[0]) return svg;
  if (!matches[0].match(/viewBox="([\s\d]+)"/)) return svg;

  svgTag = matches[0];
  dimensions = getDimensionsFromViewBox(svgTag.match(/viewBox="([\s\d]+)"/)[0])

  if (!svgTag.match(/\s*width=/)) svgTag = svgTag.replace(/>$/, ` width="${dimensions.width}">`);
  if (!svgTag.match(/\s*height=/)) svgTag = svgTag.replace(/>$/, ` height="${dimensions.height}">`);

  return svg.replace(matches[0], svgTag);
};

const compressFile = function (file) {
  let bytesIn, bytesOut;

  fs.readFile(file, 'utf8', function (err, data) {
    bytesIn = Buffer.byteLength(data);

    svgomin.optimize(data, function (svg) {
      svg = forceWidthHeight(svg.data);
      bytesOut = Buffer.byteLength(svg);
      fs.writeFile(file, svg);
      render(file, bytesIn, bytesOut);
    });
  });
};

const compressAllFiles = function () {
  if (allFiles.length <= 0) return;

  compressFile(allFiles.shift());
  compressAllFiles();
};

const findAllSvgsInFolder = function (path) {
  dir.files(path, function (err, files) {
    allFiles = allFiles.concat(files.filter(function (item) {
      return item.match(/\.svg$/);
    }));
    compressAllFiles();
  });
};

const fileDropped = function (files) {
  for (let fileOrDir of files) {
    if (fs.statSync(fileOrDir.path).isDirectory()) {
      findAllSvgsInFolder(fileOrDir.path);
    } else {
      allFiles.push(fileOrDir.path);
    }
  }

  compressAllFiles();
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

  fileDropped(e.dataTransfer.files);

  return false;
};

window.addEventListener('will-navigate', function (e) {
  e.preventDefault();
});
