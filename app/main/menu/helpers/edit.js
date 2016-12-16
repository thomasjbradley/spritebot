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
    win.send('app:remove-file');
  },

  'app:reveal-in-finder': function (menuItem, win) {
    win.send('app:reveal-in-finder');
  },
};

module.exports = require(__dirname + '/../menu-helper')(commands);
