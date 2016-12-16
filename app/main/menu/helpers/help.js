'use strict';

const {app, dialog, shell} = require('electron');
const is = require('electron-is');

const commands = {
  'app:spritebot-license': function (menuItem, win) {
    shell.openExternal('https://github.com/thomasjbradley/spritebot/blob/master/LICENSE');
  },

  'app:spritebot-website': function (menuItem, win) {
    shell.openExternal('https://github.com/thomasjbradley/spritebot/');
  },

  'app:spritebot-support': function (menuItem, win) {
    shell.openExternal('https://github.com/thomasjbradley/spritebot/issues/');
  },

  'app:send-feedback': function (menuItem, win) {
    shell.openExternal('mailto:hey@thomasjbradley.ca');
  },
};

module.exports = require(__dirname + '/../menu-helper')(commands);
