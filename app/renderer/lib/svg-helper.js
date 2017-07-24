'use strict';

const xml2js = require('xml2js').parseString;
const xmlformat = require('xml-formatter');

const parseSymbolChildren = function (svgData, svgObj) {
  svgObj.symbols = {};

  svgData.svg.symbol.forEach(function (symbol, i) {
    let id = (symbol.$.id) ? symbol.$.id : `unnamed-symbol-${i}`;

    svgObj.symbols[id] = {
      id: `${svgObj.id}-${id}`,
      filename: id,
      filenamePretty: id,
    };
  })

  return svgObj;
};

const isOnlySymbols = function (svgObj, next) {
  xml2js(svgObj.original, {normalizeTags: true}, function (err, result) {
    let onlySymbols = true;

    if (err) return next(svgObj);
    if (!result.svg.symbol) return next(svgObj);

    for (let elem of Object.keys(result.svg)) {
      if (['$', 'symbol'].indexOf(elem) === -1) {
        onlySymbols = false;
        break;
      }
    }

    if (onlySymbols) svgObj = parseSymbolChildren(result, svgObj);

    next(svgObj);
  });
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

  if (!matches || !matches[0]) return svg;
  if (!matches[0].match(/viewBox="([\s\d]+)"/)) return svg;

  svgTag = matches[0];
  dimensions = getDimensionsFromViewBox(svgTag.match(/viewBox="([\s\d]+)"/)[0]);

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

const removeAllDataNameAttrs = function (svg) {
  return svg.replace(/\s*data-name="[^"]+"/g, '');
};

const extractSymbol = function (svg, symbolId) {
  const findSymbolRegex = new RegExp(`<symbol[^>]*?id="${symbolId}"[^>]*?>[^]*?</symbol[^>]*>`);
  let matches = svg.match(findSymbolRegex);

  if (matches && matches[0]) return matches[0];

  return false;
};

const convertSvgToSymbol = function (svg, id) {
  svg = svg
    .replace(/\<svg([^>])\s*id="[^"]+"/, '<svg$1')
    .replace(/\<svg/, `<symbol id="${id}"`)
    .replace(/\<\/svg/, '</symbol')
    .replace(/ (width|height)="\d+"/g, '')
    .replace(/ +/g, ' ')
  ;

  return svg;
};

const convertSymbolToSvg = function (svg, id, forceXmlNs) {
  svg = svg
    .replace(/\<symbol([^>])\s*id="[^"]+"/, '<symbol$1')
    .replace(/\<symbol/, `<svg id="${id}"`)
    .replace(/\<\/symbol/, '</svg')
  ;

  if (forceXmlNs) svg = forceXmlNs(svg);

  return forceWidthHeight(svg).replace(/ +/g, ' ');
};

const convertSvgToDataUri = function (svg) {
  const prefix = 'data:image/svg+xml,';

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

  return prefix + svg;
};

const getUseStatement = function (id) {
  return `<svg><use xlink:href="#${id}" /></svg>`;
};

const cleanId = function (svg, id) {
  svg = svg
    .replace(/\<svg([^>])\s*id="[^"]+"/, '<svg$1')
    .replace(/\<svg/, `<svg id="${id}"`)
    .replace(/ +/g, ' ')
  ;

  return svg;
};

const beautify = function (svg) {
  svg = xmlformat(svg, { indentation: '  ' })
    .replace(/\r\n/g, '\n')
    .replace(/\n+/, '\n')
    .replace(/^\s*\n/gm, '')
  ;

  return svg;
};

module.exports = {
  isOnlySymbols: isOnlySymbols,
  getDimensionsFromViewBox: getDimensionsFromViewBox,
  forceXmlNs: forceXmlNs,
  forceWidthHeight: forceWidthHeight,
  removeAllDataNameAttrs: removeAllDataNameAttrs,
  extractSymbol: extractSymbol,
  convertSvgToSymbol: convertSvgToSymbol,
  convertSymbolToSvg: convertSymbolToSvg,
  convertSvgToDataUri: convertSvgToDataUri,
  getUseStatement: getUseStatement,
  cleanId: cleanId,
  beautify: beautify,
};
