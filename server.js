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

app.put('/editmovie/:id', async (req, res) => {
    const { id } = req.params;
    const { movie_title, movie_url } = req.body;

    if (movie_title === undefined && movie_url === undefined) {
        return res.status(400).json({ message: 'No information to update' });
    }

    try {
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `UPDATE defaultdb.movies 
             SET movie_title = COALESCE(?, movie_title),
                 movie_url = COALESCE(?, movie_url)
             WHERE id = ?`,
            [movie_title ?? null, movie_url ?? null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json({ message: 'Movie id ' + id + ' updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update movie id ' + id });
    }
});