// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { query } = require('express');
const e = require('express');

let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

let app = express();
let port = 8000;

app.use(express.json());

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// GET request handler for crime codes
app.get('/codes', (req, res) => {
    let query = "SELECT * FROM Codes"
    let clause = " WHERE code = "
    //make key value pairs
    for (const [key, data] of Object.entries(req.query)) {
        if(key == "code"){
            let new_data = data.split(",")
            //create query for each value
            for(let i=0; i<new_data.length; i++){
                query = query + clause + new_data[i];
                clause = " OR code = "
            }
        }
    }
    query = query + " ORDER BY code";
    
    databaseSelect(query, [])
    .then((data) => {
        res.status(200).type('json').send(data); 
    })
    .catch((err) => {
        res.status(500).type('html').send("Error: Query is entered incorrectly (e.g. ?code=15");

    })
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    let query = "SELECT * FROM Neighborhoods"
    let clause =  " WHERE neighborhood_number ="
    //make key value pairs
    for (const [key, data] of Object.entries(req.query)) {
        if(key == "id"){
            let new_data = data.split(",")
            //create query for each value
            for(let i=0; i<new_data.length; i++){
                query = query + clause + new_data[i];
                clause = " OR neighborhood_number = "
            }
        }
    }
    query = query + " ORDER BY neighborhood_number";
    
    databaseSelect(query, [])
    .then((data) => {
        res.status(200).type('json').send(data); 
    })
    .catch((err) => {
        res.status(500).type('html').send("Error: Query is entered incorrectly (e.g. ?neighborhood_number=12");
    })
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    // let query = "SELECT * FROM Incidents"
    let query = "SELECT case_number, SUBSTRING(date_time,1,10) AS date, SUBSTRING(date_time,12,19) AS time, code, incident, police_grid, neighborhood_number, block FROM incidents";

    let clause = " WHERE ("
    let limit = 1000
    let new_data
    let iterator = 1
    //make key value pairs
    for (const [key, data] of Object.entries(req.query)) {
        if(key == "start_date"){
            query = query + clause + "date(date) >= '" + data + "'"
            clause = ") AND ("
        } else if(key == "end_date"){
            query = query + clause + "date(date) <= '" + data + "'"
            clause = ") AND ("
        } else if(key == "code"){
            new_data = data.split(",")
            for(i=0; i<new_data.length; i++){
                query = query + clause + "code = " + new_data[i]
                clause = " OR "
            }
            clause = ") AND ("
        } else if(key == "grid"){
            new_data = data.split(",");
            for(i=0; i<new_data.length; i++){
                query = query + clause + "police_grid = " + new_data[i]
                clause = " OR "
            }
            clause = ") AND ("

        } else if(key == "neighborhood"){
            new_data = data.split(",");
            for(i=0; i<new_data.length; i++){
                query = query + clause + "neighborhood_number = " +  new_data[i]
                clause = " OR "
            }
            clause = ") AND ("
            
        } else if(key == "limit"){
            limit = data
        }     
        iterator++   
    }

    if((clause == " WHERE (" && req.query.hasOwnProperty("limit")) || clause == " WHERE ("){
        query = "SELECT case_number, SUBSTRING(date_time,1,10) AS date, SUBSTRING(date_time,12,19) AS time, code, incident, police_grid, neighborhood_number, block FROM incidents ORDER BY date ASC, time LIMIT " + limit;
    } else {
        query = query + ") ORDER BY date ASC, time LIMIT " + limit
    }
    databaseSelect(query, [])
    .then((data) => {
        res.status(200).type('json').send(data); 
    })
    .catch((err) => {
        res.status(500).type('html').send("Error: Query is entered incorrectly (e.g. ?limit=50"); 
    })
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    let query = 'INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?);'
    // let query = 'INSERT INTO incidents (case_number, date_time, code, incident, polic_grid, neighborhood_number, block) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'

    let date_time = req.body.date + "T" + req.body.time
    let data = [req.body.case_number, date_time, req.body.code, req.body.incident, req.body.police_grid, req.body.neighborhood_number, req.body.block]
    console.log(data)
    databaseRun(query, data)
    .then((data) => {
        res.status(200).type('txt').send('Data has been successfully inputed into the database')
    })
    .catch((err) => {
        res.status(500).type('txt').send("The data is already inside of the database.")
    })
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    console.log(req.body); // uploaded data
    let query = 'DELETE FROM Incidents WHERE case_number = ?'
    let findQuery = 'SELECT * FROM Incidents WHERE case_number = ?'
    databaseSelect(findQuery, req.body.case_number)
    .then((data) => {
        if(data.isEmpty()){
            res.status(500).type('txt').send('This data does not exist in the database')
        }
        databaseRun(query, req.body.case_number)
        .then(() => {
            res.status(200).type('txt').send('Data has been deleted from the database')
        })
        console.log("Data: " + data)
    })
    .catch((err) => {
        res.status(500).type('txt').send("The data does not exist or something is wrong with the program.")
    })
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        })
    })
}

// Create Promise for SQLite3 database INSERT or DELETE query
function databaseRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    })
}


// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
