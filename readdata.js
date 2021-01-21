const sqlite3 = require('sqlite3').verbose();
const fs = require('fs'); // Node.js file system module
// use a persistent database named db.sqlite
const db = new sqlite3.Database('./restaurantdb1.sqlite');

// load function to load the given data into the 3 tables we have in our database
function loadDatabase(data){
    // Declare our SQL commands to run within the for loops, the "?"s are taken as parameters within the .run() method
    // so for example with this command "INSERT INTO RESTAURANTS (name, imagelink) VALUES (?, ?)"
    //                          the .run(firstParameter, secontParameter)    firstParameter^  ^secondParameter

    let insertRestaurant = db.prepare("INSERT INTO RESTAURANTS (name, imagelink) VALUES (?,?)");
    let insertMenu = db.prepare("INSERT INTO MENUS (title, restaurantId) VALUES (?,?)");
    let insertItem = db.prepare("INSERT INTO MENU_ITEMS (menuId, name, price) VALUES (?,?,?)");

    let menus = []; // Empty array to store every menu with its items for later use
    for (let i = 0 ; i < data.length; i++){ // Iterate our entire array of restaurants objects
        insertRestaurant.run(data[i].name, data[i].image) // Add the name and image of the restaurant we currently at to the database

        for (let i2 = 0; i2 < data[i].menus.length; i2++){ // Iterate through the curent restaurants menus
            insertMenu.run(data[i].menus[i2].title, i+1) // Add the menu title to our MENUS table, i+1 is our restaurant id as we iterate through restaurants (line 13)
            menus.push(data[i].menus[i2]); // Because atm we dont know how many menus/items we have in total we need to store them for later
        }
    }

    // With our array of menus we can link the MENU_ITEMS' menuId to the index+1 of our menus array as now we now how many menus we have and
    // at what place are we at currently. 

    for (let i = 0; i < menus.length; i++){ // With our full list of menus and items we can iterate through them to assign it to the right place
        for (let i2 = 0; i2 < menus[i].items.length; i2++){ // Iterate through every item within the curent menu
            insertItem.run(i+1, menus[i].items[i2].name, menus[i].items[i2].price)  // Store the id of the menu (position in array + 1)
                                                                                    // name (current elements .name) and price (current elements .price)
        }
    }
    // You can see we didn't actualy tell SQL the id of any of rows we inserted. Because it's set as a PRIMARY KEY it nows to increment it and set it automaticaly

    insertRestaurant.finalize();
    insertMenu.finalize();
    insertItem.finalize();

    db.close();
}

db.serialize(function () {
        // Create our tables if they don't already exist. "IF NOT EXISTS" make sures for sql not to attempt to create them if they exist breaking our program
        db.run("CREATE TABLE IF NOT EXISTS RESTAURANTS (id INTEGER PRIMARY KEY, name TEXT, imagelink TEXT)");
        db.run("CREATE TABLE IF NOT EXISTS MENUS (id INTEGER PRIMARY KEY, title TEXT, restaurantId INT)");
        db.run("CREATE TABLE IF NOT EXISTS MENU_ITEMS (id INTEGER PRIMARY KEY, menuId INT, name TEXT, price REAL)");

        db.run("DELETE FROM RESTAURANTS")
        db.run("DELETE FROM MENUS")
        db.run("DELETE FROM MENU_ITEMS")


        // Read the given file and call our load function with the converted json data
        fs.readFile("./restaurants.json", (err,data)=>{
            if (err) throw new Error(err);
            
            loadDatabase(JSON.parse(data)); // What JSON.parse(<<data>>) does it converts a json data into a JS array of objects
        })
});

