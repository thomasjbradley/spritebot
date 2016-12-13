'use strict';

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

const processSvg = function (svgString) {
  const processQueue = [
    forceWidthHeight,
  ];

  processQueue.forEach(function (func) {
    svgString = func(svgString);
  });

  return svgString;
};

module.exports = {
  process: processSvg,
};
