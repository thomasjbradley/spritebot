'use strict';

const path = require('path');

const classify = require(__dirname + '/../../shared/classify');
const templateHelper = require(__dirname + '/../lib/template-helper');

let sprites = [];

const reset = function () {
  sprites = [];
};

const findIndex = function (id) {
  return sprites.findIndex(function (item) {
    return item.id == id;
  });
};

const findViewBoxDimensions = function (svg) {
  const viewBox = svg.match(/^<svg[^>]*viewBox="([^"]*)"/);

  if (!viewBox || !viewBox[1]) return false;

  return viewBox[1];
};

const findSvgContents = function (svg) {
  return svg.trim().replace(/<\/svg>$/, '').replace(/^<svg[^>]*>/, '').trim();
};

const stripSvgWrapper = function (svgString) {
  return svgString.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg[^>]*>/, '').trim();
};

const convertToSymbol = function (svgObj) {
  if (svgObj.symbols) {
    return stripSvgWrapper(svgObj.optimized);
  } else {
    return templateHelper.render('sprite.xml', {
      id: classify(path.parse(svgObj.path).name),
      viewBox: findViewBoxDimensions(svgObj.optimized),
      data: findSvgContents(svgObj.optimized),
    }, { noEscape: true });
  }
};

const append = function (svgObj) {
  sprites.push(svgObj);
};

const remove = function (id) {
  let index = findIndex(id);

  if (index > -1) sprites.splice(index, 1);
};

const compile = function (optimizer, next) {
  let spriteStrings = sprites.map(convertToSymbol);
  let spriteSheet = templateHelper.render('sprite-sheet.xml', {
    sprites: spriteStrings.join(''),
  }, { noEscape: true });

  optimizer(spriteSheet, next);
};

module.exports = {
  reset: reset,
  append: append,
  remove: remove,
  compile: compile,
};
