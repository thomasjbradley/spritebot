'use strict';

const fs = require('fs');
const merge = require('merge-objects');
const SVGO = require('svgo');

const svgoMin = new SVGO(require(__dirname + '/../config/svgo-minify.json'));
const svgoPretty = new SVGO(require(__dirname + '/../config/svgo-pretty.json'));

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

const postProcess = function (svgString) {
  const processQueue = [
    forceWidthHeight,
  ];

  processQueue.forEach(function (func) {
    svgString = func(svgString);
  });

  return svgString;
};

const processSvg = function (svgObj, opts, next) {
  let optimizer = svgoMin;
  opts = merge(defaultOpts, opts);

  if (opts.pretty) optimizer = svgoPretty;

  optimizer.optimize(svgObj.original, function (svg) {
    svg = postProcess(svg.data);

    svgObj = merge(svgObj, {
      optimized: svg,
      bytesOut: Buffer.byteLength(svg),
    });

    fs.writeFile(svgObj.path, svg);
    next(svgObj);
  });
};

const optimize = function (svgObj, opts, next) {
  if (svgObj.original) {
    processSvg(svgObj, opts, next);
  } else {
    fs.readFile(svgObj.path, 'utf8', function (err, data) {
      svgObj = merge(svgObj, {
        original: data,
        bytesIn: Buffer.byteLength(data),
      });

      processSvg(svgObj, opts, next);
    });
  }
};

module.exports = {
  optimize: optimize,
};
