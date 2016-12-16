'use strict';

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const TEMPLATE_FOLDER = path.resolve(__dirname + '/../templates');

let templates = {};

const getTemplate = function (id) {
  let temp = fs.readFileSync(`${TEMPLATE_FOLDER}/${id}`, 'utf8');

  templates[id] = temp;

  return temp;
};

const render = function (id, obj, handlebarsOpts) {
  return handlebars.compile(getTemplate(id), handlebarsOpts)(obj);
};

module.exports = {
  getTemplate: getTemplate,
  render: render,
};
