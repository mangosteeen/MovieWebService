// include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

// database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnection: true,
    connectionLimit: 100,
    queueLimit: 0,
};

// intialize Express app
const app = express();
// helps app to read JSON
app.use(express.json());

// start the server
app.listen(port, () => {
    console.log("Server is running on port ", port);
});

app.get('/allmovies', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.movies');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Server error for allmovies"});
    }
});

app.post('/addmovie', async (req, res) => {
    const { movie_title, movie_url } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO movies (movie_title, movie_url) VALUES (?, ?)', [movie_title, movie_url]);
        res.status(201).json({ message: 'Movie ' + movie_title + ' added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add movie ' + movie_title });
    }
});
