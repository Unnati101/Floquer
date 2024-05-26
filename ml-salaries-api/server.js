const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 8080;

app.use(cors());

app.get('/api/salaries', (req, res) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, 'data', 'salaries.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
