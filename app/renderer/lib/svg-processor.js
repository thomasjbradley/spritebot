'use strict';

const fs = require('fs');
const merge = require('merge-objects');
const SVGO = require('svgo');

const svgoMin = new SVGO(require(__dirname + '/../config/svgo-minify.json'));
const svgoPretty = new SVGO(require(__dirname + '/../config/svgo-pretty.json'));
const svgoSpriteMin = new SVGO(require(__dirname + '/../config/svgo-sprite-minify.json'));

const defaultOpts = {
  pretty: false,
};

const getDimensionsFromViewBox = function (vb) {
  let viewBox = vb.split(/(?:,\s*|\s+)/);

  return {
    width: parseFloat(viewBox[2]),
    height: parseFloat(viewBox[3]),
  };
};

const read = function (svgObj, next) {
  fs.readFile(svgObj.path, 'utf8', function (err, data) {
    svgObj = merge(svgObj, {
      original: data,
      bytesIn: Buffer.byteLength(data),
    });

    next(svgObj);
  });
};

const save = function (svgObj, next) {
  fs.writeFile(svgObj.path, (svgObj.reverted) ? svgObj.original : svgObj.optimized, next);
};

const forceWidthHeight = function (svg) {
  let matches = svg.match(/<svg[^>]+>/);
  let svgTag;
  let dimensions;

  if (!matches || !matches[0]) return svg;
  if (!matches[0].match(/viewBox="([\s\d]+)"/)) return svg;

  svgTag = matches[0];
  dimensions = getDimensionsFromViewBox(svgTag.match(/viewBox="([\s\d]+)"/)[0])

  if (!svgTag.match(/\s*width=/)) svgTag = svgTag.replace(/>$/, ` width="${dimensions.width}">`);
  if (!svgTag.match(/\s*height=/)) svgTag = svgTag.replace(/>$/, ` height="${dimensions.height}">`);

  return svg.replace(matches[0], svgTag);
};

const forceXmlNs = function (svg) {
  let matches = svg.match(/<svg[^>]+>/);
  let svgTag;
  let dimensions;

  if (!matches || !matches[0]) return svg;
  if (matches[0].match(/xmlns="[^"]+"/)) return svg;

  svgTag = matches[0];
  svgTag = svgTag.replace(/>$/, ' xmlns="http://www.w3.org/2000/svg">');

  return svg.replace(matches[0], svgTag);
};

const postProcess = function (svgString, opts) {
  const processQueue = [
    forceWidthHeight,
    (!opts.pretty) ? forceXmlNs : false,
  ];

  processQueue.forEach(function (func) {
    if (!func) return;
    svgString = func(svgString);
  });

  return svgString;
};

const processSvgString = function (svgString, opts, next) {
  let optimizer = svgoMin;

  opts = merge(defaultOpts, opts);

  if (opts.sprites) optimizer = svgoSpriteMin;
  if (opts.pretty) optimizer = svgoPretty;

  optimizer.optimize(svgString, function (svg) {
    svg = postProcess(svg.data, opts);
    next(svg);
  });
};

const processSvg = function (svgObj, opts, next) {
  processSvgString(svgObj.original, opts, function (svg) {
    svgObj = merge(svgObj, {
      optimized: svg,
      bytesOut: Buffer.byteLength(svg),
    });

    save(svgObj);
    next(svgObj);
  });
};

const getOptimizer = function (opts) {
  return function (svgString, next) {
    processSvgString(svgString, opts, next);
  };
};

const optimize = function (svgObj, opts, before, after) {
  before(svgObj);

  if (svgObj.original) {
    processSvg(svgObj, opts, after);
  } else {
    read(svgObj, function (svgObj) {
      processSvg(svgObj, opts, after);
    });
  }
};

module.exports = {
  getOptimizer: getOptimizer,
  read: read,
  save: save,
  optimize: optimize,
};
