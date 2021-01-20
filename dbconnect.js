const { deepStrictEqual } = require("assert");
const fetch = require('node-fetch');

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('\x1b[1m \x1b[92m', "Connected to the SQlite database. \x1b[0m")
});

// db.run("DROP TABLE restaurants");
// db.run("DROP TABLE menus");




db.serialize(async function(){

    db.run("CREATE TABLE IF NOT EXISTS restaurants(restaurant INTEGER PRIMARY KEY, name TEXT)");

    db.run("CREATE TABLE IF NOT EXISTS menus(restaurant INTEGER, menu TEXT, FOREIGN KEY(restaurant) REFERENCES restaurants(restaurant))");

    let insert = db.prepare("INSERT INTO restaurants (restaurant,name) VALUES (?,?)");

    for(let i = 1; i <=10; i++){
        insert.run(i,"Restaurant "+i)
    }

    insert = db.prepare("INSERT INTO menus (restaurant,menu) VALUES (?,?)");
    let i = 1;
    let loop = ()=>{
        let url = "https://www.themealdb.com/api/json/v1/1/random.php";
        let settings = { method: "Get" };
        if (i <=10){
            fetch(url,settings)
                .then(data=> data.json())
                .then((json =>{
                    insert.run(i, json.meals[0].strMeal)
                    i++;
                    loop();
            }));
        }
        else{
            db.all("SELECT * FROM restaurants", (err, data)=>{
                console.log(data);
            });

            db.all("SELECT * FROM menus", (err, data2)=>{
                console.log(data2);
            });
        }
    }
    loop()    
});



// fetch(url,settings)
//     .then(data=> data.json())
//     .then((json =>{
//         console.log(json.meals[0].strMeal)
//     }));



//db.run("INSERT INTO Restaurants (Restaurant,Menu) VALUES (\'Test Restaurant\',\'Test Menu\')");

let data;





// close the database connection



