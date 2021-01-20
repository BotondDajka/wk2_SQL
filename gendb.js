const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
	if (err) {
		return console.error(err.message);
	}
    console.log('\x1b[1m \x1b[92m', "Connected to the SQlite database. \x1b[0m")
});