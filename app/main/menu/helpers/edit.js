'use strict';

const {app, dialog} = require('electron');
const is = require('electron-is');

const commands = {
  'app:revert-to-original': function (menuItem, win) {

  },

  'app:copy-svg': function (menuItem, win) {

  },

  'app:copy-svg-datauri': function (menuItem, win) {

  },

  'app:remove-file': function (menuItem, win) {

  },

  'app:pretty-output': function (menuItem, win) {
    win.send('app:toggle-pretty-output');
  },

  'app:reveal-in-finder': function (menuItem, win) {

  },
};

module.exports = require(__dirname + '/../menu-helper')(commands);
