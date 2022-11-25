// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


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
    if (queryCheck(req.query, res) === true) { return; }

    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = 'SELECT * FROM Codes ORDER BY code';
    let clause = [];
    
    // res.status(200).type('json').send({}); // <-- you will need to change this
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    if (queryCheck(req.query, res) === true) { return; }

    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = 'SELECT * FROM Neighborhoods ORDER BY neighborhood_number';
    let clause = [];
    // res.status(200).type('json').send({}); // <-- you will need to change this
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    if (queryCheck(req.query, res) === true) { return; }

    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = 'SELECT * FROM Incidents';
    let clause = [
        {
            expression: "Date(date_time) >= ?",
            param: req.query.start_date
        },
        {
            expression: "Date(date_time) >= ?",
            param: req.query.end_date
        },
        {
            expression: "code >= ?",
            param: parseInt(req.query.code)
        },
        {
            expression: "police_grid >= ?",
            param: parseInt(req.query.grid)
        },
        {
            expression: "neighborhood_number >= ?",
            param: parseInt(req.query.neighborhood)
        },
    ];

    buildQuery(query, clause)
    .then((incidents) => {
        res.status(200).type('json').send(incidents)
    })
    .catch((err) => {
        res.status(404).type('text/plain').send(err)
    })
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    // res.status(200).type('txt').send('OK'); // <-- you may need to change this
});

// DELETE request handler for new crime incident
app.delete('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    // res.status(200).type('txt').send('OK'); // <-- you may need to change this
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

/**
 * Will build SQL Query
 * @param {Current created SQL Query} query 
 * @param {Holds current conditions that may be used to find specified info} condition 
 */
function buildQuery(query, condition){
    let url = window.location.search
    //Initialize limit to be 1000 by default unless specified 
    let limit
    if(!url.hasOwnProperty("limit")){
        limit = 1000
    }
    let clause = "WHERE"
    let sqlQuery = '${query} ${clause} ${condition}'
    //TODO Create SQLQuery
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
