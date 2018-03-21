const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// set environment to be production
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// listen for app to be ready
app.on('ready', function() {
	// create new window
	mainWindow = new BrowserWindow({});

	// load html into window.
	mainWindow.loadURL(url.format({
		// pass in file under current directory of index.js
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));   // file://dirname/mainWindow.html

	// Quit app when closed
	mainWindow.on('closed', function() {
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add Shopping List Item'
	});

	// load html into window.
	addWindow.loadURL(url.format({
		// pass in file under current directory of index.js
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes: true
	}));   // file://dirname/mainWindow.html

	// Garbage collection handle
	addWindow.on('close', function() {
		addWindow = null;
	});
}

// handle add item action
ipcMain.on('item:add', function(e, item) {
	console.log(item);
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
	e.returnedValue = item;
});

// Create menu template
const mainMenuTemplate = [
	// {},   // in case mac system will show 'electron' instead of 'file'
	{
		label: 'File',
		submenu:[
			{
				label: 'Add Item',
				click() {
					createAddWindow();
				}
			},
			{
				label: 'Clear Items',
				click() {
					// handle clear item action
					mainWindow.webContents.send('item:clear');
				}
			},
			{
				label: 'Quit',
				// shortcuts for quit
				// darwin is the processing platform value of mac system
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				}
			}
		]
	}
];

if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu:[
			{
				label: "Toggle DevTools",
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					// will focus on the window that's currently selected
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	});
}