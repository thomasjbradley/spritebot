'use strict';

const {app, BrowserWindow} = require('electron');

let win;

module.exports = function (commands) {
  const trigger = function (command) {
    commands[command](null, win);
  };

  const bind = function (appMenu, winId) {
    win = BrowserWindow.fromId(winId);

    Object.keys(commands).forEach(function (command) {
      appMenu.on(command, function (menuItem) {
        commands[command](menuItem, win);
      });
    });
  };

  return {
    trigger: trigger,
    bind: bind,
  };
};
