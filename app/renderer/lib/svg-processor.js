'use strict';

const fs = require('fs');
const merge = require('merge-objects');
const SVGO = require('svgo');

const svgHelper = require(`${__dirname}/svg-helper`);

const svgoMin = new SVGO(require(`${__dirname}/../config/svgo-minify.json`));
const svgoPretty = new SVGO(require(`${__dirname}/../config/svgo-pretty.json`));
const svgoSpriteMin = new SVGO(require(`${__dirname}/../config/svgo-sprite-minify.json`));

const defaultOpts = {
  pretty: false,
};

const read = function (svgObj, opts, next) {
  fs.readFile(svgObj.path, 'utf8', function (err, data) {
    svgObj = merge(svgObj, {
      original: data,
      bytesIn: Buffer.byteLength(data),
    });

    svgHelper.isOnlySymbols(svgObj, function (svgObj) {
      if (svgObj.symbols) opts.sprites = true;

      next(svgObj, opts);
    });
  });
};

const save = function (svgObj, next) {
  fs.writeFile(svgObj.path, (svgObj.reverted) ? svgObj.original : svgObj.optimized, next);
};

const postProcess = function (svgString, opts) {
  const processQueue = [
    svgHelper.forceWidthHeight,
    (!opts.pretty) ? svgHelper.forceXmlNs : false,
  ];

  processQueue.forEach(function (func) {
    if (!func) return;
    svgString = func(svgString);
  });

  return svgString;
};

const preProcess = function (svgString) {
  const processQueue = [
    svgHelper.removeAllDataNameAttrs,
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

  optimizer.optimize(preProcess(svgString), function (svg) {
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
  if (svgObj.original) {
    before(svgObj);
    processSvg(svgObj, opts, after);
  } else {
    read(svgObj, opts, function (svgObjNew, optsNew) {
      before(svgObjNew);
      processSvg(svgObjNew, optsNew, after);
    });
  }
};

module.exports = {
  getOptimizer: getOptimizer,
  read: read,
  save: save,
  optimize: optimize,
};
