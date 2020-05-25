const electron = require('electron');
const url = require('url');
const path = require('path');
const sqlCommands = require('./sqlCommands.js');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./main.db"
    },
    useNullAsDefault: true
});

app.on('ready', function () {
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
        nodeIntegration: true
        }
    })
    // Load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol:'file',
        slashes: true
    }));

    // TODO Populate list of items
    mainWindow.webContents.on("dom-ready", () => {sqlCommands.displayData(mainWindow)});
                 

    // Quit app on close
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert menu
    Menu.setApplicationMenu(mainMenu);
    console.log("Window Not-Loaded");

});

// Handle createAddWindow
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Shopping List Item",
        webPreferences: {
            nodeIntegration: true
            }
    })

    // Load HTML into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol:'file',
        slashes: true
    }));

    // Remove menu bar from window
    addWindow.setMenuBarVisibility(false);
    
    // Garbage colletion handle
    addWindow.on('close', function(){
        addWindow = null;
    });
};

    // Catch item:add
ipcMain.on('item:add', function(err, item){
        sqlCommands.addData(err, item, mainWindow);
        addWindow.close();
});                


    // Catch item:remove
    ipcMain.on('item:remove', function(err, item){
        sqlCommands.removeItem(item)
    });

// Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
        { 
            label: 'Add Item',
            accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
            click(){
                createAddWindow();
            }
        },
        {
            label: 'Clear Items',
            click(){               
                sqlCommands.removeAll(mainWindow);
            }
        },
        {
            label: 'Quit', 
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){
                app.quit();
            }
        }
    ]
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
};

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
};