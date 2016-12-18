'use strict';

const {shell, Menu} = require('electron');
const {EventEmitter} = require('events');
const is = require('electron-is');
const dispatcher = new EventEmitter();
const handlebars = require('handlebars');

const pkg = require(__dirname + '/../../../package.json');

const menuVars = {
  version: pkg.version,
};

const emitMenuCommand = function (menuItem, browserWindow, event) {
  dispatcher.emit(menuItem.command, menuItem);
};

const populateLabel = function (label) {
  return handlebars.compile(label)(menuVars);
};

const prepareMenu = function (menu) {
  let i = 0, total = menu.length;

  for (i = 0; i < total; i++) {
    if (menu[i].label) menu[i].label = populateLabel(menu[i].label);
    if (menu[i].command) menu[i].click = emitMenuCommand;
    if (menu[i].submenu) menu[i].submenu = prepareMenu(menu[i].submenu);
  };

  return menu;
};

const getMenuTemplate = function () {
  let menu;

  if (is.macOS()) menu = prepareMenu(require(__dirname + '/templates/macos.json'));
  if (is.windows()) menu = prepareMenu(require(__dirname + '/templates/windows.json'));

  return menu;
};

const on = function (channel, next) {
  dispatcher.on(channel, next);
};

const updateMenuItem = function (id, opts) {
  const idPieces = id.split(/,/);

  const primeMenu = Menu.getApplicationMenu().items.find(function (item) {
    return item.id == idPieces[0];
  });

  const menuItem = primeMenu.submenu.items.find(function (item) {
    return item.id == idPieces[1];
  });

  Object.keys(opts).forEach(function (key) {
    menuItem[key] = opts[key];
  });
};

module.exports = {
  getMenuTemplate: getMenuTemplate,
  updateMenuItem: updateMenuItem,
  on: on,
};
