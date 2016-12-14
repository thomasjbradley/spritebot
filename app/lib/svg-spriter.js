'use strict';

const path = require('path');

const classify = require(__dirname + '/classify');
const templateHelper = require(__dirname + '/../lib/template-helper');

let sprites = [];

const reset = function () {
  sprites = [];
};

const findViewBoxDimensions = function (svg) {
  return svg.match(/^<svg[^>]*viewBox="([^"]*)"/)[1];
};

const findSvgContents = function (svg) {
  return svg.trim().replace(/<\/svg>$/, '').replace(/^<svg[^>]*>/, '').trim();
};

const convertToSymbol = function (svgObj) {
  return templateHelper.render('sprite.xml', {
    id: classify(path.parse(svgObj.path).name),
    viewBox: findViewBoxDimensions(svgObj.optimized),
    data: findSvgContents(svgObj.optimized),
  }, { noEscape: true });
};

const append = function (svgObj) {
  sprites.push(convertToSymbol(svgObj));
};

const compile = function (optimizer, next) {
  let spriteSheet = templateHelper.render('sprite-sheet.xml', {
    sprites: sprites.join(''),
  }, { noEscape: true });

  optimizer(spriteSheet, next);
};

module.exports = {
  reset: reset,
  append: append,
  compile: compile,
};
