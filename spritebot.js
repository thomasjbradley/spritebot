'use strict';

const {app, ipcMain, BrowserWindow, dialog} = require('electron');

let appPkg = require('./package.json');
let mainWindow;

const createMainWindow = function (next) {
  mainWindow = new BrowserWindow({
    width: 600,
    minWidth: 600,
    height: 400,
    show: false,
    minHeight: 400,
    vibrancy: 'light',
  });

  mainWindow.loadURL('file://' + __dirname + '/app/main/main.html');

  mainWindow.on('closed', function () {
    mainWindow = null;

    if (process.platform !== 'darwin') menuCallbacks.quit();
  });

  mainWindow.on('focus', function () {
    mainWindow.webContents.send('app:focus');
  });

  mainWindow.on('blur', function () {
    mainWindow.webContents.send('app:blur');
  });

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();

    if (next) next();
  });
};

app.on('ready', function () {
  createMainWindow();
});

app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') menuCallbacks.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createMainWindow();
});

app.on('open-file', function (e, path) {
  e.preventDefault();

  if (mainWindow === null) createMainWindow(function () {
    // markbotMain.send('app:file-dropped', path);
  });
});

ipcMain.on('app:show-save-dialog', function (e, arg) {
  const dialogOpts = {
    title: 'Save Sprite Sheet',
    defaultPath: app.getPath('downloads') + '/sprite-sheet.svg'
  };

  dialog.showSaveDialog(mainWindow, dialogOpts, function (filepath) {
    if (filepath) mainWindow.webContents.send('app:save-sprite-sheet', filepath);
  });
});
