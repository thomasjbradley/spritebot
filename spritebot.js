'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

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
