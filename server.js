const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const privateKey = fs.readFileSync('private-key.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Verbindung zur PostgreSQL-Datenbank
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
        console.error('Fehler beim Abrufen der Zählerdaten', error);
        res.status(500).send('Fehler beim Abrufen der Zählerdaten');
    }
});

const incrementCounterQuery = 'UPDATE counters SET counter = counter + 1 WHERE id = $1 RETURNING *';

app.put('/increment/:personId', async (req, res) => {
    const { personId } = req.params;

    try {
        const result = await client.query(incrementCounterQuery, [personId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fehler beim Inkrementieren des Zählers', error);
        res.status(500).send('Fehler beim Inkrementieren des Zählers');
    }
});

const decrementCounterQuery = 'UPDATE counters SET counter = counter - 1 WHERE id = $1 RETURNING *';

app.put('/decrement/:personId', async (req, res) => {
    const { personId } = req.params;

    try {
        const result = await client.query(decrementCounterQuery, [personId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fehler beim Dekrementieren des Zählers', error);
        res.status(500).send('Fehler beim Dekrementieren des Zählers');
    }
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`HTTPS Server läuft auf https://localhost:${port}`);
});
