'use strict';

const path = require('path');
const {app, dialog} = require('electron');
const is = require('electron-is');
const config = new (require('electron-store'))();

const DEFAULT_FILE_NAME = '/sprite-sheet.svg';

const addFilesOpts = {
  title: 'Add Files…',
  filters: [
    {name: 'Images', extensions: ['svg']},
  ],
  properties: ['openFile', 'multiSelections'],
};

const addFolderOpts = {
  title: 'Add Folder…',
  filters: [
    {name: 'Images', extensions: ['svg']},
  ],
  properties: ['openDirectory', 'multiSelections'],
};

const saveOpts = {
  title: 'Save Sprite Sheet',
  defaultPath: (config.has('save-path')) ? config.get('save-path') : app.getPath('downloads') + DEFAULT_FILE_NAME,
};

const commands = {
  'app:quit': function (menuItem, win) {
    app.quit();
  },

  'app:add-files': function (menuItem, win) {
    if (is.macOS()) addFilesOpts.properties.push('openDirectory');

    dialog.showOpenDialog(win, addFilesOpts, function (filenames) {
      if (filenames) win.send('app:add-files', filenames);
    });
  },

  'app:add-folders': function (menuItem, win) {
    if (is.macOS()) addFolderOpts.properties.push('openFile');

    dialog.showOpenDialog(win, addFolderOpts, function (filenames) {
      if (filenames) win.send('app:add-files', filenames);
    });
  },

  'app:remove-all-files': function (menuItem, win) {
    win.send('app:remove-all-files');
  },

  'app:copy-svg-sprite-sheet': function (menuItem, win) {
    win.send('app:copy-svg-sprite-sheet');
  },

  'app:save-sprite-sheet': function (menuItem, win) {
    dialog.showSaveDialog(win, saveOpts, function (filepath) {
      if (filepath) {
        config.set('save-path', filepath);
        saveOpts.defaultPath = filepath;

        win.send('app:save-sprite-sheet', filepath);
      }
    });
  },
};

module.exports = require(__dirname + '/../menu-helper')(commands);
