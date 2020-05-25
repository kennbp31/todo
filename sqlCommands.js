const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain} = electron;

let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./main.db"
    },
    useNullAsDefault: true
});


var sqlCommands = {

    // Refresh the data on the page
    displayData: function(mainWindow) {
        let result = knex.select('*').from("list");
        console.log(result);
        result.then(function(rows){
            mainWindow.webContents.send('item:load', rows);
        }) 
    },            

    // Add items to DB
    addData: function (err, item, mainWindow){
        var toAdd = [{item: item}];
        knex('list').insert(toAdd)
        .catch(err)
        .then(console.log("data inserted"))
        .then(this.displayData(mainWindow));
    },

    // Delete individual items from DB
    removeItem: function (item){
        console.log("LID = " + item);
        knex.from('list').del().where('lid', '=', item).then(() => console.log("data deleted"))
        .catch((err) => { console.log(err); throw err });
    },

    // Delete all items from DB (DANGER!!!!)
    removeAll: function (mainWindow){
        knex.from('list').del().then(() => console.log("data deleted"))
        .catch((err) => { console.log(err); throw err })
        .then(mainWindow.webContents.send('item:clear'));
    },

};

module.exports = sqlCommands