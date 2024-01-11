const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connectionString = "postgres://lvfaqizi:Sk-qXSUFTpdRzysSPOyM8p45zQ3na2Z8@horton.db.elephantsql.com/lvfaqizi";
const client = new Client({ connectionString });
client.connect();

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS counters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        counter INT DEFAULT 0
    );
`;

client.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Fehler beim Erstellen der Tabelle', err);
    } else {
        console.log('Tabelle erfolgreich erstellt');
    }
});

app.get('/getCounters', async (req, res) => {
    try {
        const query = 'SELECT * FROM counters';
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten', error);
        res.status(500).send('Fehler beim Abrufen der Daten');
    }
});

app.post('/addCounter', async (req, res) => {
    const { name } = req.body;

    try {
        const insertQuery = 'INSERT INTO counters (name, counter) VALUES ($1, 0) RETURNING *';
        const result = await client.query(insertQuery, [name]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Daten', error);
        res.status(500).send('Fehler beim Hinzufügen der Daten');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
