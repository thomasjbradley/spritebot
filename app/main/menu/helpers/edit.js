'use strict';

const {app, dialog} = require('electron');
const is = require('electron-is');

const commands = {
  'app:revert-to-original': function (menuItem, win) {
    win.send('app:revert-to-original');
  },

  'app:re-optimize': function (menuItem, win) {
    win.send('app:re-optimize');
  },

  'app:copy-svg': function (menuItem, win) {
    win.send('app:copy-svg');
  },

  'app:copy-svg-use': function (menuItem, win) {
    win.send('app:copy-svg-use');
  },

  'app:copy-svg-datauri': function (menuItem, win) {
    win.send('app:copy-svg-datauri');
  },

  'app:remove-file': function (menuItem, win) {
    win.send('app:remove-file');
  },

  'app:reveal-in-finder': function (menuItem, win) {
    win.send('app:reveal-in-finder');
  },
};

module.exports = require(__dirname + '/../menu-helper')(commands);
